import type { Metadata } from "next";
import { JsonLd } from "@/components/site/JsonLd";
import { PostPage } from "@/components/site/Notiviajero";
import { getPublishedPost } from "@/lib/actions/blog";
import { ROUTES } from "@/lib/routes";
import { abs, breadcrumbJsonLd, clip, pageMeta, SITE_NAME, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPublishedPost(id).catch(() => null);
  if (!post) return { title: "Notiviajero", robots: { index: false } };
  return pageMeta({
    title: post.title,
    description: clip(post.excerpt || post.body.replace(/^#+ /gm, "")),
    path: ROUTES.post(post.id),
    image: post.coverUrl || undefined,
  });
}

export default async function NotiviajeroPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPublishedPost(id).catch(() => null);
  return (
    <>
      {post && (
        <JsonLd data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt || undefined,
            ...(post.coverUrl ? { image: abs(post.coverUrl) } : {}),
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            author: post.author ? { "@type": "Person", name: post.author } : { "@id": SITE_URL + "/#agencia" },
            publisher: { "@id": SITE_URL + "/#agencia", name: SITE_NAME },
            mainEntityOfPage: abs(ROUTES.post(post.id)),
          },
          breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Notiviajero", path: ROUTES.notiviajero }, { name: post.title, path: ROUTES.post(post.id) }]),
        ]} />
      )}
      <PostPage post={post} />
    </>
  );
}
