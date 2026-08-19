import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const simulateError =
      request.headers.get("x-simulate-error") === "true" ||
      request.nextUrl.searchParams.get("error") === "500" ||
      id.includes("error");

    // Simulação de latência de rede
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (simulateError) {
      return NextResponse.json(
        { error: "Falha interna no servidor legado ao finalizar atendimento." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        id,
        status: "FINISHED",
        finishedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Erro inesperado ao finalizar atendimento." },
      { status: 500 }
    );
  }
}
