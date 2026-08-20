import { NextRequest, NextResponse } from "next/server";
import { TicketResponse, ErrorResponse } from "@/app/types/atendimento";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleFinish(context);
}

export async function PATCH(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleFinish(context);
}

async function handleFinish(context: { params: Promise<{ id: string }> }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  try {
    const { id } = await context.params;

    const res = await fetch(`${apiUrl}/v1/tickets/${encodeURIComponent(id)}/finish`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err: Partial<ErrorResponse> = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || err.error || `Falha ao finalizar atendimento (${res.status})` },
        { status: res.status }
      );
    }

    const data: TicketResponse = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erro inesperado ao finalizar atendimento." },
      { status: 500 }
    );
  }
}
