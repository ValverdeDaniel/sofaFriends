# SofaFriends Documentation

Welcome to the SofaFriends documentation! This guide will help you get started, play the game, and develop new features.

## Quick Navigation

### For Players

**Just want to play?** Start here:

1. **[Setup Guide](SETUP.md)** - Install Docker Desktop and Claude (optional)
2. **[Getting Started](GETTING_STARTED.md)** - Launch the game in 5 minutes
3. **[How to Play](HOW_TO_PLAY.md)** - Learn controls and gameplay

### For Developers

**Want to contribute or customize?** Check these out:

1. **[Setup Guide](SETUP.md)** - Development environment setup
2. **[Development Guide](DEVELOPMENT.md)** - Architecture, workflow, and common tasks
3. **[CLAUDE.md](../CLAUDE.md)** - Comprehensive project architecture reference

---

## Documentation Overview

### [SETUP.md](SETUP.md)
**Complete installation guide**

Learn how to install:
- Docker Desktop (Windows, macOS, Linux)
- Claude in VS Code (optional AI assistant)
- Verify your installation

**Read this if:**
- First time setting up the project
- Need to install Docker
- Want to use Claude for development
- Troubleshooting installation issues

---

### [GETTING_STARTED.md](GETTING_STARTED.md)
**Quick start guide**

Get the game running quickly:
- Start Docker services
- Open host screen (TV)
- Connect phone controllers
- Play in local test mode
- Troubleshoot common issues

**Read this if:**
- Ready to run the game for first time
- Want to test multiplayer mode
- Need to find your IP address
- Having connection issues

---

### [HOW_TO_PLAY.md](HOW_TO_PLAY.md)
**Complete gameplay guide**

Learn the game:
- Controls (phone and keyboard)
- Objective and win conditions
- Game mechanics and physics
- Level walkthroughs
- Tips and strategies
- FAQ

**Read this if:**
- First time playing
- Want to understand game mechanics
- Looking for gameplay tips
- Curious about level design
- Teaching others to play

---

### [DEVELOPMENT.md](DEVELOPMENT.md)
**Developer guide**

Everything for developers:
- Architecture overview
- Running locally (Docker and manual)
- Project structure
- Development workflow
- Testing and debugging
- Common development tasks
- Contributing guidelines

**Read this if:**
- Want to add new features
- Debugging issues
- Contributing to the project
- Understanding the codebase
- Customizing the game

---

## Additional Resources

### Project Documentation

- **[README.md](../README.md)** - Project overview and quick start
- **[CLAUDE.md](../CLAUDE.md)** - Comprehensive architecture and technical details
- **[docker-compose.yml](../docker-compose.yml)** - Service configuration

### Code Documentation

**Key files with inline documentation:**
- [host/game.js](../host/game.js) - Game logic, physics, rendering (1294 lines)
- [controller/controller.js](../controller/controller.js) - Controller interface (288 lines)
- [server/app/main.py](../server/app/main.py) - Backend API and WebSocket server

### Testing Tools

- **Admin Test Panel:** http://localhost:9001/admin/test-panel.html
  - Unit tests
  - Manual testing tools
  - WebSocket debugging

---

## Common Workflows

### First-Time Player Setup

```
1. SETUP.md → Install Docker
2. GETTING_STARTED.md → Start the game
3. HOW_TO_PLAY.md → Learn controls
4. Play! 🎮
```

### First-Time Developer Setup

```
1. SETUP.md → Install Docker + Claude
2. GETTING_STARTED.md → Verify game works
3. DEVELOPMENT.md → Understand architecture
4. CLAUDE.md → Deep dive into code
5. Start coding! 💻
```

### Adding a New Feature

```
1. DEVELOPMENT.md → Review architecture
2. Use local test mode for quick iteration
3. Ask Claude for help (if installed)
4. Test thoroughly
5. Submit pull request
```

### Debugging an Issue

```
1. GETTING_STARTED.md → Check troubleshooting section
2. DEVELOPMENT.md → Review debugging tools
3. Check browser console (F12)
4. Check Docker logs (docker-compose logs)
5. Ask Claude for help
```

---

## Documentation Quick Reference

### Installation & Setup

