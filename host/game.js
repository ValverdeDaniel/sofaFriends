// SofaFriends Host Client
// Use current hostname so it works on both localhost and LAN
// Port 9000 to avoid conflict with Stocktimus (main business app on port 8000)
const API_URL = `http://${window.location.hostname}:9000`;

let ws = null;
let roomCode = null;
let players = {};
let gameStarted = false;

// Canvas setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = 1200;
    canvas.height = 600;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// DOM elements
const lobby = document.getElementById('lobby');
const roomCodeDisplay = document.getElementById('room-code');
const playerList = document.getElementById('player-list');
const startBtn = document.getElementById('start-btn');
const status = document.getElementById('status');

// Initialize
async function init() {
    // Add "Test Locally" button immediately
    addLocalTestButton();

    try {
        status.textContent = 'Creating room...';

        // Create room
        const response = await fetch(`${API_URL}/api/rooms`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to create room');
        }

        const data = await response.json();
        roomCode = data.room_code;
        const wsUrl = data.ws_url;

        // Display room code
        roomCodeDisplay.textContent = roomCode;

        // Generate QR code (optional - might fail if CDN is blocked)
        const qrContainer = document.getElementById('qr-code');
        try {
            if (typeof QRCode !== 'undefined') {
                QRCode.toCanvas(document.createElement('canvas'), data.qr_url, {
                    width: 200,
                    margin: 2,
                    color: {
                        dark: '#1a1a2e',
                        light: '#ffffff'
                    }
                }, (error, qrCanvas) => {
                    if (error) {
                        console.error('QR generation failed:', error);
                        qrContainer.innerHTML = '<p style="color: #bbb;">QR code unavailable</p>';
                    } else {
                        qrContainer.innerHTML = '';
                        qrContainer.appendChild(qrCanvas);
                    }
                });
            } else {
                qrContainer.innerHTML = '<p style="color: #bbb;">QR library not loaded</p>';
            }
        } catch (qrError) {
            console.warn('QR code generation skipped:', qrError);
            qrContainer.innerHTML = '<p style="color: #bbb;">QR code unavailable</p>';
        }

        // Connect WebSocket
        connectWebSocket(wsUrl);

    } catch (error) {
        console.error('Initialization error:', error);
        status.textContent = `Error: ${error.message}`;
    }
}

function connectWebSocket(wsUrl) {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        status.textContent = '🟢 Connected';
        // Send handshake
        ws.send(JSON.stringify({
            type: 'handshake',
            role: 'host'
        }));
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleMessage(message);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        status.textContent = '🔴 Connection error';
    };

    ws.onclose = () => {
        status.textContent = '🔴 Disconnected';
    };
}

function handleMessage(message) {
    const { type } = message;

    switch (type) {
        case 'connected':
            console.log('Host connected', message);
            break;

        case 'lobby_update':
            updatePlayerList(message.players);
            break;

        case 'game_started':
            startGame();
            break;

        case 'state':
            updateGameState(message);
            break;

        default:
            console.log('Unknown message type:', type, message);
    }
}

function updatePlayerList(playerData) {
    players = {};
    playerData.forEach(p => {
        players[p.id] = p;
    });

    // Update UI
    playerList.innerHTML = '';

    // Show 8 slots
    for (let i = 0; i < 8; i++) {
        const slot = document.createElement('div');
        slot.className = 'player-slot';

        const player = playerData[i];
        if (player) {
            slot.classList.add('filled');
            slot.style.backgroundColor = player.color;
            slot.innerHTML = `
                <div style="font-size: 40px;">👤</div>
                <div class="player-name">${player.name}</div>
            `;
        } else {
            slot.classList.add('empty');
            slot.innerHTML = `
                <div style="font-size: 32px;">⊕</div>
                <div>Empty</div>
            `;
        }

        playerList.appendChild(slot);
    }

    // Enable start button if we have players
    if (playerData.length > 0) {
        startBtn.disabled = false;
        startBtn.textContent = `Start Game (${playerData.length} player${playerData.length > 1 ? 's' : ''})`;
    } else {
        startBtn.disabled = true;
        startBtn.textContent = 'Waiting for players...';
    }
}

// Local testing mode - keyboard controls
let localTestMode = false;
let localInputState = {
    p1: { left: false, right: false, jump: false },
    p2: { left: false, right: false, jump: false }
};

// Death animation state
let deathAnimationActive = false;
let deathAnimationProgress = 0;

// Death animation types
const DEATH_ANIMATIONS = ['bubble', 'spring', 'flower', 'origami', 'pixel'];

// Level system
const LEVEL_WIDTH = 3000; // Wide level for side-scrolling
let cameraX = 0;
let platforms = [];
let obstacles = [];
let currentLevel = 1;

// Dragon and fireballs (Level 1 only)
let dragon = null;
let fireballs = [];

// Particle system for effects
let particles = [];

// Dragon class - hovers at the top and shoots fireballs
class Dragon {
    constructor() {
        this.x = 600; // Start closer to beginning so it's visible early
        this.y = 100; // Top of screen
        this.width = 80;
        this.height = 60;
        this.speed = 120; // Hover speed
        this.direction = 1; // 1 = right, -1 = left
        this.shootTimer = 0;
        this.shootInterval = 3; // Shoot every 3 seconds (not too aggressive)
        this.hoverRange = { min: 200, max: LEVEL_WIDTH - 400 }; // Stay away from edges
    }

