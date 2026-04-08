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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Hero */}
        <div className="text-center mb-10 sm:mb-14 animate-fade-up">
          {/* Privacy badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full privacy-badge border border-cipher-accent/10 text-xs text-cipher-muted mb-6">
            <svg className="w-3 h-3 text-cipher-green" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
            End-to-end encrypted with FHE
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">
            See where you stand.
            <br />
            <span className="bg-gradient-to-r from-cipher-accent to-cipher-green bg-clip-text text-transparent">
              Without anyone seeing what you earn.
            </span>
          </h1>
          <p className="text-cipher-muted max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Your salary is encrypted in your browser before it ever touches the
            blockchain. CipherComp computes percentiles on encrypted data. Nobody
            sees individual salaries. Ever.
          </p>
        </div>

        {!isConnected ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-cipher-surface border border-cipher-border text-cipher-muted text-sm">
              <div className="w-2 h-2 rounded-full bg-cipher-yellow animate-pulse-soft" />
              Connect your wallet to get started
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
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
              <div className="card-glow rounded-xl bg-cipher-surface border border-cipher-border p-6 sm:p-8 flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-cipher-accent/8 flex items-center justify-center">
                    <svg className="w-7 h-7 text-cipher-accent/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  </div>
                  <p className="text-cipher-muted text-sm mb-1">
                    Submit your salary to see the distribution
                  </p>
                  <p className="text-cipher-muted/40 text-xs">
                    Results unlock after 5 submissions
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* How it works */}
        <div className="mt-16 sm:mt-24">
          <h2 className="text-lg font-semibold text-center mb-2">
            How It Works
          </h2>
          <p className="text-cipher-muted text-sm text-center mb-8 max-w-md mx-auto">
            Three steps. Your salary never leaves your device unencrypted.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "Choose & Enter",
                desc: "Select your role and metro area. Enter your annual salary.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                ),
              },
              {
                step: "2",
                title: "Encrypt & Submit",
                desc: "FHE encryption happens in your browser. Only ciphertext goes on-chain.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                ),
              },
              {
                step: "3",
                title: "See Your Percentile",
                desc: "The contract computes on encrypted data. Only aggregate counts are revealed.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                ),
              },
            ].map(({ step, title, desc, icon }) => (
              <div
                key={step}
                className="rounded-xl bg-cipher-surface/60 border border-cipher-border/40 p-5 hover:border-cipher-border/70 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-cipher-accent/10 text-cipher-accent flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {icon}
                  </svg>
                </div>
                <h3 className="font-medium text-sm mb-1">{title}</h3>
                <p className="text-cipher-muted text-xs leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why it matters — condensed */}
        <div className="mt-12 sm:mt-16 rounded-xl bg-cipher-surface/30 border border-cipher-border/30 p-6 sm:p-8">
          <h2 className="text-lg font-semibold mb-4">Why This Matters</h2>
          <div className="grid sm:grid-cols-2 gap-6 text-sm text-cipher-muted leading-relaxed">
            <div>
              <h3 className="text-cipher-text font-medium text-sm mb-2">The problem</h3>
              <p>
                In January 2025, the DOJ and FTC warned that sharing compensation
                data through third parties may violate antitrust law. Companies
                like Glassdoor and Pave process your salary in plaintext. Someone
                at those companies can see exactly what you earn.
              </p>
            </div>
            <div>
              <h3 className="text-cipher-text font-medium text-sm mb-2">The solution</h3>
              <p>
                CipherComp uses fully homomorphic encryption (FHE) on Fhenix.
                The smart contract computes on encrypted data without ever
                decrypting individual salaries. Only aggregate bucket counts are
                revealed. Nobody sees your number. Not us, not other users, not
                even the blockchain validators.
              </p>
            </div>
          </div>
        </div>

        {/* Tech stack badge */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {["Fhenix CoFHE", "Arbitrum Sepolia", "FHE (euint64)", "BLS OEWS Data"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-cipher-surface/50 border border-cipher-border/30 text-cipher-muted/60 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 pb-8 text-center text-xs text-cipher-muted/30">
          <p>Encrypted salary benchmarking. Privacy by default.</p>
        </footer>
      </main>
    </div>
  );
}
