"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type WorkspaceUser = { id: string; name: string; email: string; telegramUserID?: string | null };
const CurrentUserContext = createContext<{ user: WorkspaceUser | null; loading: boolean }>({ user: null, loading: true });

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<WorkspaceUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/users").then((response) => response.ok ? response.json() : []).then((users: WorkspaceUser[]) => {
      const savedId = localStorage.getItem("flextudy-current-user-id");
      setUser(users.find((item) => item.id === savedId) ?? users[0] ?? null);
    }).catch(() => undefined).finally(() => setLoading(false));
  }, []);
  return <CurrentUserContext.Provider value={{ user, loading }}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() { return useContext(CurrentUserContext); }
