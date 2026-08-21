import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAnalytics, formatDuration, formatMonthLabel } from "../useAnalytics";
import { SWRConfig } from "swr";
import React from "react";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

describe("useAnalytics Hook and Helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("formatDuration helper", () => {
    it("should format seconds correctly", () => {
      expect(formatDuration(0)).toBe("0s");
      expect(formatDuration(null)).toBe("0s");
      expect(formatDuration(45)).toBe("45s");
      expect(formatDuration(60)).toBe("1m");
      expect(formatDuration(125)).toBe("2m 5s");
      expect(formatDuration(3665)).toBe("1h 1m");
    });
  });

  describe("formatMonthLabel helper", () => {
    it("should format YYYY-MM into friendly month names", () => {
      expect(formatMonthLabel("2026-08")).toBe("Agosto 2026");
      expect(formatMonthLabel("2026-01")).toBe("Janeiro 2026");
      expect(formatMonthLabel("invalid")).toBe("invalid");
    });
  });

  describe("useAnalytics hook", () => {
    it("should load and return analytics data", async () => {
      const mockData = {
        overallSummary: {
          totalTickets: 50,
          totalResolved: 45,
          totalRejected: 2,
          totalInProgress: 2,
          totalPending: 1,
          avgWaitingTimeSeconds: 30,
          avgServiceTimeSeconds: 120,
          avgTotalTimeSeconds: 150,
        },
        monthlyMetrics: [],
      };

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockData,
        })
      );

      const { result } = renderHook(() => useAnalytics(0), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.overallSummary?.totalTickets).toBe(50);
      expect(result.current.overallSummary?.totalResolved).toBe(45);
    });

    it("should handle error state", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          json: async () => ({ error: "Erro ao consultar analytics" }),
        })
      );

      const { result } = renderHook(() => useAnalytics(0), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBeDefined();
      });

      expect(result.current.isError?.message).toBe("Erro ao consultar analytics");
    });
  });
});
