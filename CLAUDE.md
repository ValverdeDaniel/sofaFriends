# SofaFriends - Multiplayer Party Game

## Overview
SofaFriends is a web-based multiplayer party game where players use their phones as controllers to play a side-scrolling platformer game displayed on a TV/monitor. The game features a host client (displayed on TV) and controller clients (player phones) that communicate via WebSocket.

## Port Configuration

**⚠️ Important: Ports configured to avoid conflicts with Stocktimus (main business app)**

| Service | Port | URL |
|---------|------|-----|
| **Backend API** | 9000 | http://localhost:9000 |
| **Host Client** (TV Screen) | 9001 | http://localhost:9001 |
| **Controller Client** (Phone) | 3001 | http://localhost:3001 |
| **Redis** | 6379 | Internal only |
| **Admin Test Panel** | 9001 | http://localhost:9001/admin/test-panel.html |

**Stocktimus ports (reserved, DO NOT USE):**
- Port 5432: PostgreSQL database
- Port 8000: Stocktimus backend API
- Port 3000: Stocktimus frontend

## Architecture

### Components
1. **Host Client** ([host/](host/))
   - Displays the game on TV/monitor
   - Creates game rooms with 6-digit codes
   - Manages player connections and game state
   - Renders the game canvas (1200x600px)
   - Handles physics and collision detection
   - Accessible at: http://localhost:9001

2. **Controller Client** ([controller/](controller/))
   - Mobile-optimized touch interface
   - Connects to host via room code or QR scan
   - Sends player input (left, right, jump, action)
   - PWA-capable with fullscreen landscape mode
   - Accessible at: http://localhost:3001

3. **Backend Server** ([server/](server/))
   - WebSocket server (port 9000)
   - Room management API
   - Player connection handling
   - FastAPI + Redis for room storage

## Game Features

### Gameplay
- **Genre**: Side-scrolling cooperative platformer
- **Players**: 1-8 players (supports local testing with keyboard)
- **Objective**: Reach the finish line while avoiding obstacles
- **Lives**: Unlimited (level restarts on death)
- **Levels**: 2 levels currently implemented

### Game Mechanics

#### Physics ([host/game.js](host/game.js))
- **Gravity**: 800 units/s�
- **Move Speed**: 260 units/s (30% boost from base)
- **Jump Speed**: -400 units/s
- **Tick Rate**: 60 FPS (1/60s delta)
- **Player Radius**: 25 pixels (circular collision)

#### Platforms & Obstacles
- **Platforms**: Static rectangular platforms with collision detection
- **Obstacles**: Deadly red squares with hazard stripes
- **Collision**: Circle-rectangle collision detection
- **Death Pits**: Falling below y=700 triggers restart

#### Camera System
- Side-scrolling camera follows rightmost player
- Smooth camera interpolation (10% lerp)
- Level width: 3000 pixels
- Canvas width: 1200 pixels

### Level Design

#### Level 1 ([host/game.js:352](host/game.js#L352))
- 10 platforms (mix of ground and elevated)
- 6 obstacles strategically placed
- Wide ground platforms for learning
- Some elevated platforms for jumping practice

#### Level 2 ([host/game.js:388](host/game.js#L388))
- 13 platforms (more challenging layout)
- 10 obstacles (higher difficulty)
- Staircase section (ascending platforms)
- High platform area with gaps
- Narrow platforms requiring precision
- Descent section with tight jumps

### Visual Effects

#### Particle System ([host/game.js:209](host/game.js#L209))
- **Particle Class**: Base particle with physics
  - Shapes: squares and circles
  - Gravity, velocity, rotation
  - Color, size, life decay

- **DeathParticle Class**: Extended particles for special effects
  - Bubble particles (float upward, grow)
  - Petal particles (gentle fall, spin)
  - Pixel particles (fixed grid, half gravity)

#### Death Animations ([host/game.js:196](host/game.js#L196))
5 unique death animations randomly selected:

1. **Bubble Pop**: Transform into bubble, float up, grow, pop
2. **Spring Bounce**: Compress down, launch upward with trail
3. **Flower Bloom**: Root, grow stem, bloom petals
4. **Origami Fold**: Flatten to paper, fold into crane, fly away
5. **Pixel Disintegration**: Glitch effect, pixelate, explode

