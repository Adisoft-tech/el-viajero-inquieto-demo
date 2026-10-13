import type { Metadata } from "next";
import { PostPage } from "@/components/site/Notiviajero";
import { getPublishedPost } from "@/lib/actions/blog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPublishedPost(id).catch(() => null);
  return { title: post ? post.title + " · Notiviajero" : "Notiviajero · El Viajero Inquieto", description: post?.excerpt || undefined };
}

export default async function NotiviajeroPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPublishedPost(id).catch(() => null);
  return <PostPage post={post} />;
}
