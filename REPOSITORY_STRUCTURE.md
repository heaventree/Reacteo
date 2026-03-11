# Repository Structure

This document explains the purpose of each file and directory in the Reacteo repository.

## 📁 Directory Structure

```
reacteo/
├── src/                          # Application source code
│   ├── lib/
│   │   ├── ai/                  # AI services and types
│   │   │   ├── types.ts         # TypeScript type definitions
│   │   │   ├── service.ts       # AI service layer
│   │   │   ├── blog.ts          # Blog management service
│   │   │   ├── crawler.ts       # Page crawling service
│   │   │   ├── hooks.ts         # React hooks
│   │   │   └── index.ts         # Public exports
│   │   └── seo/                 # SEO utilities
│   │       ├── components/      # SEO components
│   │       ├── context/         # Context providers
│   │       ├── hooks/           # Hooks
│   │       ├── types/           # Type definitions
│   │       └── utils/           # Utilities
│   ├── components/              # React components
│   │   ├── AIModelsConfig.tsx   # AI model configuration
│   │   ├── BlogEditor.tsx       # Blog editor
│   │   ├── SEOAuditReport.tsx   # Audit report viewer
│   │   ├── SEO.tsx              # SEO component
│   │   └── Image.tsx            # Image component
│   ├── pages/                   # Page components
│   │   ├── AdminDashboard.tsx   # Admin dashboard
│   │   └── (other pages)
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   ├── index.css                # Global styles
│   └── vite-env.d.ts            # Vite type definitions
├── supabase/                     # Supabase configuration
│   ├── migrations/              # Database migrations
│   │   └── 20260311231129_create_ai_seo_tables.sql
│   └── functions/               # Edge Functions
│       ├── ai-generate/         # AI request handler
│       │   └── index.ts
│       ├── ai-models/           # Model management
│       │   └── index.ts
│       └── ai-audit/            # Audit storage
│           └── index.ts
├── public/                       # Static assets
│   ├── favicon.svg
│   └── (other static files)
├── .github/                      # GitHub configuration
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md       # Bug report template
│   │   ├── feature_request.md  # Feature request template
│   │   └── question.md         # Question template
│   └── PULL_REQUEST_TEMPLATE.md # PR template
├── scripts/                      # Build and utility scripts
│   ├── generate-sitemap.ts      # Sitemap generator
│   ├── generate-robots.ts       # Robots.txt generator
│   └── seo-audit.ts             # SEO audit script
├── dist/                         # Build output (generated)
├── node_modules/                # Dependencies (generated)
├── .env.local                   # Local environment (gitignored)
├── .gitignore                   # Git ignore patterns
├── package.json                 # Dependencies and scripts
├── package-lock.json            # Dependency lock file
├── tsconfig.json                # TypeScript config
├── tsconfig.app.json            # App TypeScript config
├── tsconfig.node.json           # Node TypeScript config
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS config
├── postcss.config.js            # PostCSS config
├── eslint.config.js             # ESLint config
├── index.html                   # HTML entry point
└── (documentation files listed below)
```

---

## 📚 Documentation Files

### Getting Started

| File | Purpose | Audience | Read Time |
|------|---------|----------|-----------|
| **README.md** | Project overview, features, quick start | Everyone | 10 min |
| **AI_QUICK_SETUP.md** | 5-minute setup guide | New users | 5 min |
| **DEVELOPMENT.md** | Local development setup | Developers | 10 min |
| **OPEN_SOURCE_SETUP.md** | Repository configuration guide | Maintainers | 15 min |

### For Users

| File | Purpose | Audience | Read Time |
|------|---------|----------|-----------|
| **AI_INTEGRATION_GUIDE.md** | Complete API reference | Developers | 20 min |
| **AI_FEATURES_INDEX.md** | Feature overview | Everyone | 10 min |
| **AI_FILES_MANIFEST.md** | File organization | Developers | 5 min |
| **AI_IMPLEMENTATION_COMPLETE.md** | Implementation status | Project managers | 5 min |
| **AI_QUICK_SETUP.md** | Quick setup | Developers | 5 min |

### For Contributors

| File | Purpose | Audience | Read Time |
|------|---------|----------|-----------|
| **CONTRIBUTING.md** | Contribution guidelines | Contributors | 10 min |
| **CODE_OF_CONDUCT.md** | Community standards | Everyone | 5 min |
| **SECURITY.md** | Security policy | Contributors | 10 min |
| **CHANGELOG.md** | Release notes | Everyone | 10 min |

### Open Source

| File | Purpose |
|------|---------|
| **LICENSE** | MIT License text |
| **REPOSITORY_STRUCTURE.md** | This file |

### Original SEO Kit

