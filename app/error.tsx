"use client"; // Obrigatório para Error Boundaries

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    // Observabilidade: em produção, aqui enviaríamos o erro para o Sentry/Datadog
    useEffect(() => {
        console.error("Erro capturado pelo Error Boundary:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4 text-center p-4">
            <h2 className="text-3xl font-bold text-destructive">Algo deu errado!</h2>
            <p className="text-muted-foreground">
                A nossa interface sofreu uma falha inesperada de renderização.
            </p>
            {/* O Next.js fornece a função reset() para tentar remontar o componente que quebrou */}
            <Button onClick={() => reset()} variant="outline">
                Tentar Novamente
            </Button>
        </div>
    );
}