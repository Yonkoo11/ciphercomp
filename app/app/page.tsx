"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Header } from "../components/Header";
import { SalaryForm } from "../components/SalaryForm";
import { PercentileDisplay } from "../components/PercentileDisplay";

export default function Home() {
  const { isConnected } = useAccount();
  const [submitted, setSubmitted] = useState<{
    role: string;
    location: string;
  } | null>(null);

  return (
    <div className="min-h-screen relative">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Hero */}
        <div className="text-center mb-10 sm:mb-14 animate-fade-up">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            See where you stand.
            <br />
            <span className="text-cipher-accent">Without anyone seeing what you earn.</span>
          </h1>
          <p className="text-cipher-muted max-w-xl mx-auto text-sm sm:text-base">
            CipherComp uses fully homomorphic encryption to compute salary
            percentiles. Your salary is encrypted before it leaves your browser.
            Nobody can see it. Not us, not other users, not even the blockchain.
          </p>
        </div>

        {!isConnected ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cipher-surface border border-cipher-border text-cipher-muted text-sm">
              <div className="w-2 h-2 rounded-full bg-cipher-yellow animate-pulse-soft" />
              Connect your wallet to get started
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <SalaryForm
              onSubmitted={(role, location) =>
                setSubmitted({ role, location })
              }
            />

            {submitted ? (
              <PercentileDisplay
                role={submitted.role}
                location={submitted.location}
              />
            ) : (
              <div className="card-glow rounded-xl bg-cipher-surface border border-cipher-border p-6 sm:p-8 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-cipher-muted text-sm mb-2">
                    Submit your salary to see the distribution
                  </p>
                  <p className="text-cipher-muted/50 text-xs">
                    Results appear after {5} people submit for the same role
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* How it works */}
        <div className="mt-16 sm:mt-20">
          <h2 className="text-lg font-semibold text-center mb-8">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "Choose & Enter",
                desc: "Select your role and metro area. Enter your annual salary.",
              },
              {
                step: "2",
                title: "Encrypt & Submit",
                desc: "Your salary is encrypted in your browser using FHE before it touches the chain.",
              },
              {
                step: "3",
                title: "See Your Percentile",
                desc: "Once enough people submit, see where you stand. Only aggregate stats are ever revealed.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="rounded-xl bg-cipher-surface/50 border border-cipher-border/50 p-5"
              >
                <div className="w-8 h-8 rounded-lg bg-cipher-accent/10 text-cipher-accent font-mono font-bold text-sm flex items-center justify-center mb-3">
                  {step}
                </div>
                <h3 className="font-medium text-sm mb-1">{title}</h3>
                <p className="text-cipher-muted text-xs leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why it matters */}
        <div className="mt-12 sm:mt-16 rounded-xl bg-cipher-surface/30 border border-cipher-border/30 p-6 sm:p-8">
          <h2 className="text-lg font-semibold mb-4">Why This Matters</h2>
          <div className="space-y-3 text-sm text-cipher-muted leading-relaxed">
            <p>
              In January 2025, the DOJ and FTC warned that sharing compensation
              data through third parties may violate antitrust law. The old safe
              harbor for salary surveys was withdrawn.
            </p>
            <p>
              Companies like Glassdoor and Pave process your salary data in
              plaintext. Someone at those companies can see exactly what you
              earn.
            </p>
            <p>
              CipherComp is different. Your salary is encrypted before it leaves
              your device. The smart contract computes on encrypted data using
              FHE (fully homomorphic encryption). The only thing that ever gets
              revealed is how many people fall above each salary threshold.
              Nobody, including CipherComp, ever sees an individual salary.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pb-8 text-center text-xs text-cipher-muted/40">
          <p>
            Built on{" "}
            <span className="text-cipher-muted/60">Fhenix CoFHE</span> |
            Arbitrum Sepolia | Salary boundaries from BLS OEWS
          </p>
        </footer>
      </main>
    </div>
  );
}
