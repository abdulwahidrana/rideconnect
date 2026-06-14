"use client";

import { useCallback, useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import type { NotificationDTO } from "@/types";

export function useNotifications() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications);
      setUnread(data.unread);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!socket) return;
    const onNew = (n: NotificationDTO) => {
      setNotifications((prev) => [n, ...prev]);
      setUnread((u) => u + 1);
    };
    socket.on("notification:new", onNew);
    return () => {
      socket.off("notification:new", onNew);
    };
  }, [socket]);

  const markAllRead = useCallback(async () => {
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications", { method: "PUT" });
  }, []);

  return { notifications, unread, loading, markAllRead, refresh: fetchNotifications };
}