    update(delta) {
        // Hover left and right
        this.x += this.speed * this.direction * delta;

        // Reverse direction at boundaries
        if (this.x > this.hoverRange.max) {
            this.direction = -1;
        } else if (this.x < this.hoverRange.min) {
            this.direction = 1;
        }

        // Shooting logic
        this.shootTimer += delta;
        if (this.shootTimer >= this.shootInterval) {
            this.shootFireball();
            this.shootTimer = 0;
        }
    }

    shootFireball() {
        fireballs.push(new Fireball(this.x, this.y + this.height / 2));
    }

    draw(ctx) {
        ctx.save();

        // Dragon body (simple friendly design)
        ctx.fillStyle = '#FF6B35';

        // Body oval
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wings (flapping animation based on x position)
        const wingFlap = Math.sin(Date.now() / 200) * 10;
        ctx.fillStyle = '#FF8C42';

        // Left wing
        ctx.beginPath();
        ctx.ellipse(this.x - 30, this.y, 25, 15 + wingFlap, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Right wing
        ctx.beginPath();
        ctx.ellipse(this.x + 30, this.y, 25, 15 + wingFlap, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.arc(this.x + (this.direction > 0 ? 25 : -25), this.y - 10, 20, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (friendly)
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + (this.direction > 0 ? 30 : -30), this.y - 12, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + (this.direction > 0 ? 32 : -32), this.y - 12, 2, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.strokeStyle = '#FF6B35';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x - (this.direction > 0 ? 35 : -35), this.y);
        ctx.quadraticCurveTo(
            this.x - (this.direction > 0 ? 50 : -50), this.y + 20,
            this.x - (this.direction > 0 ? 45 : -45), this.y + 35
        );
        ctx.stroke();

        ctx.restore();
    }
}

// Fireball class - falls down slowly
class Fireball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.speed = 200; // Falls at moderate speed (not too fast)
        this.active = true;
    }

    update(delta) {
        this.y += this.speed * delta;

        // Deactivate if off screen
        if (this.y > 700) {
            this.active = false;
        }
    }

