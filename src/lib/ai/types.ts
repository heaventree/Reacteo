export type AIProvider = 'openai' | 'gemini' | 'claude' | 'perplexity' | 'deepseek';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  modelId: string;
  isActive: boolean;
  maxTokens: number;
  temperature: number;
}

export interface AuditIssue {
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  location?: string;
  suggestion?: string;
}

export interface H1Issue extends AuditIssue {
  count: number;
  expected: number;
}

export interface H2HierarchyIssue extends AuditIssue {
  h1Index: number;
  h2Index: number;
}

export interface MetadataIssue extends AuditIssue {
  field: string;
  currentValue?: string;
  recommendedValue?: string;
}

export interface SchemaIssue extends AuditIssue {
  schemaType: string;
  missingFields?: string[];
}

export interface AISuggestion {
  type: 'metadata' | 'content' | 'structure' | 'technical' | 'schema' | 'url';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  estimatedImpact: string;
}

export interface AuditResult {
  pageId: string;
  aiModelId: string;
  auditType: string;
  issues: AuditIssue[];
  suggestions: AISuggestion[];
  score: number;
  h1Issues: H1Issue[];
  h2HierarchyIssues: H2HierarchyIssue[];
  metadataIssues: MetadataIssue[];
  schemaIssues: SchemaIssue[];
  readabilityScore: number;
  seoScore: number;
}

export interface PageContent {
  path: string;
  title: string;
  description: string;
  headings: Array<{
    level: number;
    text: string;
    id?: string;
  }>;
  images: Array<{
    src: string;
    alt: string;
    title?: string;
  }>;
  links: Array<{
    href: string;
    text: string;
    internal: boolean;
  }>;
  rawContent: string;
  wordCount: number;
  readingTime: number;
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  tags: string[];
  category: string;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  wordCount: number;
  readingTime: number;
}

export interface URLOptimization {
  currentUrl: string;
  optimizedUrl: string;
  slugKeywords: string[];
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  internalLinks: number;
  externalLinks: number;
  imagesWithAlt: number;
  imagesMissingAlt: number;
}

export interface AIRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  systemMessage?: string;
}

export interface AIResponse {
  content: string;
  tokensUsed: number;
  model: string;
  provider: AIProvider;
}