| File | Purpose |
|------|---------|
| **QUICK_START_SEO.md** | SEO Kit quick start |
| **SEO_KIT_README.md** | SEO Kit documentation |
| **SEO_KIT_INDEX.md** | SEO Kit feature index |
| **IMPLEMENTATION_SUMMARY.md** | Implementation summary |

---

## 📝 File Descriptions

### README.md (510 lines)

**Purpose:** Main project documentation and entry point

**Contains:**
- Project tagline and badges
- Feature overview
- Quick start guide (5 steps)
- Tech stack table
- What's included
- Usage examples (3 types)
- Use cases (5 categories)
- Security information
- Performance metrics
- Roadmap
- Contributing information
- License information
- Support channels
- FAQ section

**Audience:** Everyone

---

### LICENSE (21 lines)

**Purpose:** Legal license for the project

**Contains:**
- MIT License text
- Copyright statement: "© 2024 Sean O'Byrne, Heaventree Ltd"
- Permissions, conditions, and limitations

**Key Points:**
- Allows commercial use
- Requires license notice in distributions
- No warranty or liability

---

### CONTRIBUTING.md (400+ lines)

**Purpose:** Guidelines for contributing to the project

**Contains:**
- Code of Conduct reference
- How to contribute (bug reports, features, PRs)
- Development setup
- Coding standards (TypeScript, React, CSS)
- File organization
- Comment guidelines
- Commit message format (Conventional Commits)
- Testing requirements
- Documentation updates
- PR process (7 steps)
- Review process
- Branch naming conventions
- Issue labels
- Performance considerations
- Security considerations
- Accessibility requirements

**Audience:** Contributors

---

### CODE_OF_CONDUCT.md (120 lines)

**Purpose:** Community standards and expectations

**Contains:**
- Community pledge
- Standards of conduct (good and bad examples)
- Enforcement responsibilities
- Scope of application
- Enforcement guidelines (4 levels)
- Attribution (Contributor Covenant v2.0)

**Audience:** Everyone

---

### SECURITY.md (200+ lines)

**Purpose:** Security policy and vulnerability reporting

**Contains:**
- How to report vulnerabilities (email, not GitHub issues)
- What to expect after reporting
- Vulnerability disclosure process
- Security guidelines for users
- Security features (built-in, best practices)
- Third-party services security
- Responsible disclosure guidelines
- Version history

**Audience:** Developers, security researchers

---

### CHANGELOG.md (300+ lines)

**Purpose:** Release notes and version history

**Contains:**
- Unreleased section (roadmap)
- v1.0.0 release details:
  - All new features
  - Services breakdown
  - Components breakdown
  - Edge Functions breakdown
  - Database tables
  - Documentation
  - Technical details
  - Performance metrics
  - Security features
  - Code quality metrics

**Audience:** Everyone

---

### DEVELOPMENT.md (400+ lines)

**Purpose:** Local development environment setup

**Contains:**
- Prerequisites (Node.js, npm, Git, Supabase)
- Environment setup (Supabase, .env.local)
- Installation steps
- Development server
- Building instructions
- Testing instructions
- Debugging tips
- Project structure
- Complete workflow
- Useful commands
- Troubleshooting guide

**Audience:** Developers

---

### OPEN_SOURCE_SETUP.md (400+ lines)

**Purpose:** Guide for setting up an open-source repository

**Contains:**
- Files checklist
- GitHub configuration guide
- License and copyright info
- Contributing workflow
- CI/CD recommendations
- Release process
- Community management
- Support channels
- Learning resources
- Setup checklist
- Next steps

**Audience:** Maintainers, repository managers

---

### AI_INTEGRATION_GUIDE.md (600+ lines)

**Purpose:** Complete API reference and integration guide

**Contains:**
- Architecture overview
- Services documentation (AIService, BlogService, PageCrawler)
- React hooks documentation
- Component documentation
- Database schema
- Edge Functions documentation
- Use cases and examples
- Best practices
- Troubleshooting
- Configuration guide
- Security guidelines

**Audience:** Developers, architects

---

### AI_QUICK_SETUP.md (150 lines)

**Purpose:** 5-minute setup guide for AI features

**Contains:**
- Step-by-step setup (5 steps)
- API key configuration
- Admin dashboard access
- First audit walkthrough
- Blog post creation
- Common tasks
- Troubleshooting

**Audience:** New users, developers

---

### AI_FEATURES_INDEX.md (400 lines)

**Purpose:** Overview of all AI features

**Contains:**
- Feature breakdown
- File structure analysis
- Integration points
- Usage examples (3 examples)
- Metrics tracked
- Security features
- Performance info
- Support resources
- Feature highlights

**Audience:** Project managers, architects

---

### AI_FILES_MANIFEST.md (300 lines)

**Purpose:** Detailed file listing and organization

