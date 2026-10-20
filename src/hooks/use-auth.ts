"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AUTH_CHANGE_EVENT,
  clearStoredUser,
  getStoredUser,
  isLoggedIn,
} from "@/lib/auth";
import type { AuthUser } from "@/lib/user";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncUser = () => {
      setUser(isLoggedIn() ? getStoredUser() : null);
    };
    syncUser();

    window.addEventListener(AUTH_CHANGE_EVENT, syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const logout = useCallback(() => {
    clearStoredUser();
  }, []);

  return {
    user,
    isLoggedIn: user !== null,
    logout,
  };
}