#### Confetti System
- Victory confetti on level completion (50 particles)
- Game complete celebration (200 particles over time)
- Death explosion particles

### Controls

#### Phone Controller ([controller/controller.js](controller/controller.js))
- **Left/Right**: Touch buttons for movement
- **Jump**: Touch button (triangle up)
- **Action**: Touch button (circle) - reserved for future features
- **Features**:
  - Haptic feedback (20ms vibration)
  - Wake lock (keeps screen on)
  - Touch-optimized (prevents gestures/refresh)
  - Status indicator (connection state)

#### Local Testing ([host/game.js:748](host/game.js#L748))
Keyboard controls for testing without phones:
- **Player 1**: W (jump), A (left), D (right)
- **Player 2**: � (jump), � (left), � (right)
- Supports 1 or 2 player local mode

### Networking

#### WebSocket Messages

**From Controller to Host:**
- `handshake`: Initial connection with player name
- `input`: Player input state (left, right, jump, action) at 20Hz
- Includes timestamp for latency tracking

**From Host to Controller:**
- `connected`: Confirmation with player_id and color
- `lobby_update`: Player list changes
- `game_started`: Transition to game screen
- `state`: Game state updates
- `error`: Error messages

#### Connection Flow
1. Host creates room via `/api/rooms` POST
2. Host connects to WebSocket and sends handshake (role: 'host')
3. Controller joins via `/api/rooms/{code}` GET
4. Controller connects to WebSocket with handshake (role: 'controller')
5. Server assigns player_id and color
6. Controllers appear in host's lobby
7. Host clicks "Start Game" button
8. Server broadcasts `game_started` to all clients
9. Game begins, controllers send input at 20Hz

### Player Management

#### Lobby System ([host/game.js:142](host/game.js#L142))
- Shows 8 player slots
- Filled slots display player color and name
- Empty slots show "+ Empty" placeholder
- Start button enabled when e1 player connected
- Auto-generated player names (Adjective + Animal)
- Random color assignment per player

#### Player Colors ([controller/controller.js:133](controller/controller.js#L133))
Generated by server, examples:
- #FF6B6B (red)
- #4ECDC4 (cyan)
- #FFA07A (orange)
- And more vibrant colors

### UI/UX Features

#### Host Interface ([host/index.html](host/index.html))
- Room code display (72px, cyan, glowing)
- QR code for easy phone joining
- Grid player slots (8 max)
- Gradient "Start Game" button
- Status indicator (top-right)
- "Test Locally" button for keyboard mode
- Keyboard controls overlay during local test

#### Controller Interface ([controller/index.html](controller/index.html))
- 3 screens: Join � Lobby � Game
- Join screen with room code input
- Lobby shows player avatar (colored circle)
- Full-screen touch controls
- Large, colorful gradient buttons
- Connection status bar
- PWA manifest for "Add to Home Screen"

### Technical Details

#### Browser Features
- Canvas API for rendering
- WebSocket for real-time communication
- Vibration API for haptic feedback
- Wake Lock API to prevent screen sleep
- Touch events with gesture prevention
- QR code generation (via CDN library)

#### Responsive Design
- Host: Desktop/TV optimized (landscape)
- Controller: Mobile optimized (landscape preferred)
- Viewport meta tags prevent zoom/scale
- Touch-action: none (prevents default gestures)

#### Local Testing Mode ([host/game.js:563](host/game.js#L563))
- Modal player count selection (1 or 2)
- Bypasses WebSocket requirement
- Keyboard-driven game loop
- All game features work offline
- Great for development and debugging

### Win Conditions

#### Level Completion ([host/game.js:912](host/game.js#L912))
- All players must reach finish line (x e 2800)
- Finish line at x=2800 (green gradient zone)
- Victory confetti explosion
- 2-second delay before next level
- Player positions reset to start

#### Game Completion ([host/game.js:621](host/game.js#L621))
- After completing level 2
- "<� You Win!" message
- Massive confetti celebration (200 bursts)
- Particles continue rendering

### Death & Restart

#### Death Triggers ([host/game.js:875](host/game.js#L875))
- Collision with red obstacle squares
- Falling below y=700 (death pit)

#### Death Sequence ([host/game.js:674](host/game.js#L674))
1. Random death animation selected
2. Player marked as "dying"
3. Animation plays (1.5 seconds)
4. Particles spawn based on animation type
5. 3-second total wait
6. All players reset to start positions
7. Camera resets to x=0

