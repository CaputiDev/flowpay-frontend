import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET, POST } from "../route";
import { NextRequest } from "next/server";

describe("API /api/queues", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("GET /api/queues", () => {
    it("should fetch queues status from backend and return mapped data", async () => {
      const mockBackendResponse = {
        activeQueue: [
          {
            id: "1",
            ticketNumber: "TCK-101",
            chatRef: "chat-001",
            subject: "Dúvida PIX",
            status: "IN_PROGRESS",
            createdAt: "2026-08-20T10:00:00Z",
          },
        ],
        waitingQueue: [
          {
            id: "2",
            ticketNumber: "TCK-102",
            chatRef: "chat-002",
            subject: "Suporte",
            status: "WAITING",
            createdAt: "2026-08-20T10:05:00Z",
          },
        ],
        teamSummaries: [],
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockBackendResponse),
      });
      vi.stubGlobal("fetch", fetchMock);

      const response = await GET();
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.filaAtiva).toEqual(mockBackendResponse.activeQueue);
      expect(json.filaEspera).toEqual(mockBackendResponse.waitingQueue);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("should return backend error status if backend call fails", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: () => Promise.resolve({ error: "Service unavailable" }),
      });
      vi.stubGlobal("fetch", fetchMock);

      const response = await GET();
      expect(response.status).toBe(503);
      const json = await response.json();
      expect(json.error).toContain("503");
    });

    it("should return 502 when backend connection throws error", async () => {
      const fetchMock = vi.fn().mockRejectedValue(new Error("Connection refused"));
      vi.stubGlobal("fetch", fetchMock);

      const response = await GET();
      expect(response.status).toBe(502);
      const json = await response.json();
      expect(json.error).toBe("Erro de conexão com o backend Spring Boot.");
    });
  });

  describe("POST /api/queues", () => {
    it("should forward create ticket request to backend and return created item", async () => {
      const createdTicket = {
        id: "new-uuid",
        ticketNumber: "TCK-999",
        chatRef: "chat-999",
        subject: "Novo chamado teste",
        status: "WAITING",
        createdAt: "2026-08-20T12:00:00Z",
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve(createdTicket),
      });
      vi.stubGlobal("fetch", fetchMock);

      const request = new NextRequest("http://localhost:3000/api/queues", {
        method: "POST",
        body: JSON.stringify({
          subject: "Novo chamado teste",
          chatRef: "chat-999",
          ticketNumber: "TCK-999",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const json = await response.json();
      expect(json).toEqual(createdTicket);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("should reject creation when subject is missing without calling backend", async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      const request = new NextRequest("http://localhost:3000/api/queues", {
        method: "POST",
        body: JSON.stringify({
          subject: "   ",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toBe("O assunto do chamado é obrigatório.");
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
