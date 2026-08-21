import { NextRequest, NextResponse } from "next/server";
import { TeamAnalyticsResponse, ErrorResponse } from "@/app/types/atendimento";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ team: string }> }
) {
  const { team } = await context.params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  try {
    const res = await fetch(`${apiUrl}/v1/analytics/teams/${team.toUpperCase()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err: Partial<ErrorResponse> = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || err.error || `Falha ao consultar analytics da equipe (${res.status})` },
        { status: res.status }
      );
    }

    const data: TeamAnalyticsResponse = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Erro de conexão com o servidor backend ao consultar analytics da equipe." },
      { status: 502 }
    );
  }
}