| Topic | Document | Section |
|-------|----------|---------|
| Install Docker (Windows) | [SETUP.md](SETUP.md) | Windows Installation |
| Install Docker (Mac) | [SETUP.md](SETUP.md) | macOS Installation |
| Install Docker (Linux) | [SETUP.md](SETUP.md) | Linux Installation |
| Install Claude | [SETUP.md](SETUP.md) | Installing Claude in VS Code |

### Getting Started

| Topic | Document | Section |
|-------|----------|---------|
| Start Docker services | [GETTING_STARTED.md](GETTING_STARTED.md) | Starting the Game |
| Connect phones | [GETTING_STARTED.md](GETTING_STARTED.md) | Multiplayer Mode |
| Local keyboard test | [GETTING_STARTED.md](GETTING_STARTED.md) | Local Testing Mode |
| Find IP address | [GETTING_STARTED.md](GETTING_STARTED.md) | Connect Phone Controllers |
| Stop services | [GETTING_STARTED.md](GETTING_STARTED.md) | Stopping the Game |

### Gameplay

| Topic | Document | Section |
|-------|----------|---------|
| Phone controls | [HOW_TO_PLAY.md](HOW_TO_PLAY.md) | Controls |
| Keyboard controls | [HOW_TO_PLAY.md](HOW_TO_PLAY.md) | Keyboard Controls |
| Game objective | [HOW_TO_PLAY.md](HOW_TO_PLAY.md) | Objective |
| Level walkthroughs | [HOW_TO_PLAY.md](HOW_TO_PLAY.md) | Levels |
| Tips & strategies | [HOW_TO_PLAY.md](HOW_TO_PLAY.md) | Tips & Strategies |
| Common questions | [HOW_TO_PLAY.md](HOW_TO_PLAY.md) | FAQ |

### Development

| Topic | Document | Section |
|-------|----------|---------|
| Architecture overview | [DEVELOPMENT.md](DEVELOPMENT.md) | Architecture Overview |
| Running locally | [DEVELOPMENT.md](DEVELOPMENT.md) | Running Locally |
| Project structure | [DEVELOPMENT.md](DEVELOPMENT.md) | Project Structure |
| Add new level | [DEVELOPMENT.md](DEVELOPMENT.md) | Adding a New Level |
| Add death animation | [DEVELOPMENT.md](DEVELOPMENT.md) | Adding a New Death Animation |
| Debugging | [DEVELOPMENT.md](DEVELOPMENT.md) | Debugging |
| Contributing | [DEVELOPMENT.md](DEVELOPMENT.md) | Contributing |

---

## Port Reference

Quick reference for accessing services:

| Service | URL | Purpose |
|---------|-----|---------|
| **Host Screen** | http://localhost:9001 | TV/monitor game display |
| **Controller** | http://YOUR-IP:3001 | Phone controllers |
| **Backend API** | http://localhost:9000 | WebSocket server |
| **Admin Panel** | http://localhost:9001/admin/test-panel.html | Testing tools |

---

## Getting Help

### Using Claude Code

If you installed Claude, ask it questions:
- "How do I add a new level?"
- "Explain the collision detection system"
- "Debug why players are falling through platforms"
- "Start Docker services for me"

### Documentation Issues

If documentation is unclear:
- Open an issue on GitHub
- Suggest improvements
- Submit documentation PRs

### Game Issues

If you encounter bugs:
- Check [GETTING_STARTED.md](GETTING_STARTED.md) troubleshooting
- Review [DEVELOPMENT.md](DEVELOPMENT.md) debugging section
- Check browser console (F12)
- Review Docker logs

---

## Contributing to Documentation

Documentation improvements are welcome!

**To improve docs:**
1. Fork the repository
2. Edit markdown files in `docs/`
3. Keep consistent formatting
4. Add examples where helpful
5. Submit pull request

**Documentation standards:**
- Use clear, simple language
- Include code examples
- Add troubleshooting tips
- Keep table of contents updated
- Link between related docs

---

## Document Version History

- **v1.0** - Initial documentation structure
  - SETUP.md - Installation guide
  - GETTING_STARTED.md - Quick start
  - HOW_TO_PLAY.md - Gameplay guide
  - DEVELOPMENT.md - Developer guide

---

## Next Steps

**New to SofaFriends?**
→ Start with [SETUP.md](SETUP.md)

**Ready to play?**
→ Jump to [GETTING_STARTED.md](GETTING_STARTED.md)

**Want to develop?**
→ Read [DEVELOPMENT.md](DEVELOPMENT.md)

**Have fun! 🎮**
