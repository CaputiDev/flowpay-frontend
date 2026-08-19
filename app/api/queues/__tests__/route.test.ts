import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET, POST } from "../route";
import mockData from "../mock.json";
import { NextRequest } from "next/server";

describe("API /api/queues", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("GET /api/queues", () => {
    it("should return mock data after simulated delay", async () => {
      const routePromise = GET();

      vi.advanceTimersByTime(500);

      const response = await routePromise;
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json).toEqual(mockData);
      expect(json).toHaveProperty("filaAtiva");
      expect(json).toHaveProperty("filaEspera");
      expect(Array.isArray(json.filaAtiva)).toBe(true);
      expect(Array.isArray(json.filaEspera)).toBe(true);
    });
  });

  describe("POST /api/queues", () => {
    it("should create a new queue item with valid data", async () => {
      const request = new NextRequest("http://localhost:3000/api/queues", {
        method: "POST",
        body: JSON.stringify({
          subject: "Novo chamado teste",
          chatRef: "chat-999",
          ticketNumber: "TCK-999",
        }),
      });

      const routePromise = POST(request);
      vi.advanceTimersByTime(400);

      const response = await routePromise;
      expect(response.status).toBe(201);

      const json = await response.json();
      expect(json.subject).toBe("Novo chamado teste");
      expect(json.chatRef).toBe("chat-999");
      expect(json.ticketNumber).toBe("TCK-999");
      expect(json.status).toBe("WAITING");
      expect(json.id).toBeDefined();
    });

    it("should reject creation when subject is missing", async () => {
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
    });
  });
});
