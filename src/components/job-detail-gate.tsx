"use client";

import { Suspense, useEffect, useState } from "react";
import JobDetailContent from "@/components/job-detail-content";
import MainHeader from "@/components/main-header";
import { findJobById } from "@/lib/flowchart/jobs";
import { getJobById } from "@/lib/mock-jobs";

export default function JobDetailGate({ jobId }: { jobId: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const job = ready ? findJobById(jobId) : getJobById(jobId);

  if (!job) {
    return (
      <div className="flex min-h-screen flex-col bg-[#faf8f6]">
        <MainHeader />
        <p className="px-4 py-16 text-center text-[14px] text-[#888]">Job not found.</p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-[#faf8f6]">
          <MainHeader />
          <p className="px-4 py-16 text-center text-[14px] text-[#888]">Loading…</p>
        </div>
      }
    >
      <JobDetailContent job={job} />
    </Suspense>
  );
}