    draw(ctx) {
        // Fireball glow
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, '#FFFF00');
        gradient.addColorStop(0.4, '#FF8C00');
        gradient.addColorStop(1, '#FF4500');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.fillStyle = '#FFFF99';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 400;
        this.vy = (Math.random() - 0.5) * 400 - 200; // Bias upward
        this.color = color;
        this.size = Math.random() * 8 + 4;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.01;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;
        this.shape = Math.random() > 0.5 ? 'square' : 'circle';
    }

    update(delta) {
        this.x += this.vx * delta;
        this.y += this.vy * delta;
        this.vy += 800 * delta; // Gravity
        this.rotation += this.rotationSpeed;
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.shape === 'square') {
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

// Enhanced particle class for special effects (must be after Particle)
class DeathParticle extends Particle {
    constructor(x, y, color, type = 'confetti') {
        super(x, y, color);
        this.type = type;

        if (type === 'bubble') {
            this.vx = (Math.random() - 0.5) * 100;
            this.vy = -Math.random() * 50 - 50; // Float up
            this.size = Math.random() * 15 + 5;
            this.decay = 0.008;
        } else if (type === 'petal') {
            this.vx = (Math.random() - 0.5) * 150;
            this.vy = Math.random() * 50 - 100;
            this.size = Math.random() * 8 + 4;
            this.decay = 0.006;
        } else if (type === 'pixel') {
            this.vx = (Math.random() - 0.5) * 300;
            this.vy = (Math.random() - 0.5) * 300;
            this.size = 8; // Fixed pixel size
            this.decay = 0.015;
            this.shape = 'square';
        }
    }

    update(delta) {
        if (this.type === 'bubble') {
            this.vy -= 100 * delta; // Float upward
            this.size += 10 * delta; // Grow
        } else if (this.type === 'petal') {
            this.vy += 200 * delta; // Gentle fall
            this.rotation += this.rotationSpeed * 3; // Spin more
        } else if (this.type === 'pixel') {
            this.vy += 400 * delta; // Half gravity
        }

        super.update(delta);
    }

    draw(ctx) {
        if (this.type === 'bubble') {
            ctx.save();
            ctx.globalAlpha = this.life * 0.5;

            // Bubble with rainbow shimmer
            const gradient = ctx.createRadialGradient(
                this.x - this.size * 0.3, this.y - this.size * 0.3, 0,
                this.x, this.y, this.size
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.5, this.color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');

            ctx.fillStyle = gradient;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        } else if (this.type === 'petal') {
            ctx.save();
            ctx.globalAlpha = this.life;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            // Petal shape
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size * 1.5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        } else {
            super.draw(ctx);
        }
    }
}

function createConfettiExplosion(x, y, playerColor) {
    const colors = [playerColor, '#FFD700', '#FF6B6B', '#4ECDC4', '#FFA07A', '#F7DC6F', '#BB8FCE', '#85C1E2'];

    // Create 50 particles
    for (let i = 0; i < 50; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.push(new Particle(x, y, color));
    }
}

function updateParticles(delta) {
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => p.update(delta));
}

function drawParticles(ctx) {
    particles.forEach(p => p.draw(ctx));
}

function createLevel1() {
    platforms = [
        // Ground platforms
        { x: 0, y: 500, width: 400, height: 20 },
        { x: 500, y: 500, width: 300, height: 20 },
        { x: 900, y: 500, width: 400, height: 20 },
        { x: 1400, y: 500, width: 300, height: 20 },
        { x: 1800, y: 500, width: 500, height: 20 },
        { x: 2400, y: 500, width: 600, height: 20 },

        // Elevated platforms
        { x: 600, y: 400, width: 150, height: 20 },
        { x: 1000, y: 380, width: 150, height: 20 },
        { x: 1500, y: 350, width: 200, height: 20 },
        { x: 2000, y: 400, width: 150, height: 20 },
    ];

    obstacles = [
        // Deadly red squares
        { x: 450, y: 470, size: 30 },
        { x: 850, y: 470, size: 30 },
        { x: 1350, y: 470, size: 30 },
        { x: 1750, y: 470, size: 30 },
        { x: 2200, y: 470, size: 30 },
        { x: 1100, y: 350, size: 30 }, // On elevated platform
    ];

    // Create dragon for level 1
    dragon = new Dragon();
    fireballs = [];
}

function loadLevel(levelNum) {
    if (levelNum === 1) {
        createLevel1();
    } else if (levelNum === 2) {
        createLevel2();
    }
}

function createLevel2() {
    platforms = [
        // Starting platform
        { x: 0, y: 500, width: 250, height: 20 },

        // Staircase section
        { x: 350, y: 480, width: 120, height: 20 },
        { x: 520, y: 450, width: 120, height: 20 },
        { x: 690, y: 420, width: 120, height: 20 },
        { x: 860, y: 390, width: 150, height: 20 },

        // High platform area with gaps
        { x: 1080, y: 350, width: 180, height: 20 },
        { x: 1340, y: 350, width: 180, height: 20 },
        { x: 1600, y: 380, width: 180, height: 20 },

        // Descent with narrow platforms
        { x: 1850, y: 420, width: 100, height: 20 },
        { x: 2000, y: 460, width: 100, height: 20 },
        { x: 2150, y: 500, width: 200, height: 20 },

        // Final stretch
        { x: 2400, y: 500, width: 300, height: 20 },
        { x: 2750, y: 480, width: 250, height: 20 },
    ];

    obstacles = [
        // Ground level hazards
        { x: 280, y: 470, size: 30 },

        // Staircase hazards
        { x: 580, y: 420, size: 30 },
        { x: 750, y: 390, size: 30 },

        // High platform hazards (between gaps)
        { x: 1280, y: 320, size: 30 },
        { x: 1540, y: 320, size: 30 },

        // Narrow platform hazards
        { x: 1880, y: 390, size: 30 },
        { x: 2030, y: 430, size: 30 },

        // Final stretch hazards
        { x: 2500, y: 470, size: 30 },
        { x: 2600, y: 470, size: 30 },
        { x: 2800, y: 450, size: 30 },
    ];

    // No dragon in level 2
    dragon = null;
    fireballs = [];
}

startBtn.addEventListener('click', () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'start_game' }));
    }
});

// Add "Test Locally" button function
function addLocalTestButton() {
    const testLocalBtn = document.createElement('button');
    testLocalBtn.id = 'test-local-btn';
    testLocalBtn.textContent = 'Test Locally (No Phone)';
    testLocalBtn.style.cssText = `
        margin-top: 20px;
        padding: 15px 40px;
        font-size: 18px;
        font-weight: bold;
        color: white;
        background: linear-gradient(135deg, #FF6B6B 0%, #C44569 100%);
        border: none;
        border-radius: 50px;
        cursor: pointer;
        box-shadow: 0 6px 15px rgba(255, 107, 107, 0.4);
        transition: transform 0.2s;
    `;

    testLocalBtn.addEventListener('mouseenter', () => {
        testLocalBtn.style.transform = 'translateY(-2px)';
    });

    testLocalBtn.addEventListener('mouseleave', () => {
        testLocalBtn.style.transform = 'translateY(0)';
    });

    testLocalBtn.addEventListener('click', () => {
        showPlayerCountSelection();
    });

    document.getElementById('lobby').appendChild(testLocalBtn);
}

