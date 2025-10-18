// SofaFriends Controller Client
// Use current hostname so it works on both localhost and LAN
// Port 9000 to avoid conflict with Stocktimus (main business app on port 8000)
const API_URL = `http://${window.location.hostname}:9000`;

let ws = null;
let roomCode = null;
let playerId = null;
let playerColor = null;
let inputState = {
    left: false,
    right: false,
    jump: false,
    action: false
};

// DOM elements
const joinScreen = document.getElementById('join-screen');
const lobbyScreen = document.getElementById('lobby-screen');
const gameScreen = document.getElementById('game-screen');
const roomCodeInput = document.getElementById('room-code-input');
const joinBtn = document.getElementById('join-btn');
const statusBar = document.getElementById('status-bar');
const statusDot = statusBar.querySelector('.status-dot');
const statusText = document.getElementById('status-text');
const playerAvatar = document.getElementById('player-avatar');
const playerNameDisplay = document.getElementById('player-name');
const roomDisplay = document.getElementById('room-display');

// Check if room code is in URL
const urlParams = new URLSearchParams(window.location.search);
const urlRoomCode = urlParams.get('room');
if (urlRoomCode) {
    roomCodeInput.value = urlRoomCode.toUpperCase();
}

// Join button handler
joinBtn.addEventListener('click', joinRoom);
roomCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinRoom();
    }
});

async function joinRoom() {
    roomCode = roomCodeInput.value.trim().toUpperCase();

    if (roomCode.length !== 6) {
        alert('Please enter a 6-character room code');
        return;
    }

    try {
        // Check if room exists
        const response = await fetch(`${API_URL}/api/rooms/${roomCode}`);
        if (!response.ok) {
            alert('Room not found. Check the code and try again.');
            return;
        }

        // Connect via WebSocket
        const wsUrl = `ws://${window.location.hostname}:9000/ws/${roomCode}`;
        connectWebSocket(wsUrl);

    } catch (error) {
        console.error('Join error:', error);
        alert('Failed to join room. Make sure the host is online.');
    }
}

function connectWebSocket(wsUrl) {
    updateStatus('connecting', 'Connecting...');

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        updateStatus('connected', 'Connected');

        // Send handshake
        ws.send(JSON.stringify({
            type: 'handshake',
            role: 'controller',
            name: generatePlayerName()
        }));
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleMessage(message);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateStatus('error', 'Connection error');
    };

    ws.onclose = () => {
        updateStatus('disconnected', 'Disconnected');
        // Could add reconnection logic here
    };
}

function handleMessage(message) {
    const { type } = message;

    switch (type) {
        case 'connected':
            playerId = message.player_id;
            playerColor = message.color;
            showLobby(message);
            break;

        case 'lobby_update':
            // Could update lobby UI if needed
            break;

        case 'game_started':
            startGame();
            break;

        case 'pong':
            // Handle latency measurement
            break;

        case 'error':
            alert(message.message);
            break;

        default:
            console.log('Unknown message:', message);
    }
}

function generatePlayerName() {
    const adjectives = ['Swift', 'Brave', 'Clever', 'Bold', 'Quick', 'Wise', 'Cool', 'Epic'];
    const nouns = ['Fox', 'Wolf', 'Bear', 'Eagle', 'Tiger', 'Lion', 'Shark', 'Dragon'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun}`;
}

function showLobby(data) {
    joinScreen.classList.add('hidden');
    lobbyScreen.classList.add('active');

    // Set player color and name
    playerAvatar.style.backgroundColor = data.color;
    playerNameDisplay.textContent = data.name;
    playerNameDisplay.style.color = data.color;
    roomDisplay.textContent = `Room: ${roomCode}`;
}

function startGame() {
    lobbyScreen.classList.remove('active');
    gameScreen.classList.add('active');

    // Initialize controls
    initializeControls();

    // Start input loop
    setInterval(sendInput, 50); // 20 Hz input rate
}

function initializeControls() {
    const buttons = document.querySelectorAll('.control-btn');

    buttons.forEach(btn => {
        const action = btn.dataset.action;

        // Touch events
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btn.classList.add('pressed');
            inputState[action] = true;
            vibrate(20);
        });

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            btn.classList.remove('pressed');
            inputState[action] = false;
        });

        btn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            btn.classList.remove('pressed');
            inputState[action] = false;
        });

        // Mouse events (for desktop testing)
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            btn.classList.add('pressed');
            inputState[action] = true;
        });

        btn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            btn.classList.remove('pressed');
            inputState[action] = false;
        });

        btn.addEventListener('mouseleave', (e) => {
            btn.classList.remove('pressed');
            inputState[action] = false;
        });
    });

    // Left button special handling - can also be right
    const leftBtn = document.getElementById('btn-left');
    leftBtn.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const rect = leftBtn.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;

            if (touch.clientX < centerX - 20) {
                inputState.left = true;
                inputState.right = false;
                leftBtn.textContent = '◄';
            } else if (touch.clientX > centerX + 20) {
                inputState.left = false;
                inputState.right = true;
                leftBtn.textContent = '►';
            } else {
                inputState.left = false;
                inputState.right = false;
                leftBtn.textContent = '◄►';
            }
        }
    });
}

function sendInput() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'input',
            left: inputState.left,
            right: inputState.right,
            jump: inputState.jump,
            action: inputState.action,
            timestamp: Date.now()
        }));
    }
}

function updateStatus(state, text) {
    statusText.textContent = text;
    statusDot.className = 'status-dot';

    if (state === 'connected') {
        statusDot.classList.add('connected');
    } else {
        statusDot.classList.add('disconnected');
    }
}

function vibrate(duration) {
    if ('vibrate' in navigator) {
        navigator.vibrate(duration);
    }
}

// Prevent pull-to-refresh and other iOS gestures
document.body.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// Keep screen awake
let wakeLock = null;
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
        }
    } catch (err) {
        console.log('Wake lock error:', err);
    }
}

// Request wake lock when game starts
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && gameScreen.classList.contains('active')) {
        requestWakeLock();
    }
});

// Initialize
updateStatus('disconnected', 'Not connected');