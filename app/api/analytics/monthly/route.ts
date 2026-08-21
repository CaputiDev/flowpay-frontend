import { NextResponse } from "next/server";
import { MonthlyAnalyticsResponse, ErrorResponse } from "@/app/types/atendimento";

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  try {
    const res = await fetch(`${apiUrl}/v1/analytics/monthly`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err: Partial<ErrorResponse> = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || err.error || `Falha ao consultar analytics (${res.status})` },
        { status: res.status }
      );
    }

    const data: MonthlyAnalyticsResponse = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Erro de conexão com o servidor backend ao consultar analytics." },
      { status: 502 }
    );
  }
}
