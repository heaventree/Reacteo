import type { PageContent } from './types';

/**
 * Page Crawler - Extracts content from pages for AI analysis
 */

export interface CrawlOptions {
  includeContent?: boolean;
  parseHeadings?: boolean;
  parseImages?: boolean;
  parseLinks?: boolean;
}

export class PageCrawler {
  /**
   * Crawl page and extract content
   */
  static async crawlPage(path: string, options: CrawlOptions = {}): Promise<PageContent> {
    const {
      includeContent = true,
      parseHeadings = true,
      parseImages = true,
      parseLinks = true,
    } = options;

    try {
      // Fetch page HTML
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Failed to fetch ${path}`);

      const html = await response.text();
      const doc = this.parseHTML(html);

      return {
        path,
        title: this.extractTitle(doc),
        description: this.extractDescription(doc),
        headings: parseHeadings ? this.extractHeadings(doc) : [],
        images: parseImages ? this.extractImages(doc) : [],
        links: parseLinks ? this.extractLinks(doc, path) : [],
        rawContent: includeContent ? this.extractContent(doc) : '',
        wordCount: includeContent ? this.countWords(this.extractContent(doc)) : 0,
        readingTime: includeContent
          ? Math.ceil(this.countWords(this.extractContent(doc)) / 200)
          : 0,
      };
    } catch (error) {
      console.error('Crawl error:', error);
      throw new Error(`Failed to crawl page: ${error}`);
    }
  }

  /**
   * Parse HTML string into document
   */
  private static parseHTML(html: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
  }

  /**
   * Extract page title
   */
  private static extractTitle(doc: Document): string {
    const titleTag = doc.querySelector('title');
    if (titleTag?.textContent) return titleTag.textContent.trim();

    const ogTitle = doc.querySelector('meta[property="og:title"]');
    if (ogTitle?.getAttribute('content')) {
      return ogTitle.getAttribute('content')!;
    }

    const h1 = doc.querySelector('h1');
    return h1?.textContent?.trim() || 'Untitled';
  }

  /**
   * Extract meta description
   */
  private static extractDescription(doc: Document): string {
    const metaDesc = doc.querySelector('meta[name="description"]');
    if (metaDesc?.getAttribute('content')) {
      return metaDesc.getAttribute('content')!;
    }

    const ogDesc = doc.querySelector('meta[property="og:description"]');
    if (ogDesc?.getAttribute('content')) {
      return ogDesc.getAttribute('content')!;
    }

    return '';
  }

  /**
   * Extract headings with hierarchy
   */
  private static extractHeadings(
    doc: Document
  ): Array<{ level: number; text: string; id?: string }> {
    const headings: Array<{ level: number; text: string; id?: string }> = [];

    const headingTags = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headingTags.forEach(heading => {
      const level = parseInt(heading.tagName[1], 10);
      const text = heading.textContent?.trim() || '';
      const id = heading.id || undefined;

      if (text) {
        headings.push({ level, text, id });
      }
    });

    return headings;
  }

  /**
   * Extract images with alt text
   */
  private static extractImages(
    doc: Document
  ): Array<{ src: string; alt: string; title?: string }> {
    const images: Array<{ src: string; alt: string; title?: string }> = [];

    const imgTags = doc.querySelectorAll('img');
    imgTags.forEach(img => {
      const src = img.src || img.getAttribute('data-src') || '';
      const alt = img.alt || '';
      const title = img.title || undefined;

      if (src) {
        images.push({ src, alt, title });
      }
    });

    return images;
  }

  /**
   * Extract links
   */
  private static extractLinks(
    doc: Document,
    basePath: string
  ): Array<{ href: string; text: string; internal: boolean }> {
    const links: Array<{ href: string; text: string; internal: boolean }> = [];
    const domain = new URL(basePath).hostname;

    const aTags = doc.querySelectorAll('a[href]');
    aTags.forEach(link => {
      const href = link.getAttribute('href') || '';
      const text = link.textContent?.trim() || '';

      if (href && text) {
        try {
          const linkUrl = new URL(href, basePath);
          const isInternal = linkUrl.hostname === domain;
          links.push({ href, text, internal: isInternal });
        } catch {
          // Invalid URL, skip
        }
      }
    });

    return links;
  }

  /**
   * Extract main content
   */
  private static extractContent(doc: Document): string {
    // Try to get main content area
    const main =
      doc.querySelector('main') ||
      doc.querySelector('article') ||
      doc.querySelector('[role="main"]') ||
      doc.body;

    if (!main) return '';

    // Remove script and style tags
    const clone = main.cloneNode(true) as Element;
    clone.querySelectorAll('script, style, nav, footer').forEach(el => el.remove());

    return clone.textContent?.trim() || '';
  }

  /**
   * Count words in text
   */
  private static countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }

  /**
   * Crawl multiple pages
   */
  static async crawlMultiple(
    paths: string[],
    options: CrawlOptions = {}
  ): Promise<PageContent[]> {
    const results: PageContent[] = [];

    for (const path of paths) {
      try {
        const content = await this.crawlPage(path, options);
        results.push(content);
      } catch (error) {
        console.error(`Failed to crawl ${path}:`, error);
      }
    }

    return results;
  }

  /**
   * Get page structure overview
   */
  static async getPageStructure(path: string): Promise<{
    title: string;
    h1Count: number;
    h2Count: number;
    imageCount: number;
    imagesWithoutAlt: number;
    linkCount: number;
    internalLinks: number;
    externalLinks: number;
  }> {
    const content = await this.crawlPage(path, {
      includeContent: false,
      parseHeadings: true,
      parseImages: true,
      parseLinks: true,
    });

    const h1Count = content.headings.filter(h => h.level === 1).length;
    const h2Count = content.headings.filter(h => h.level === 2).length;
    const imageCount = content.images.length;
    const imagesWithoutAlt = content.images.filter(img => !img.alt).length;
    const linkCount = content.links.length;
    const internalLinks = content.links.filter(l => l.internal).length;
    const externalLinks = content.links.filter(l => !l.internal).length;

    return {
      title: content.title,
      h1Count,
      h2Count,
      imageCount,
      imagesWithoutAlt,
      linkCount,
      internalLinks,
      externalLinks,
    };
  }
}

export const createPageCrawler = (): typeof PageCrawler => PageCrawler;
