"use client";

import { useCallback } from "react";
import {
  useReadContract,
  useWriteContract,
  useAccount,
} from "wagmi";
import {
  SALARY_BENCHMARK_ADDRESS,
  SALARY_BENCHMARK_ABI,
  NUM_BUCKETS,
} from "../lib/contract";

export function useSalaryBenchmark() {
  const { writeContractAsync } = useWriteContract();

  const submitSalary = useCallback(
    async (encryptedSalary: any, role: string, location: string) => {
      const hash = await writeContractAsync({
        address: SALARY_BENCHMARK_ADDRESS,
        abi: SALARY_BENCHMARK_ABI,
        functionName: "submitSalary",
        args: [encryptedSalary, role, location],
      });
      return hash;
    },
    [writeContractAsync]
  );

  const requestPercentile = useCallback(
    async (role: string, location: string, bucket: number) => {
      const hash = await writeContractAsync({
        address: SALARY_BENCHMARK_ADDRESS,
        abi: SALARY_BENCHMARK_ABI,
        functionName: "requestPercentile",
        args: [role, location, bucket],
      });
      return hash;
    },
    [writeContractAsync]
  );

  return {
    submitSalary,
    requestPercentile,
  };
}

export function useRoleSubmissions(role: string, location: string) {
  const roleKey = useReadContract({
    address: SALARY_BENCHMARK_ADDRESS,
    abi: SALARY_BENCHMARK_ABI,
    functionName: "getRoleKey",
    args: [role, location],
    query: { enabled: !!role && !!location },
  });

  const totalSubmissions = useReadContract({
    address: SALARY_BENCHMARK_ADDRESS,
    abi: SALARY_BENCHMARK_ABI,
    functionName: "totalSubmissions",
    args: roleKey.data ? [roleKey.data] : undefined,
    query: { enabled: !!roleKey.data },
  });

  return {
    total: totalSubmissions.data as bigint | undefined,
    isLoading: roleKey.isLoading || totalSubmissions.isLoading,
    refetch: totalSubmissions.refetch,
  };
}

export function useHasSubmitted(role: string, location: string) {
  const { address } = useAccount();

  const roleKey = useReadContract({
    address: SALARY_BENCHMARK_ADDRESS,
    abi: SALARY_BENCHMARK_ABI,
    functionName: "getRoleKey",
    args: [role, location],
    query: { enabled: !!role && !!location },
  });

  const hasSubmitted = useReadContract({
    address: SALARY_BENCHMARK_ADDRESS,
    abi: SALARY_BENCHMARK_ABI,
    functionName: "hasSubmitted",
    args: address && roleKey.data ? [address, roleKey.data] : undefined,
    query: { enabled: !!address && !!roleKey.data },
  });

  return {
    hasSubmitted: hasSubmitted.data as boolean | undefined,
    isLoading: roleKey.isLoading || hasSubmitted.isLoading,
    refetch: hasSubmitted.refetch,
  };
}

export function usePercentileResult(
  role: string,
  location: string,
  bucket: number
) {
  const result = useReadContract({
    address: SALARY_BENCHMARK_ADDRESS,
    abi: SALARY_BENCHMARK_ABI,
    functionName: "getPercentileResult",
    args: [role, location, bucket],
    query: { enabled: !!role && !!location && bucket >= 0 && bucket < NUM_BUCKETS },
  });

  const data = result.data as [bigint, boolean] | undefined;

  return {
    count: data?.[0],
    ready: data?.[1] ?? false,
    isLoading: result.isLoading,
    refetch: result.refetch,
  };
}
