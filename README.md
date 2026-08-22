<div align="center">

# 🚀 Ocal Code
### Modern Multi-Language & Web Developer Studio

[![Release](https://img.shields.io/badge/version-1.0.0--stable-emerald?style=for-the-badge&logo=electron)](https://github.com/neelkanth-patel26/Ocal-Code)
[![Platform](https://img.shields.io/badge/platform-Windows%20x64-38bdf8?style=for-the-badge&logo=windows)](https://github.com/neelkanth-patel26/Ocal-Code)
[![License](https://img.shields.io/badge/license-MIT-e8ff47?style=for-the-badge&color=22c55e&labelColor=0c0c0c)](LICENSE)
[![Studio](https://img.shields.io/badge/Developed%20By-Gaming%20Network%20Studio-818cf8?style=for-the-badge)](https://github.com/neelkanth-patel26)

<br/>

**Ocal Code** is a high-performance, zero-friction desktop developer studio engineered by **Gaming Network Studio** and the **Ocal Team**. It combines the authentic muscle-memory discipline of classic educational programming with the speed of modern cloud and web engineering.

---

</div>

## 🌟 Key Capabilities

### ⚡ 1. 10-Language Multi-Runtime Support
Seamlessly write, compile, and execute code across 10 programming paradigms out-of-the-box:
- 💻 **C++ Application**: Modern C++17/20/23 with bundled MinGW GCC and Turbo C++ compatibility headers (`<conio.h>`, `<graphics.h>`).
- ⚙️ **C Console Program**: C11/C17 standard compliance with memory safety linters.
- 🐍 **Python 3 Environment**: Automated path resolution across system `%PATH%` and Windows AppData, with live unbuffered interactive standard I/O.
- ☕ **Java Console Application**: Automatic JDK/JRE detection (Adoptium, Zulu, Corretto, Oracle) with Java 11+ single-source direct execution.
- 🌐 **HTML5 & CSS3 Web Projects**: Built-in native HTTP Web Server (`http://localhost:5500`) with Server-Sent Events (SSE) Live Hot-Reload.
- ⚛️ **React Interactive Components**: Direct TSX/JSX compilation and interactive component previews.
- ⚡ **Next.js Fullstack Sandbox**: Full support for App Router layouts, server components, and dynamic templates.
- 🟨 **JavaScript & TypeScript**: Powered by embedded Node.js with native type-stripping flags.

---

### 🌐 2. Native Local Web Server (`localhost:5500`)
- **Zero-Setup Live Server**: Runs an in-memory HTTP server on port 5500 that broadcasts live changes.
- **Server-Sent Events (SSE)**: Any file edit inside Ocal Code triggers instant DOM hot-reloading in all connected browsers (Opera, Chrome, Edge, Brave).
- **Responsive Device Simulator**: Test websites across Desktop (100%), Tablet (768px), and Mobile (375px) viewports with one click.
- **External Browser Launcher**: Instant launch into your default web browser via native OS routing.

---

### 🎨 3. Flagship Ocal Signature Design System
- **Layered Obsidian Surfaces**: `#0c0c0c` canvas, `#121318` toolbars, and `#181920` elevated cards.
- **Vibrant Accent Spectrum**: Ocal Emerald (`#34d058`), Neon Lime (`#e8ff47`), Electric Cyan (`#38bdf8`), and Amber Glow (`#fb923c`).
- **Multiple Theme Engines**:
  1. `Ocal Signature` (Default, sleek modern web palette)
  2. `Turbo C++ Nostalgia` (Authentic DOS Blue `#0000AA` & Yellow font)
  3. `Dark+ WinUI` (Clean Fluent dark theme)
  4. `Cyberpunk Neon` (Vibrant purple & synthwave palette)
  5. `Modern Light` (Crisp daylight theme)

---

### ⌨️ 4. Keyboard Shortcuts Reference

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| <kbd>F5</kbd> / <kbd>Ctrl+F9</kbd> | **Run / Compile & Run** | Builds and executes program in interactive terminal or launches Live Server |
| <kbd>Alt+F9</kbd> / <kbd>F9</kbd> | **Compile Source** | Compiles active source code and outputs diagnostic logs |
| <kbd>Ctrl+F5</kbd> | **Run Last Binary** | Spawns previously compiled binary directly |
| <kbd>Shift+F5</kbd> | **Stop Process** | Immediately terminates active running process |
| <kbd>Ctrl+N</kbd> | **New File** | Creates a new tab with current language template |
| <kbd>Ctrl+S</kbd> | **Save File** | Context-aware dynamic save dialog for current language |
| <kbd>Ctrl+O</kbd> | **Open File** | Open source file from disk with auto-language detection |
| <kbd>Ctrl+W</kbd> | **Close Tab** | Closes current active tab (resets to Project Hub if empty) |
| <kbd>Ctrl+B</kbd> | **Toggle Sidebar** | Collapses or expands left activity sidebar |
| <kbd>Ctrl+,</kbd> | **Settings** | Opens compiler standards and optimization configuration |
| <kbd>F1</kbd> | **Keyboard Help** | Displays full keyboard shortcut overlay |

---

## 🏗️ Architecture & Project Structure

```text
ocal-code/
├── electron/                  # Electron Main Process
│   ├── main.ts                # Application lifecycle & IPC handlers
│   ├── compiler.ts            # Multi-runtime compiler & execution engine
│   ├── liveServer.ts          # Native HTTP Live Web Server with SSE
│   └── preload.ts             # Secure ContextBridge API exposure
├── src/                       # React 19 Frontend
│   ├── components/
│   │   ├── editor/            # Monaco Editor & Multi-Tab management
│   │   ├── modals/            # About, Settings, and Shortcuts Dialogs
│   │   ├── panels/            # ActivityBar, LeftSidebar, BottomPanel
│   │   ├── preview/           # Live Server Web Preview & Device Switcher
│   │   ├── terminal/          # Xterm.js Interactive Console
│   │   ├── toolbar/           # HeaderToolbar & StatusBar
│   │   └── welcome/           # Startup Project Launcher Hub
│   ├── hooks/                 # Compiler, LiveServer, & Keyboard hooks
│   ├── store/                 # Zustand IDE State Store
│   ├── templates/             # Default starter snippets for all 10 languages
│   ├── themes/                # Monaco Editor Theme Definitions
│   ├── types/                 # TypeScript interfaces and IPC definitions
│   ├── App.tsx                # Main IDE Shell
│   └── index.css              # Ocal Signature & WinUI styling system
├── public/                    # Clean 2D SVG icons & static assets
├── package.json               # Build scripts and Electron Builder config
└── vite.config.ts             # Vite bundler configuration
```

---

## 🛠️ Building and Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Git](https://git-scm.com/)

### 1. Clone the repository
```bash
git clone https://github.com/neelkanth-patel26/Ocal-Code.git
cd "Ocal-Code"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run in Development Mode
```bash
npm run dev
```

### 4. Build Production Executable / Installer
```bash
npm run electron:build
```
The portable `.exe` and NSIS installer will be generated in the `release/` directory.

---

## 👥 Credits & Attribution

- **Organization**: [Gaming Network Studio](https://github.com/neelkanth-patel26)
- **Lead Developer**: **Neelkanth Patel** ([neelkanthpatel26@outlook.com](mailto:neelkanthpatel26@outlook.com))
- **Team**: **Ocal Team**

---

<div align="center">
  <sub>© 2026 Gaming Network Studio & Ocal Team. All rights reserved.</sub>
</div>