#### Restart Behavior
- Level progress retained
- All players respawn together
- Obstacles and platforms unchanged
- Input disabled during animation

### Code Structure

#### Main Files
- **[host/game.js](host/game.js)**: 1294 lines - Game logic, rendering, physics
- **[controller/controller.js](controller/controller.js)**: 288 lines - Controller interface
- **[host/index.html](host/index.html)**: 176 lines - Host page structure
- **[controller/index.html](controller/index.html)**: 324 lines - Controller page structure

#### Key Functions

**Host ([host/game.js](host/game.js)):**
- `init()`: Creates room, connects WebSocket
- `connectWebSocket()`: Establishes connection
- `handleMessage()`: Routes incoming messages
- `updatePlayerList()`: Updates lobby UI
- `startGame()`: Begins game loop
- `localGameLoop()`: 60fps physics and rendering
- `render()`: Canvas drawing
- `restartLevel()`: Death handler
- `nextLevel()`: Level progression
- `createLevel1/2()`: Level definitions
- `createConfettiExplosion()`: Particle spawner

**Controller ([controller/controller.js](controller/controller.js)):**
- `joinRoom()`: Validates and joins room
- `connectWebSocket()`: Establishes connection
- `handleMessage()`: Routes incoming messages
- `showLobby()`: Displays waiting screen
- `startGame()`: Shows control interface
- `initializeControls()`: Sets up touch handlers
- `sendInput()`: Sends input at 20Hz

### Styling & Theme

#### Color Scheme
- **Background**: #1a1a2e (dark blue-purple)
- **Primary Accent**: #4ECDC4 (cyan)
- **Secondary**: #667eea, #764ba2 (purple gradient)
- **Platform**: #16213e (dark blue)
- **Grid**: rgba(255,255,255,0.05) (subtle white)

#### Button Styles
- Gradient backgrounds
- Large padding for touch
- Box shadows with glow effects
- Scale transform on press
- Border radius: 50px (pill shape)

### Future Enhancement Opportunities
- More levels (currently only 2)
- Power-ups or collectibles
- Moving platforms
- Enemy characters
- Multiplayer competitive modes
- Leaderboards
- Sound effects and music
- Custom player avatars
- Team-based gameplay
- Action button functionality (reserved but unused)

## Setup & Deployment

### Requirements
- Docker & Docker Compose installed
- Modern browsers with WebSocket support
- Local network or internet connectivity (for phone controllers)
- For phone controllers: camera for QR scanning (optional)

### Quick Start with Docker

**1. Start all services:**
```bash
docker-compose up --build
```

This starts:
- Redis (port 6379) - Room data storage
- Backend API (port 9000) - FastAPI WebSocket server
- Host Client (port 9001) - TV/monitor game screen
- Controller Client (port 3001) - Phone controller interface

**2. Access the game:**

**Option A: Full Multiplayer Mode**
- **TV/Host Screen:** http://localhost:9001/index.html
- **Phone Controller:** http://localhost:3001/index.html
  - Enter room code from TV screen
  - Or scan QR code displayed on TV

**Option B: Local Keyboard Testing** (no phone needed)
- Open: http://localhost:9001/index.html
- Click **"Test Locally (No Phone)"** button
- Select 1 or 2 players
- Use keyboard:
  - **Player 1:** W (jump), A (left), D (right)
  - **Player 2:** ↑ (jump), ← (left), → (right)

**Option C: Admin Test Panel** (unit tests)
- Open: http://localhost:9001/admin/test-panel.html
- Click "Run All Tests" to execute unit tests
- Use manual testing tools for controller/keyboard verification

### API Endpoints
- `POST /api/rooms`: Create new room, returns room_code and ws_url
- `GET /api/rooms/{code}`: Verify room exists
- `WS /ws/{code}`: WebSocket connection for real-time communication

**Base URL:** http://localhost:9000

### Running Alongside Stocktimus
Both projects can run simultaneously without port conflicts:
- **Stocktimus:** Uses ports 5432, 8000, 3000
- **SofaFriends:** Uses ports 6379, 9000, 9001, 3001

### Troubleshooting
- If ports are already in use, check if Stocktimus is running
- To stop: `docker-compose down`
- To rebuild: `docker-compose up --build`
- Check logs: `docker-compose logs -f [service_name]`
