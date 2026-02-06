# Modular Architecture

This directory contains the modular structure of the OpenKai server. Each module is self-contained with its own routes, controllers, and services.

## Module Structure

Each module follows this pattern:
```
module-name/
├── index.ts          # Module entry point - exports all public APIs
├── routes.ts         # Express routes for this module
├── controllers.ts    # Request/response handlers
└── services.ts       # Business logic and data operations
```

## Available Modules

### Auth Module (`/api/auth`)
- Handles user authentication and authorization
- Routes: register, login, get user info
- Controllers: user registration, login, profile management

### Lint Module (`/api/lint`)
- Code analysis and linting functionality
- Routes: check code, verify links, get supported languages
- Controllers: code analysis, URL verification

### Paste Module (`/api/pastes`)
- Pastebin functionality
- Routes: create, read, delete pastes, user history
- Controllers: paste management, user paste history

### Terminal Module (`/api/terminal`)
- Terminal session management and command execution
- Routes: session management, command execution
- Controllers: terminal operations, security checks

### URL Module (`/api/urls`)
- URL shortening service
- Routes: create short URLs, redirect, stats
- Controllers: URL management, analytics

## Benefits of Modular Architecture

1. **Separation of Concerns**: Each module handles a specific domain
2. **Easy Maintenance**: All related code is in one place
3. **Scalability**: Easy to add new modules or modify existing ones
4. **Testing**: Each module can be tested independently
5. **Reusability**: Services can be shared across modules if needed

## Importing Modules

```typescript
// Import specific router
import { authRouter } from './modules/auth';

// Import all modules
import * as modules from './modules';

// Import specific module
import { authRouter, pasteRouter } from './modules';
```

## Adding New Modules

1. Create a new directory in `modules/`
2. Follow the standard structure (index.ts, routes.ts, controllers.ts, services.ts)
3. Export the router from `routes.ts`
4. Add exports to the module's `index.ts`
5. Import and use the router in the main `server/index.ts`
6. Update `modules/index.ts` to export the new module
