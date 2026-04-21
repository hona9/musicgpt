export type WsEventName = "job:processing" | "job:completed" | "job:failed";

export interface WsJobEvent {
  jobId: string;
  promptId: string;
  userId: string;
  status: WsEventName;
  title?: string;
  audioUrl?: string;
  errorMessage?: string;
}

export interface ISocketIOService {
  emitToUser(userId: string, event: WsJobEvent): void;
}
