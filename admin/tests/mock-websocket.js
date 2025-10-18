// Mock WebSocket for Testing
// Simulates WebSocket behavior without needing a real server

class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.readyState = MockWebSocket.CONNECTING;
        this.sentMessages = [];
        this.onopen = null;
        this.onclose = null;
        this.onerror = null;
        this.onmessage = null;

        // Auto-connect after a short delay to simulate real behavior
        setTimeout(() => {
            this.readyState = MockWebSocket.OPEN;
            if (this.onopen) {
                this.onopen({ type: 'open' });
            }
        }, 10);
    }

    send(data) {
        if (this.readyState !== MockWebSocket.OPEN) {
            throw new Error('WebSocket is not open');
        }

        // Record sent message
        const message = typeof data === 'string' ? JSON.parse(data) : data;
        this.sentMessages.push(message);

        // Auto-respond based on message type
        this.autoRespond(message);
    }

    close(code = 1000, reason = '') {
        this.readyState = MockWebSocket.CLOSING;
        setTimeout(() => {
            this.readyState = MockWebSocket.CLOSED;
            if (this.onclose) {
                this.onclose({ type: 'close', code, reason });
            }
        }, 10);
    }

    // Simulate receiving a message from server
    simulateMessage(data) {
        if (this.onmessage) {
            const event = {
                type: 'message',
                data: typeof data === 'string' ? data : JSON.stringify(data)
            };
            this.onmessage(event);
        }
    }

    // Simulate an error
    simulateError(error = 'Connection error') {
        if (this.onerror) {
            this.onerror({ type: 'error', error });
        }
    }

    // Auto-respond to common message types
    autoRespond(message) {
        switch (message.type) {
            case 'handshake':
                if (message.role === 'host') {
                    this.simulateMessage({
                        type: 'connected',
                        message: 'Host connected'
                    });
                } else if (message.role === 'controller') {
                    this.simulateMessage({
                        type: 'connected',
                        player_id: 'test-player-' + Math.random().toString(36).substr(2, 9),
                        color: '#FF6B6B',
                        name: message.name || 'Test Player'
                    });
                }
                break;

            case 'start_game':
                this.simulateMessage({
                    type: 'game_started'
                });
                break;

            case 'input':
                // Could simulate state updates here if needed
                break;

            case 'ping':
                this.simulateMessage({
                    type: 'pong',
                    timestamp: Date.now()
                });
                break;
        }
    }

    // Get last sent message
    getLastMessage() {
        return this.sentMessages[this.sentMessages.length - 1];
    }

    // Get all messages of a specific type
    getMessagesByType(type) {
        return this.sentMessages.filter(msg => msg.type === type);
    }

    // Clear sent messages
    clearMessages() {
        this.sentMessages = [];
    }

    // Static constants
    static get CONNECTING() { return 0; }
    static get OPEN() { return 1; }
    static get CLOSING() { return 2; }
    static get CLOSED() { return 3; }
}

// Mock WebSocket Server for testing multiple clients
class MockWebSocketServer {
    constructor() {
        this.clients = [];
        this.rooms = new Map();
    }

    createClient(url) {
        const client = new MockWebSocket(url);
        this.clients.push(client);

        // Extract room code from URL
        const roomMatch = url.match(/\/ws\/([A-Z0-9]{6})/);
        if (roomMatch) {
            const roomCode = roomMatch[1];
            if (!this.rooms.has(roomCode)) {
                this.rooms.set(roomCode, []);
            }
            this.rooms.get(roomCode).push(client);
        }

        return client;
    }

    // Broadcast to all clients in a room
    broadcast(roomCode, message) {
        const room = this.rooms.get(roomCode);
        if (room) {
            room.forEach(client => {
                client.simulateMessage(message);
            });
        }
    }

    // Get all clients in a room
    getRoom(roomCode) {
        return this.rooms.get(roomCode) || [];
    }

    // Simulate a lobby update
    simulateLobbyUpdate(roomCode, players) {
        this.broadcast(roomCode, {
            type: 'lobby_update',
            players: players
        });
    }

    // Simulate game start
    simulateGameStart(roomCode) {
        this.broadcast(roomCode, {
            type: 'game_started'
        });
    }

    // Clear all clients
    reset() {
        this.clients.forEach(client => {
            if (client.readyState === MockWebSocket.OPEN) {
                client.close();
            }
        });
        this.clients = [];
        this.rooms.clear();
    }
}

// Helper function to create a mock controller input state
function createMockInputState(overrides = {}) {
    return {
        left: false,
        right: false,
        jump: false,
        action: false,
        ...overrides
    };
}

// Helper function to create a mock player
function createMockPlayer(overrides = {}) {
    return {
        id: 'test-player-' + Math.random().toString(36).substr(2, 9),
        name: 'Test Player',
        color: '#FF6B6B',
        x: 100,
        y: 400,
        vx: 0,
        vy: 0,
        grounded: false,
        ...overrides
    };
}

// Helper to wait for async operations
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Export for use in tests
window.MockWebSocket = MockWebSocket;
window.MockWebSocketServer = MockWebSocketServer;
window.createMockInputState = createMockInputState;
window.createMockPlayer = createMockPlayer;
window.wait = wait;
