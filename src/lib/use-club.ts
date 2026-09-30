import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getClubSnapshot } from "@/lib/club-api";

export const clubQueryKey = ["club"] as const;

export type ClubSnapshot = Awaited<ReturnType<typeof getClubSnapshot>>;

export function useClub(initialData?: ClubSnapshot) {
  return useQuery({
    queryKey: clubQueryKey,
    queryFn: () => getClubSnapshot(),
    staleTime: 15_000,
    initialData,
  });
}

export function useInvalidateClub() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: clubQueryKey });
}