**Contains:**
- File-by-file breakdown
- Line counts
- Organization by layer
- Integration points
- Services summary
- Component summary
- Hook summary
- Edge Function summary
- Documentation summary
- Installation notes
- Testing status

**Audience:** Developers, contributors

---

### AI_IMPLEMENTATION_COMPLETE.md (300 lines)

**Purpose:** Implementation completion report

**Contains:**
- Deliverables summary
- Component breakdown
- Build status
- Code statistics
- Highlights and achievements
- Quick reference
- Troubleshooting
- Summary

**Audience:** Project stakeholders, QA

---

### GitHub Templates

#### .github/ISSUE_TEMPLATE/bug_report.md
- Structured bug reporting
- Environment section
- Steps to reproduce
- Expected vs actual behavior
- Code examples

#### .github/ISSUE_TEMPLATE/feature_request.md
- Feature description
- Motivation
- Use cases
- Alternative solutions
- Priority levels

#### .github/ISSUE_TEMPLATE/question.md
- Question format
- Context provision
- Code examples
- Environment details

#### .github/PULL_REQUEST_TEMPLATE.md
- Description field
- Type of change checkboxes
- Related issues
- Testing instructions
- Checklist

---

## 🔍 How to Use This Repository

### I want to...

**Get started quickly**
→ Read `README.md` then `AI_QUICK_SETUP.md`

**Understand the architecture**
→ Read `AI_INTEGRATION_GUIDE.md` and `AI_FILES_MANIFEST.md`

**Set up for development**
→ Read `DEVELOPMENT.md`

**Contribute to the project**
→ Read `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`

**Report a security issue**
→ See `SECURITY.md`

**Configure the repository**
→ Read `OPEN_SOURCE_SETUP.md`

**See what's new**
→ Check `CHANGELOG.md`

**Understand file organization**
→ Read this file (`REPOSITORY_STRUCTURE.md`)

---

## 📊 Documentation Statistics

| Category | Files | Lines | Purpose |
|----------|-------|-------|---------|
| Getting Started | 4 | 1,200 | Setup and quick start |
| User Documentation | 5 | 2,500 | Features and API |
| Contributing | 4 | 900 | Community guidelines |
| Open Source | 3 | 1,200 | Repository setup |
| Original SEO Kit | 4 | 2,000 | Legacy documentation |
| **Total** | **20** | **7,800** | Complete documentation |

---

## 🛠️ Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `vite.config.ts` | Build tool configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `postcss.config.js` | PostCSS configuration |
| `eslint.config.js` | Linting configuration |
| `.gitignore` | Git ignore patterns |
| `index.html` | HTML entry point |

---

## 📦 Source Code Organization

### Services (`src/lib/ai/`)

- **types.ts** (90 lines) - Type definitions for all services
- **service.ts** (250 lines) - AIService for 5 AI providers
- **blog.ts** (250 lines) - BlogService for content management
- **crawler.ts** (200 lines) - PageCrawler for page analysis
- **hooks.ts** (180 lines) - React hooks (6 hooks)
- **index.ts** (40 lines) - Public exports

### Components (`src/components/`)

- **AdminDashboard.tsx** (250 lines) - Main dashboard
- **AIModelsConfig.tsx** (180 lines) - Model configuration
- **BlogEditor.tsx** (350 lines) - Blog editor
- **SEOAuditReport.tsx** (200 lines) - Audit visualization

### Edge Functions (`supabase/functions/`)

- **ai-generate/index.ts** (192 lines) - Multi-model AI routing
- **ai-models/index.ts** (100 lines) - Model management API
- **ai-audit/index.ts** (95 lines) - Audit result storage

---

## 🚀 Quick Navigation

### For New Contributors

1. Start with: `README.md`
2. Then read: `CONTRIBUTING.md`
3. Setup: Follow `DEVELOPMENT.md`
4. Code: Follow standards in `CONTRIBUTING.md`

### For Maintainers

1. Repository setup: `OPEN_SOURCE_SETUP.md`
2. Security: `SECURITY.md`
3. Release: `CHANGELOG.md`
4. Community: `CODE_OF_CONDUCT.md`

### For Users

1. Quick start: `AI_QUICK_SETUP.md`
2. Features: `README.md`
3. Complete guide: `AI_INTEGRATION_GUIDE.md`
4. API reference: `AI_INTEGRATION_GUIDE.md`

---

## 📞 Getting Help

- **Questions?** → Check documentation or open a discussion
- **Found a bug?** → Use bug_report.md template
- **Have a feature idea?** → Use feature_request.md template
- **Security issue?** → Email security@heaventree.co
- **Want to contribute?** → See CONTRIBUTING.md

---

**Repository Structure - Reacteo Open Source Project**

Version 1.0.0 | Last Updated: 2024-03-11 | MIT License
