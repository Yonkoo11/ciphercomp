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

  // Poll a specific bucket for decryption result
  const pollBucket = useCallback(
    async (bucket: number) => {
      if (!publicClient) return;
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

  // Polling effect — only runs for the specific bucket being decrypted
  useEffect(() => {
    if (polling === null) return;
    const bucket = polling;
    let active = true;

    const interval = setInterval(async () => {
      if (!active) return;
      const done = await pollBucket(bucket);
      if (done && active) {
        clearInterval(interval);
      }
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [polling, pollBucket]);

  async function handleRequestPercentile(bucket: number) {
    // If we already have this result, don't re-request
    if (results[bucket]) return;

    setRequesting(bucket);
    setError(null);

    try {
      await requestPercentile(role, location, bucket);
      setPolling(bucket);
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || "Failed to request");
    } finally {
      setRequesting(null);
    }
  }

  // Request all buckets at once
  async function handleRequestAll() {
    setError(null);
    for (let i = 0; i < NUM_BUCKETS; i++) {
      if (results[i]) continue;
      try {
        setRequesting(i);
        await requestPercentile(role, location, i);
        // Start polling last requested bucket — earlier ones will resolve naturally
      } catch (err: any) {
        setError(err?.shortMessage || err?.message || "Failed on bucket " + (i + 1));
        break;
      }
    }
    setRequesting(null);
    // Poll all unrequested buckets
    setPolling(0); // will trigger polling effect
  }

  // Reset results when role/location changes
  useEffect(() => {
    setResults({});
    setPolling(null);
    setError(null);
  }, [role, location]);

  if (!role || !location || !boundaries) return null;

  const allResolved = Object.keys(results).length === NUM_BUCKETS;

  return (
    <div className="card-glow rounded-xl bg-cipher-surface border border-cipher-border p-6 sm:p-8 animate-fade-up">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">Salary Distribution</h2>
            <p className="text-cipher-muted text-sm">
              {role} in {location}
              {totalNum > 0 && (
                <span className="ml-2 text-cipher-accent">
                  ({totalNum} submission{totalNum !== 1 ? "s" : ""})
                </span>
              )}
            </p>
          </div>
          {canSeeResults && !allResolved && (
            <button
              onClick={handleRequestAll}
              disabled={requesting !== null}
              className="px-3 py-1.5 text-xs font-medium bg-cipher-accent/10 text-cipher-accent rounded-lg border border-cipher-accent/20 hover:bg-cipher-accent/20 transition-colors disabled:opacity-40"
            >
              {requesting !== null ? "Requesting..." : "Reveal All"}
            </button>
          )}
        </div>
      </div>

      {!canSeeResults ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cipher-accent/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-cipher-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <p className="text-cipher-muted text-sm mb-2">
            {!hasSubmitted
              ? "Submit your salary first to see where you stand."
              : `Need ${MIN_SAMPLE - totalNum} more submissions to unlock results.`}
          </p>
          <p className="text-cipher-muted/60 text-xs">
            At least {MIN_SAMPLE} people need to submit before anyone can see
            percentiles. This protects individual privacy.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {boundaries.map((boundary, i) => {
            const result = results[i];
            const isRequesting = requesting === i;
            const isPolling = polling === i && !result;

            return (
              <button
                key={i}
                onClick={() => handleRequestPercentile(i)}
                disabled={isRequesting || !!result}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  result
                    ? "border-cipher-accent/20 bg-cipher-accent/5"
                    : "border-cipher-border/50 bg-cipher-bg/50 hover:border-cipher-border"
                } ${isRequesting ? "opacity-50 cursor-wait" : ""} ${
                  result ? "cursor-default" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-cipher-muted font-mono">
                      {formatSalary(boundary)}+
                    </span>
                  </div>

                  {isRequesting && (
                    <span className="text-xs text-cipher-yellow">
                      Requesting...
                    </span>
                  )}

                  {isPolling && (
                    <span className="text-xs text-cipher-yellow animate-pulse">
                      Decrypting on Fhenix...
                    </span>
                  )}

                  {result && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-cipher-accent font-semibold">
                        {result.percentile}%
                      </span>
                      <span className="text-xs text-cipher-muted">
                        ({result.count}/{totalNum})
                      </span>
                    </div>
                  )}

                  {!result && !isRequesting && !isPolling && (
                    <span className="text-xs text-cipher-muted/50">
                      Click to reveal
                    </span>
                  )}
                </div>

                {result && (
                  <div className="mt-2 h-1.5 rounded-full bg-cipher-bg overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cipher-accent to-cipher-green transition-all duration-700"
                      style={{ width: `${result.percentile}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-cipher-red/5 border border-cipher-red/10">
          <p className="text-sm text-cipher-red">{error}</p>
        </div>
      )}
    </div>
  );
}
