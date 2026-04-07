"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { arbSepolia } from "../lib/contract";

export function Header() {
  const { address, isConnected, chain } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const wrongNetwork = isConnected && chain?.id !== arbSepolia.id;

  return (
    <header className="border-b border-cipher-border/50 bg-cipher-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cipher-accent/20 to-cipher-green/20 flex items-center justify-center">
            <span className="text-cipher-accent font-mono text-sm font-bold">
              C
            </span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight">CipherComp</h1>
        </div>

        <div className="flex items-center gap-3">
          {wrongNetwork && (
            <button
              onClick={() => switchChain({ chainId: arbSepolia.id })}
              className="px-3 py-1.5 text-xs font-medium bg-cipher-yellow/10 text-cipher-yellow rounded-lg border border-cipher-yellow/20 hover:bg-cipher-yellow/20 transition-colors"
            >
              Switch Network
            </button>
          )}

          {isConnected ? (
            <button
              onClick={() => disconnect()}
              className="px-4 py-2 text-sm font-medium bg-cipher-surface border border-cipher-border rounded-lg hover:border-cipher-muted/50 transition-colors font-mono"
            >
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </button>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              className="px-4 py-2 text-sm font-medium bg-cipher-accent/10 text-cipher-accent border border-cipher-accent/20 rounded-lg hover:bg-cipher-accent/20 transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
