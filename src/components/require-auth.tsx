"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AUTH_CHANGE_EVENT,
  buildLoginUrl,
  isLoggedIn,
} from "@/lib/auth";

type RequireAuthProps = {
  returnTo: string;
  children: React.ReactNode;
};

export default function RequireAuth({ returnTo, children }: RequireAuthProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => setAllowed(isLoggedIn());
    sync();

    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (allowed === false) {
      router.replace(buildLoginUrl(returnTo));
    }
  }, [allowed, router, returnTo]);

  if (allowed !== true) {
    return null;
  }

  return children;
}
