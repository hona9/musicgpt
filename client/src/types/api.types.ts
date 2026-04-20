// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserTier = "FREE" | "PAID";

export type JobStatus =
  | "QUEUED"
  | "DISPATCHED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

// ─── Domain Models ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  tier: UserTier;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationJob {
  id: string;
  promptId: string;
  status: JobStatus;
  audioUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Prompt {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptWithJob extends Prompt {
  job: GenerationJob | null;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PageResult<T> {
  items: T[];
  nextCursor: string | null;
}

export interface PromptsPage {
  prompts: PromptWithJob[];
  nextCursor: string | null;
}

export interface UsersPage {
  users: User[];
  nextCursor: string | null;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

export interface CreatePromptRequest {
  text: string;
}

export interface CreatePromptResponse {
  prompt: PromptWithJob;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchResult {
  users: User[];
  prompts: PromptWithJob[];
  nextCursor: string | null;
}

// ─── API Envelope ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ─── Socket Events ────────────────────────────────────────────────────────────

export interface JobEvent {
  jobId: string;
  promptId: string;
  status: JobStatus;
  audioUrl?: string | null;
  errorMessage?: string | null;
  progress?: number;
  message?: string;
}

// ─── TanStack Query Helpers ───────────────────────────────────────────────────

import type { InfiniteData } from "@tanstack/react-query";
export type InfinitePromptsData = InfiniteData<PromptsPage>;