function showPlayerCountSelection() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'player-count-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    modal.innerHTML = `
        <h2 style="color: white; font-size: 36px; margin-bottom: 40px;">Select Number of Players</h2>
        <div style="display: flex; gap: 30px;">
            <button id="one-player-btn" class="player-count-btn">
                <div style="font-size: 72px;">1️⃣</div>
                <div style="font-size: 24px; margin-top: 10px;">One Player</div>
                <div style="font-size: 14px; color: #bbb; margin-top: 5px;">WASD only</div>
            </button>
            <button id="two-player-btn" class="player-count-btn">
                <div style="font-size: 72px;">2️⃣</div>
                <div style="font-size: 24px; margin-top: 10px;">Two Players</div>
                <div style="font-size: 14px; color: #bbb; margin-top: 5px;">WASD + Arrows</div>
            </button>
        </div>
        <button id="cancel-btn" style="
            margin-top: 40px;
            padding: 12px 30px;
            font-size: 16px;
            color: #bbb;
            background: transparent;
            border: 2px solid #666;
            border-radius: 25px;
            cursor: pointer;
        ">Cancel</button>
    `;

    // Add button styles
    const style = document.createElement('style');
    style.textContent = `
        .player-count-btn {
            padding: 40px 60px;
            font-weight: bold;
            color: white;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: 3px solid transparent;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        .player-count-btn:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 35px rgba(102, 126, 234, 0.6);
            border-color: #4ECDC4;
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(modal);

    // Event listeners
    document.getElementById('one-player-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        showLevelSelection(1);
    });

    document.getElementById('two-player-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        showLevelSelection(2);
    });

    document.getElementById('cancel-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

function showLevelSelection(playerCount) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'level-select-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    modal.innerHTML = `
        <h2 style="color: white; font-size: 36px; margin-bottom: 40px;">Select Level</h2>
        <div style="display: flex; gap: 30px;">
            <button id="level-1-btn" class="level-select-btn">
                <div style="font-size: 72px;">🐉</div>
                <div style="font-size: 24px; margin-top: 10px;">Level 1</div>
                <div style="font-size: 14px; color: #bbb; margin-top: 5px;">Dragon Boss</div>
            </button>
            <button id="level-2-btn" class="level-select-btn">
                <div style="font-size: 72px;">⛰️</div>
                <div style="font-size: 24px; margin-top: 10px;">Level 2</div>
                <div style="font-size: 14px; color: #bbb; margin-top: 5px;">Mountain Climb</div>
            </button>
        </div>
        <button id="level-cancel-btn" style="
            margin-top: 40px;
            padding: 12px 30px;
            font-size: 16px;
            color: #bbb;
            background: transparent;
            border: 2px solid #666;
            border-radius: 25px;
            cursor: pointer;
        ">Back</button>
    `;

    // Add button styles
    const style = document.createElement('style');
    style.textContent = `
        .level-select-btn {
            padding: 40px 60px;
            font-weight: bold;
            color: white;
            background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
            border: 3px solid transparent;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 8px 25px rgba(78, 205, 196, 0.4);
        }
        .level-select-btn:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 35px rgba(78, 205, 196, 0.6);
            border-color: #FFD700;
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(modal);

    // Event listeners
    document.getElementById('level-1-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        localTestMode = true;
        startLocalTest(playerCount, 1);
    });

    document.getElementById('level-2-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        localTestMode = true;
        startLocalTest(playerCount, 2);
    });

    document.getElementById('level-cancel-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        showPlayerCountSelection();
    });
}

function startLocalTest(playerCount = 2, startLevel = 1) {
    gameStarted = true;
    lobby.classList.add('hidden');
    currentLevel = startLevel; // Start at selected level
    levelTransitioning = false; // Reset transition flag
    status.textContent = `🎮 Level ${currentLevel} - ${playerCount} Player${playerCount > 1 ? 's' : ''}`;

    // Initialize level
    loadLevel(currentLevel);
    cameraX = 0;
    particles = []; // Clear particles

    // Create players based on count
    const players = {
        'local1': {
            id: 'local1',
            name: 'Player 1 (WASD)',
            color: '#FF6B6B',
            x: 100,
            y: 400,
            vx: 0,
            vy: 0,
            grounded: false,
            active: true
        }
    };

    if (playerCount === 2) {
        players['local2'] = {
            id: 'local2',
            name: 'Player 2 (Arrows)',
            color: '#4ECDC4',
            x: 150,
            y: 400,
            vx: 0,
            vy: 0,
            grounded: false,
            active: true
        };
    }

    lastState = { players };

    // Add keyboard controls
    setupKeyboardControls(playerCount);

    // Start local game loop
    requestAnimationFrame(localGameLoop);
}

let levelTransitioning = false;

function nextLevel() {
    if (levelTransitioning) return; // Prevent multiple calls
    levelTransitioning = true;

    currentLevel++;

    if (currentLevel > 2) {
        // Game complete!
        status.textContent = '🎉 You Win! All Levels Complete!';

        // Victory confetti!
        for (let i = 0; i < 200; i++) {
            setTimeout(() => {
                const x = Math.random() * canvas.width + cameraX;
                const y = -50;
                createConfettiExplosion(x, y, '#FFD700');
            }, i * 20);
        }

        // Stop transitioning but keep rendering particles
        setTimeout(() => {
            levelTransitioning = false;
        }, 5000);
        return;
    }

    // Load next level
    status.textContent = `🎊 Level Complete! Loading Level ${currentLevel}...`;

    // Victory confetti
    const allPlayers = Object.values(lastState.players);
    allPlayers.forEach(player => {
        createConfettiExplosion(player.x, player.y, player.color);
    });

    setTimeout(() => {
        loadLevel(currentLevel);
        cameraX = 0;

        // Reset player positions
        lastState.players.local1.x = 100;
        lastState.players.local1.y = 400;
        lastState.players.local1.vx = 0;
        lastState.players.local1.vy = 0;

        if (lastState.players.local2) {
            lastState.players.local2.x = 150;
            lastState.players.local2.y = 400;
            lastState.players.local2.vx = 0;
            lastState.players.local2.vy = 0;
        }

        const playerCount = lastState.players.local2 ? 2 : 1;
        status.textContent = `🎮 Level ${currentLevel} - ${playerCount} Player${playerCount > 1 ? 's' : ''}`;

        levelTransitioning = false; // Allow next level transition
    }, 2000);
}

