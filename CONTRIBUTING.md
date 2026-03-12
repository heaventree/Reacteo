# Contributing to Reacteo

Thank you for considering contributing to Reacteo! We're excited to have you help make this the go-to open-source SEO system for React.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## How Can I Contribute?

### 1. Report a Bug

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem** in as much detail as possible
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**
- **Include your environment** (Node version, OS, browser, etc.)

### 2. Suggest an Enhancement

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior** and the expected behavior
- **Explain why this enhancement would be useful**

### 3. Submit a Pull Request

- Fork the repository and create your branch from `main`
- Follow the code style guidelines
- Include appropriate test coverage
- Update documentation if needed
- Write clear commit messages
- Sign off your commits (use `git commit -s`)

---

## Development Setup

### Prerequisites

- Node.js 16 or higher
- npm 8 or higher
- Supabase account (free tier works)
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/heaventree-ltd/reacteo.git
cd reacteo

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
EOF

# Start development server
npm run dev

# In another terminal, run type checking
npm run typecheck

# Build for production
npm run build

# Run SEO audit
npm run seo:audit
```

### Development Commands

```bash
npm run dev          # Start development server
npm run typecheck    # TypeScript type checking
npm run build        # Production build
npm run lint         # ESLint check
npm run preview      # Preview production build
npm run seo:audit    # Run SEO audit
npm run seo:audit:pre-deploy  # Full pre-deployment check
```

---

## Coding Standards

### TypeScript

- Always use TypeScript, avoid `any` type when possible
- Use meaningful type names and interfaces
- Export types from appropriate index files
- Include JSDoc comments for public APIs

```typescript
/**
 * Audit page content for SEO issues
 * @param content The page content to audit
 * @returns Promise with audit results
 */
async function auditPage(content: PageContent): Promise<AuditResult> {
  // Implementation
}
```

### Components

- Use functional components with hooks
- Props should be typed with interfaces
- Use TypeScript default props when appropriate
- Keep components focused and single-responsibility

```typescript
interface MyComponentProps {
  title: string;
  onClick: () => void;
  disabled?: boolean;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onClick,
  disabled = false,
}) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {title}
    </button>
  );
};
```

### Styling

- Use Tailwind CSS classes
- Follow the utility-first approach
- Use responsive prefixes (sm:, md:, lg:, etc.)
- Avoid inline styles and hardcoded colors

```typescript
// Good
<div className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition md:p-6">

// Avoid
<div style={{ padding: '16px', backgroundColor: 'white' }}>
```

### File Organization

- Group related functionality in directories
- Use clear, descriptive file names (kebab-case)
- Keep files focused and manageable (under 300 lines)
- Use index files to manage exports

```
src/
├── lib/
│   ├── ai/
│   │   ├── service.ts
│   │   ├── blog.ts
│   │   ├── crawler.ts
│   │   ├── hooks.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── seo/
├── components/
│   ├── AIModelsConfig.tsx
│   ├── BlogEditor.tsx
│   └── SEOAuditReport.tsx
└── pages/
    └── AdminDashboard.tsx
```

### Comments

- Comment the "why", not the "what"
- Use JSDoc for public APIs
- Keep comments up-to-date with code changes
- Avoid over-commenting obvious code

```typescript
// Good
// Cache results for 5 minutes to reduce API calls
const cachedResult = cache.get(key);

// Avoid
// Get cached result
const cachedResult = cache.get(key);
```

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that don't affect code meaning
- `refactor:` Code change that neither fixes bugs nor adds features
- `perf:` Code change that improves performance
- `test:` Adding missing tests or changing existing tests
- `chore:` Changes to build process, dependencies, etc.

### Examples

```
feat(ai-service): add support for Claude 3 Opus

Add new AIProvider interface implementation for Anthropic Claude.
Includes proper error handling and rate limiting.

Closes #42
```

```
fix(blog-editor): correct word count calculation

Word count was including HTML tags in calculation.
Now strips tags before counting.

Fixes #38
```

---

## Testing

While we're still building out test coverage, here are guidelines for adding tests:

- Write tests for new features
- Maintain or improve code coverage
- Use descriptive test names
- Follow existing test patterns

```typescript
describe('AIService', () => {
  describe('auditPage', () => {
    it('should return audit results with valid score', async () => {
      // Arrange
      const mockContent = { /* ... */ };

      // Act
      const result = await service.auditPage(mockContent);

      // Assert
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });
});
```

---

## Documentation

- Update README.md if changing user-facing functionality
- Update relevant documentation files
- Add comments for complex logic
- Include examples for new features
- Keep API documentation in JSDoc comments

When adding a new feature:
1. Update the relevant guide file
2. Add usage examples
3. Update the roadmap if appropriate
4. Add to CHANGELOG.md

---

## Pull Request Process

1. **Fork and branch** - Create a feature branch from `main`
   ```bash
   git checkout -b feat/amazing-feature
   ```

2. **Make your changes** - Follow the coding standards

3. **Test locally**
   ```bash
   npm run typecheck
   npm run build
   npm run seo:audit:pre-deploy
   ```

4. **Commit with clear messages**
   ```bash
   git commit -s -m "feat(module): add amazing feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feat/amazing-feature
   ```

6. **Create Pull Request**
   - Use the PR template
   - Reference related issues
   - Provide clear description of changes
   - Include screenshots if UI changes

7. **Address feedback**
   - Make requested changes
   - Push updates to the same branch
   - Request re-review when ready

---

## Review Process

All submissions require review. We use GitHub pull requests for this purpose. Reviewers will:

- Check code quality and standards compliance
- Verify functionality and test coverage
- Review documentation completeness
- Ensure alignment with project direction

---

## Branch Naming

Use descriptive branch names with prefixes:

```
feat/add-feature-name
fix/fix-bug-description
docs/update-documentation
refactor/improve-code-section
perf/optimize-component
```

---

## Issue Labels

We use labels to organize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested
- `wontfix` - This will not be worked on

---

## Recognition

Contributors will be:
- Added to the CONTRIBUTORS.md file
- Thanked in release notes
- Recognized in the project README

---

## Questions?

- Check the [README](./README.md)
- Search [existing issues](https://github.com/heaventree-ltd/reacteo/issues)
- Open a [discussion](https://github.com/heaventree-ltd/reacteo/discussions)
- Read the [Code of Conduct](./CODE_OF_CONDUCT.md)

---

## Additional Notes

### Performance Considerations

- Consider bundle size impact of dependencies
- Test performance on slower connections
- Optimize database queries with proper indexing
- Use React performance optimization patterns

### Security Considerations

- Never commit sensitive data (API keys, secrets)
- Use environment variables for configuration
- Validate all user inputs
- Follow OWASP guidelines
- Report security issues privately (see SECURITY.md)

### Accessibility

- Ensure WCAG 2.1 compliance
- Test with screen readers
- Provide keyboard navigation
- Use semantic HTML

---

## Thank You!

Your contributions to Reacteo are what make it great. We appreciate your time and effort!

**Happy contributing!** 🚀
