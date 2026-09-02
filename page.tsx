import { DiscoverPage } from "@/components/DiscoverPage";
import { listSpots, type SpotFilters } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const filters: SpotFilters = {
    q: searchParams.q,
    building: (searchParams.building as SpotFilters["building"]) ?? "all",
    maxNoise: searchParams.maxNoise ? Number(searchParams.maxNoise) : undefined,
    minWifi: searchParams.minWifi ? Number(searchParams.minWifi) : undefined,
    minOutlets: searchParams.minOutlets ? Number(searchParams.minOutlets) : undefined,
    status: (searchParams.status as SpotFilters["status"]) ?? "all",
    sort: (searchParams.sort as SpotFilters["sort"]) ?? "newest",
  };
  const spots = await listSpots(filters);

  return (
    <main>
      <DiscoverPage spots={spots} />
    </main>
  );
}
