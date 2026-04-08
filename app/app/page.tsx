"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Header } from "../components/Header";
import { SalaryForm } from "../components/SalaryForm";
import { PercentileDisplay } from "../components/PercentileDisplay";

export default function Home() {
  const { isConnected } = useAccount();
  const [activeRole, setActiveRole] = useState<{
    role: string;
    location: string;
  } | null>(null);

  return (
    <div className="min-h-screen relative">
      <Header />

      <main className="relative z-10 max-w-[960px] mx-auto px-6">
        {/* Hero — editorial, left-aligned, redacted signature */}
        <section className="pt-16 sm:pt-20 pb-12 sm:pb-16">
          <h1 className="text-[36px] sm:text-[44px] font-bold leading-[1.08] tracking-[-0.03em] mb-5">
            Your salary is yours.
            <br />
            Keep it{" "}
            <span className="redacted">private</span>.
          </h1>
          <p className="text-[16px] sm:text-[17px] leading-[1.6] text-t-2 max-w-[480px] mb-8">
            See where you stand in the market without revealing what you earn.
            Your salary is encrypted in your browser. The chain computes on
            ciphertext. Only aggregate counts come out.
          </p>
          <div className="flex flex-col gap-1.5 text-[14px] text-t-3">
            <span className="flex items-center gap-2">
              <span className="text-sealed font-mono text-[12px] font-medium">&times;</span>
              No one sees your salary. Not us.
            </span>
            <span className="flex items-center gap-2">
              <span className="text-sealed font-mono text-[12px] font-medium">&times;</span>
              No plaintext on any server. Ever.
            </span>
            <span className="flex items-center gap-2">
              <span className="text-sealed font-mono text-[12px] font-medium">&times;</span>
              No third-party data sharing risk.
            </span>
          </div>
        </section>

        {/* Main content */}
        {!isConnected ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-surface border border-[rgba(255,255,255,0.06)] text-t-3 text-[14px]">
              <div className="w-[6px] h-[6px] rounded-full bg-warn pulse" />
              Connect your wallet to get started
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr] items-start pb-12">
            <SalaryForm
              onSubmitted={(role, location) =>
                setActiveRole({ role, location })
              }
            />

            {activeRole ? (
              <PercentileDisplay
                role={activeRole.role}
                location={activeRole.location}
              />
            ) : (
              <div className="card-flat rounded-xl bg-surface border border-[rgba(255,255,255,0.06)] p-7 flex items-center justify-center min-h-[320px]">
                <div className="text-center">
                  <p className="text-t-3 text-[14px] mb-1">
                    Submit your salary to see the distribution
                  </p>
                  <p className="text-t-4 text-[13px]">
                    Results unlock after 5 submissions
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Context — below the fold, two columns */}
        <section className="py-14 sm:py-16 border-t border-[rgba(255,255,255,0.06)]">
          <div className="grid sm:grid-cols-2 gap-12">
            <div>
              <h3 className="text-[13px] font-semibold text-t-3 uppercase tracking-[0.05em] mb-3">
                The problem
              </h3>
              <p className="text-[15px] leading-[1.7] text-t-2">
                In January 2025, the DOJ and FTC warned that sharing compensation
                data through third parties may violate antitrust law. Glassdoor,
                Pave, and every salary survey processes your data in plaintext.
                Someone at those companies can see what you earn.
              </p>
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-t-3 uppercase tracking-[0.05em] mb-3">
                How this works
              </h3>
              <p className="text-[15px] leading-[1.7] text-t-2">
                Your salary is encrypted using FHE before it leaves your browser.
                The smart contract on Fhenix computes on ciphertext. It counts how
                many salaries fall above each threshold without ever decrypting an
                individual number. Only the aggregate count is revealed.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 border-t border-[rgba(255,255,255,0.06)] text-center">
          <p className="text-[12px] text-t-4 tracking-[0.02em]">
            Fhenix CoFHE &middot; Arbitrum Sepolia &middot; FHE euint64 &middot; BLS OEWS boundaries
          </p>
        </footer>
      </main>
    </div>
  );
}
