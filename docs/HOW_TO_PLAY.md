# How to Play SofaFriends

Complete gameplay guide for SofaFriends - a cooperative platformer party game.

## Table of Contents
- [Game Overview](#game-overview)
- [Controls](#controls)
- [Objective](#objective)
- [Game Mechanics](#game-mechanics)
- [Levels](#levels)
- [Tips & Strategies](#tips--strategies)
- [FAQ](#faq)

---

## Game Overview

SofaFriends is a cooperative platformer where friends work together to complete challenging levels.

### Key Features
- **1-8 players** in cooperative mode
- **Side-scrolling platformer** with physics-based movement
- **2 levels** with increasing difficulty
- **Unique death animations** - watch your character transform in creative ways
- **Phone controllers** - each player uses their phone as a gamepad
- **TV display** - everyone watches the action together on one screen

### Game Philosophy
- **Everyone succeeds together** - all players must reach the finish line
- **Communication is key** - talk to your teammates
- **Death is part of the fun** - enjoy the creative death animations
- **No time limit** - take your time, plan your moves

---

## Controls

### Phone Controller

The controller features 4 large touch buttons:

```
┌─────────────────────────┐
│                    [ ^ ]│  Jump
│                         │
│                    [ O ]│  Action (reserved)
│                         │
│  [ < ]          [ > ]   │  Move Left/Right
└─────────────────────────┘
```

**Buttons:**
- **Left Arrow `<`** - Move your character left
- **Right Arrow `>`** - Move your character right
- **Up Arrow `^`** - Jump
- **Circle `O`** - Action button (not yet used, reserved for future features)

**Features:**
- **Haptic feedback** - Phone vibrates when you press buttons
- **Wake lock** - Screen stays on during gameplay
- **Status indicator** - Top bar shows connection status

### Keyboard Controls (Local Testing Mode)

When playing in local test mode without phones:

**Player 1 (Blue):**
- `W` - Jump
- `A` - Move left
- `D` - Move right

**Player 2 (Red):**
- `↑` - Jump
- `←` - Move left
- `→` - Move right

---

## Objective

### Win Condition

**Complete each level by:**
1. Navigate through platforms and obstacles
2. Avoid deadly red obstacles
3. **All players** must reach the finish line (green zone at x=2800)
4. Stand in the finish zone together
5. Progress to next level

**Game Complete:**
- After completing Level 2, you win!
- Massive confetti celebration
- "You Win!" message displayed

### How Levels Work

- **Level 1:** Tutorial-style level with basic platforms and obstacles
- **Level 2:** Advanced challenges with tighter jumps and more hazards
- **Progression:** Must complete Level 1 to access Level 2
- **Restarts:** Dying sends all players back to start of current level

---

## Game Mechanics

### Movement Physics

**Walking:**
- Move speed: 260 units/second
- Smooth acceleration and deceleration
- Can change direction mid-air

**Jumping:**
- Jump velocity: -400 units/second (upward)
- Gravity: 800 units/second²
- Cannot double jump
- Jumping while moving maintains horizontal momentum

**Player Size:**
- 25-pixel radius circular hitbox
- Collides with platforms and obstacles

### Platforms

**Green platforms:**
- Safe to land on
- Different sizes and heights
- Some floating, some ground-level

**Collision:**
- Circle-to-rectangle collision detection
- Can jump up through platforms
- Land on top of platforms
- Cannot pass through sides or bottom

### Obstacles

**Red obstacles with hazard stripes:**
- Instant death on contact
- Rectangular shaped
- Strategically placed to challenge players
- Must jump over or avoid

**Death pits:**
- Falling below y=700 triggers death
- Falls are instant death
- Careful near level edges

### Death & Respawn

**When a player dies:**
1. One of 5 random death animations plays:
   - **Bubble Pop** - Transform into bubble, float up, pop
   - **Spring Bounce** - Compress, launch upward with particle trail
   - **Flower Bloom** - Root down, grow stem, bloom petals
   - **Origami Fold** - Flatten to paper, fold into crane, fly away
   - **Pixel Disintegration** - Glitch effect, pixelate, explode

2. Animation plays for 1.5 seconds
3. 3-second total delay
4. **All players respawn** at level start
5. Level progress resets (back to beginning)
6. Try again!

**Important:**
- One player death = everyone restarts
- Work together to keep everyone alive
- Death animations are part of the fun!

### Camera System

**Side-scrolling camera:**
- Follows the **rightmost player**
- Smooth interpolation (no jerky movement)
- Level width: 3000 pixels
- Screen width: 1200 pixels
- Players too far left get left behind (don't split up!)

**Strategy:**
- Stay together as a group
- Wait for slower players
- Don't rush ahead alone

### Visual Effects

**Confetti:**
- Small celebration when reaching finish line
- Massive confetti explosion when beating the game
- Colorful particles for festive feel

**Particle effects:**
- Death animations spawn themed particles
- Bubbles, petals, pixels, etc.
- Physics-based particle system

---

## Levels

### Level 1 - Introduction

**Layout:**
- 10 platforms total
- 6 obstacles strategically placed
- Wide platforms for learning
- Some elevated platforms for practice

**Difficulty:** Easy
**Goal:** Learn the controls and physics
**Challenge:** Basic platforming and obstacle avoidance

**Tips:**
- Take your time
- Practice jumping between platforms
- Learn your jump height and distance
- Communicate with teammates about when to jump

**Key sections:**
- Starting ground area
- First jump to elevated platform
- Obstacle gauntlet
- Final approach to finish line

### Level 2 - Advanced Challenge

**Layout:**
- 13 platforms total
- 10 obstacles (more hazards!)
- Complex multi-level sections
- Narrow platforms requiring precision

**Difficulty:** Medium-Hard
**Goal:** Complete challenging platforming sequences
**Challenge:** Precision jumps, timing, coordination

**Sections:**
1. **Staircase** - Ascending platforms
2. **High platform area** - Gaps between platforms
3. **Narrow platforms** - Precision required
4. **Descent section** - Controlled falling
5. **Final gauntlet** - Obstacle course to finish

**Tips:**
- Wait for all players before moving to next section
- Some jumps require running starts
- Narrow platforms need precise landing
- Communicate constantly

---

## Tips & Strategies

### For New Players

1. **Learn the controls first:**
   - Practice in Level 1
   - Get comfortable with jump timing
   - Understand momentum physics

2. **Stay together:**
   - Camera follows rightmost player
   - Players left behind might get stuck
   - Move as a group

3. **Don't rush:**
   - No time limit
   - Plan jumps together
   - Better to wait than die and restart

4. **Communicate:**
   - Talk to your teammates
   - Count down jumps: "Jump on 3... 1, 2, 3!"
   - Warn about obstacles ahead

### For Advanced Players

1. **Momentum jumps:**
   - Run before jumping for distance
   - Jump at platform edges for maximum distance
   - Use momentum to clear larger gaps

2. **Efficient routing:**
   - Learn optimal paths through levels
   - Memorize obstacle positions
   - Skip unnecessary detours

3. **Group coordination:**
   - Assign a "leader" to set pace
   - Everyone follows the leader
   - Slower players set the pace

4. **Death recovery:**
   - Don't get frustrated
   - Learn from mistakes
   - Try different approaches

### Common Mistakes

**Don't:**
- ❌ Rush ahead without teammates
- ❌ Jump too early or too late
- ❌ Ignore obstacle patterns
- ❌ Blame teammates for deaths

**Do:**
- ✅ Wait for everyone before advancing
- ✅ Practice difficult jumps
- ✅ Communicate constantly
- ✅ Have fun with death animations!

---

## FAQ

### Gameplay Questions

**Q: How many players do I need?**
A: 1-8 players. Game works with any number, but more players = more chaos and fun!

**Q: What happens if one player dies?**
A: Everyone respawns at the level start. Work together to keep everyone alive!

**Q: Is there a time limit?**
A: No! Take all the time you need.

**Q: Can I play solo?**
A: Yes! Use local testing mode with keyboard, or connect one phone controller.

**Q: How do I unlock Level 2?**
A: Complete Level 1. All players must reach the finish line.

**Q: What does the Action button (O) do?**
A: Nothing yet - it's reserved for future features like power-ups or special abilities.

### Technical Questions

**Q: My character isn't jumping!**
A: Check connection status on phone. Green = connected. Try pressing jump button firmly.

**Q: I'm falling through platforms!**
A: This is a bug. Try refreshing the host screen and reconnecting controllers.

**Q: Game is laggy!**
A: Check WiFi connection. Make sure phone and computer are on same network. Close other apps.

**Q: Can I customize controls?**
A: Not currently, but this is a potential future feature.

**Q: How do I exit fullscreen?**
A: Press `F11` or `Esc` on host screen.

### Strategy Questions

**Q: What's the best way to coordinate jumps?**
A: Use voice chat or shout across the room! Count down: "3... 2... 1... JUMP!"

**Q: Should we all jump at the same time?**
A: Not always necessary, but helps keep group together and ensures camera follows everyone.

**Q: How do I know how far I can jump?**
A: Practice! Jump height is fixed, but distance depends on running speed.

**Q: Can I save my progress?**
A: No saving - each game session starts at Level 1. Levels are quick though!

---

## Game Settings

### Currently Available

- **Local test mode** - 1 or 2 keyboard players
- **Multiplayer mode** - 1-8 phone controllers
- **Fullscreen** - Press F11 on host screen

### Future Features (Roadmap)

Planned enhancements:
- Volume controls
- Difficulty settings
- Custom player colors
- More levels
- Power-ups and collectibles
- Sound effects and music
- Respawn timer adjustment
- Custom level editor

---

## Accessibility

### Current Features

- **Large touch buttons** - Easy to press on phones
- **Vibration feedback** - Haptic confirmation
- **Visual indicators** - Connection status, player colors
- **No time pressure** - Take your time
- **Simple controls** - Only 3 buttons used (left, right, jump)

### Potential Improvements

Future accessibility features could include:
- Colorblind modes
- Button remapping
- Adjustable game speed
- Audio cues
- Larger player sizes
- Platform highlighting

---

## Scoring & Competition

Currently, SofaFriends is purely cooperative - no scoring or competition.

### Unofficial Challenges

Create your own challenges:
- **Speedrun:** Complete both levels as fast as possible
- **Deathless:** Complete without dying
- **Minimum jumps:** Use fewest jumps possible
- **Leader challenge:** One player guides while others have eyes closed

### Future Features

Planned competitive features:
- Completion time tracking
- Death counters
- Leaderboards
- Achievements
- Replay system

---

## Have More Fun!

**Remember:**
- It's about having fun together
- Death animations are entertaining
- Communication makes it easier
- Celebrate small victories
- Don't take it too seriously!

**Enjoy the chaos of coordinating 8 friends on one platform!**

---

**Previous:** [← Getting Started](GETTING_STARTED.md) | **Next:** [Development Guide →](DEVELOPMENT.md)
