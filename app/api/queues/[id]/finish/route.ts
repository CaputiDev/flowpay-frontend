import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  try {
    const { id } = await context.params;

    const res = await fetch(`${apiUrl}/v1/tickets/${encodeURIComponent(id)}/finish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || err.error || `Falha ao finalizar atendimento (${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json().catch(() => ({ success: true, id, status: "FINISHED" }));
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erro inesperado ao finalizar atendimento." },
      { status: 500 }
    );
  }
}
