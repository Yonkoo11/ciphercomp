"use client";

import { useState } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useCofhe } from "../hooks/useCofhe";
import {
  useSalaryBenchmark,
  useHasSubmitted,
  useRoleSubmissions,
} from "../hooks/useSalaryBenchmark";
import { getRoleNames, getLocationsForRole } from "../lib/roles";
import { MIN_SAMPLE } from "../lib/contract";

interface SalaryFormProps {
  onSubmitted: (role: string, location: string) => void;
}

export function SalaryForm({ onSubmitted }: SalaryFormProps) {
  const { isConnected } = useAccount();
  const { cofheState, cofheError, encryptSalary } = useCofhe();
  const { submitSalary } = useSalaryBenchmark();

  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const roles = getRoleNames();
  const locations = role ? getLocationsForRole(role) : [];
  const { hasSubmitted } = useHasSubmitted(role, location);
  const { total, refetch: refetchTotal } = useRoleSubmissions(role, location);

  const { isLoading: txPending, isSuccess: txConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const salaryNum = parseInt(salary.replace(/,/g, ""), 10);
  const validSalary = !isNaN(salaryNum) && salaryNum >= 10000 && salaryNum <= 1000000;

  const canSubmit =
    isConnected &&
    cofheState === "ready" &&
    role &&
    location &&
    validSalary &&
    !hasSubmitted &&
    !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const encrypted = await encryptSalary(BigInt(salaryNum));
      const hash = await submitSalary(encrypted, role, location);
      setTxHash(hash);
      setSuccess(true);
      refetchTotal();
      onSubmitted(role, location);
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card-glow rounded-xl bg-cipher-surface border border-cipher-border p-6 sm:p-8 animate-fade-up">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Submit Your Salary</h2>
        <p className="text-cipher-muted text-sm">
          Your salary is encrypted before it leaves your browser. Nobody sees
          the number, not even us.
        </p>
      </div>

      {/* Encryption status */}
      {isConnected && cofheState !== "ready" && (
        <div className="mb-4 p-3 rounded-lg bg-cipher-accent/5 border border-cipher-accent/10">
          <p className="text-sm text-cipher-muted">
            {cofheState === "initializing"
              ? "Setting up encryption..."
              : cofheState === "error"
                ? `Encryption error: ${cofheError}`
                : "Connecting to encryption network..."}
          </p>
        </div>
      )}

      {/* Role */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-cipher-muted mb-1.5">
          Job Role
        </label>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setLocation("");
            setSuccess(false);
          }}
          className="w-full bg-cipher-bg border border-cipher-border rounded-lg px-4 py-2.5 text-sm focus:border-cipher-accent/50 transition-colors appearance-none"
        >
          <option value="">Select your role</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-cipher-muted mb-1.5">
          Metro Area
        </label>
        <select
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setSuccess(false);
          }}
          disabled={!role}
          className="w-full bg-cipher-bg border border-cipher-border rounded-lg px-4 py-2.5 text-sm focus:border-cipher-accent/50 transition-colors appearance-none disabled:opacity-40"
        >
          <option value="">Select metro area</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Salary */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-cipher-muted mb-1.5">
          Annual Salary (USD)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cipher-muted text-sm">
            $
          </span>
          <input
            type="number"
            value={salary}
            onChange={(e) => {
              setSalary(e.target.value);
              setSuccess(false);
            }}
            placeholder="120000"
            min={10000}
            max={1000000}
            className="w-full bg-cipher-bg border border-cipher-border rounded-lg pl-8 pr-4 py-2.5 text-sm font-mono focus:border-cipher-accent/50 transition-colors"
          />
        </div>
        {salary && !validSalary && (
          <p className="text-cipher-red text-xs mt-1">
            Enter a salary between $10,000 and $1,000,000
          </p>
        )}
      </div>

      {/* Submission count */}
      {role && location && total !== undefined && (
        <div className="mb-4 flex items-center gap-2 text-xs text-cipher-muted">
          <div
            className={`w-2 h-2 rounded-full ${
              Number(total) >= MIN_SAMPLE
                ? "bg-cipher-green"
                : "bg-cipher-yellow animate-pulse-soft"
            }`}
          />
          <span>
            {Number(total)} submission{Number(total) !== 1 ? "s" : ""} for{" "}
            {role} in {location}
            {Number(total) < MIN_SAMPLE &&
              ` (need ${MIN_SAMPLE - Number(total)} more to see results)`}
          </span>
        </div>
      )}

      {/* Already submitted */}
      {hasSubmitted && (
        <div className="mb-4 p-3 rounded-lg bg-cipher-green/5 border border-cipher-green/10">
          <p className="text-sm text-cipher-green">
            You already submitted for this role and location.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-cipher-red/5 border border-cipher-red/10">
          <p className="text-sm text-cipher-red">{error}</p>
        </div>
      )}

      {/* Success */}
      {success && txConfirmed && (
        <div className="mb-4 p-3 rounded-lg bg-cipher-green/5 border border-cipher-green/10">
          <p className="text-sm text-cipher-green">
            Salary encrypted and submitted. Your data is private.
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-3 px-4 rounded-lg font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-cipher-accent/10 text-cipher-accent border border-cipher-accent/20 hover:bg-cipher-accent/20 active:scale-[0.98]"
      >
        {submitting || txPending
          ? "Encrypting & Submitting..."
          : !isConnected
            ? "Connect Wallet First"
            : cofheState !== "ready"
              ? "Waiting for Encryption..."
              : hasSubmitted
                ? "Already Submitted"
                : "Encrypt & Submit Salary"}
      </button>
    </div>
  );
}
