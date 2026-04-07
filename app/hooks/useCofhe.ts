"use client";

import { useState, useCallback, useEffect } from "react";
import { usePublicClient, useWalletClient } from "wagmi";

type CofheState = "uninitialized" | "initializing" | "ready" | "error";

let cofheModule: typeof import("cofhejs/web") | null = null;

async function getCofhe() {
  if (!cofheModule) {
    cofheModule = await import("cofhejs/web");
  }
  return cofheModule;
}

export function useCofhe() {
  const [state, setState] = useState<CofheState>("uninitialized");
  const [error, setError] = useState<string | null>(null);
  const [initAddress, setInitAddress] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    const currentAddr = walletClient?.account?.address ?? null;
    if (initAddress && currentAddr !== initAddress) {
      setState("uninitialized");
      setError(null);
      setInitAddress(null);
    }
    if (!walletClient && state !== "uninitialized") {
      setState("uninitialized");
      setError(null);
      setInitAddress(null);
    }
  }, [walletClient, initAddress, state]);

  useEffect(() => {
    if (!walletClient || !publicClient || state !== "uninitialized") return;

    let cancelled = false;

    async function init() {
      setState("initializing");
      try {
        const { cofhejs } = await getCofhe();
        const result = await cofhejs.initializeWithViem({
          viemClient: publicClient,
          viemWalletClient: walletClient,
          environment: "TESTNET",
        });

        if (cancelled) return;

        if (result.success) {
          setState("ready");
          setInitAddress(walletClient!.account.address);
        } else {
          setState("error");
          setError(String(result.error) || "Failed to initialize encryption");
        }
      } catch (err) {
        if (cancelled) return;
        setState("error");
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [walletClient, publicClient, state]);

  const encryptSalary = useCallback(
    async (salary: bigint) => {
      if (state !== "ready") {
        throw new Error("Encryption not initialized");
      }

      const { cofhejs, Encryptable } = await getCofhe();

      const result = await cofhejs.encrypt([
        Encryptable.uint64(salary),
      ] as const);

      if (!result.success || !result.data) {
        throw new Error(String(result.error) || "Encryption failed");
      }

      return result.data[0];
    },
    [state]
  );

  return {
    cofheState: state,
    cofheError: error,
    encryptSalary,
  };
}
