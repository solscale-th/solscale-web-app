"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlowCard, FlowPage, fieldClass, primaryBtn } from "@/components/flow-page-shell";
import { useAuth } from "@/hooks/use-auth";
import { useFlowchart } from "@/hooks/use-flowchart";
import { useLanguage } from "@/i18n/language-provider";
import { buildRating } from "@/lib/flowchart/builders";
import { FlowchartError } from "@/lib/flowchart/types";

export default function RatingContent({ engagementId }: { engagementId: string }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { state, dispatch } = useFlowchart();
  const router = useRouter();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const engagement = state.engagements.find((item) => item.id === engagementId);

  if (!user) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!engagement || !user) return;
    setError("");
    try {
      dispatch({
        type: "LEAVE_RATING",
        rating: buildRating({
          engagementId,
          fromUserId: user.id,
          toUserId:
            user.role === "entrepreneur"
              ? engagement.influencerId
              : engagement.entrepreneurId,
          stars,
          comment: comment.trim(),
        }),
      });
      router.push("/my-jobs");
    } catch (err) {
      setError(err instanceof FlowchartError ? err.code : t("flow.error"));
    }
  }

  return (
    <FlowPage
      title={t("flow.rateTitle")}
      subtitle={t("flow.rateSubtitle")}
      backHref={`/my-jobs/${engagementId}`}
    >
      <FlowCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset>
            <legend className="text-[13px] font-medium text-[#333]">{t("flow.stars")}</legend>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStars(value)}
                  className={`h-10 w-10 rounded-xl text-[14px] font-semibold ${
                    value <= stars
                      ? "bg-[#d7ff2f] text-[#2a1018]"
                      : "bg-[#f4f1ec] text-[#888]"
                  }`}
                  aria-label={`${value}`}
                >
                  {value}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block text-[13px] font-medium text-[#333]">
            {t("flow.comment")}
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={`mt-1.5 resize-none ${fieldClass}`}
            />
          </label>
          <button type="submit" className={primaryBtn}>
            {t("flow.rateCta")}
          </button>
        </form>
      </FlowCard>
      {error && <p className="text-[13px] text-[#c0392b]">{error}</p>}
    </FlowPage>
  );
}
