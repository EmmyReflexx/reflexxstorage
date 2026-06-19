# 🔒 Reflexx - Secure File Vault System

<div align="center">
  <img src="https://img.shields.io/badge/React-19.2.6-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind-4.3.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Router-7.15.1-CA4245?style=for-the-badge&logo=react-router&logoColor=white" />
  <img src="https://img.shields.io/badge/PrimeReact-10.9.8-2D7A9E?style=for-the-badge&logo=primefaces&logoColor=white" />
  <img src="https://img.shields.io/badge/RsBuild-2.0.6-FFA116?style=for-the-badge&logo=esbuild&logoColor=white" />
  <img src="https://img.shields.io/badge/Biome-2.4.14-FFC107?style=for-the-badge" />
</div>

<br/>

**A cyberpunk-themed file management system with encrypted vault storage, drag-and-drop uploads, and persistent state management built from scratch.**

### 🚀 [Live Demo](https://reflexxstorage.vercel.app/)


---

## ✨ Features

### 📁 Dual File Systems
- **Global Store** - Standard file/folder management with persistent IndexedDB storage
- **Secure Vault** - Password-protected encrypted storage with separate persistence layer

### 🎯 Core Functionality
- **Nested Folder Structure** - Infinite depth with recursive tree operations
- **Drag & Drop Uploads** - Visual feedback with preview generation for images/videos
- **File Type Recognition** - Dynamic icons for 40+ file extensions (PDF, JSX, MP4, etc.)
- **Duplicate Detection** - Prevents name collisions at folder level
- **Breadcrumb Navigation** - Clickable path tracking with route integration
- **Dark/Light Mode** - Full theme system with CSS custom properties

### 🔐 Security Features
- **XOR + Base64 Encryption** - Password scrambling before storage (⚠️ demo only)
- **Separate Vault State** - Isolated tree structure from global file system
- **Persistent Storage** - IndexedDB for files, localStorage for auth state

### 🎨 UI/UX
- **Floating Action Menu** - SpeedDial for quick folder/file creation
- **Context Menus** - TieredMenu for delete/rename/file info
- **Toast Notifications** - Action feedback system
- **Responsive Design** - Mobile-friendly with Tailwind CSS 4

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Frontend** | React | 19.2.6 |
| **Routing** | React Router DOM | 7.15.1 |
| **Build Tool** | RsBuild | 2.0.6 |
| **Styling** | Tailwind CSS | 4.3.0 |
| **UI Components** | PrimeReact | 10.9.8 |
| **Icons** | Lucide React + React Icons | 1.16.0 / 5.6.0 |
| **Linting** | Biome | 2.4.14 |
| **Testing** | Rstest (RsBuild test) | 0.10.0 |
| **State Management** | Custom Reflexx Store | - |
| **Persistence** | IndexedDB + localStorage | - |

### Build & Dev Tools
- **RsBuild** - Lightning fast Rust-based bundler
- **Biome** - Unified formatting + linting (replaces ESLint/Prettier)
- **Rstest** - Native RsBuild testing with Happy DOM
- **Storybook** - Component documentation (with RsBuild integration)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/emmyreflexx/reflexxstorage.git
cd reflexx

# Install dependencies
npm install

# Start development server (opens automatically)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Format code with Biome
npm run format

# ⚠️ Important Security Note

// This is NOT production-grade security!
const SECRET = `key..`;

### ⚠️ This is for demonstration only. The code includes a comment warning about this. In a real application, use:

bcrypt for password hashing

Web Crypto API for AES encryption

Backend authentication (never client-side only)
```

## 🌳 Project Structure

```
reflexxstorage/
├── AGENTS.md
├── biome.json
├── eslint.config.mjs
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── public/
│   └── favicon.svg
├── README.md
├── rsbuild.config.js
├── rslint.config.ts
└── src/
    ├── App.css
    ├── App.jsx
    ├── assets/
    │   └── fonts/
    │       ├── LexendDeca-Bold.ttf
    │       ├── LexendDeca-ExtraBold.ttf
    │       └── LexendDeca-Regular.ttf
    ├── components/
    │   ├── breadcrumb/
    │   │   └── BreadCrumb.jsx
    │   ├── explorer/
    │   │   ├── DeleteConfirmModal.jsx
    │   │   ├── file-upload/
    │   │   │   ├── Buttons.jsx
    │   │   │   ├── DragAndDrop.jsx
    │   │   │   ├── Errors.jsx
    │   │   │   ├── FileUploadModal.jsx
    │   │   │   ├── handleCreateFile.jsx
    │   │   │   └── MediaMetadata.jsx
    │   │   ├── FileActionMenu.jsx
    │   │   ├── fileIcons.jsx
    │   │   ├── FolderActionMenu.jsx
    │   │   ├── FolderModal.jsx
    │   │   └── TreeNode.jsx
    │   └── headers/
    │       └── Header.jsx
    ├── index.css
    ├── index.jsx
    ├── pages/
    │   ├── file-explorer/
    │   │   └── FileExplorer.jsx
    │   ├── home/
    │   │   └── Home.jsx
    │   └── vault/
    │       ├── index.js
    │       ├── ValidatePassword.jsx
    │       ├── vault-explorer/
    │       │   └── VaultExplorer.jsx
    │       ├── Vault.jsx
    │       ├── VaultLogin.jsx
    │       └── VaultSignUp.jsx
    ├── Reflexx_Tools/
    │   ├── file-upload/
    │   │   ├── index.ts
    │   │   ├── types.ts
    │   │   └── useFileUpload.tsx
    │   ├── react-toast/
    │   │   ├── GUIDE.md
    │   │   ├── index.tsx
    │   │   ├── package.json
    │   │   ├── src/
    │   │   │   ├── hooks/
    │   │   │   │   └── useToast.ts
    │   │   │   ├── icons/
    │   │   │   │   ├── DefaultIcon.tsx
    │   │   │   │   ├── ErrorIcon.tsx
    │   │   │   │   ├── InfoIcon.tsx
    │   │   │   │   ├── SuccessIcon.tsx
    │   │   │   │   └── WarningIcon.tsx
    │   │   │   └── styles/
    │   │   │       └── toast.css
    │   │   ├── Toast.tsx
    │   │   ├── ToastContainer.tsx
    │   │   └── types.ts
    │   └── reflexx-state/
    │       ├── hooks/
    │       │   ├── hook.ts
    │       │   └── indexedDBHooks.ts
    │       ├── index.ts
    │       ├── indexedDB.ts
    │       ├── README.md
    │       ├── ReflexxStore.ts
    │       └── types.ts
    ├── store/
    │   ├── fileTree.js
    │   ├── signUpState.js
    │   ├── userDetails.js
    │   ├── vaultCheckState.js
    │   └── vaultTree.js
    ├── styles/
    │   ├── fonts.css
    │   └── theme.css
    └── utils/
        ├── checkDuplicate.js
        └── passwordValidation.js
```
