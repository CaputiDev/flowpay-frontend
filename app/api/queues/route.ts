import { NextRequest, NextResponse } from "next/server";
import mockData from "./mock.json";
import { Atendimento } from "@/app/types/atendimento";

export async function GET() {
  // Atraso artificial para simular a latência da rede e permitir visualização dos skeletons
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json(mockData);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.subject || typeof body.subject !== "string" || body.subject.trim() === "") {
      return NextResponse.json(
        { error: "O assunto do chamado é obrigatório." },
        { status: 400 }
      );
    }

    // Simula tempo de processamento no Spring Boot BFF
    await new Promise((resolve) => setTimeout(resolve, 400));

    const novoAtendimento: Atendimento = {
      id: crypto.randomUUID(),
      ticketNumber: body.ticketNumber?.trim() || `TCK-${Math.floor(100 + Math.random() * 900)}`,
      chatRef: body.chatRef?.trim() || `chat-${Math.floor(100 + Math.random() * 900)}`,
      subject: body.subject.trim(),
      status: "WAITING",
      errorMsg: null,
      createdAt: new Date().toISOString(),
      finishedAt: null,
      queueId: body.queueId || "46145c40-f16d-4e7b-b5b5-368423a21141",
      agentId: body.agentId || "0f9ce0b9-c65a-4b31-9f03-13f32cab6317",
    };

    return NextResponse.json(novoAtendimento, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erro interno ao processar requisição." },
      { status: 500 }
    );
  }
}