function restartLevel(deadPlayer = null) {
    if (deathAnimationActive) return; // Already dying

    deathAnimationActive = true;
    deathAnimationProgress = 0;

    // Mark which player died for animation
    if (deadPlayer) {
        // Pick random death animation
        deadPlayer.dying = true;
        deadPlayer.deathTime = 0;
        deadPlayer.deathAnimation = DEATH_ANIMATIONS[Math.floor(Math.random() * DEATH_ANIMATIONS.length)];

        // Trigger appropriate particle effects
        if (deadPlayer.deathAnimation === 'bubble') {
            // Create bubble pop particles
            for (let i = 0; i < 40; i++) {
                particles.push(new DeathParticle(deadPlayer.x, deadPlayer.y, deadPlayer.color, 'bubble'));
            }
        } else if (deadPlayer.deathAnimation === 'spring') {
            // Spring creates confetti at launch
            setTimeout(() => {
                createConfettiExplosion(deadPlayer.x, deadPlayer.y - 50, deadPlayer.color);
            }, 800);
        } else if (deadPlayer.deathAnimation === 'flower') {
            // Flower creates petals
            setTimeout(() => {
                for (let i = 0; i < 30; i++) {
                    particles.push(new DeathParticle(deadPlayer.x, deadPlayer.y - 40, deadPlayer.color, 'petal'));
                }
            }, 1200);
        } else if (deadPlayer.deathAnimation === 'origami') {
            // Origami creates paper trail
            setTimeout(() => {
                createConfettiExplosion(deadPlayer.x, deadPlayer.y, deadPlayer.color);
            }, 1000);
        } else if (deadPlayer.deathAnimation === 'pixel') {
            // Pixel creates pixel cubes
            for (let i = 0; i < 50; i++) {
                particles.push(new DeathParticle(deadPlayer.x, deadPlayer.y, deadPlayer.color, 'pixel'));
            }
        }
    }

    status.textContent = '💀 Died!';

    // Wait 3 seconds total (1s deflate + 2s watch confetti fall)
    setTimeout(() => {
        // Reset player positions
        lastState.players.local1.x = 100;
        lastState.players.local1.y = 400;
        lastState.players.local1.vx = 0;
        lastState.players.local1.vy = 0;
        lastState.players.local1.dying = false;
        lastState.players.local1.deathTime = 0;

        if (lastState.players.local2) {
            lastState.players.local2.x = 150;
            lastState.players.local2.y = 400;
            lastState.players.local2.vx = 0;
            lastState.players.local2.vy = 0;
            lastState.players.local2.dying = false;
            lastState.players.local2.deathTime = 0;
        }

        cameraX = 0;
        deathAnimationActive = false;
        deathAnimationProgress = 0;

        const playerCount = lastState.players.local2 ? 2 : 1;
        status.textContent = `🎮 Level ${currentLevel} - ${playerCount} Player${playerCount > 1 ? 's' : ''}`;
    }, 3000);
}

function setupKeyboardControls(playerCount = 2) {
    // Show controls hint
    const hint = document.createElement('div');
    hint.style.cssText = `
        position: absolute;
        top: 60px;
        left: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 15px;
        border-radius: 10px;
        font-size: 14px;
        line-height: 1.6;
        z-index: 100;
    `;

    let controlsHTML = `
        <strong>🎮 Keyboard Controls:</strong><br>
        <span style="color: #FF6B6B;">Player 1:</span> W=Jump, A=Left, D=Right
    `;

    if (playerCount === 2) {
        controlsHTML += `<br><span style="color: #4ECDC4;">Player 2:</span> ↑=Jump, ←=Left, →=Right`;
    }

    hint.innerHTML = controlsHTML;
    document.getElementById('app').appendChild(hint);

    window.addEventListener('keydown', (e) => {
        // Player 1 (WASD)
        if (e.key === 'a' || e.key === 'A') localInputState.p1.left = true;
        if (e.key === 'd' || e.key === 'D') localInputState.p1.right = true;
        if (e.key === 'w' || e.key === 'W') localInputState.p1.jump = true;

        // Player 2 (Arrow keys)
        if (e.key === 'ArrowLeft') localInputState.p2.left = true;
        if (e.key === 'ArrowRight') localInputState.p2.right = true;
        if (e.key === 'ArrowUp') localInputState.p2.jump = true;
    });

    window.addEventListener('keyup', (e) => {
        // Player 1
        if (e.key === 'a' || e.key === 'A') localInputState.p1.left = false;
        if (e.key === 'd' || e.key === 'D') localInputState.p1.right = false;
        if (e.key === 'w' || e.key === 'W') localInputState.p1.jump = false;

        // Player 2
        if (e.key === 'ArrowLeft') localInputState.p2.left = false;
        if (e.key === 'ArrowRight') localInputState.p2.right = false;
        if (e.key === 'ArrowUp') localInputState.p2.jump = false;
    });
}

