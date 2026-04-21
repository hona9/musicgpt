import { JobStatus } from "../../shared/types/enums";

export interface GenerationJobEntity {
  id: string;
  promptId: string;
  userId: string;
  status: JobStatus;
  priority: number;
  title: string | null;
  audioUrl: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}
