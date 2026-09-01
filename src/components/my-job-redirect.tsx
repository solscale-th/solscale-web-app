"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFlowchart } from "@/hooks/use-flowchart";
import { getEngagementById } from "@/lib/mock-my-jobs";
import { jobDetailHref } from "@/lib/job-detail-href";

export default function MyJobRedirect({ engagementId }: { engagementId: string }) {
  const router = useRouter();
  const { state } = useFlowchart();

  useEffect(() => {
    const live = state.engagements.find((item) => item.id === engagementId);
    const seed = getEngagementById(engagementId);
    const jobId = live?.jobId ?? seed?.jobId;
    if (jobId) {
      router.replace(jobDetailHref(jobId, engagementId, "workspace"));
    } else {
      router.replace("/my-jobs");
    }
  }, [engagementId, router, state.engagements]);

  return (
    <p className="px-4 py-16 text-center text-[14px] text-[#888]">Redirecting…</p>
  );
}
