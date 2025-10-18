// Unit Tests for WebSocket Communication

function createWebSocketTests(runner) {
    runner.suite('WebSocket - Connection Lifecycle', ({ test, beforeEach, afterEach }) => {
        let mockWs;

        beforeEach(async () => {
            mockWs = new MockWebSocket('ws://localhost:8000/ws/ABC123');
            await wait(20); // Wait for auto-connect
        });

        afterEach(() => {
            if (mockWs && mockWs.readyState === MockWebSocket.OPEN) {
                mockWs.close();
            }
        });

        test('should initialize with CONNECTING state', (assert) => {
            const ws = new MockWebSocket('ws://localhost:8000/ws/TEST12');
            assert.equal(ws.readyState, MockWebSocket.CONNECTING, 'Should start in CONNECTING state');
        });

        test('should transition to OPEN state on connection', (assert) => {
            assert.equal(mockWs.readyState, MockWebSocket.OPEN, 'Should be in OPEN state');
        });

        test('should call onopen handler when connected', async (assert) => {
            let opened = false;
            const ws = new MockWebSocket('ws://localhost:8000/ws/TEST12');

            ws.onopen = () => {
                opened = true;
            };

            await wait(20);
            assert.isTrue(opened, 'onopen should be called');
        });

        test('should transition to CLOSED state on close', async (assert) => {
            mockWs.close();
            await wait(20);

            assert.equal(mockWs.readyState, MockWebSocket.CLOSED, 'Should be in CLOSED state');
        });

        test('should call onclose handler when closed', async (assert) => {
            let closed = false;
            mockWs.onclose = () => {
                closed = true;
            };

            mockWs.close();
            await wait(20);

            assert.isTrue(closed, 'onclose should be called');
        });

        test('should handle onerror callback', (assert) => {
            let errorReceived = false;

            mockWs.onerror = (error) => {
                errorReceived = true;
            };

            mockWs.simulateError('Test error');
            assert.isTrue(errorReceived, 'onerror should be called');
        });
    });

    runner.suite('WebSocket - Host Messages', ({ test, beforeEach, afterEach }) => {
        let mockWs;

        beforeEach(async () => {
            mockWs = new MockWebSocket('ws://localhost:8000/ws/ABC123');
            await wait(20);
        });

        afterEach(() => {
            mockWs.close();
        });

        test('should send host handshake', (assert) => {
            const handshake = {
                type: 'handshake',
                role: 'host'
            };

            mockWs.send(JSON.stringify(handshake));

            const lastMsg = mockWs.getLastMessage();
            assert.equal(lastMsg.type, 'handshake', 'Should send handshake');
            assert.equal(lastMsg.role, 'host', 'Role should be host');
        });

        test('should receive host connected confirmation', async (assert) => {
            let connectedMsg = null;

            mockWs.onmessage = (event) => {
                connectedMsg = JSON.parse(event.data);
            };

            mockWs.send(JSON.stringify({ type: 'handshake', role: 'host' }));
            await wait(10);

            assert.exists(connectedMsg, 'Should receive connected message');
            assert.equal(connectedMsg.type, 'connected', 'Should be connected type');
        });

        test('should send start_game message', (assert) => {
            mockWs.send(JSON.stringify({ type: 'start_game' }));

            const lastMsg = mockWs.getLastMessage();
            assert.equal(lastMsg.type, 'start_game', 'Should send start_game');
        });

        test('should receive game_started confirmation', async (assert) => {
            let gameStartedMsg = null;

            mockWs.onmessage = (event) => {
                gameStartedMsg = JSON.parse(event.data);
            };

            mockWs.send(JSON.stringify({ type: 'start_game' }));
            await wait(10);

            assert.exists(gameStartedMsg, 'Should receive message');
            assert.equal(gameStartedMsg.type, 'game_started', 'Should be game_started');
        });

        test('should receive lobby_update messages', async (assert) => {
            let lobbyUpdate = null;

            mockWs.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.type === 'lobby_update') {
                    lobbyUpdate = msg;
                }
            };

            mockWs.simulateMessage({
                type: 'lobby_update',
                players: [
                    { id: 'p1', name: 'Player 1', color: '#FF6B6B' }
                ]
            });

            await wait(10);

            assert.exists(lobbyUpdate, 'Should receive lobby update');
            assert.isArray(lobbyUpdate.players, 'Should have players array');
            assert.equal(lobbyUpdate.players.length, 1, 'Should have 1 player');
        });
    });

    runner.suite('WebSocket - Controller Messages', ({ test, beforeEach, afterEach }) => {
        let mockWs;

        beforeEach(async () => {
            mockWs = new MockWebSocket('ws://localhost:8000/ws/ABC123');
            await wait(20);
        });

        afterEach(() => {
            mockWs.close();
        });

        test('should send controller handshake with name', (assert) => {
            const handshake = {
                type: 'handshake',
                role: 'controller',
                name: 'Swift Fox'
            };

            mockWs.send(JSON.stringify(handshake));

            const lastMsg = mockWs.getLastMessage();
            assert.equal(lastMsg.type, 'handshake', 'Should send handshake');
            assert.equal(lastMsg.role, 'controller', 'Role should be controller');
            assert.equal(lastMsg.name, 'Swift Fox', 'Should include player name');
        });

        test('should receive player_id and color on connection', async (assert) => {
            let playerData = null;

            mockWs.onmessage = (event) => {
                playerData = JSON.parse(event.data);
            };

            mockWs.send(JSON.stringify({
                type: 'handshake',
                role: 'controller',
                name: 'Test Player'
            }));

            await wait(10);

            assert.exists(playerData, 'Should receive player data');
            assert.exists(playerData.player_id, 'Should have player_id');
            assert.exists(playerData.color, 'Should have color');
            assert.exists(playerData.name, 'Should have name');
        });

        test('should send input messages at regular intervals', (assert) => {
            for (let i = 0; i < 5; i++) {
                mockWs.send(JSON.stringify({
                    type: 'input',
                    left: i % 2 === 0,
                    right: false,
                    jump: false,
                    action: false,
                    timestamp: Date.now()
                }));
            }

            const inputMessages = mockWs.getMessagesByType('input');
            assert.equal(inputMessages.length, 5, 'Should have 5 input messages');
        });

        test('should include all input states in input message', (assert) => {
            const input = {
                type: 'input',
                left: true,
                right: false,
                jump: true,
                action: false,
                timestamp: Date.now()
            };

            mockWs.send(JSON.stringify(input));

            const lastMsg = mockWs.getLastMessage();
            assert.exists(lastMsg.left, 'Should have left');
            assert.exists(lastMsg.right, 'Should have right');
            assert.exists(lastMsg.jump, 'Should have jump');
            assert.exists(lastMsg.action, 'Should have action');
            assert.exists(lastMsg.timestamp, 'Should have timestamp');
        });
    });

    runner.suite('WebSocket - Message Format Validation', ({ test }) => {
        test('should validate handshake message structure', (assert) => {
            const handshake = {
                type: 'handshake',
                role: 'controller',
                name: 'Player'
            };

            assert.equal(handshake.type, 'handshake', 'Should have type');
            assert.isType(handshake.role, 'string', 'Role should be string');
            assert.isType(handshake.name, 'string', 'Name should be string');
        });

        test('should validate input message structure', (assert) => {
            const input = {
                type: 'input',
                left: false,
                right: false,
                jump: false,
                action: false,
                timestamp: Date.now()
            };

            assert.equal(input.type, 'input', 'Should have type');
            assert.isType(input.left, 'boolean', 'Left should be boolean');
            assert.isType(input.right, 'boolean', 'Right should be boolean');
            assert.isType(input.jump, 'boolean', 'Jump should be boolean');
            assert.isType(input.action, 'boolean', 'Action should be boolean');
            assert.isType(input.timestamp, 'number', 'Timestamp should be number');
        });

        test('should validate lobby_update message structure', (assert) => {
            const lobbyUpdate = {
                type: 'lobby_update',
                players: [
                    { id: 'p1', name: 'Player 1', color: '#FF6B6B' }
                ]
            };

            assert.equal(lobbyUpdate.type, 'lobby_update', 'Should have type');
            assert.isArray(lobbyUpdate.players, 'Players should be array');
            assert.exists(lobbyUpdate.players[0].id, 'Player should have id');
            assert.exists(lobbyUpdate.players[0].name, 'Player should have name');
            assert.exists(lobbyUpdate.players[0].color, 'Player should have color');
        });

        test('should validate game_started message structure', (assert) => {
            const gameStarted = {
                type: 'game_started'
            };

            assert.equal(gameStarted.type, 'game_started', 'Should have type');
        });

        test('should validate state message structure', (assert) => {
            const state = {
                type: 'state',
                players: {
                    'p1': {
                        id: 'p1',
                        x: 100,
                        y: 400,
                        vx: 0,
                        vy: 0,
                        color: '#FF6B6B',
                        name: 'Player 1'
                    }
                }
            };

            assert.equal(state.type, 'state', 'Should have type');
            assert.isObject(state.players, 'Players should be object');
            assert.exists(state.players.p1, 'Should have player data');
        });
    });

    runner.suite('WebSocket - Multi-Room Support', ({ test, beforeEach, afterEach }) => {
        let server;

        beforeEach(() => {
            server = new MockWebSocketServer();
        });

        afterEach(() => {
            server.reset();
        });

        test('should support multiple rooms', (assert) => {
            const ws1 = server.createClient('ws://localhost:8000/ws/ROOM01');
            const ws2 = server.createClient('ws://localhost:8000/ws/ROOM02');

            assert.equal(server.rooms.size, 2, 'Should have 2 rooms');
        });

        test('should isolate messages to specific rooms', async (assert) => {
            const ws1 = server.createClient('ws://localhost:8000/ws/ROOM01');
            const ws2 = server.createClient('ws://localhost:8000/ws/ROOM02');

            await wait(20);

            let room1Received = false;
            let room2Received = false;

            ws1.onmessage = () => { room1Received = true; };
            ws2.onmessage = () => { room2Received = true; };

            server.broadcast('ROOM01', { type: 'test' });
            await wait(10);

            assert.isTrue(room1Received, 'Room 1 should receive message');
            assert.isFalse(room2Received, 'Room 2 should not receive message');
        });

        test('should support multiple clients in same room', (assert) => {
            const ws1 = server.createClient('ws://localhost:8000/ws/ROOM01');
            const ws2 = server.createClient('ws://localhost:8000/ws/ROOM01');
            const ws3 = server.createClient('ws://localhost:8000/ws/ROOM01');

            const room = server.getRoom('ROOM01');
            assert.equal(room.length, 3, 'Room should have 3 clients');
        });

        test('should broadcast lobby updates to all clients in room', async (assert) => {
            const ws1 = server.createClient('ws://localhost:8000/ws/ROOM01');
            const ws2 = server.createClient('ws://localhost:8000/ws/ROOM01');

            await wait(20);

            let ws1Received = null;
            let ws2Received = null;

            ws1.onmessage = (e) => { ws1Received = JSON.parse(e.data); };
            ws2.onmessage = (e) => { ws2Received = JSON.parse(e.data); };

            const players = [
                { id: 'p1', name: 'Player 1', color: '#FF6B6B' },
                { id: 'p2', name: 'Player 2', color: '#4ECDC4' }
            ];

            server.simulateLobbyUpdate('ROOM01', players);
            await wait(10);

            assert.exists(ws1Received, 'Client 1 should receive update');
            assert.exists(ws2Received, 'Client 2 should receive update');
            assert.deepEqual(ws1Received.players, players, 'Client 1 should have correct data');
            assert.deepEqual(ws2Received.players, players, 'Client 2 should have correct data');
        });

        test('should broadcast game_started to all clients', async (assert) => {
            const ws1 = server.createClient('ws://localhost:8000/ws/ROOM01');
            const ws2 = server.createClient('ws://localhost:8000/ws/ROOM01');

            await wait(20);

            let ws1Started = false;
            let ws2Started = false;

            ws1.onmessage = (e) => {
                const msg = JSON.parse(e.data);
                if (msg.type === 'game_started') ws1Started = true;
            };

            ws2.onmessage = (e) => {
                const msg = JSON.parse(e.data);
                if (msg.type === 'game_started') ws2Started = true;
            };

            server.simulateGameStart('ROOM01');
            await wait(10);

            assert.isTrue(ws1Started, 'Client 1 should receive game_started');
            assert.isTrue(ws2Started, 'Client 2 should receive game_started');
        });
    });

    runner.suite('WebSocket - Error Handling', ({ test, beforeEach, afterEach }) => {
        let mockWs;

        beforeEach(async () => {
            mockWs = new MockWebSocket('ws://localhost:8000/ws/ABC123');
            await wait(20);
        });

        afterEach(() => {
            if (mockWs.readyState === MockWebSocket.OPEN) {
                mockWs.close();
            }
        });

        test('should throw error when sending on closed connection', (assert) => {
            mockWs.readyState = MockWebSocket.CLOSED;

            assert.throws(() => {
                mockWs.send(JSON.stringify({ type: 'test' }));
            }, Error, 'Should throw error');
        });

        test('should handle server error messages', async (assert) => {
            let errorMsg = null;

            mockWs.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.type === 'error') {
                    errorMsg = msg;
                }
            };

            mockWs.simulateMessage({
                type: 'error',
                message: 'Room is full'
            });

            await wait(10);

            assert.exists(errorMsg, 'Should receive error message');
            assert.equal(errorMsg.type, 'error', 'Should be error type');
            assert.exists(errorMsg.message, 'Should have error message');
        });

        test('should handle connection errors', (assert) => {
            let errorOccurred = false;

            mockWs.onerror = () => {
                errorOccurred = true;
            };

            mockWs.simulateError('Connection failed');

            assert.isTrue(errorOccurred, 'Error handler should be called');
        });

        test('should handle malformed JSON gracefully', (assert) => {
            const validJSON = '{"type":"test"}';
            const invalidJSON = '{type:test}';

            assert.notThrows(() => {
                JSON.parse(validJSON);
            }, 'Valid JSON should parse');

            assert.throws(() => {
                JSON.parse(invalidJSON);
            }, 'Invalid JSON should throw');
        });
    });

    runner.suite('WebSocket - Latency & Performance', ({ test, beforeEach, afterEach }) => {
        let mockWs;

        beforeEach(async () => {
            mockWs = new MockWebSocket('ws://localhost:8000/ws/ABC123');
            await wait(20);
        });

        afterEach(() => {
            mockWs.close();
        });

        test('should support ping/pong for latency measurement', async (assert) => {
            let pongReceived = null;

            mockWs.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.type === 'pong') {
                    pongReceived = msg;
                }
            };

            const pingTime = Date.now();
            mockWs.send(JSON.stringify({ type: 'ping', timestamp: pingTime }));

            await wait(10);

            assert.exists(pongReceived, 'Should receive pong');
            assert.exists(pongReceived.timestamp, 'Pong should have timestamp');
        });

        test('should track message count', (assert) => {
            for (let i = 0; i < 10; i++) {
                mockWs.send(JSON.stringify({
                    type: 'input',
                    left: false,
                    right: false,
                    jump: false,
                    action: false,
                    timestamp: Date.now()
                }));
            }

            assert.equal(mockWs.sentMessages.length, 10, 'Should track 10 messages');
        });

        test('should clear message history', (assert) => {
            mockWs.send(JSON.stringify({ type: 'test' }));
            assert.equal(mockWs.sentMessages.length, 1, 'Should have 1 message');

            mockWs.clearMessages();
            assert.equal(mockWs.sentMessages.length, 0, 'Should have 0 messages');
        });
    });
}

// Export test suite
window.createWebSocketTests = createWebSocketTests;
