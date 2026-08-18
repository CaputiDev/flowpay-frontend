import { NextResponse } from "next/server";
import mockData from "./mock.json";

export async function GET() {
    // Atraso artificial de 2 segundos para simularmos a latência da rede (AWS)
    // Isso será crucial para testarmos o nosso "Skeleton Loading" no Frontend depois
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return NextResponse.json(mockData);
}