function localGameLoop() {
    if (!localTestMode) return;

    const GRAVITY = 800;
    const MOVE_SPEED = 260; // Increased by 30% (was 200)
    const JUMP_SPEED = -400;
    const DELTA = 1/60; // 60 FPS

    // Get player references
    const p1 = lastState.players.local1;
    const p2 = lastState.players.local2;

    // Don't process input during death animation
    if (!deathAnimationActive) {
        // Update Player 1
        if (p1) {
            p1.vx = 0;
            if (localInputState.p1.left) p1.vx = -MOVE_SPEED;
            if (localInputState.p1.right) p1.vx = MOVE_SPEED;
            if (localInputState.p1.jump && p1.grounded) {
                p1.vy = JUMP_SPEED;
                localInputState.p1.jump = false; // Prevent holding
            }
        }

        // Update Player 2 (only if exists)
        if (p2) {
            p2.vx = 0;
            if (localInputState.p2.left) p2.vx = -MOVE_SPEED;
            if (localInputState.p2.right) p2.vx = MOVE_SPEED;
            if (localInputState.p2.jump && p2.grounded) {
                p2.vy = JUMP_SPEED;
                localInputState.p2.jump = false;
            }
        }
    }

    // Apply physics to all active players
    const activePlayers = [p1, p2].filter(p => p);
    activePlayers.forEach(player => {
        // Handle death animation
        if (player.dying) {
            player.deathTime += DELTA;
            // Slowly stop moving during death animation
            player.vx *= 0.95;
            player.vy *= 0.95;
            return; // Skip normal physics for dying player
        }

        // Gravity
        player.vy += GRAVITY * DELTA;

        // Update position
        player.x += player.vx * DELTA;
        player.y += player.vy * DELTA;

        // Platform collision detection
        player.grounded = false;
        const PLAYER_RADIUS = 25;

        platforms.forEach(platform => {
            // Check if player is above platform and falling
            if (player.vy >= 0 &&
                player.x + PLAYER_RADIUS > platform.x &&
                player.x - PLAYER_RADIUS < platform.x + platform.width &&
                player.y + PLAYER_RADIUS >= platform.y &&
                player.y + PLAYER_RADIUS <= platform.y + platform.height + 10) {

                player.y = platform.y - PLAYER_RADIUS;
                player.vy = 0;
                player.grounded = true;
            }
        });

        // Death pit (fell off map)
        if (player.y > 700) {
            restartLevel(player);
            return;
        }

        // Keep in horizontal bounds (but allow forward progress)
        player.x = Math.max(PLAYER_RADIUS, Math.min(LEVEL_WIDTH - PLAYER_RADIUS, player.x));

        // Obstacle collision (deadly squares)
        obstacles.forEach(obstacle => {
            const obstacleRight = obstacle.x + obstacle.size;
            const obstacleBottom = obstacle.y + obstacle.size;

            // Circle-rectangle collision
            const closestX = Math.max(obstacle.x, Math.min(player.x, obstacleRight));
            const closestY = Math.max(obstacle.y, Math.min(player.y, obstacleBottom));

            const distanceX = player.x - closestX;
            const distanceY = player.y - closestY;
            const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

            if (distanceSquared < (PLAYER_RADIUS * PLAYER_RADIUS)) {
                restartLevel(player);
            }
        });

        // Fireball collision (circle-circle collision)
        fireballs.forEach(fireball => {
            if (!fireball.active) return;

            const dx = player.x - fireball.x;
            const dy = player.y - fireball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < PLAYER_RADIUS + fireball.radius) {
                restartLevel(player);
                fireball.active = false; // Deactivate fireball
            }
        });
    });

    // Update camera to follow the rightmost player
    const playerXPositions = activePlayers.map(p => p.x);
    const maxPlayerX = Math.max(...playerXPositions);
    const targetCameraX = Math.max(0, Math.min(LEVEL_WIDTH - canvas.width, maxPlayerX - canvas.width / 3));
    cameraX += (targetCameraX - cameraX) * 0.1; // Smooth follow

    // Update dragon and fireballs (only in Level 1)
    if (dragon && !deathAnimationActive) {
        dragon.update(DELTA);
    }

    // Update fireballs
    fireballs.forEach(fireball => fireball.update(DELTA));
    fireballs = fireballs.filter(f => f.active); // Remove inactive fireballs

    // Update particles
    updateParticles(DELTA);

    // Check win condition (reached finish line)
    if (!levelTransitioning) {
        const finishX = LEVEL_WIDTH - 200;
        const allPlayersAtFinish = activePlayers.every(p => p.x >= finishX);
        if (allPlayersAtFinish) {
            nextLevel();
        }
    }

    // Render
    render();

    // Continue loop
    requestAnimationFrame(localGameLoop);
}

function startGame() {
    gameStarted = true;
    lobby.classList.add('hidden');
    status.textContent = '🎮 Game running';

    // Start render loop
    requestAnimationFrame(render);
}

let lastState = null;

function updateGameState(state) {
    lastState = state;
}

