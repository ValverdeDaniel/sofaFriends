# Setup Guide

Complete installation guide for SofaFriends.

## Table of Contents
- [System Requirements](#system-requirements)
- [Installing Docker Desktop](#installing-docker-desktop)
- [Installing Claude in VS Code (Optional)](#installing-claude-in-vs-code-optional)
- [Verifying Installation](#verifying-installation)
- [Next Steps](#next-steps)

---

## System Requirements

### Minimum Requirements
- **OS:** Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM:** 4GB minimum, 8GB recommended
- **Disk Space:** 2GB free space
- **Network:** WiFi capability (for phone controllers)
- **Browser:** Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

### For Phone Controllers
- **Smartphone:** iOS 12+ or Android 8+
- **Browser:** Safari (iOS) or Chrome (Android)
- **Network:** Must be on same WiFi as host computer

---

## Installing Docker Desktop

Docker Desktop bundles Docker Engine and Docker Compose, making it the easiest way to run SofaFriends.

### Windows Installation

**Prerequisites:**
- Windows 10 64-bit: Pro, Enterprise, or Education (Build 19041+) OR Windows 11
- WSL 2 (Windows Subsystem for Linux) enabled

**Steps:**

1. **Enable WSL 2:**
   ```powershell
   # Run PowerShell as Administrator
   wsl --install
   ```
   Restart your computer if prompted.

2. **Download Docker Desktop:**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Click "Download for Windows"
   - Run the installer: `Docker Desktop Installer.exe`

3. **Install Docker:**
   - Follow the installation wizard
   - Ensure "Use WSL 2 instead of Hyper-V" is checked
   - Click "Ok" and wait for installation to complete

4. **Start Docker:**
   - Launch Docker Desktop from Start Menu
   - Wait for whale icon to appear in system tray
   - You may need to accept the service agreement

5. **Verify Installation:**
   ```bash
   docker --version
   docker-compose --version
   ```
   You should see version numbers like:
   ```
   Docker version 24.0.x
   Docker Compose version v2.x.x
   ```

**Troubleshooting Windows:**
- If WSL 2 installation fails, run: `wsl --update`
- Check "Turn Windows features on or off" → Enable "Virtual Machine Platform" and "Windows Subsystem for Linux"
- Restart computer after enabling features

---

### macOS Installation

**Prerequisites:**
- macOS 10.15 or newer
- Apple chip (M1/M2) or Intel processor

**Steps:**

1. **Download Docker Desktop:**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Choose your chip type:
     - "Mac with Apple chip" (M1/M2)
     - "Mac with Intel chip"
   - Download the `.dmg` file

2. **Install Docker:**
   - Open the downloaded `Docker.dmg`
   - Drag Docker icon to Applications folder
   - Launch Docker from Applications

3. **Grant Permissions:**
   - Click "Ok" to open System Preferences
   - Allow Docker Desktop in Security & Privacy
   - Enter your password when prompted

4. **Start Docker:**
   - Docker icon will appear in menu bar
   - Wait for "Docker Desktop is running" message

5. **Verify Installation:**
   ```bash
   docker --version
   docker-compose --version
   ```

**Troubleshooting macOS:**
- If Docker won't start, go to System Preferences → Security & Privacy → General → Allow Docker
- Check Activity Monitor to ensure no other virtualization software conflicts
- Try restarting your Mac

---

### Linux Installation (Ubuntu/Debian)

**Steps:**

1. **Update Package Index:**
   ```bash
   sudo apt-get update
   ```

2. **Install Docker:**
   ```bash
   # Install Docker
   sudo apt-get install -y docker.io

   # Install Docker Compose
   sudo apt-get install -y docker-compose
   ```

3. **Add User to Docker Group:**
   ```bash
   # Allows running Docker without sudo
   sudo usermod -aG docker $USER
   ```

4. **Log Out and Back In:**
   ```bash
   # Or run this to apply group changes immediately
   newgrp docker
   ```

5. **Enable Docker Service:**
   ```bash
   sudo systemctl enable docker
   sudo systemctl start docker
   ```

6. **Verify Installation:**
   ```bash
   docker --version
   docker-compose --version
   ```

**Alternative - Docker Desktop for Linux:**
- Download from: https://docs.docker.com/desktop/install/linux-install/
- Provides GUI similar to Windows/Mac version

**Troubleshooting Linux:**
- If permission denied, ensure you logged out and back in after adding user to docker group
- Check Docker daemon: `sudo systemctl status docker`
- View Docker logs: `sudo journalctl -u docker`

---

## Installing Claude in VS Code (Optional)

Claude Code is an AI coding assistant that helps with development, debugging, and understanding the codebase.

### Prerequisites
- Visual Studio Code installed (download from https://code.visualstudio.com/)
- Active Claude subscription (Claude Pro or API access)
- Internet connection

### Installation Steps

1. **Open VS Code:**
   - Launch Visual Studio Code

2. **Open Extensions Panel:**
   - Press `Ctrl+Shift+X` (Windows/Linux)
   - Or `Cmd+Shift+X` (macOS)
   - Or click Extensions icon in left sidebar

3. **Search for Claude:**
   - Type "Claude Code" in search box
   - Look for the official extension by Anthropic

4. **Install Extension:**
   - Click "Install" button
   - Wait for installation to complete

5. **Authenticate:**
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
   - Type `/login` and press Enter
   - Your browser will open
   - Sign in with your Claude account
   - Grant permissions when prompted

6. **Verify Setup:**
   - Press `Ctrl+L` (or `Cmd+L` on Mac)
   - Claude chat panel should open
   - Type "Hello" to test

### Using Claude Code

**Open Chat:**
- `Ctrl+L` (Windows/Linux) or `Cmd+L` (macOS)

**Useful Commands:**
- `/help` - View help documentation
- `/clear` - Clear conversation history
- `/login` - Re-authenticate if session expires

**Example Prompts:**
- "Explain how this file works"
- "Help me debug this error"
- "Add comments to this function"
- "Start the Docker services"

### Subscription Required

Claude Code requires one of the following:
- **Claude Pro** subscription ($20/month)
- **Claude API** access with credits
- **Claude Team** or Enterprise plan

Sign up at: https://claude.ai/

---

## Verifying Installation

After installing Docker (and optionally Claude), verify everything is working:

### 1. Check Docker

```bash
# Check Docker version
docker --version
# Expected: Docker version 24.0.x or higher

# Check Docker Compose version
docker-compose --version
# Expected: Docker Compose version v2.x.x or higher

# Test Docker is running
docker run hello-world
# Expected: "Hello from Docker!" message
```

### 2. Check Docker Desktop

- **Windows/Mac:** Look for whale icon in system tray/menu bar
- Icon should be steady (not animated)
- Click icon → Should show "Docker Desktop is running"

### 3. Check Claude (if installed)

- Open VS Code
- Press `Ctrl+L` or `Cmd+L`
- Claude chat should appear on the right side
- Type a test message

---

## Next Steps

Once everything is installed:

1. **Clone the Project:**
   ```bash
   git clone <your-repo-url>
   cd sofafriends
   ```

2. **Read Getting Started Guide:**
   - See [GETTING_STARTED.md](GETTING_STARTED.md) for first-time setup

3. **Learn How to Play:**
   - See [HOW_TO_PLAY.md](HOW_TO_PLAY.md) for gameplay instructions

4. **For Developers:**
   - See [DEVELOPMENT.md](DEVELOPMENT.md) for local development guide

---

## Common Issues

### Docker Won't Start

**Windows:**
- Ensure WSL 2 is installed: `wsl --status`
- Check virtualization is enabled in BIOS
- Restart Docker Desktop from system tray

**macOS:**
- Check System Preferences → Security & Privacy
- Grant Full Disk Access to Docker
- Restart Docker from menu bar

**Linux:**
- Check service status: `sudo systemctl status docker`
- Restart service: `sudo systemctl restart docker`
- Check logs: `sudo journalctl -u docker -f`

### Permission Denied (Linux)

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or run
newgrp docker
```

### Port Conflicts

If ports 9000, 9001, or 3001 are already in use:
- Check what's using the port: `netstat -ano | findstr :9000` (Windows) or `lsof -i :9000` (Mac/Linux)
- Stop the conflicting service
- Or modify `docker-compose.yml` to use different ports

### Claude Authentication Failed

- Check your internet connection
- Ensure Claude subscription is active
- Try `/login` again in VS Code
- Clear browser cookies and retry
- Visit https://claude.ai/ to verify account status

---

## Getting Help

- **Docker Issues:** https://docs.docker.com/get-started/
- **Claude Code Issues:** https://docs.claude.com/
- **SofaFriends Issues:** Check [GitHub Issues](../README.md) or ask Claude in VS Code

---

**Next:** [Getting Started →](GETTING_STARTED.md)
