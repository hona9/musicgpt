"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useJobUpdates } from "@/hooks/use-job-updates";

function SocketBridge() {
  useSocket();
  useJobUpdates();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SocketBridge />
      {children}
    </QueryClientProvider>
  );
}
