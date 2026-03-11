# AI Integration Guide - React SEO Kit

## Overview

Your React SEO Kit now includes **multi-model AI integration** enabling intelligent SEO management across your entire application. Support for 5 major AI providers means you can choose the best model for your needs.

## Supported AI Providers

- **OpenAI** (GPT-4, GPT-3.5)
- **Google Gemini** (Gemini Pro)
- **Anthropic Claude** (Claude 3 Opus)
- **Perplexity** (Perplexity Online)
- **Deepseek** (Deepseek Chat)

---

## Architecture

### Components

```
AI Integration System
├── Edge Functions (API Layer)
│   ├── ai-generate.ts         # Multi-model AI request handler
│   ├── ai-models.ts           # Model management
│   └── ai-audit.ts            # Audit result storage
├── Services (Business Logic)
│   ├── AIService.ts           # Unified AI interface
│   ├── BlogService.ts         # Blog content management
│   ├── PageCrawler.ts         # Page analysis
│   └── types.ts               # TypeScript definitions
├── Hooks (React Integration)
│   └── hooks.ts               # useAIModels, useAIAudit, useBlogPost, etc.
├── Components (UI)
│   ├── AIModelsConfig.tsx     # Model configuration
│   ├── BlogEditor.tsx         # Blog post editor
│   ├── SEOAuditReport.tsx     # Audit visualization
│   └── AdminDashboard.tsx     # Main admin interface
└── Database (Supabase)
    ├── ai_models              # Model configurations
    ├── seo_pages              # Page tracking
    ├── ai_audits              # Audit results
    ├── seo_suggestions        # AI suggestions
    ├── blog_posts             # Blog content
    ├── schema_definitions     # JSON-LD schemas
    └── url_configurations     # URL optimization
```

---

## Quick Start

### 1. Configure API Keys

Add API keys as Supabase Edge Function secrets:

```bash
# In your Supabase project dashboard, add these secrets:
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
CLAUDE_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...
DEEPSEEK_API_KEY=sk-...
```

### 2. Access Admin Dashboard

Create a route to the admin dashboard:

```typescript
import { AdminDashboard } from './pages/AdminDashboard';

// In your router:
<Route path="/admin" element={<AdminDashboard />} />
```

### 3. Configure AI Models

1. Navigate to `/admin`
2. Go to "AI Models" tab
3. Click "Add Model"
4. Configure model settings (provider, model ID, tokens, temperature)
5. Models are ready to use!

---

## Feature Breakdown

### 🤖 AI Model Management

**Use Case:** Switch between different AI providers based on needs

```typescript
import { useAIModels } from './lib/ai';

function MyComponent() {
  const { models, fetchModels } = useAIModels();

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <>
      {models.map(model => (
        <div key={model.id}>
          <p>{model.name}</p>
          <p>{model.provider}</p>
        </div>
      ))}
    </>
  );
}
```

### 🔍 SEO Audits

**Use Case:** Analyze pages for SEO issues and get AI-powered suggestions

**AI Will Check:**
- ✅ H1/H2 heading hierarchy
- ✅ Meta title/description quality (length, keywords)
- ✅ Image alt text completeness
- ✅ Keyword optimization
- ✅ Content readability
- ✅ JSON-LD schema suggestions
- ✅ URL optimization recommendations
- ✅ Internal/external link balance

**Example Usage:**

```typescript
import { useAIAudit } from './lib/ai';

function AuditPage() {
  const { auditPage, auditResult } = useAIAudit();

  const handleAudit = async () => {
    const result = await auditPage('/my-page', modelId);
    // Result includes:
    // - score (0-100)
    // - seoScore
    // - readabilityScore
    // - h1Issues
    // - metadataIssues
    // - schemaIssues
    // - suggestions (array of AI recommendations)
  };

  return (
    <>
      <button onClick={handleAudit}>Run Audit</button>
      {auditResult && <SEOAuditReport result={auditResult} />}
    </>
  );
}
```

