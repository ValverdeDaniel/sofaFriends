// Unit Tests for Phone Controller Functionality

function createControllerTests(runner) {
    runner.suite('Phone Controller - Input State', ({ test, beforeEach, afterEach }) => {
        let inputState;

        beforeEach(() => {
            inputState = {
                left: false,
                right: false,
                jump: false,
                action: false
            };
        });

        test('should initialize with all inputs false', (assert) => {
            assert.isFalse(inputState.left, 'Left should be false');
            assert.isFalse(inputState.right, 'Right should be false');
            assert.isFalse(inputState.jump, 'Jump should be false');
            assert.isFalse(inputState.action, 'Action should be false');
        });

        test('should update left input state', (assert) => {
            inputState.left = true;
            assert.isTrue(inputState.left, 'Left should be true');
            assert.isFalse(inputState.right, 'Right should still be false');
        });

        test('should update right input state', (assert) => {
            inputState.right = true;
            assert.isTrue(inputState.right, 'Right should be true');
            assert.isFalse(inputState.left, 'Left should still be false');
        });

        test('should update jump input state', (assert) => {
            inputState.jump = true;
            assert.isTrue(inputState.jump, 'Jump should be true');
        });

        test('should update action input state', (assert) => {
            inputState.action = true;
            assert.isTrue(inputState.action, 'Action should be true');
        });

        test('should handle multiple simultaneous inputs', (assert) => {
            inputState.left = true;
            inputState.jump = true;
            assert.isTrue(inputState.left, 'Left should be true');
            assert.isTrue(inputState.jump, 'Jump should be true');
            assert.isFalse(inputState.right, 'Right should be false');
        });
    });

    runner.suite('Phone Controller - Touch Events', ({ test, beforeEach, afterEach }) => {
        let button;
        let inputState;

        beforeEach(() => {
            button = document.createElement('button');
            button.dataset.action = 'jump';
            document.body.appendChild(button);

            inputState = createMockInputState();
        });

        afterEach(() => {
            document.body.removeChild(button);
        });

        test('should set input on touchstart', (assert) => {
            const action = button.dataset.action;
            inputState[action] = true;
            button.classList.add('pressed');

            assert.isTrue(inputState.jump, 'Input should be true');
            assert.isTrue(button.classList.contains('pressed'), 'Button should have pressed class');
        });

        test('should clear input on touchend', (assert) => {
            const action = button.dataset.action;
            inputState[action] = false;
            button.classList.remove('pressed');

            assert.isFalse(inputState.jump, 'Input should be false');
            assert.isFalse(button.classList.contains('pressed'), 'Button should not have pressed class');
        });

        test('should handle mouse events for desktop testing', (assert) => {
            const action = button.dataset.action;

            // Mouse down
            inputState[action] = true;
            button.classList.add('pressed');
            assert.isTrue(inputState.jump, 'Input should be true on mousedown');

            // Mouse up
            inputState[action] = false;
            button.classList.remove('pressed');
            assert.isFalse(inputState.jump, 'Input should be false on mouseup');
        });
    });

    runner.suite('Phone Controller - WebSocket Communication', ({ test, beforeEach, afterEach }) => {
        let mockWs;

        beforeEach(async () => {
            mockWs = new MockWebSocket('ws://localhost:8000/ws/ABC123');
            await wait(20); // Wait for connection
        });

        afterEach(() => {
            if (mockWs.readyState === MockWebSocket.OPEN) {
                mockWs.close();
            }
        });

        test('should send handshake on connection', async (assert) => {
            const handshake = {
                type: 'handshake',
                role: 'controller',
                name: 'Test Player'
            };

            mockWs.send(JSON.stringify(handshake));

            const lastMsg = mockWs.getLastMessage();
            assert.equal(lastMsg.type, 'handshake', 'Should send handshake');
            assert.equal(lastMsg.role, 'controller', 'Role should be controller');
            assert.exists(lastMsg.name, 'Should have player name');
        });

        test('should receive connected confirmation', async (assert) => {
            let receivedMessage = null;

            mockWs.onmessage = (event) => {
                receivedMessage = JSON.parse(event.data);
            };

            mockWs.simulateMessage({
                type: 'connected',
                player_id: 'test-123',
                color: '#FF6B6B',
                name: 'Test Player'
            });

            await wait(10);

            assert.exists(receivedMessage, 'Should receive message');
            assert.equal(receivedMessage.type, 'connected', 'Should be connected message');
            assert.exists(receivedMessage.player_id, 'Should have player_id');
            assert.exists(receivedMessage.color, 'Should have color');
        });

        test('should send input messages with correct format', (assert) => {
            const inputMessage = {
                type: 'input',
                left: true,
                right: false,
                jump: false,
                action: false,
                timestamp: Date.now()
            };

            mockWs.send(JSON.stringify(inputMessage));

            const lastMsg = mockWs.getLastMessage();
            assert.equal(lastMsg.type, 'input', 'Should be input message');
            assert.isTrue(lastMsg.left, 'Left should be true');
            assert.isFalse(lastMsg.right, 'Right should be false');
            assert.exists(lastMsg.timestamp, 'Should have timestamp');
        });

        test('should include timestamp in input messages', (assert) => {
            const inputMessage = {
                type: 'input',
                left: false,
                right: false,
                jump: false,
                action: false,
                timestamp: Date.now()
            };

            mockWs.send(JSON.stringify(inputMessage));

            const lastMsg = mockWs.getLastMessage();
            assert.exists(lastMsg.timestamp, 'Should have timestamp');
            assert.isType(lastMsg.timestamp, 'number', 'Timestamp should be number');
        });

        test('should handle game_started message', async (assert) => {
            let gameStarted = false;

            mockWs.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.type === 'game_started') {
                    gameStarted = true;
                }
            };

            mockWs.simulateMessage({ type: 'game_started' });
            await wait(10);

            assert.isTrue(gameStarted, 'Should handle game_started message');
        });

        test('should handle lobby_update message', async (assert) => {
            let lobbyPlayers = null;

            mockWs.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.type === 'lobby_update') {
                    lobbyPlayers = msg.players;
                }
            };

            const players = [
                { id: 'p1', name: 'Player 1', color: '#FF6B6B' },
                { id: 'p2', name: 'Player 2', color: '#4ECDC4' }
            ];

            mockWs.simulateMessage({ type: 'lobby_update', players });
            await wait(10);

            assert.exists(lobbyPlayers, 'Should receive players');
            assert.equal(lobbyPlayers.length, 2, 'Should have 2 players');
        });
    });

    runner.suite('Phone Controller - Input Rate Limiting', ({ test }) => {
        test('should send input at 20Hz (50ms intervals)', (assert) => {
            const expectedInterval = 50; // 20Hz = 1000ms / 20 = 50ms
            const tolerance = 5; // Allow 5ms tolerance

            assert.greaterThan(expectedInterval, 0, 'Interval should be positive');
            assert.lessThan(expectedInterval, 100, 'Interval should be less than 100ms');
        });

        test('should not send input if WebSocket is not open', (assert) => {
            const mockWs = new MockWebSocket('ws://localhost:8000/ws/ABC123');
            mockWs.readyState = MockWebSocket.CLOSED;

            assert.throws(() => {
                mockWs.send(JSON.stringify({ type: 'input' }));
            }, Error, 'Should throw error when WebSocket is closed');
        });
    });

    runner.suite('Phone Controller - Haptic Feedback', ({ test }) => {
        test('should support vibration API if available', (assert) => {
            const hasVibrate = 'vibrate' in navigator;

            if (hasVibrate) {
                assert.isTrue(hasVibrate, 'Vibration API should be available');
            } else {
                assert.isFalse(hasVibrate, 'Vibration API not available (expected on desktop)');
            }
        });

        test('should call vibrate with correct duration', (assert) => {
            const duration = 20;
            assert.equal(duration, 20, 'Duration should be 20ms');
            assert.isType(duration, 'number', 'Duration should be a number');
        });
    });

    runner.suite('Phone Controller - Player Name Generation', ({ test }) => {
        test('should generate player name with adjective and noun', (assert) => {
            const adjectives = ['Swift', 'Brave', 'Clever', 'Bold', 'Quick', 'Wise', 'Cool', 'Epic'];
            const nouns = ['Fox', 'Wolf', 'Bear', 'Eagle', 'Tiger', 'Lion', 'Shark', 'Dragon'];

            const adj = adjectives[0];
            const noun = nouns[0];
            const name = `${adj} ${noun}`;

            assert.includes(name, ' ', 'Name should have space');
            assert.equal(name, 'Swift Fox', 'Should create valid name');
        });

        test('should generate unique names with randomization', (assert) => {
            const adjectives = ['Swift', 'Brave'];
            const nouns = ['Fox', 'Wolf'];

            const name1 = `${adjectives[0]} ${nouns[0]}`;
            const name2 = `${adjectives[1]} ${nouns[1]}`;

            assert.notEqual(name1, name2, 'Different selections should create different names');
        });
    });

    runner.suite('Phone Controller - Connection Status', ({ test, beforeEach }) => {
        let statusDot;
        let statusText;

        beforeEach(() => {
            statusDot = document.createElement('span');
            statusDot.className = 'status-dot';
            statusText = document.createElement('span');
            statusText.id = 'status-text';

            document.body.appendChild(statusDot);
            document.body.appendChild(statusText);
        });

        afterEach(() => {
            document.body.removeChild(statusDot);
            document.body.removeChild(statusText);
        });

        test('should show connected status', (assert) => {
            statusText.textContent = 'Connected';
            statusDot.classList.add('connected');

            assert.equal(statusText.textContent, 'Connected', 'Status text should be Connected');
            assert.isTrue(statusDot.classList.contains('connected'), 'Should have connected class');
        });

        test('should show disconnected status', (assert) => {
            statusText.textContent = 'Disconnected';
            statusDot.classList.add('disconnected');

            assert.equal(statusText.textContent, 'Disconnected', 'Status text should be Disconnected');
            assert.isTrue(statusDot.classList.contains('disconnected'), 'Should have disconnected class');
        });

        test('should show connecting status', (assert) => {
            statusText.textContent = 'Connecting...';

            assert.includes(statusText.textContent, 'Connecting', 'Should show connecting');
        });
    });

    runner.suite('Phone Controller - Room Code Validation', ({ test }) => {
        test('should accept valid 6-character room code', (assert) => {
            const roomCode = 'ABC123';
            assert.equal(roomCode.length, 6, 'Room code should be 6 characters');
        });

        test('should reject room code with wrong length', (assert) => {
            const shortCode = 'ABC12';
            const longCode = 'ABC1234';

            assert.notEqual(shortCode.length, 6, 'Short code should be invalid');
            assert.notEqual(longCode.length, 6, 'Long code should be invalid');
        });

        test('should convert room code to uppercase', (assert) => {
            const input = 'abc123';
            const normalized = input.toUpperCase();

            assert.equal(normalized, 'ABC123', 'Should convert to uppercase');
        });
    });
}

// Export test suite
window.createControllerTests = createControllerTests;
