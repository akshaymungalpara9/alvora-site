import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SpecialtyPageShell, { SpecialtyCta } from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";
import type { ProductPageData } from "@/lib/productPages";

const isDev = import.meta.env.DEV;

interface Props {
  page: ProductPageData;
}

export default function MarkdownPage({ page }: Props) {
  useEffect(() => {
    if (isDev && page.body.includes('TODO(alvora)')) {
      console.warn('[Alvora] Product page has unfilled TODO(alvora) markers:', page.route);
    }
  }, [page.body, page.route]);

  const processedBody = isDev
    ? page.body
    : page.body.replace(/TODO\(alvora\):\s*______/g, '`::todo::`');

  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title={page.title}
        description={page.metaDescription}
        path={page.route}
        jsonLd={page.jsonLd ?? undefined}
      />
      <section className="specialty-hero" aria-labelledby={`${page.slug}-h1`}>
        <p className="eyebrow eyebrow-bright"><span />ALVORA DIAMONDS · SURAT</p>
        <h1 id={`${page.slug}-h1`}>{page.h1}</h1>
        <p className="specialty-hero-copy">{page.answerSentence}</p>
      </section>
      <section className="specialty-section specialty-section-ink">
        <div className="product-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ children, ...props }) {
                const content = String(children);
                if (content === '::todo::') {
                  if (isDev) {
                    return (
                      <mark
                        data-alvora-todo
                        style={{ background: 'oklch(0.9 0.18 100)', color: '#222' }}
                      >
                        TODO(alvora)
                      </mark>
                    );
                  }
                  return <span data-alvora-todo aria-hidden="true" />;
                }
                return <code {...props}>{children}</code>;
              },
            }}
          >
            {processedBody}
          </ReactMarkdown>
        </div>
      </section>
      <SpecialtyCta />
    </SpecialtyPageShell>
  );
}
