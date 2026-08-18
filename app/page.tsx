"use client";

import { useQueues } from "@/app/hooks/useQueues";

export default function Home() {
  const { filas, isLoading } = useQueues();

  console.log("Status do SWR:", { filas, isLoading });

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1>Teste do SWR</h1>
    </main>
  );
}