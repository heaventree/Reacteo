import type { BlogPost } from './types';
import { createClient } from '@supabase/supabase-js';

/**
 * Blog Management Service - Manage blog posts with SEO optimization
 */

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export class BlogService {
  /**
   * Create blog post
   */
  static async createPost(post: BlogPost): Promise<BlogPost> {
    const slug = this.slugify(post.slug);

    // Create page entry
    const { data: pageData, error: pageError } = await supabase
      .from('seo_pages')
      .insert([
        {
          path: `/blog/${slug}`,
          title: post.seoTitle || post.title,
          description: post.seoDescription || post.excerpt,
          h1_tag: post.title,
          h1_count: 1,
          is_published: post.published,
          needs_audit: true,
        },
      ])
      .select();

    if (pageError) throw new Error(`Failed to create page: ${pageError.message}`);

    // Create blog post
    const { data: postData, error: postError } = await supabase
      .from('blog_posts')
      .insert([
        {
          page_id: pageData[0].id,
          title: post.title,
          slug,
          excerpt: post.excerpt,
          content: post.content,
          author: post.author,
          featured_image: post.featuredImage,
          featured_image_alt: post.featuredImageAlt,
          tags: post.tags,
          category: post.category,
          published: post.published,
          published_at: post.published ? new Date().toISOString() : null,
          seo_title: post.seoTitle,
          seo_description: post.seoDescription,
          seo_keywords: post.seoKeywords,
          word_count: post.wordCount,
          reading_time: post.readingTime,
        },
      ])
      .select();

    if (postError) throw new Error(`Failed to create post: ${postError.message}`);

    return {
      ...postData[0],
      id: postData[0].id,
    };
  }

  /**
   * Update blog post
   */
  static async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        ...(updates.title && { title: updates.title }),
        ...(updates.excerpt && { excerpt: updates.excerpt }),
        ...(updates.content && { content: updates.content }),
        ...(updates.author && { author: updates.author }),
        ...(updates.featuredImage && { featured_image: updates.featuredImage }),
        ...(updates.featuredImageAlt && { featured_image_alt: updates.featuredImageAlt }),
        ...(updates.tags && { tags: updates.tags }),
        ...(updates.category && { category: updates.category }),
        ...(updates.seoTitle && { seo_title: updates.seoTitle }),
        ...(updates.seoDescription && { seo_description: updates.seoDescription }),
        ...(updates.seoKeywords && { seo_keywords: updates.seoKeywords }),
        ...(updates.wordCount && { word_count: updates.wordCount }),
        ...(updates.readingTime && { reading_time: updates.readingTime }),
        ...(updates.published !== undefined && { published: updates.published }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) throw new Error(`Failed to update post: ${error.message}`);

    return data[0];
  }

  /**
   * Get blog post by slug
   */
  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch post: ${error.message}`);
    return data;
  }

  /**
   * Get all blog posts
   */
  static async getAllPosts(published: boolean = true): Promise<BlogPost[]> {
    let query = supabase.from('blog_posts').select('*');

    if (published) {
      query = query.eq('published', true);
    }

    const { data, error } = await query.order('published_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch posts: ${error.message}`);
    return data;
  }

  /**
   * Search blog posts
   */
  static async searchPosts(query: string): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) throw new Error(`Failed to search posts: ${error.message}`);
    return data;
  }

  /**
   * Get posts by category
   */
  static async getPostsByCategory(category: string): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('category', category)
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch posts: ${error.message}`);
    return data;
  }

  /**
   * Get posts by tag
   */
  static async getPostsByTag(tag: string): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .contains('tags', [tag])
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch posts: ${error.message}`);
    return data;
  }

  /**
   * Delete blog post
   */
  static async deletePost(id: string): Promise<void> {
    // Get page_id
    const { data: postData } = await supabase
      .from('blog_posts')
      .select('page_id')
      .eq('id', id)
      .maybeSingle();

    // Delete post
    const { error: postError } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (postError) throw new Error(`Failed to delete post: ${postError.message}`);

    // Delete page (cascade will handle related records)
    if (postData?.page_id) {
      await supabase
        .from('seo_pages')
        .delete()
        .eq('id', postData.page_id);
    }
  }

  /**
   * Generate slug from title
   */
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Calculate reading time
   */
  static calculateReadingTime(content: string): number {
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  }

  /**
   * Calculate word count
   */
  static calculateWordCount(content: string): number {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Generate excerpt from content
   */
  static generateExcerpt(content: string, length: number = 160): string {
    const text = content.replace(/<[^>]*>/g, '').trim();
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + '...';
  }

  /**
   * Validate blog post SEO
   */
  static validateSEO(post: BlogPost): {
    valid: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Title validation
    if (!post.seoTitle) {
      issues.push('SEO title is required');
    } else if (post.seoTitle.length < 30) {
      warnings.push('SEO title is too short (min 30 characters)');
    } else if (post.seoTitle.length > 60) {
      warnings.push('SEO title is too long (max 60 characters)');
    }

    // Description validation
    if (!post.seoDescription) {
      issues.push('SEO description is required');
    } else if (post.seoDescription.length < 120) {
      warnings.push('SEO description is too short (min 120 characters)');
    } else if (post.seoDescription.length > 160) {
      warnings.push('SEO description is too long (max 160 characters)');
    }

    // Keywords validation
    if (!post.seoKeywords) {
      warnings.push('SEO keywords not set');
    }

    // Image validation
    if (!post.featuredImage) {
      warnings.push('Featured image not set');
    } else if (!post.featuredImageAlt) {
      issues.push('Featured image alt text is required');
    }

    // Content validation
    if (post.wordCount < 300) {
      warnings.push('Content is very short (less than 300 words)');
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
    };
  }
}

export const createBlogService = (): typeof BlogService => BlogService;
