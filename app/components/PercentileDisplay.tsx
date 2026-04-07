"use client";

import { useState, useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import {
  useSalaryBenchmark,
  usePercentileResult,
  useRoleSubmissions,
  useHasSubmitted,
} from "../hooks/useSalaryBenchmark";
import { getBoundaries, formatSalary } from "../lib/roles";
import { MIN_SAMPLE } from "../lib/contract";

interface PercentileDisplayProps {
  role: string;
  location: string;
}

export function PercentileDisplay({ role, location }: PercentileDisplayProps) {
  const { requestPercentile } = useSalaryBenchmark();
  const { total } = useRoleSubmissions(role, location);
  const { hasSubmitted } = useHasSubmitted(role, location);
  const boundaries = getBoundaries(role, location);

  const [selectedBucket, setSelectedBucket] = useState<number | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [decryptRequested, setDecryptRequested] = useState(false);

  useWaitForTransactionReceipt({ hash: txHash });

  const { count, ready, refetch } = usePercentileResult(
    role,
    location,
    selectedBucket ?? 0
  );

  // Poll for decryption result
  useEffect(() => {
    if (!decryptRequested || ready) return;
    const interval = setInterval(() => refetch(), 3000);
    return () => clearInterval(interval);
  }, [decryptRequested, ready, refetch]);

  async function handleRequestPercentile(bucket: number) {
    setSelectedBucket(bucket);
    setRequesting(true);
    setError(null);
    setDecryptRequested(false);

    try {
      const hash = await requestPercentile(role, location, bucket);
      setTxHash(hash);
      setDecryptRequested(true);
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || "Failed to request");
    } finally {
      setRequesting(false);
    }
  }

  if (!role || !location || !boundaries) return null;

  const totalNum = Number(total ?? 0);
  const canSeeResults = totalNum >= MIN_SAMPLE && hasSubmitted;

  return (
    <div className="card-glow rounded-xl bg-cipher-surface border border-cipher-border p-6 sm:p-8 animate-fade-up">
      <div className="mb-6">
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
            const isSelected = selectedBucket === i;
            const hasResult = isSelected && ready && count !== undefined;
            const percentile = hasResult
              ? Math.round((Number(count) / totalNum) * 100)
              : null;

            return (
              <button
                key={i}
                onClick={() => handleRequestPercentile(i)}
                disabled={requesting}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? "border-cipher-accent/30 bg-cipher-accent/5"
                    : "border-cipher-border/50 bg-cipher-bg/50 hover:border-cipher-border"
                } ${requesting ? "opacity-50 cursor-wait" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-cipher-muted font-mono">
                      Bucket {i + 1}
                    </span>
                    <span className="ml-2 text-sm">
                      {formatSalary(boundary)}+
                    </span>
                  </div>

                  {isSelected && decryptRequested && !ready && (
                    <span className="text-xs text-cipher-yellow animate-pulse">
                      Decrypting...
                    </span>
                  )}

                  {hasResult && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-cipher-accent">
                        {percentile}%
                      </span>
                      <span className="text-xs text-cipher-muted">
                        ({Number(count)}/{totalNum} earn this or more)
                      </span>
                    </div>
                  )}
                </div>

                {hasResult && (
                  <div className="mt-2 h-1.5 rounded-full bg-cipher-bg overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cipher-accent to-cipher-green transition-all duration-500"
                      style={{ width: `${percentile}%` }}
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
