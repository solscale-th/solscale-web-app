"use client";

import { Suspense, useEffect, useState } from "react";
import JobDetailContent from "@/components/job-detail-content";
import MainHeader from "@/components/main-header";
import { findJobById } from "@/lib/flowchart/jobs";
import { fetchJobById, mapApiJobToJob } from "@/lib/jobs";
import { getJobById, type Job } from "@/lib/mock-jobs";

export default function JobDetailGate({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<Job | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const numericId = Number(jobId);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      setJob(findJobById(jobId) ?? getJobById(jobId));
      setReady(true);
      return;
    }

    const controller = new AbortController();
    fetchJobById(numericId, controller.signal)
      .then((apiJob) => {
        if (controller.signal.aborted) return;
        setJob(
          apiJob
            ? mapApiJobToJob(apiJob)
            : findJobById(jobId) ?? getJobById(jobId)
        );
        setReady(true);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setJob(findJobById(jobId) ?? getJobById(jobId));
        setReady(true);
      });

    return () => controller.abort();
  }, [jobId]);

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col bg-surface">
        <MainHeader />
        <p className="px-4 py-16 text-center text-[14px] text-[#888]">Loading…</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen flex-col bg-surface">
        <MainHeader />
        <p className="px-4 py-16 text-center text-[14px] text-[#888]">Job not found.</p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-surface">
          <MainHeader />
          <p className="px-4 py-16 text-center text-[14px] text-[#888]">Loading…</p>
        </div>
      }
    >
      <JobDetailContent job={job} />
    </Suspense>
  );
}