function render() {
    if (!gameStarted) return;

    // Clear canvas
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save context and apply camera transform
    ctx.save();
    ctx.translate(-cameraX, 0);

    // Draw background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridStartX = Math.floor(cameraX / 50) * 50;
    for (let x = gridStartX; x < cameraX + canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(cameraX, y);
        ctx.lineTo(cameraX + canvas.width, y);
        ctx.stroke();
    }

    // Draw platforms
    ctx.fillStyle = '#16213e';
    ctx.strokeStyle = '#4ECDC4';
    ctx.lineWidth = 2;
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw obstacles (deadly red squares)
    obstacles.forEach(obstacle => {
        ctx.fillStyle = '#FF3333';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.size, obstacle.size);

        // Danger stripes
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y);
        ctx.lineTo(obstacle.x + obstacle.size, obstacle.y + obstacle.size);
        ctx.moveTo(obstacle.x + obstacle.size, obstacle.y);
        ctx.lineTo(obstacle.x, obstacle.y + obstacle.size);
        ctx.stroke();
    });

    // Draw dragon (Level 1 only)
    if (dragon) {
        dragon.draw(ctx);
    }

    // Draw fireballs
    fireballs.forEach(fireball => {
        if (fireball.active) {
            fireball.draw(ctx);
        }
    });

    // Draw particles (confetti)
    drawParticles(ctx);

    // Draw players
    if (lastState && lastState.players) {
        Object.values(lastState.players).forEach(player => {
            if (player.dying) {
                const deathProgress = Math.min(player.deathTime / 1.5, 1);
                const radius = 25;
                const animType = player.deathAnimation;

                ctx.save();

                if (animType === 'bubble') {
                    // BUBBLE POP: Transform into bubble, float up, grow, pop
                    const bubbleProgress = deathProgress * 1.2;
                    const scale = 1 + bubbleProgress * 0.8;
                    const alpha = Math.max(0, 1 - bubbleProgress);

                    ctx.translate(player.x, player.y - bubbleProgress * 100);
                    ctx.globalAlpha = alpha * 0.6;

                    // Rainbow gradient bubble
                    const gradient = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 0, 0, 0, radius * scale);
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                    gradient.addColorStop(0.5, player.color);
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');

                    ctx.fillStyle = gradient;
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(0, 0, radius * scale, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                } else if (animType === 'spring') {
                    // SPRING BOUNCE: Compress down, then launch up
                    const springPhase = deathProgress < 0.5 ? deathProgress / 0.5 : 1;
                    const launchPhase = deathProgress >= 0.5 ? (deathProgress - 0.5) / 0.5 : 0;

                    if (launchPhase === 0) {
                        // Compression phase
                        const squish = 1 - springPhase * 0.7;
                        ctx.translate(player.x, player.y);
                        ctx.scale(1 + (1 - squish), squish);

                        ctx.fillStyle = player.color;
                        ctx.beginPath();
                        ctx.arc(0, 0, radius, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.strokeStyle = 'white';
                        ctx.lineWidth = 3;
                        ctx.stroke();

                        // Spring coils
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                        ctx.lineWidth = 2;
                        for (let i = 0; i < 3; i++) {
                            ctx.beginPath();
                            ctx.arc(0, -5 - i * 8 * squish, radius * 0.6, 0, Math.PI * 2);
                            ctx.stroke();
                        }
                    } else {
                        // Launch phase
                        const yOffset = -launchPhase * 500;
                        const trailAlpha = 1 - launchPhase;

                        ctx.translate(player.x, player.y + yOffset);
                        ctx.globalAlpha = trailAlpha;

                        ctx.fillStyle = player.color;
                        ctx.beginPath();
                        ctx.arc(0, 0, radius, 0, Math.PI * 2);
                        ctx.fill();

                        // Motion blur trail
                        for (let i = 1; i < 5; i++) {
                            ctx.globalAlpha = trailAlpha * (1 - i * 0.2);
                            ctx.beginPath();
                            ctx.arc(0, i * 30, radius, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }

                } else if (animType === 'flower') {
                    // FLOWER BLOOM: Root, grow stem, bloom petals
                    const rootPhase = Math.min(deathProgress / 0.3, 1);
                    const stemPhase = Math.min(Math.max(deathProgress - 0.3, 0) / 0.4, 1);
                    const bloomPhase = Math.min(Math.max(deathProgress - 0.7, 0) / 0.3, 1);

                    ctx.translate(player.x, player.y);

                    if (rootPhase < 1) {
                        // Morphing into plant
                        ctx.globalAlpha = 1 - rootPhase * 0.5;
                        ctx.fillStyle = player.color;
                        ctx.beginPath();
                        ctx.arc(0, 0, radius * (1 - rootPhase * 0.5), 0, Math.PI * 2);
                        ctx.fill();
                    }

                    // Stem growing
                    if (stemPhase > 0) {
                        ctx.strokeStyle = '#4CAF50';
                        ctx.lineWidth = 4;
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.lineTo(0, -stemPhase * 60);
                        ctx.stroke();

                        // Leaves
                        if (stemPhase > 0.5) {
                            ctx.fillStyle = '#81C784';
                            ctx.beginPath();
                            ctx.ellipse(-15, -30 * stemPhase, 8, 12, -Math.PI / 4, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.beginPath();
                            ctx.ellipse(15, -35 * stemPhase, 8, 12, Math.PI / 4, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }

                    // Flower bloom
                    if (bloomPhase > 0) {
                        const flowerY = -60;
                        const petalCount = 6;

                        for (let i = 0; i < petalCount; i++) {
                            const angle = (i / petalCount) * Math.PI * 2;
                            const petalScale = bloomPhase;
                            const x = Math.cos(angle) * 15 * petalScale;
                            const y = flowerY + Math.sin(angle) * 15 * petalScale;

                            ctx.fillStyle = player.color;
                            ctx.beginPath();
                            ctx.ellipse(x, y, 8 * petalScale, 12 * petalScale, angle, 0, Math.PI * 2);
                            ctx.fill();
                        }

                        // Center
                        ctx.fillStyle = '#FDD835';
                        ctx.beginPath();
                        ctx.arc(0, flowerY, 6 * bloomPhase, 0, Math.PI * 2);
                        ctx.fill();
                    }

                } else if (animType === 'origami') {
                    // ORIGAMI FOLD: Flatten, fold into crane, fly away
                    const flattenPhase = Math.min(deathProgress / 0.3, 1);
                    const foldPhase = Math.min(Math.max(deathProgress - 0.3, 0) / 0.4, 1);
                    const flyPhase = Math.min(Math.max(deathProgress - 0.7, 0) / 0.3, 1);

                    if (flyPhase === 0) {
                        ctx.translate(player.x, player.y);

                        if (flattenPhase < 1) {
                            // Flattening into paper
                            ctx.scale(1, 1 - flattenPhase * 0.9);
                            ctx.fillStyle = player.color;
                            ctx.beginPath();
                            ctx.arc(0, 0, radius, 0, Math.PI * 2);
                            ctx.fill();
                        } else {
                            // Folding animation
                            ctx.rotate(foldPhase * Math.PI * 2);

                            // Draw folded paper
                            ctx.fillStyle = player.color;
                            ctx.beginPath();
                            ctx.moveTo(-radius, 0);
                            ctx.lineTo(0, -radius * (1 + foldPhase));
                            ctx.lineTo(radius, 0);
                            ctx.lineTo(0, radius * 0.5);
                            ctx.closePath();
                            ctx.fill();

                            // Fold lines
                            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    } else {
                        // Flying crane
                        const yOffset = -flyPhase * 200;
                        const wingFlap = Math.sin(flyPhase * Math.PI * 6) * 10;

                        ctx.translate(player.x, player.y + yOffset);
                        ctx.globalAlpha = 1 - flyPhase;

                        // Crane body
                        ctx.fillStyle = player.color;
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.lineTo(-10, 10);
                        ctx.lineTo(-20, 5 + wingFlap);
                        ctx.lineTo(-10, 0);
                        ctx.lineTo(0, 0);
                        ctx.lineTo(10, 0);
                        ctx.lineTo(20, 5 - wingFlap);
                        ctx.lineTo(10, 10);
                        ctx.closePath();
                        ctx.fill();
                    }

                } else if (animType === 'pixel') {
                    // PIXEL DISINTEGRATION: Glitch, pixelate, explode
                    const glitchPhase = Math.min(deathProgress / 0.3, 1);
                    const pixelPhase = Math.min(Math.max(deathProgress - 0.3, 0) / 0.7, 1);

                    ctx.translate(player.x, player.y);

                    if (pixelPhase < 0.5) {
                        // Glitching effect
                        const offset = Math.random() * glitchPhase * 10;
                        ctx.translate(Math.random() > 0.5 ? offset : -offset, 0);

                        // Draw horizontal scan lines
                        for (let i = -radius; i < radius; i += 4) {
                            if (Math.random() > glitchPhase) {
                                ctx.fillStyle = player.color;
                                ctx.fillRect(-radius, i, radius * 2, 3);
                            }
                        }

                        // Original shape fading
                        ctx.globalAlpha = 1 - glitchPhase;
                        ctx.fillStyle = player.color;
                        ctx.beginPath();
                        ctx.arc(0, 0, radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    // Pixels explosion handled by particles
                }

                ctx.restore();

                // Draw name (fading)
                ctx.fillStyle = 'white';
                ctx.globalAlpha = Math.max(0, 1 - deathProgress * 2);
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(player.name, player.x, player.y - 35);
                ctx.globalAlpha = 1;

            } else {
                // Normal player circle
                ctx.fillStyle = player.color;
                ctx.beginPath();
                ctx.arc(player.x, player.y, 25, 0, Math.PI * 2);
                ctx.fill();

                // Draw outline
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Draw name
                ctx.fillStyle = 'white';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(player.name, player.x, player.y - 35);
            }
        });
    }

    // Draw finish line
    const finishX = LEVEL_WIDTH - 200;
    ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
    ctx.fillRect(finishX, 0, 200, canvas.height);
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(finishX, 0);
    ctx.lineTo(finishX, canvas.height);
    ctx.stroke();

    // Draw "FINISH" text
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', finishX + 100, 250);

    ctx.restore();

    // Draw UI overlay (not affected by camera)
    if (lastState && lastState.players) {
        const playerXPositions = Object.values(lastState.players).map(p => p.x);
        const maxDistance = Math.max(...playerXPositions);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Distance: ${Math.floor(maxDistance)}/${LEVEL_WIDTH}`, 10, canvas.height - 10);
    }
}

// Start everything
init();