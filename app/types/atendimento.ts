export interface Atendimento {
    id: string;
    ticketNumber: string | null;
    chatRef: string;
    subject: string;
    status: string;
    errorMsg: string | null;
    createdAt: string; // Vem como ISO 8601 do Java
    finishedAt: string | null;
    queueId: string;
    agentId: string;
}

// O formato de resposta da API
export interface FilaResponse {
    filaAtiva: Atendimento[];
    filaEspera: Atendimento[];
}