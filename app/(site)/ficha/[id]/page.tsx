import { Detail } from "@/components/site/Detail";

export default async function FichaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Detail key={id} id={id} />;
}
