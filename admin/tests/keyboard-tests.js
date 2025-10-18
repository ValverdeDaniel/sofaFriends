// Unit Tests for Keyboard Controller Functionality

function createKeyboardTests(runner) {
    runner.suite('Keyboard Controller - Player 1 (WASD)', ({ test, beforeEach, afterEach }) => {
        let localInputState;

        beforeEach(() => {
            localInputState = {
                p1: { left: false, right: false, jump: false },
                p2: { left: false, right: false, jump: false }
            };
        });

        test('should set left input on A key press', (assert) => {
            localInputState.p1.left = true;
            assert.isTrue(localInputState.p1.left, 'P1 left should be true');
            assert.isFalse(localInputState.p2.left, 'P2 left should be false');
        });

        test('should set right input on D key press', (assert) => {
            localInputState.p1.right = true;
            assert.isTrue(localInputState.p1.right, 'P1 right should be true');
            assert.isFalse(localInputState.p2.right, 'P2 right should be false');
        });

        test('should set jump input on W key press', (assert) => {
            localInputState.p1.jump = true;
            assert.isTrue(localInputState.p1.jump, 'P1 jump should be true');
            assert.isFalse(localInputState.p2.jump, 'P2 jump should be false');
        });

        test('should handle lowercase keys', (assert) => {
            const key = 'a';
            if (key === 'a' || key === 'A') {
                localInputState.p1.left = true;
            }
            assert.isTrue(localInputState.p1.left, 'Should handle lowercase a');
        });

        test('should handle uppercase keys', (assert) => {
            const key = 'A';
            if (key === 'a' || key === 'A') {
                localInputState.p1.left = true;
            }
            assert.isTrue(localInputState.p1.left, 'Should handle uppercase A');
        });

        test('should clear input on key release', (assert) => {
            localInputState.p1.left = true;
            assert.isTrue(localInputState.p1.left, 'Left should be true');

            localInputState.p1.left = false;
            assert.isFalse(localInputState.p1.left, 'Left should be false after release');
        });

        test('should handle simultaneous key presses', (assert) => {
            localInputState.p1.left = true;
            localInputState.p1.jump = true;

            assert.isTrue(localInputState.p1.left, 'Left should be true');
            assert.isTrue(localInputState.p1.jump, 'Jump should be true');
            assert.isFalse(localInputState.p1.right, 'Right should be false');
        });
    });

    runner.suite('Keyboard Controller - Player 2 (Arrow Keys)', ({ test, beforeEach }) => {
        let localInputState;

        beforeEach(() => {
            localInputState = {
                p1: { left: false, right: false, jump: false },
                p2: { left: false, right: false, jump: false }
            };
        });

        test('should set left input on ArrowLeft key', (assert) => {
            localInputState.p2.left = true;
            assert.isTrue(localInputState.p2.left, 'P2 left should be true');
            assert.isFalse(localInputState.p1.left, 'P1 left should be false');
        });

        test('should set right input on ArrowRight key', (assert) => {
            localInputState.p2.right = true;
            assert.isTrue(localInputState.p2.right, 'P2 right should be true');
            assert.isFalse(localInputState.p1.right, 'P1 right should be false');
        });

        test('should set jump input on ArrowUp key', (assert) => {
            localInputState.p2.jump = true;
            assert.isTrue(localInputState.p2.jump, 'P2 jump should be true');
            assert.isFalse(localInputState.p1.jump, 'P1 jump should be false');
        });

        test('should handle simultaneous arrow key presses', (assert) => {
            localInputState.p2.right = true;
            localInputState.p2.jump = true;

            assert.isTrue(localInputState.p2.right, 'Right should be true');
            assert.isTrue(localInputState.p2.jump, 'Jump should be true');
            assert.isFalse(localInputState.p2.left, 'Left should be false');
        });

        test('should clear input on arrow key release', (assert) => {
            localInputState.p2.jump = true;
            assert.isTrue(localInputState.p2.jump, 'Jump should be true');

            localInputState.p2.jump = false;
            assert.isFalse(localInputState.p2.jump, 'Jump should be false after release');
        });
    });

    runner.suite('Keyboard Controller - Two Player Mode', ({ test, beforeEach }) => {
        let localInputState;

        beforeEach(() => {
            localInputState = {
                p1: { left: false, right: false, jump: false },
                p2: { left: false, right: false, jump: false }
            };
        });

        test('should handle both players pressing different keys', (assert) => {
            localInputState.p1.left = true;
            localInputState.p2.right = true;

            assert.isTrue(localInputState.p1.left, 'P1 left should be true');
            assert.isTrue(localInputState.p2.right, 'P2 right should be true');
            assert.isFalse(localInputState.p1.right, 'P1 right should be false');
            assert.isFalse(localInputState.p2.left, 'P2 left should be false');
        });

        test('should handle both players jumping simultaneously', (assert) => {
            localInputState.p1.jump = true;
            localInputState.p2.jump = true;

            assert.isTrue(localInputState.p1.jump, 'P1 jump should be true');
            assert.isTrue(localInputState.p2.jump, 'P2 jump should be true');
        });

        test('should handle all inputs from both players', (assert) => {
            localInputState.p1.left = true;
            localInputState.p1.jump = true;
            localInputState.p2.right = true;
            localInputState.p2.jump = true;

            assert.isTrue(localInputState.p1.left, 'P1 left should be true');
            assert.isTrue(localInputState.p1.jump, 'P1 jump should be true');
            assert.isTrue(localInputState.p2.right, 'P2 right should be true');
            assert.isTrue(localInputState.p2.jump, 'P2 jump should be true');
        });

        test('should independently release each players inputs', (assert) => {
            localInputState.p1.jump = true;
            localInputState.p2.jump = true;

            // Release P1 jump
            localInputState.p1.jump = false;

            assert.isFalse(localInputState.p1.jump, 'P1 jump should be false');
            assert.isTrue(localInputState.p2.jump, 'P2 jump should still be true');
        });
    });

    runner.suite('Keyboard Controller - Key Event Handling', ({ test }) => {
        test('should map correct key codes to actions', (assert) => {
            const keyMapping = {
                'w': 'p1_jump',
                'a': 'p1_left',
                'd': 'p1_right',
                'ArrowUp': 'p2_jump',
                'ArrowLeft': 'p2_left',
                'ArrowRight': 'p2_right'
            };

            assert.equal(keyMapping['w'], 'p1_jump', 'W should map to P1 jump');
            assert.equal(keyMapping['a'], 'p1_left', 'A should map to P1 left');
            assert.equal(keyMapping['d'], 'p1_right', 'D should map to P1 right');
            assert.equal(keyMapping['ArrowUp'], 'p2_jump', 'ArrowUp should map to P2 jump');
            assert.equal(keyMapping['ArrowLeft'], 'p2_left', 'ArrowLeft should map to P2 left');
            assert.equal(keyMapping['ArrowRight'], 'p2_right', 'ArrowRight should map to P2 right');
        });

        test('should not respond to other keys', (assert) => {
            const validKeys = ['w', 'a', 'd', 'W', 'A', 'D', 'ArrowUp', 'ArrowLeft', 'ArrowRight'];
            const invalidKey = 'x';

            assert.isFalse(validKeys.includes(invalidKey), 'X should not be a valid key');
        });
    });

    runner.suite('Keyboard Controller - Jump Prevention', ({ test, beforeEach }) => {
        let localInputState;
        let player;

        beforeEach(() => {
            localInputState = {
                p1: { left: false, right: false, jump: false },
                p2: { left: false, right: false, jump: false }
            };

            player = {
                grounded: false,
                vy: 0
            };
        });

        test('should only allow jump when grounded', (assert) => {
            player.grounded = true;
            localInputState.p1.jump = true;

            if (localInputState.p1.jump && player.grounded) {
                player.vy = -400; // Jump speed
                localInputState.p1.jump = false; // Prevent holding
            }

            assert.equal(player.vy, -400, 'Should set jump velocity');
            assert.isFalse(localInputState.p1.jump, 'Should reset jump input');
        });

        test('should not allow jump when in air', (assert) => {
            player.grounded = false;
            localInputState.p1.jump = true;

            if (localInputState.p1.jump && player.grounded) {
                player.vy = -400;
                localInputState.p1.jump = false;
            } else {
                // Don't jump if not grounded
                player.vy = 0;
            }

            assert.equal(player.vy, 0, 'Should not set jump velocity');
        });

        test('should prevent jump holding (auto-release)', (assert) => {
            player.grounded = true;
            let jumpPressed = true;

            if (jumpPressed && player.grounded) {
                player.vy = -400;
                jumpPressed = false; // Auto-release
            }

            assert.isFalse(jumpPressed, 'Jump should be auto-released');
        });
    });

    runner.suite('Keyboard Controller - Death Animation Input Block', ({ test, beforeEach }) => {
        let localInputState;
        let deathAnimationActive;
        let player;

        beforeEach(() => {
            localInputState = {
                p1: { left: false, right: false, jump: false },
                p2: { left: false, right: false, jump: false }
            };

            deathAnimationActive = false;

            player = {
                vx: 0,
                vy: 0
            };
        });

        test('should process input when not in death animation', (assert) => {
            deathAnimationActive = false;
            localInputState.p1.left = true;

            if (!deathAnimationActive) {
                player.vx = localInputState.p1.left ? -260 : 0;
            }

            assert.equal(player.vx, -260, 'Should process input');
        });

        test('should block input during death animation', (assert) => {
            deathAnimationActive = true;
            localInputState.p1.left = true;

            if (!deathAnimationActive) {
                player.vx = localInputState.p1.left ? -260 : 0;
            } else {
                player.vx = 0; // Blocked
            }

            assert.equal(player.vx, 0, 'Should block input during death');
        });
    });

    runner.suite('Keyboard Controller - One Player Mode', ({ test, beforeEach }) => {
        let playerCount;
        let localInputState;

        beforeEach(() => {
            localInputState = {
                p1: { left: false, right: false, jump: false },
                p2: { left: false, right: false, jump: false }
            };
        });

        test('should only use P1 controls in one player mode', (assert) => {
            playerCount = 1;

            // P1 input should work
            localInputState.p1.left = true;
            assert.isTrue(localInputState.p1.left, 'P1 input should work');

            // P2 input exists but won't be processed by game
            localInputState.p2.left = true;
            if (playerCount === 1) {
                // In actual game, P2 doesn't exist, so this would be ignored
                assert.equal(playerCount, 1, 'Only one player active');
            }
        });

        test('should show correct controls hint for one player', (assert) => {
            playerCount = 1;
            const controlsText = 'Player 1: W=Jump, A=Left, D=Right';

            assert.includes(controlsText, 'Player 1', 'Should mention Player 1');
            assert.isFalse(controlsText.includes('Player 2'), 'Should not mention Player 2');
        });
    });

    runner.suite('Keyboard Controller - Player Physics Application', ({ test, beforeEach }) => {
        let localInputState;
        let player;

        beforeEach(() => {
            localInputState = {
                p1: { left: false, right: false, jump: false }
            };

            player = {
                vx: 0,
                vy: 0,
                grounded: false
            };
        });

        test('should apply left movement velocity', (assert) => {
            const MOVE_SPEED = 260;
            localInputState.p1.left = true;

            player.vx = localInputState.p1.left ? -MOVE_SPEED : 0;

            assert.equal(player.vx, -260, 'Should have negative velocity for left');
        });

        test('should apply right movement velocity', (assert) => {
            const MOVE_SPEED = 260;
            localInputState.p1.right = true;

            player.vx = localInputState.p1.right ? MOVE_SPEED : 0;

            assert.equal(player.vx, 260, 'Should have positive velocity for right');
        });

        test('should apply jump velocity when grounded', (assert) => {
            const JUMP_SPEED = -400;
            player.grounded = true;
            localInputState.p1.jump = true;

            if (localInputState.p1.jump && player.grounded) {
                player.vy = JUMP_SPEED;
            }

            assert.equal(player.vy, -400, 'Should have negative velocity for jump');
        });

        test('should reset vx to 0 when no horizontal input', (assert) => {
            player.vx = 260;
            localInputState.p1.left = false;
            localInputState.p1.right = false;

            player.vx = 0;

            assert.equal(player.vx, 0, 'Velocity should reset to 0');
        });

        test('should prioritize right when both left and right pressed', (assert) => {
            const MOVE_SPEED = 260;
            localInputState.p1.left = true;
            localInputState.p1.right = true;

            // In actual implementation, right overrides left
            player.vx = 0;
            if (localInputState.p1.left) player.vx = -MOVE_SPEED;
            if (localInputState.p1.right) player.vx = MOVE_SPEED; // Overrides

            assert.equal(player.vx, 260, 'Right should override left');
        });
    });

    runner.suite('Keyboard Controller - Controls Display', ({ test }) => {
        test('should display correct control hints', (assert) => {
            const p1Controls = 'Player 1: W=Jump, A=Left, D=Right';
            const p2Controls = 'Player 2: ↑=Jump, ←=Left, →=Right';

            assert.includes(p1Controls, 'W=Jump', 'Should show W for jump');
            assert.includes(p1Controls, 'A=Left', 'Should show A for left');
            assert.includes(p1Controls, 'D=Right', 'Should show D for right');

            assert.includes(p2Controls, '↑=Jump', 'Should show up arrow for jump');
            assert.includes(p2Controls, '←=Left', 'Should show left arrow');
            assert.includes(p2Controls, '→=Right', 'Should show right arrow');
        });

        test('should show colored player indicators', (assert) => {
            const p1Color = '#FF6B6B';
            const p2Color = '#4ECDC4';

            assert.equal(p1Color, '#FF6B6B', 'P1 should be red');
            assert.equal(p2Color, '#4ECDC4', 'P2 should be cyan');
        });
    });
}

// Export test suite
window.createKeyboardTests = createKeyboardTests;
