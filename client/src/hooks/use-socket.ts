"use client";

import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "@/lib/socket/socket.client";
import { useAuthStore } from "@/store/auth.store";

export function useSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;
    connectSocket(accessToken);
    return () => disconnectSocket();
  }, [accessToken]);
}
