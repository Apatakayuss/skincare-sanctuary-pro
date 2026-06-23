import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: (s.q as string) ?? "" }),
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/shop", search: { q: search.q || undefined } });
  },
});