### 📝 Blog Management

**Use Case:** Create and manage SEO-optimized blog posts

**Features:**
- ✅ SEO validation (title, description, keywords)
- ✅ Auto-calculated word count and reading time
- ✅ Featured image alt text management
- ✅ Tag and category organization
- ✅ Auto-generated URL slug
- ✅ Preview mode

**Example Usage:**

```typescript
import { useBlogPost, useBlogValidation } from './lib/ai';

function BlogEditor() {
  const { createPost, updatePost } = useBlogPost();
  const { validate, validationResult } = useBlogValidation();

  const handleSave = async (post) => {
    // Validate SEO
    const validation = validate(post);
    if (!validation.valid) {
      alert('Fix SEO issues: ' + validation.issues.join(', '));
      return;
    }

    // Save post
    await createPost(post);
  };
}
```

### 📊 Page Content Analysis

**Use Case:** Analyze page structure and extract content

```typescript
import { PageCrawler } from './lib/ai';

const content = await PageCrawler.crawlPage('/my-page');
// Returns:
// - title
// - description
// - headings (with hierarchy)
// - images (src, alt)
// - links (internal/external)
// - rawContent
// - wordCount
// - readingTime
```

---

## React Hooks API

### `useAIModels()`

Manage available AI models

```typescript
const { models, loading, error, fetchModels } = useAIModels();

// Load models
await fetchModels();

// models = [
//   { id: '...', name: 'GPT-4', provider: 'openai', ... },
//   { id: '...', name: 'Gemini Pro', provider: 'gemini', ... }
// ]
```

### `useAIAudit()`

Run SEO audits on pages

```typescript
const { auditPage, auditResult, auditing, error } = useAIAudit();

// Run audit
const result = await auditPage('/my-page', modelId);
// result.score // 0-100
// result.suggestions // Array of improvements
// result.h1Issues // Heading problems
// result.metadataIssues // Meta tag issues
```

### `useBlogPost()`

Manage single blog post

```typescript
const {
  post,
  loading,
  createPost,
  updatePost,
  deletePost,
  loadPost
} = useBlogPost();

// Create
await createPost({
  title: 'My Post',
  content: '...',
  seoTitle: '...',
  seoDescription: '...',
  // ...
});

// Update
await updatePost(postId, { title: 'New Title' });

// Delete
await deletePost(postId);
```

### `useBlogPosts()`

Manage multiple blog posts

```typescript
const { posts, fetchPosts, search, getByCategory, getByTag } = useBlogPosts();

// Fetch all published
await fetchPosts(true);

// Search
await search('react seo');

// Filter by category
await getByCategory('SEO');

// Filter by tag
await getByTag('tutorial');
```

### `usePageContent()`

Analyze page content

```typescript
const { content, crawlPage, getStructure } = usePageContent();

// Crawl page
const result = await crawlPage('/my-page');
// result.headings
// result.images
// result.wordCount

// Get page structure overview
const structure = await getStructure('/my-page');
// structure.h1Count
// structure.imagesWithoutAlt
// structure.linkCount
```

### `useBlogValidation()`

Validate blog post SEO

```typescript
const { validate, validationResult } = useBlogValidation();

const result = validate(blogPost);
// result.valid // boolean
// result.issues // SEO problems
// result.warnings // Non-critical items
```

---

## Services API

### AIService

Low-level AI interaction

```typescript
import { AIService } from './lib/ai';

const service = new AIService();
await service.initialize(modelId);

// Generic AI request
const response = await service.sendRequest({
  prompt: 'Your prompt here',
  maxTokens: 2000,
  temperature: 0.7,
  systemMessage: 'You are an SEO expert'
});

// Specific tasks
const audit = await service.auditPage(pageContent);
const metadata = await service.suggestMetadata(content);
const schema = await service.suggestSchema(content, 'Article');
const url = await service.optimizeURL(currentUrl, summary);
const readability = await service.analyzeReadability(text);
```

