import { TripWorkspace } from "@/components/trips/trip-workspace";

export default async function TripRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  return <TripWorkspace tripId={tripId} />;
}
