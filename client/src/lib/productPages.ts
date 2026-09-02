export interface ProductPageData {
  slug: string;
  route: string;
  title: string;
  metaDescription: string;
  h1: string;
  answerSentence: string;
  jsonLd: object | null;
  body: string;
}

interface MarkdownModule {
  frontmatter: {
    route: string;
    title: string;
    metaDescription: string;
    h1: string;
    answerSentence: string;
    jsonLdType: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  body: string;
  jsonLd: object | null;
}

const modules = import.meta.glob<MarkdownModule>(
  '../../../content/product-pages/*.md',
  { eager: true }
);

export const PRODUCT_PAGES: ProductPageData[] = Object.entries(modules).map(
  ([filepath, mod]) => {
    const slug = filepath.split('/').pop()!.replace('.md', '');
    return {
      slug,
      route: mod.frontmatter.route,
      title: mod.frontmatter.title,
      metaDescription: mod.frontmatter.metaDescription,
      h1: mod.frontmatter.h1,
      answerSentence: mod.frontmatter.answerSentence,
      jsonLd: mod.jsonLd,
      body: mod.body,
    };
  }
);

export function findProductPage(route: string): ProductPageData | undefined {
  return PRODUCT_PAGES.find((p) => p.route === route);
}
