import { BookingFlow } from "@/components/site/BookingFlow";

export default async function ReservarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingFlow id={id} />;
}
