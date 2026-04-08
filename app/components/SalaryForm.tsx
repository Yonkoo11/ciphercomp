"use client";

import { useState, useEffect } from "react";
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

  const roles = getRoleNames();
  const locations = role ? getLocationsForRole(role) : [];
  const { hasSubmitted, refetch: refetchSubmitted } = useHasSubmitted(role, location);
  const { total, refetch: refetchTotal } = useRoleSubmissions(role, location);

  const { isLoading: txPending, isSuccess: txConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (txConfirmed && role && location) {
      refetchTotal();
      refetchSubmitted();
      onSubmitted(role, location);
    }
  }, [txConfirmed]);

  const salaryNum = parseInt(salary.replace(/,/g, ""), 10);
  const validSalary = !isNaN(salaryNum) && salaryNum >= 10000 && salaryNum <= 1000000;

  const canSubmit =
    isConnected &&
    cofheState === "ready" &&
    role &&
    location &&
    validSalary &&
    !hasSubmitted &&
    !submitting &&
    !txPending;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const encrypted = await encryptSalary(BigInt(salaryNum));
      const hash = await submitSalary(encrypted, role, location);
      setTxHash(hash);
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card-sealed rounded-xl bg-surface border border-[rgba(255,255,255,0.06)] p-7">
      <h2 className="text-[16px] font-semibold mb-1">Submit your salary</h2>
      <p className="text-[13px] text-t-3 mb-6">
        Encrypted before it leaves your device
      </p>

      {/* Cofhe status */}
      {isConnected && cofheState !== "ready" && (
        <div className="mb-4 p-3 rounded-lg bg-sealed/5 border border-sealed/10">
          <p className="text-[13px] text-t-3">
            {cofheState === "initializing"
              ? "Setting up encryption..."
              : cofheState === "error"
                ? `Error: ${cofheError}`
                : "Connecting to encryption network..."}
          </p>
        </div>
      )}

      {/* Role */}
      <div className="mb-4">
        <label className="block text-[13px] font-medium text-t-2 mb-1.5">
          Job Role
        </label>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setLocation(""); setTxHash(undefined); }}
          className="w-full bg-base border border-strong rounded-lg px-3.5 py-2.5 text-[15px] text-t-1 outline-none focus:border-sealed/40 transition-colors appearance-none"
        >
          <option value="">Select role</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div className="mb-4">
        <label className="block text-[13px] font-medium text-t-2 mb-1.5">
          Metro Area
        </label>
        <select
          value={location}
          onChange={(e) => { setLocation(e.target.value); setTxHash(undefined); }}
          disabled={!role}
          className="w-full bg-base border border-strong rounded-lg px-3.5 py-2.5 text-[15px] text-t-1 outline-none focus:border-sealed/40 transition-colors appearance-none disabled:opacity-40"
        >
          <option value="">Select metro</option>
          {locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Salary */}
      <div className="mb-5">
        <label className="block text-[13px] font-medium text-t-2 mb-1.5">
          Annual Salary
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-t-3 text-[15px]">$</span>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="130000"
            min={10000}
            max={1000000}
            className="w-full bg-base border border-strong rounded-lg pl-7 pr-3.5 py-2.5 text-[16px] font-mono font-medium text-t-1 outline-none focus:border-sealed/40 transition-colors"
          />
        </div>
        {salary && !validSalary && (
          <p className="text-danger text-[12px] mt-1.5">Between $10,000 and $1,000,000</p>
        )}
      </div>

      {/* Submission count */}
      {role && location && total !== undefined && (
        <div className="flex items-center gap-2 text-[13px] text-t-3 mb-4">
          <div className={`w-[6px] h-[6px] rounded-full ${Number(total) >= MIN_SAMPLE ? "bg-revealed" : "bg-warn pulse"}`} />
          {Number(total)} of {MIN_SAMPLE} needed
          {Number(total) >= MIN_SAMPLE && <span className="text-revealed ml-1">Ready</span>}
        </div>
      )}

      {/* Status messages */}
      {hasSubmitted && (
        <div className="mb-4 p-3 rounded-lg bg-revealed/5 border border-revealed/10">
          <p className="text-[13px] text-revealed">Already submitted for this role.</p>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger/5 border border-danger/10">
          <p className="text-[13px] text-danger">{error}</p>
        </div>
      )}
      {txPending && (
        <div className="mb-4 p-3 rounded-lg bg-sealed/5 border border-sealed/10">
          <p className="text-[13px] text-sealed">Confirming on-chain...</p>
        </div>
      )}
      {txConfirmed && (
        <div className="mb-4 p-3 rounded-lg bg-revealed/5 border border-revealed/10">
          <p className="text-[13px] text-revealed">Sealed and submitted. Your data is private.</p>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-3 text-[15px] font-semibold bg-sealed text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_24px_rgba(59,124,245,0.2)] active:scale-[0.98]"
      >
        {submitting
          ? "Encrypting..."
          : txPending
            ? "Confirming..."
            : !isConnected
              ? "Connect Wallet"
              : cofheState !== "ready"
                ? "Initializing..."
                : hasSubmitted
                  ? "Already Submitted"
                  : "Seal & Submit"}
      </button>
    </div>
  );
}
