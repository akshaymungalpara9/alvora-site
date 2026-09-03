// All articles are now loaded from content/insights/*.md and content/paa-pages/*.md
// via insightsArticles.ts. This file is kept for the shape export only.

export interface InsightArticle {
  slug: string;
  type: 'paa' | 'insight';
  title: string;
  eyebrow: string;
  description: string;
  published: string;
  body: string;
}

export const INSIGHTS: InsightArticle[] = [];

export function findArticle(_slug: string): InsightArticle | undefined {
  return undefined;
}
