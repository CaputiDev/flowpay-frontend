import { NextRequest, NextResponse } from "next/server";
import { QueueStatusResponse, TicketResponse, ErrorResponse } from "@/app/types/atendimento";

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  try {
    const res = await fetch(`${apiUrl}/v1/queues/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err: Partial<ErrorResponse> = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || err.error || `Falha ao consultar status das filas (${res.status})` },
        { status: res.status }
      );
    }

    const data: QueueStatusResponse = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Erro de conexão com o servidor backend Spring Boot." },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  try {
    const body = await request.json();

    if (!body.subject || typeof body.subject !== "string" || body.subject.trim() === "") {
      return NextResponse.json(
        { error: "O assunto do chamado é obrigatório." },
        { status: 400 }
      );
    }

    // Se a referência do chat não for informada, gera automaticamente para atender ao contrato do backend
    const chatRef =
      typeof body.chatRef === "string" && body.chatRef.trim() !== ""
        ? body.chatRef.trim()
        : `chat-${Math.floor(1000 + Math.random() * 9000)}`;

    const res = await fetch(`${apiUrl}/v1/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: body.subject.trim(),
        chatRef,
      }),
    });

    if (!res.ok) {
      const err: Partial<ErrorResponse> = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || err.error || `Falha ao criar chamado (${res.status})` },
        { status: res.status }
      );
    }

    const created: TicketResponse = await res.json();
    return NextResponse.json(created, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Erro interno ao processar requisição." },
      { status: 500 }
    );
  }
}