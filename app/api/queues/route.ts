import { NextRequest, NextResponse } from "next/server";

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
      return NextResponse.json(
        { error: `Falha ao consultar filas no backend (${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      filaAtiva: data.filaAtiva ?? data.activeQueue ?? [],
      filaEspera: data.filaEspera ?? data.waitingQueue ?? [],
      teamSummaries: data.teamSummaries ?? [],
    });
  } catch {
    return NextResponse.json(
      { error: "Erro de conexão com o backend Spring Boot." },
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

    const res = await fetch(`${apiUrl}/v1/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: body.subject.trim(),
        ticketNumber: body.ticketNumber?.trim() || undefined,
        chatRef: body.chatRef?.trim() || undefined,
        queueId: body.queueId,
        agentId: body.agentId,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || err.error || `Falha ao criar atendimento (${res.status})` },
        { status: res.status }
      );
    }

    const created = await res.json();
    return NextResponse.json(created, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Erro interno ao processar requisição." },
      { status: 500 }
    );
  }
}