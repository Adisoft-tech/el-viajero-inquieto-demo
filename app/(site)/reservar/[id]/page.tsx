import { BookingFlow } from "@/components/site/BookingFlow";

export const metadata = { title: "Reservar", robots: { index: false, follow: false } };

export default async function ReservarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingFlow id={id} />;
}
