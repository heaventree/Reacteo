# AI Integration - Quick Setup (5 minutes)

## Step 1: Add API Keys to Supabase

Go to your Supabase project dashboard:

1. Click "Settings" → "Edge Functions" → "Secrets"
2. Add secrets for the AI providers you want to use:

```
OPENAI_API_KEY=sk-your-key-here
GEMINI_API_KEY=AIza_your-key-here
CLAUDE_API_KEY=sk-ant-your-key-here
PERPLEXITY_API_KEY=pplx_your-key-here
DEEPSEEK_API_KEY=sk_your-key-here
```

**Where to get API keys:**
- **OpenAI:** https://platform.openai.com/api-keys
- **Gemini:** https://makersuite.google.com/app/apikey
- **Claude:** https://console.anthropic.com/
- **Perplexity:** https://www.perplexity.ai/api (requires waitlist)
- **Deepseek:** https://platform.deepseek.com/

## Step 2: Access Admin Dashboard

Add a route to your app:

```typescript
// In your router configuration
import { AdminDashboard } from './pages/AdminDashboard';

<Route path="/admin" element={<AdminDashboard />} />
```

## Step 3: Configure AI Models

1. Go to `http://localhost:5173/admin`
2. Click "AI Models" tab
3. Click "Add Model"
4. Fill in the form:
   - **Name:** e.g., "GPT-4 Turbo"
   - **Provider:** Select from dropdown
   - **Model ID:** Leave auto-filled or enter custom
   - **Max Tokens:** 4096 (default)
   - **Temperature:** 0.7 (default)
5. Click "Save Model"

## Step 4: Run Your First SEO Audit

1. Click "SEO Audit" tab
2. Ensure a model is selected
3. Enter a page path: `/` or `/about`
4. Click "Run Audit"
5. View results!

## Step 5: Create a Blog Post

1. Click "Blog" tab
2. Fill in blog post form:
   - Title
   - Content
   - SEO Title (30-60 chars)
   - SEO Description (120-160 chars)
3. Click "Validate SEO"
4. Fix any issues
5. Click "Save Post"

---

## What You Can Do Now

### 🔍 SEO Audit Your Pages
Analyze any page for:
- H1/H2 heading issues
- Meta tag quality
- Image alt text
- Keyword optimization
- Readability score
- Schema recommendations

### 📝 Create SEO-Optimized Blog Posts
With:
- AI-validated SEO metadata
- Auto word count & reading time
- Featured image management
- Tag & category organization
- Publishing workflow

### 🤖 Switch Between AI Models
Choose best provider per task:
- **GPT-4** - Complex analysis (most capable)
- **Gemini** - Cost-effective
- **Claude** - Nuanced content
- **Perplexity** - Real-time web info
- **Deepseek** - Fast responses

### 📊 Get AI Suggestions
Every audit includes:
- Critical issues (must fix)
- Warnings (should fix)
- Actionable suggestions
- Impact estimations

---

## Common Tasks

### Run Audit on Multiple Pages

```typescript
import { useAIAudit } from './lib/ai';

async function auditMultiplePages(pages, modelId) {
  const { auditPage } = useAIAudit();

  for (const page of pages) {
    await auditPage(page, modelId);
    // Results stored in Supabase
  }
}
```

### Search Blog Posts

```typescript
import { useBlogPosts } from './lib/ai';

function SearchBlog() {
  const { search } = useBlogPosts();

  const handleSearch = async (query) => {
    const results = await search(query);
    // Display results
  };
}
```

### Generate Blog Post Alt Text

```typescript
import { AIService } from './lib/ai';

async function generateAltText(imageContext, modelId) {
  const service = new AIService();
  await service.initialize(modelId);

  const altText = await service.generateAltText(
    imageUrl,
    'Product photo for e-commerce'
  );

  return altText;
}
```

---

## Database Overview

Data is stored in Supabase:

- **ai_models** - Your configured AI models
- **seo_pages** - Pages you've analyzed
- **ai_audits** - Audit results & scores
- **blog_posts** - Your blog content
- **seo_suggestions** - AI recommendations

All with Row Level Security (RLS) for safety!

---

## Environment Setup

Ensure these are in your `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## Troubleshooting

**Q: "AI Model not found" error**
A: Make sure you've added and saved a model in the AI Models tab

**Q: Audit returns no results**
A: Check that the page path is correct and the model has an API key

**Q: Blog post won't save**
A: Validate SEO first - check title length (30-60), description length (120-160)

**Q: Can't access admin dashboard**
A: Make sure route is added to your React Router config

---

## That's It!

You now have a complete AI-powered SEO management system integrated into your React app!

### Next steps:
1. Configure your preferred AI models
2. Run audits on your pages
3. Create blog posts
4. Monitor SEO metrics
5. Get AI suggestions

### For detailed API documentation, see: `AI_INTEGRATION_GUIDE.md`

Need help? Check the component JSDoc comments in:
- `src/components/AIModelsConfig.tsx`
- `src/components/BlogEditor.tsx`
- `src/components/SEOAuditReport.tsx`
