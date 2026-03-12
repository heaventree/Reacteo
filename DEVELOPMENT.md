# Development Guide

This guide will help you set up your local development environment for Reacteo.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Installation](#installation)
4. [Development Server](#development-server)
5. [Building](#building)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Project Structure](#project-structure)
9. [Workflow](#workflow)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required

- **Node.js** 16.13.0 or higher ([Download](https://nodejs.org/))
- **npm** 8.0.0 or higher (included with Node.js)
- **Git** 2.30 or higher ([Download](https://git-scm.com/))
- **Supabase Account** ([Free Tier](https://supabase.com/))

### Optional but Recommended

- **VS Code** - [Download](https://code.visualstudio.com/)
- **VS Code Extensions**:
  - TypeScript Vue Plugin
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

### Verify Installation

```bash
node --version    # Should be v16.13.0 or higher
npm --version     # Should be 8.0.0 or higher
git --version     # Should be 2.30 or higher
```

---

## Environment Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Note your project URL and anon key

### 2. Create `.env.local` File

In the project root, create `.env.local`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### 3. Configure AI Provider Keys (Optional)

To use AI features, add API keys as Supabase Edge Function Secrets:

1. Go to Supabase Dashboard
2. Settings → Edge Functions → Secrets
3. Add any of these:

```
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza_...
CLAUDE_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx_...
DEEPSEEK_API_KEY=sk_...
```

---

## Installation

### Clone Repository

```bash
# Clone your fork
git clone https://github.com/yourfork/reacteo.git
cd reacteo

# Add upstream remote for sync
git remote add upstream https://github.com/heaventree-ltd/reacteo.git
```

### Install Dependencies

```bash
npm install
```

This will:
- Install all npm packages
- Set up git hooks (if configured)
- Create node_modules directory

### Verify Installation

```bash
npm run typecheck
```

Should complete with no errors.

---

## Development Server

### Start Development Server

```bash
npm run dev
```

The app will be available at:
- **Frontend:** http://localhost:5173
- **Admin Dashboard:** http://localhost:5173/admin

### Hot Module Replacement (HMR)

Changes to files will automatically reload in the browser. This includes:
- React components
- TypeScript files
- CSS/Tailwind changes
- Environment variables (restart needed)

### Development Tips

- Open DevTools (F12) to see console and network tabs
- Check React DevTools for component inspection
- Watch the terminal for TypeScript errors
- Use browser DevTools for debugging

---

## Building

### Development Build

```bash
npm run build
```

Creates optimized production build in `dist/` directory.

### Pre-Deployment Check

```bash
npm run seo:audit:pre-deploy
```

Runs:
1. Full build
2. SEO audit
3. Sitemap generation
4. Robots.txt validation

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally at http://localhost:4173

---

## Testing

### Type Checking

```bash
npm run typecheck
```

Runs TypeScript compiler without emitting code. Catches type errors.

### Linting

```bash
npm run lint
```

Checks code style and potential errors.

### SEO Audit

```bash
npm run seo:audit
```

Audits the built project for SEO issues:
- Sitemap validation
- Robots.txt validation
- HTML structure
- Meta tags

---

## Debugging

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

Then press F5 to start debugging.

### Console Logging

Use console methods for debugging:

```typescript
console.log('Normal log');
console.warn('Warning message');
console.error('Error message');
console.table(data); // Table format
```

### Debugging React Components

1. Install React DevTools browser extension
2. Open DevTools (F12)
3. Go to React tab
4. Inspect components and their state

### Debugging Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Interact with the app
4. Click on requests to see details
5. Check Response and Preview tabs

### Debugging TypeScript

- TypeScript errors show in terminal
- Check browser console for runtime errors
- Use VS Code's built-in TypeScript support
- Enable "strict" mode in tsconfig.json for stricter checks

---

## Project Structure

### Directory Layout

```
reacteo/
├── src/
│   ├── lib/
│   │   ├── ai/                 # AI services and types
│   │   │   ├── types.ts
│   │   │   ├── service.ts
│   │   │   ├── blog.ts
│   │   │   ├── crawler.ts
│   │   │   ├── hooks.ts
│   │   │   └── index.ts
│   │   └── seo/                # SEO utilities
│   ├── components/             # React components
│   │   ├── AIModelsConfig.tsx
│   │   ├── BlogEditor.tsx
│   │   └── SEOAuditReport.tsx
│   ├── pages/                  # Page components
│   │   └── AdminDashboard.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── functions/              # Edge Functions
│       ├── ai-generate/
│       ├── ai-models/
│       ├── ai-audit/
│       ├── seo-bulk-processor/
│       └── seo-instant-indexing/
├── public/                     # Static assets
├── .env.local                  # Local environment (gitignored)
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
├── eslint.config.js           # ESLint configuration
├── package.json               # Dependencies and scripts
├── README.md                  # Project overview
├── CONTRIBUTING.md            # Contribution guidelines
└── LICENSE                    # MIT License
```

### Key Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Build tool configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `package.json` | Dependencies and scripts |
| `.env.local` | Local environment variables |

---

## Workflow

### 1. Create Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feat/my-feature
```

### 2. Make Changes

```bash
# Edit files in your editor
# Changes auto-reload in browser
npm run dev
```

### 3. Test Your Changes

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build
npm run build
```

### 4. Commit Changes

```bash
# Add changes
git add .

# Commit with descriptive message
git commit -s -m "feat(scope): description of changes"
```

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feat/my-feature

# Go to GitHub and create Pull Request
```

### 6. Address Feedback

```bash
# Make requested changes
# Commit again
git commit -s -m "refactor: address PR feedback"

# Push updates
git push origin feat/my-feature
```

---

## Useful Commands

### Development

```bash
npm run dev                    # Start dev server
npm run dev -- --port 3000    # Custom port
npm run typecheck             # Type checking
npm run lint                  # Linting
```

### Building

```bash
npm run build                 # Production build
npm run preview              # Preview build
npm run seo:audit:pre-deploy # Full pre-deployment check
```

### Git

```bash
git status                   # Show status
git log --oneline           # Show commit history
git diff                    # Show changes
git branch -a               # Show branches
git stash                   # Save work in progress
```

---

## Troubleshooting

### Issue: Modules not found

**Solution:** Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript errors after changes

**Solution:** Type checking
```bash
npm run typecheck
```

### Issue: Dev server not starting

**Solution:** Check ports
```bash
# Free port 5173
# Or use different port
npm run dev -- --port 3000
```

### Issue: .env.local not working

**Solution:** Restart dev server
```bash
# Stop with Ctrl+C
# Start again
npm run dev
```

### Issue: Build fails

**Solution:** Check build output
```bash
npm run build 2>&1 | head -50
```

### Issue: Git conflicts

**Solution:** Update and rebase
```bash
git fetch upstream
git rebase upstream/main
# Resolve conflicts in files
git add .
git rebase --continue
```

### Issue: Cannot push to fork

**Solution:** Check remote
```bash
git remote -v
git remote add origin https://github.com/yourfork/reacteo.git
git push origin feat/my-feature
```

---

## Performance Optimization

### Build Performance

- Vite provides fast cold starts and HMR
- TypeScript compilation is optimized
- Bundle size is monitored automatically

### Development Performance

- Use React DevTools Profiler tab
- Check Network tab for slow requests
- Monitor CPU usage in DevTools
- Use Performance API for custom measurements

### Production Performance

- Build produces optimized output
- Tree-shaking removes unused code
- CSS is minified
- Images are optimized (when using public)

---

## Database Development

### Local Supabase (Optional)

For local development without internet:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Check status
supabase status
```

### Migrations

Apply the included backend schemas for templates, history, and AI keys:

```bash
# Apply migrations to your local or remote database
supabase migration up
```

To create a new migration for further schema changes:

```bash
supabase migration new feature_name
```

---

## Tips for Success

1. **Read the code** - Understand existing patterns
2. **Small commits** - Make focused changes
3. **Test frequently** - Test as you develop
4. **Ask questions** - Use GitHub Discussions
5. **Follow conventions** - Use existing patterns
6. **Keep it simple** - Don't over-engineer
7. **Document changes** - Update relevant docs
8. **Review your own PR** - Catch mistakes early

---

## Getting Help

- Check existing issues: https://github.com/heaventree-ltd/reacteo/issues
- Search documentation: [README.md](./README.md)
- Ask in discussions: https://github.com/heaventree-ltd/reacteo/discussions
- Read contribution guide: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

Happy developing! 🚀
