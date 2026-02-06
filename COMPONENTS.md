# Component Architecture

This document describes the modular component architecture for the OpenKai project.

## Folder Structure

```
src/components/
├── core/           # Reusable UI components (buttons, modals, inputs)
├── features/       # Feature-specific components
├── layout/         # Layout components (Navbar, Sidebar, etc.)
└── pages/          # Page-level components (route-level)
```

## Directory Descriptions

### `core/`
Reusable UI components that can be used across the entire application.
- Buttons, inputs, modals, cards
- Ready for shadcn/ui components
- No business logic, pure presentation

### `features/`
Feature-specific components that encapsulate specific functionality.
- Complex feature implementations
- May contain business logic
- Self-contained feature modules

### `layout/`
Layout components that define the application structure.
- Navbar, sidebar, footer
- Page wrappers
- Navigation components

### `pages/`
Page-level components that correspond to routes.
- HomePage, Login, Register
- CodeHealth, Terminal, etc.
- Route-level component entry points

## Import Examples

```typescript
// Layout components
import Navbar from './components/layout/Navbar';

// Page components
import HomePage from './components/pages/HomePage';
import CodeHealth from './components/pages/CodeHealth';

// Core UI components
import ConfirmModal from './components/core/ConfirmModal';
```

## Current Components

### Layout
- `Navbar.tsx` - Main navigation component

### Pages
- `HomePage.tsx` - Landing page
- `Login.tsx` - Authentication login
- `Register.tsx` - User registration
- `Profile.tsx` - User profile
- `PasteView.tsx` - Paste detail view
- `PasteHistory.tsx` - Paste history list
- `OpenPasteHub.tsx` - OpenPaste hub page
- `ReceivePost.tsx` - Receive post page
- `MinusURL.tsx` - URL shortener
- `Terminal.tsx` - Terminal session
- `TerminalSessions.tsx` - Terminal sessions list
- `CodeHealth.tsx` - Code quality analyzer
- `ToolsLanding.tsx` - Tools landing page
- `RedirectPage.tsx` - URL redirect page

### Core
- `ConfirmModal.tsx` - Confirmation modal (ready for shadcn replacement)
