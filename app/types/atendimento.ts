export type Team = "CREDIT_CARDS" | "LOANS" | "OTHERS";

export type TicketStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";

export interface ActiveTicketDto {
  id: string;
  ticketNumber: number;
  chatRef: string;
  subject: string;
  status: TicketStatus;
  team: Team;
  agentId: string;
  agentName: string;
  createdAt: string;
}

export interface WaitingTicketDto {
  id: string;
  ticketNumber: number;
  chatRef: string;
  subject: string;
  status: TicketStatus;
  team: Team;
  queueId: string;
  position: number;
  createdAt: string;
}

export interface AgentSummaryDto {
  id: string;
  name: string;
  team: Team;
  currentLoad: number;
  maxCapacity: number;
  availableCapacity: number;
}

export interface TeamSummaryDto {
  team: Team;
  queueId: string;
  maxQueueCapacity: number;
  waitingCount: number;
  totalAgents: number;
  totalCapacity: number;
  currentLoad: number;
  agents: AgentSummaryDto[];
}

export interface QueueStatusResponse {
  activeQueue: ActiveTicketDto[];
  waitingQueue: WaitingTicketDto[];
  teamSummaries: TeamSummaryDto[];
}

export interface TicketRequest {
  chatRef: string;
  subject: string;
}

export interface TicketResponse {
  id: string;
  ticketNumber: number;
  chatRef: string;
  subject: string;
  status: TicketStatus;
  errorMsg?: string | null;
  createdAt: string;
  finishedAt?: string | null;
  queueId?: string;
  agentId?: string;
}

export interface ErrorResponse {
  timestamp?: string;
  status: number;
  error: string;
  message: string;
  path?: string;
}

// Helpers para exibição amigável dos Times
export const TEAM_LABELS: Record<Team, string> = {
  CREDIT_CARDS: "Cartões",
  LOANS: "Empréstimos",
  OTHERS: "Outros Assuntos",
};

export const TEAM_VARIANTS: Record<
  Team,
  "default" | "secondary" | "destructive" | "outline" | "info" | "warning" | "success"
> = {
  CREDIT_CARDS: "info",
  LOANS: "warning",
  OTHERS: "secondary",
};