from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import asyncio
import json
import random
import string
from typing import Dict, Set
from datetime import datetime

app = FastAPI(title="SofaFriends Game Server")

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory room storage (use Redis in production)
rooms: Dict[str, dict] = {}

class CreateRoomResponse(BaseModel):
    room_code: str
    ws_url: str
    qr_url: str

def generate_room_code() -> str:
    """Generate 6-character room code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def create_qr_url(room_code: str, host: str) -> str:
    """Generate QR-friendly join URL"""
    return f"http://{host}:3001/?room={room_code}"

@app.get("/")
async def root():
    return {"status": "online", "rooms": len(rooms)}

@app.post("/api/rooms", response_model=CreateRoomResponse)
async def create_room(request: Request):
    """Create a new game room"""
    room_code = generate_room_code()

    # Ensure unique code
    while room_code in rooms:
        room_code = generate_room_code()

    # Initialize room state
    rooms[room_code] = {
        "code": room_code,
        "host": None,
        "players": {},  # {player_id: {ws, name, color, x, y, vx, vy}}
        "status": "lobby",  # lobby, playing, ended
        "created_at": datetime.now().isoformat(),
        "game_state": {
            "players": {},
            "key_collected": False,
            "door_open": False,
        }
    }

    # Get host from request header (works for both localhost and LAN)
    host = request.client.host if request.client else "localhost"
    ws_url = f"ws://{host}:8000/ws/{room_code}"
    qr_url = create_qr_url(room_code, host)

    return CreateRoomResponse(room_code=room_code, ws_url=ws_url, qr_url=qr_url)

@app.get("/api/rooms/{room_code}")
async def get_room_info(room_code: str):
    """Get room status and player count"""
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room = rooms[room_code]
    return {
        "code": room_code,
        "status": room["status"],
        "player_count": len(room["players"]),
        "created_at": room["created_at"]
    }

class ConnectionManager:
    """Manages WebSocket connections per room"""

    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, room_code: str, websocket: WebSocket):
        await websocket.accept()
        if room_code not in self.active_connections:
            self.active_connections[room_code] = set()
        self.active_connections[room_code].add(websocket)

    def disconnect(self, room_code: str, websocket: WebSocket):
        if room_code in self.active_connections:
            self.active_connections[room_code].discard(websocket)
            if not self.active_connections[room_code]:
                del self.active_connections[room_code]

    async def broadcast(self, room_code: str, message: dict, exclude: WebSocket = None):
        """Send message to all connections in room"""
        if room_code not in self.active_connections:
            return

        dead_connections = set()
        for connection in self.active_connections[room_code]:
            if connection != exclude:
                try:
                    await connection.send_json(message)
                except:
                    dead_connections.add(connection)

        # Clean up dead connections
        for conn in dead_connections:
            self.disconnect(room_code, conn)

manager = ConnectionManager()

# Player colors
PLAYER_COLORS = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A",
    "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"
]

def get_player_spawn_position(player_index: int) -> tuple:
    """Get spawn position based on player index"""
    base_x = 100 + (player_index * 80)
    base_y = 300
    return (base_x, base_y)

@app.websocket("/ws/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str):
    """WebSocket handler for game room"""

    # Check if room exists
    if room_code not in rooms:
        await websocket.close(code=4004, reason="Room not found")
        return

    room = rooms[room_code]
    player_id = None
    role = None

    await manager.connect(room_code, websocket)

    try:
        # Wait for initial handshake
        init_msg = await websocket.receive_json()
        msg_type = init_msg.get("type")
        role = init_msg.get("role")  # "host" or "controller"

        if role == "host":
            # Register host
            room["host"] = websocket
            await websocket.send_json({
                "type": "connected",
                "role": "host",
                "room_code": room_code
            })

        elif role == "controller":
            # Register player
            player_id = f"p{len(room['players']) + 1}"
            player_index = len(room['players'])

            if player_index >= 8:
                await websocket.send_json({"type": "error", "message": "Room full"})
                await websocket.close()
                return

            x, y = get_player_spawn_position(player_index)

            room["players"][player_id] = {
                "ws": websocket,
                "id": player_id,
                "name": init_msg.get("name", f"Player {player_index + 1}"),
                "color": PLAYER_COLORS[player_index],
                "x": x,
                "y": y,
                "vx": 0,
                "vy": 0,
                "grounded": False,
            }

            # Send confirmation to player
            await websocket.send_json({
                "type": "connected",
                "role": "controller",
                "player_id": player_id,
                "color": PLAYER_COLORS[player_index],
                "name": room["players"][player_id]["name"]
            })

            # Broadcast lobby update to all
            await broadcast_lobby_update(room_code)

        # Main message loop
        async for message in websocket.iter_json():
            msg_type = message.get("type")

            if msg_type == "start_game" and role == "host":
                # Start the game
                room["status"] = "playing"
                await manager.broadcast(room_code, {
                    "type": "game_started",
                    "timestamp": datetime.now().isoformat()
                })

                # Start game loop
                asyncio.create_task(game_loop(room_code))

            elif msg_type == "input" and role == "controller":
                # Handle player input
                if player_id and player_id in room["players"]:
                    player = room["players"][player_id]

                    # Update player velocity based on input
                    left = message.get("left", False)
                    right = message.get("right", False)
                    jump = message.get("jump", False)
                    action = message.get("action", False)

                    # Simple movement (will be refined in game loop)
                    player["vx"] = 0
                    if left:
                        player["vx"] = -200
                    if right:
                        player["vx"] = 200

                    if jump and player["grounded"]:
                        player["vy"] = -400

            elif msg_type == "ping":
                # Respond to ping for latency measurement
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": message.get("timestamp")
                })

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        # Clean up on disconnect
        manager.disconnect(room_code, websocket)

        if role == "host":
            room["host"] = None
        elif role == "controller" and player_id:
            if player_id in room["players"]:
                del room["players"][player_id]
                await broadcast_lobby_update(room_code)

        # Clean up empty rooms
        if not room["host"] and not room["players"]:
            del rooms[room_code]

async def broadcast_lobby_update(room_code: str):
    """Send updated player list to all clients"""
    room = rooms[room_code]

    player_list = [
        {
            "id": pid,
            "name": p["name"],
            "color": p["color"]
        }
        for pid, p in room["players"].items()
    ]

    await manager.broadcast(room_code, {
        "type": "lobby_update",
        "players": player_list
    })

async def game_loop(room_code: str):
    """Main game loop - runs at 20 TPS"""

    if room_code not in rooms:
        return

    room = rooms[room_code]
    TICK_RATE = 20  # 20 ticks per second
    DELTA_TIME = 1.0 / TICK_RATE
    GRAVITY = 800

    tick_count = 0

    while room["status"] == "playing" and room_code in rooms:
        tick_start = asyncio.get_event_loop().time()

        # Update physics for each player
        for player_id, player in room["players"].items():
            # Apply gravity
            player["vy"] += GRAVITY * DELTA_TIME

            # Update position
            player["x"] += player["vx"] * DELTA_TIME
            player["y"] += player["vy"] * DELTA_TIME

            # Simple ground collision (y = 500 is ground)
            if player["y"] >= 500:
                player["y"] = 500
                player["vy"] = 0
                player["grounded"] = True
            else:
                player["grounded"] = False

            # Keep in bounds
            player["x"] = max(0, min(1200, player["x"]))

        # Build state snapshot
        state = {
            "type": "state",
            "tick": tick_count,
            "timestamp": datetime.now().isoformat(),
            "players": {
                pid: {
                    "id": pid,
                    "x": p["x"],
                    "y": p["y"],
                    "vx": p["vx"],
                    "vy": p["vy"],
                    "color": p["color"],
                    "name": p["name"],
                }
                for pid, p in room["players"].items()
            }
        }

        # Broadcast to host (host renders, controllers don't need full state)
        if room["host"]:
            try:
                await room["host"].send_json(state)
            except:
                pass

        tick_count += 1

        # Sleep to maintain tick rate
        elapsed = asyncio.get_event_loop().time() - tick_start
        sleep_time = max(0, DELTA_TIME - elapsed)
        await asyncio.sleep(sleep_time)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)