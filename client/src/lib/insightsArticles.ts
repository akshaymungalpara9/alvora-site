export interface InsightMarkdownArticle {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  publishedDate: string;
  author: string;
  readingTime: string;
  relatedProduct: string;
  answerSentence: string;
  paaQuestions?: string[];
  jsonLd: object | object[] | null;
  body: string;
}

interface MarkdownModule {
  frontmatter: {
    slug?: string;
    title: string;
    metaDescription: string;
    eyebrow: string;
    publishedDate: string;
    author: string;
    readingTime: string;
    relatedProduct: string;
    answerSentence: string;
    paaQuestions?: string[];
  };
  body: string;
  jsonLd: object | object[] | null;
}

function toArticle(filepath: string, mod: MarkdownModule): InsightMarkdownArticle {
  const slug = mod.frontmatter.slug ?? filepath.split('/').pop()!.replace('.md', '');
  return {
    slug,
    title: mod.frontmatter.title,
    description: mod.frontmatter.metaDescription,
    eyebrow: mod.frontmatter.eyebrow,
    publishedDate: mod.frontmatter.publishedDate,
    author: mod.frontmatter.author,
    readingTime: mod.frontmatter.readingTime,
    relatedProduct: mod.frontmatter.relatedProduct,
    answerSentence: mod.frontmatter.answerSentence,
    paaQuestions: mod.frontmatter.paaQuestions,
    jsonLd: mod.jsonLd,
    body: mod.body,
  };
}

const insightModules = import.meta.glob<MarkdownModule>(
  '../../../content/insights/*.md',
  { eager: true }
);

const paaModules = import.meta.glob<MarkdownModule>(
  '../../../content/paa-pages/*.md',
  { eager: true }
);

export const INSIGHT_ARTICLES: InsightMarkdownArticle[] = [
  ...Object.entries(insightModules).map(([fp, mod]) => toArticle(fp, mod)),
  ...Object.entries(paaModules).map(([fp, mod]) => toArticle(fp, mod)),
];

export function findInsightArticle(slug: string): InsightMarkdownArticle | undefined {
  return INSIGHT_ARTICLES.find((a) => a.slug === slug);
}
