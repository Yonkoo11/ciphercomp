"use client";

import { useState, useEffect, useCallback } from "react";
import { usePublicClient } from "wagmi";
import {
  useSalaryBenchmark,
  useRoleSubmissions,
  useHasSubmitted,
} from "../hooks/useSalaryBenchmark";
import { getBoundaries, formatSalary } from "../lib/roles";
import { SALARY_BENCHMARK_ADDRESS, SALARY_BENCHMARK_ABI, MIN_SAMPLE, NUM_BUCKETS } from "../lib/contract";

interface PercentileDisplayProps {
  role: string;
  location: string;
}

interface BucketResult {
  count: number;
  percentile: number;
}

export function PercentileDisplay({ role, location }: PercentileDisplayProps) {
  const { requestPercentile } = useSalaryBenchmark();
  const { total } = useRoleSubmissions(role, location);
  const { hasSubmitted } = useHasSubmitted(role, location);
  const boundaries = getBoundaries(role, location);
  const publicClient = usePublicClient();

  const [results, setResults] = useState<Record<number, BucketResult>>({});
  const [requesting, setRequesting] = useState<number | null>(null);
  const [polling, setPolling] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalNum = Number(total ?? 0);
  const canSeeResults = totalNum >= MIN_SAMPLE && hasSubmitted;

  const pollBucket = useCallback(
    async (bucket: number) => {
      if (!publicClient) return false;
      try {
        const data = await publicClient.readContract({
          address: SALARY_BENCHMARK_ADDRESS,
          abi: SALARY_BENCHMARK_ABI as any,
          functionName: "getPercentileResult",
          args: [role, location, bucket],
        });
        const [count, ready] = data as [bigint, boolean];
        if (ready && totalNum > 0) {
          const countNum = Number(count);
          setResults((prev) => ({
            ...prev,
            [bucket]: {
              count: countNum,
              percentile: Math.round((countNum / totalNum) * 100),
            },
          }));
          setPolling(null);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [publicClient, role, location, totalNum]
  );

  useEffect(() => {
    if (polling === null) return;
    const bucket = polling;
    let active = true;
    const interval = setInterval(async () => {
      if (!active) return;
      const done = await pollBucket(bucket);
      if (done && active) clearInterval(interval);
    }, 3000);
    return () => { active = false; clearInterval(interval); };
  }, [polling, pollBucket]);

  async function handleRequest(bucket: number) {
    if (results[bucket]) return;
    setRequesting(bucket);
    setError(null);
    try {
      await requestPercentile(role, location, bucket);
      setPolling(bucket);
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || "Request failed");
    } finally {
      setRequesting(null);
    }
  }

  async function handleRequestAll() {
    setError(null);
    for (let i = 0; i < NUM_BUCKETS; i++) {
      if (results[i]) continue;
      try {
        setRequesting(i);
        await requestPercentile(role, location, i);
      } catch (err: any) {
        setError(err?.shortMessage || err?.message || "Failed on bucket " + (i + 1));
        break;
      }
    }
    setRequesting(null);
    setPolling(0);
  }

  useEffect(() => {
    setResults({});
    setPolling(null);
    setError(null);
  }, [role, location]);

  if (!role || !location || !boundaries) return null;

  const allResolved = Object.keys(results).length === NUM_BUCKETS;

  return (
    <div className="card-flat rounded-xl bg-surface border border-[rgba(255,255,255,0.06)] p-7">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-[16px] font-semibold mb-1">Salary Distribution</h2>
          <p className="text-[13px] text-t-3">
            {role} &middot; {location}
            {totalNum > 0 && (
              <span className="text-revealed ml-1.5">&middot; {totalNum} submissions</span>
            )}
          </p>
        </div>
        {canSeeResults && !allResolved && (
          <button
            onClick={handleRequestAll}
            disabled={requesting !== null}
            className="px-3 py-1.5 text-[12px] font-medium text-sealed bg-sealed/5 border border-sealed/15 rounded-md hover:bg-sealed/10 transition-colors disabled:opacity-40"
          >
            {requesting !== null ? "Requesting..." : "Reveal All"}
          </button>
        )}
      </div>

      {!canSeeResults ? (
        <div className="text-center py-10">
          <div className="w-11 h-11 mx-auto mb-4 rounded-full bg-sealed/8 flex items-center justify-center">
            <svg className="w-5 h-5 text-sealed" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <p className="text-t-3 text-[14px] mb-1">
            {!hasSubmitted
              ? "Submit your salary first."
              : `${MIN_SAMPLE - totalNum} more submissions to unlock.`}
          </p>
          {/* Threshold progress bar */}
          {totalNum > 0 && totalNum < MIN_SAMPLE && (
            <div className="mt-4 mx-auto max-w-[180px] h-[3px] bg-base rounded-full overflow-hidden">
              <div
                className="h-full bg-sealed rounded-full transition-all duration-500"
                style={{ width: `${(totalNum / MIN_SAMPLE) * 100}%` }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {boundaries.map((boundary, i) => {
            const result = results[i];
            const isRequesting = requesting === i;
            const isPolling = polling === i && !result;

            return (
              <button
                key={i}
                onClick={() => handleRequest(i)}
                disabled={isRequesting || !!result}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  result
                    ? "border-revealed/12 bg-revealed/[0.02]"
                    : "border-[rgba(255,255,255,0.06)] bg-base/50 hover:border-strong"
                } ${isRequesting ? "opacity-50" : ""} ${result ? "cursor-default" : "cursor-pointer"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[13px] font-medium text-t-2">
                    {formatSalary(boundary)}+
                  </span>

                  {isRequesting && (
                    <span className="text-[12px] text-warn">Requesting...</span>
                  )}
                  {isPolling && (
                    <span className="text-[12px] text-warn pulse">Decrypting...</span>
                  )}
                  {result && (
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[15px] font-bold text-revealed">
                        {result.percentile}%
                      </span>
                      <span className="text-[12px] text-t-3">
                        {result.count}/{totalNum}
                      </span>
                    </div>
                  )}
                  {!result && !isRequesting && !isPolling && (
                    <span className="text-[12px] text-t-4">reveal</span>
                  )}
                </div>

                {result && (
                  <div className="h-[4px] rounded-[2px] bg-base overflow-hidden">
                    <div
                      className="h-full rounded-[2px] bar-animate"
                      style={{
                        width: `${result.percentile}%`,
                        background: `linear-gradient(90deg, var(--sealed), var(--revealed))`,
                      }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-danger/5 border border-danger/10">
          <p className="text-[13px] text-danger">{error}</p>
        </div>
      )}
    </div>
  );
}
