"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import CompleteProfileForm from "@/components/complete-profile-form";
import { useLanguage } from "@/i18n/language-provider";
import { getSafeReturnTo, setAuthToken, setStoredUser } from "@/lib/auth";
import {
  loginEntrepreneurWithLine,
  loginInfluencerWithLine,
  updateEntrepreneurProfile,
  updateInfluencerProfile,
} from "@/lib/auth-api";
import {
  LINE_OAUTH_ROLE_KEY,
  LINE_OAUTH_RETURN_TO_KEY,
  LINE_OAUTH_STATE_KEY,
} from "@/lib/line-auth";
import type { MockUser } from "@/lib/mock-users";

function LineCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const ran = useRef(false);

  const [error, setError] = useState("");
  const [returnTo, setReturnTo] = useState("/");
  const [pendingUser, setPendingUser] = useState<MockUser | null>(null);
  const [profileGaps, setProfileGaps] = useState({
    needsEmail: false,
    needsCompanyName: false,
  });

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function run() {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const lineError = searchParams.get("error");

      const storedState = sessionStorage.getItem(LINE_OAUTH_STATE_KEY);
      const role = sessionStorage.getItem(LINE_OAUTH_ROLE_KEY);
      const storedReturnTo = getSafeReturnTo(
        sessionStorage.getItem(LINE_OAUTH_RETURN_TO_KEY)
      );

      sessionStorage.removeItem(LINE_OAUTH_STATE_KEY);
      sessionStorage.removeItem(LINE_OAUTH_ROLE_KEY);
      sessionStorage.removeItem(LINE_OAUTH_RETURN_TO_KEY);

      setReturnTo(storedReturnTo);

      if (lineError || !code || !state || !role || state !== storedState) {
        setError(t("auth.login.lineLoginFailed"));
        return;
      }

      const redirectUri = `${window.location.origin}/login/line/callback`;

      try {
        if (role === "influencer") {
          const { token, user, needsEmail } = await loginInfluencerWithLine(
            code,
            redirectUri
          );
          setAuthToken(token);
          setStoredUser(user);
          if (needsEmail) {
            setPendingUser(user);
            setProfileGaps({ needsEmail: true, needsCompanyName: false });
          } else {
            router.push(storedReturnTo);
          }
        } else {
          const { token, user, needsEmail, needsCompanyName } =
            await loginEntrepreneurWithLine(code, redirectUri);
          setAuthToken(token);
          setStoredUser(user);
          if (needsEmail || needsCompanyName) {
            setPendingUser(user);
            setProfileGaps({ needsEmail, needsCompanyName });
          } else {
            router.push(storedReturnTo);
          }
        }
      } catch {
        setError(t("auth.login.lineLoginFailed"));
      }
    }

    run();
    // one-shot on mount: reads the auth-code exchange result from the URL/sessionStorage once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleProfileSubmit(values: {
    email?: string;
    companyName?: string;
  }) {
    if (!pendingUser) return;

    if (pendingUser.role === "entrepreneur") {
      await updateEntrepreneurProfile(values);
    } else {
      await updateInfluencerProfile({ email: values.email ?? "" });
    }

    setStoredUser({
      ...pendingUser,
      name: values.companyName || pendingUser.name,
      email: values.email || pendingUser.email,
    });
    router.push(returnTo);
  }

  if (pendingUser) {
    return (
      <CompleteProfileForm
        needsEmail={profileGaps.needsEmail}
        needsCompanyName={profileGaps.needsCompanyName}
        onSubmit={handleProfileSubmit}
      />
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[460px] text-center">
        <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[13px] text-red-600">
          {error}
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-[14px] font-semibold text-[#9d003b] hover:underline"
        >
          {t("auth.login.backToLoginLink")}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[460px] text-center text-[15px] text-[#777]">
      {t("auth.login.submitting")}
    </div>
  );
}

export default function LineCallbackPage() {
  return (
    <Suspense fallback={null}>
      <LineCallback />
    </Suspense>
  );
}