### BlogService

Blog content management

```typescript
import { BlogService } from './lib/ai';

// Create
const post = await BlogService.createPost(blogData);

// Read
const post = await BlogService.getPostBySlug('my-post');
const posts = await BlogService.getAllPosts(published);

// Search & Filter
const results = await BlogService.searchPosts('query');
const posts = await BlogService.getPostsByCategory('SEO');
const posts = await BlogService.getPostsByTag('tutorial');

// Validation
const validation = BlogService.validateSEO(post);
// validation.valid
// validation.issues
// validation.warnings

// Utilities
const slug = BlogService.slugify('My Post Title'); // 'my-post-title'
const words = BlogService.calculateWordCount(text);
const time = BlogService.calculateReadingTime(text);
const excerpt = BlogService.generateExcerpt(content, 160);
```

### PageCrawler

Page content extraction

```typescript
import { PageCrawler } from './lib/ai';

// Crawl single page
const content = await PageCrawler.crawlPage('/path', {
  includeContent: true,
  parseHeadings: true,
  parseImages: true,
  parseLinks: true
});

// Crawl multiple pages
const contents = await PageCrawler.crawlMultiple(['/page1', '/page2']);

// Get page structure
const structure = await PageCrawler.getPageStructure('/page');
// structure.title
// structure.h1Count
// structure.imagesWithoutAlt
```

---

## Database Schema

### ai_models
Stores configured AI models

```typescript
{
  id: uuid,
  name: string,              // 'GPT-4 Turbo'
  provider: string,          // 'openai'
  api_key_name: string,      // 'OPENAI_API_KEY'
  model_id: string,          // 'gpt-4-turbo-preview'
  is_active: boolean,
  max_tokens: integer,
  temperature: numeric,
}
```

### seo_pages
Tracks all pages in application

```typescript
{
  id: uuid,
  path: string,              // '/blog/my-post'
  title: string,
  description: string,
  h1_tag: string,
  h1_count: integer,
  h2_count: integer,
  last_crawled: timestamptz,
  needs_audit: boolean,
}
```

### ai_audits
Stores audit results from AI analysis

```typescript
{
  id: uuid,
  page_id: uuid,
  ai_model_id: uuid,
  audit_type: string,
  score: integer,
  seo_score: integer,
  readability_score: integer,
  issues: jsonb,             // Array of issues
  suggestions: jsonb,        // Array of suggestions
  h1_issues: jsonb,
  metadata_issues: jsonb,
  schema_issues: jsonb,
}
```

### blog_posts
Blog content with SEO fields

```typescript
{
  id: uuid,
  page_id: uuid,
  title: string,
  slug: string (unique),
  excerpt: string,
  content: text,
  author: string,
  featured_image: string,
  featured_image_alt: string,
  tags: text[] (array),
  category: string,
  published: boolean,
  seo_title: string,
  seo_description: string,
  seo_keywords: string,
  word_count: integer,
  reading_time: integer,
}
```

### seo_suggestions
AI-generated optimization suggestions

```typescript
{
  id: uuid,
  page_id: uuid,
  audit_id: uuid,
  suggestion_type: string,   // 'metadata', 'content', 'structure'
  priority: string,          // 'high', 'medium', 'low'
  title: string,
  description: text,
  action: text,
  estimated_impact: string,
}
```

---

## Admin Dashboard Features

### Overview Tab
- Quick statistics (AI models, blog posts, audits)
- Welcome guide
- Feature overview

### AI Models Tab
- Add new AI models
- Configure model parameters
- Activate/deactivate models
- View active model
- API key setup instructions

### SEO Audit Tab
- Select AI model
- Enter page path
- Run comprehensive audit
- View audit results with:
  - Overall score (0-100)
  - SEO score
  - Readability score
  - Critical issues
  - Warnings
  - H1/H2 hierarchy analysis
  - Metadata issues
  - Schema suggestions
  - Action items

