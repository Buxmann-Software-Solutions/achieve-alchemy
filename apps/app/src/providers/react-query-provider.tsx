import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, trpc, trpcClient } from "@/lib/trpc";

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
