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
    <header className="relative z-10 border-b border-[rgba(255,255,255,0.06)]">
      <div className="max-w-[960px] mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-[26px] h-[26px] rounded-[5px] bg-sealed flex items-center justify-center">
            <span className="font-mono text-[12px] font-bold text-white">C</span>
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-t-1">
            CipherComp
          </span>
        </div>

        <div className="flex items-center gap-3">
          {wrongNetwork && (
            <button
              onClick={() => switchChain({ chainId: arbSepolia.id })}
              className="px-3 py-1.5 text-[13px] font-medium text-warn bg-warn/5 border border-warn/15 rounded-md hover:bg-warn/10 transition-colors"
            >
              Switch Network
            </button>
          )}

          {isConnected ? (
            <button
              onClick={() => disconnect()}
              className="px-3.5 py-[7px] text-[13px] font-mono font-medium text-t-2 bg-surface border border-strong rounded-md hover:border-t-3 transition-colors"
            >
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </button>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              className="px-3.5 py-[7px] text-[13px] font-medium text-t-2 border border-strong rounded-md hover:text-t-1 hover:border-sealed/30 transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