### Blog Tab
- Create new blog posts
- Edit existing posts
- Manage meta tags (title, description, keywords)
- Auto-validate SEO
- Track word count and reading time
- Manage images and alt text
- Organize with tags and categories
- Publish/unpublish posts
- Preview content

---

## Use Cases

### Use Case 1: Audit Entire Site

```typescript
import { PageCrawler } from './lib/ai';
import { AIService } from './lib/ai';

async function auditSite(pages, modelId) {
  const service = new AIService();
  await service.initialize(modelId);

  for (const page of pages) {
    const content = await PageCrawler.crawlPage(page);
    const audit = await service.auditPage(content);

    // Store audit results
    // Update page status
  }
}
```

### Use Case 2: Auto-Generate Blog Post

```typescript
import { AIService } from './lib/ai';
import { BlogService } from './lib/ai';

async function generateBlogPost(title, outline, keywords, modelId) {
  const service = new AIService();
  await service.initialize(modelId);

  // Generate content
  const content = await service.generateBlogPost(title, outline, keywords);

  // Create post
  const post = await BlogService.createPost({
    title,
    content,
    seoKeywords: keywords,
    wordCount: BlogService.calculateWordCount(content),
    readingTime: BlogService.calculateReadingTime(content),
    // ...
  });

  return post;
}
```

### Use Case 3: Batch Content Optimization

```typescript
async function optimizeAllBlogPosts(modelId) {
  const service = new AIService();
  await service.initialize(modelId);

  const posts = await BlogService.getAllPosts(true);

  for (const post of posts) {
    const pageContent = await PageCrawler.crawlPage(`/blog/${post.slug}`);

    // Suggest improvements
    const metadata = await service.suggestMetadata(pageContent);
    const schema = await service.suggestSchema(pageContent, 'Article');

    // Update post
    await BlogService.updatePost(post.id, {
      seoTitle: metadata.title.suggested,
      seoDescription: metadata.description.suggested,
    });
  }
}
```

---

## Configuration

### Environment Variables

```env
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Edge Function Secrets

```bash
# Add via Supabase dashboard
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
CLAUDE_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...
DEEPSEEK_API_KEY=sk-...
```

---

## Best Practices

1. **Model Selection**
   - Use GPT-4 for complex analysis
   - Use Gemini for cost-effective options
   - Use Claude for nuanced content
   - Use Perplexity for web-aware insights
   - Use Deepseek for fast responses

2. **Temperature Settings**
   - Lower (0.3-0.5): Consistent audit results
   - Medium (0.7): Balanced suggestions
   - Higher (0.9+): Creative content generation

3. **Token Management**
   - Audits: 2000-4000 tokens
   - Blog generation: 3000-4000 tokens
   - Metadata: 500-1000 tokens
   - Schema: 1000-2000 tokens

4. **Error Handling**
   ```typescript
   try {
     await auditPage('/my-page', modelId);
   } catch (error) {
     console.error('Audit failed:', error);
     // Fallback logic
   }
   ```

5. **Rate Limiting**
   - Space out batch operations
   - Use appropriate token limits
   - Monitor API usage

---

## Troubleshooting

### Issue: "API key not found"
**Solution:** Ensure API key is set in Supabase Edge Function secrets with correct name

### Issue: Audit returns empty results
**Solution:** Check page path is accessible and AI model is active

### Issue: Blog validation fails
**Solution:** Ensure SEO title, description, and featured image are set

### Issue: Models not loading
**Solution:** Verify Supabase connection and check RLS policies

---

## Next Steps

1. ✅ Configure API keys in Supabase
2. ✅ Access admin dashboard at `/admin`
3. ✅ Add AI models
4. ✅ Run first SEO audit
5. ✅ Create blog posts
6. ✅ Monitor and iterate

---

**AI Integration Complete!** Your app now has enterprise-grade AI-powered SEO management.

For detailed component API, see component JSDoc comments in source files.
