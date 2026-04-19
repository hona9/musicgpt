export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "MusicGPT API",
    version: "1.0.0",
    description:
      "API for MusicGPT — an AI-powered music generation platform. Supports prompt-based audio generation, real-time job status via Socket.IO, and tier-based rate limiting.",
  },
  servers: [{ url: "/api/v1", description: "v1" }],
  security: [{ BearerAuth: [] }],

  // ─── Reusable Components ──────────────────────────────────────────────────
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Access token obtained from POST /auth/login or POST /auth/refresh.",
      },
    },
    schemas: {
      // ── Primitives ──
      SubscriptionTier: {
        type: "string",
        enum: ["FREE", "PAID"],
      },
      JobStatus: {
        type: "string",
        enum: ["QUEUED", "DISPATCHED", "PROCESSING", "COMPLETED", "FAILED"],
      },

      // ── Entities ──
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "clx1abc123" },
          email: { type: "string", format: "email", example: "user@example.com" },
          tier: { $ref: "#/components/schemas/SubscriptionTier" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      GenerationJob: {
        type: "object",
        properties: {
          id: { type: "string", example: "clx2def456" },
          promptId: { type: "string", example: "clx1abc123" },
          userId: { type: "string", example: "clx0xyz000" },
          status: { $ref: "#/components/schemas/JobStatus" },
          priority: { type: "integer", example: 0 },
          audioUrl: {
            type: "string",
            nullable: true,
            example: "https://cdn.musicgpt.fake/audio/clx1abc123.mp3",
          },
          errorMessage: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      PromptWithJob: {
        type: "object",
        properties: {
          id: { type: "string", example: "clx1abc123" },
          userId: { type: "string", example: "clx0xyz000" },
          text: { type: "string", example: "a chill lo-fi beat" },
          createdAt: { type: "string", format: "date-time" },
          job: {
            nullable: true,
            allOf: [{ $ref: "#/components/schemas/GenerationJob" }],
          },
        },
      },

      // ── Pagination ──
      PromptsPage: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/PromptWithJob" },
          },
          nextCursor: { type: "string", nullable: true, example: "eyJpZCI6ImNseCIsImNyZWF0ZWRBdCI6IjIwMjQifQ==" },
        },
      },
      UsersPage: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/User" },
          },
          nextCursor: { type: "string", nullable: true },
        },
      },

      // ── Auth ──
      AuthTokens: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
        },
      },

      // ── Errors ──
      ErrorResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string", example: "Unauthorized" },
        },
      },
      ValidationErrorResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string", example: "Validation failed" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
    },

    // ── Reusable Responses ──
    responses: {
      Unauthorized: {
        description: "Missing or invalid access token.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      TooManyRequests: {
        description: "Rate limit exceeded for your subscription tier.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      ValidationError: {
        description: "Request body or query failed validation.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
          },
        },
      },
    },

    // ── Reusable Parameters ──
    parameters: {
      cursor: {
        name: "cursor",
        in: "query",
        required: false,
        description: "Opaque pagination cursor from the previous response's `nextCursor`.",
        schema: { type: "string" },
      },
      limit: {
        name: "limit",
        in: "query",
        required: false,
        description: "Number of items to return (1–100, default 20).",
        schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
      },
    },
  },

  // ─── Paths ────────────────────────────────────────────────────────────────
  paths: {
    // ── Health ──
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        security: [],
        responses: {
          200: {
            description: "Service is healthy.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    environment: { type: "string", example: "development" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Auth ──
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  password: { type: "string", minLength: 8, example: "secret123" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      type: "object",
                      properties: { user: { $ref: "#/components/schemas/User" } },
                    },
                  },
                },
              },
            },
          },
          409: { description: "Email already in use." },
          422: { $ref: "#/components/responses/ValidationError" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and receive tokens",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  password: { type: "string", example: "secret123" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/AuthTokens" },
                  },
                },
              },
            },
          },
          401: { description: "Invalid email or password." },
          422: { $ref: "#/components/responses/ValidationError" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: {
                  refreshToken: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "New tokens issued.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/AuthTokens" },
                  },
                },
              },
            },
          },
          401: { description: "Invalid or expired refresh token." },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        responses: {
          200: {
            description: "Current user.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      type: "object",
                      properties: { user: { $ref: "#/components/schemas/User" } },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout and revoke tokens",
        responses: {
          204: { description: "Logged out successfully." },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },

    // ── Prompts ──
    "/prompts": {
      get: {
        tags: ["Prompts"],
        summary: "List the authenticated user's prompts",
        description:
          "Returns paginated prompts with their nested generation job (including `audioUrl` when completed). Results are cached for 60 seconds and invalidated when a new prompt is created or a job completes.",
        parameters: [
          { $ref: "#/components/parameters/cursor" },
          { $ref: "#/components/parameters/limit" },
        ],
        responses: {
          200: {
            description: "Paginated list of prompts.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/PromptsPage" },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Prompts"],
        summary: "Submit a new generation prompt",
        description:
          "Creates a prompt and a background generation job. The job is queued asynchronously — listen to Socket.IO events (`job:processing`, `job:completed`, `job:failed`) for real-time updates. **Rate limited**: FREE tier — 3/hr, PAID tier — 20/hr.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["text"],
                properties: {
                  text: {
                    type: "string",
                    minLength: 1,
                    maxLength: 500,
                    example: "a chill lo-fi beat with rain sounds",
                  },
                },
              },
            },
          },
        },
        responses: {
          202: {
            description: "Prompt accepted, generation job queued.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      type: "object",
                      properties: {
                        promptId: { type: "string", example: "clx1abc123" },
                        jobId: { type: "string", example: "clx2def456" },
                        jobStatus: { $ref: "#/components/schemas/JobStatus" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          422: { $ref: "#/components/responses/ValidationError" },
          429: { $ref: "#/components/responses/TooManyRequests" },
        },
      },
    },

    // ── Users ──
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List all users",
        description: "Returns a paginated list of all users. Results are cached for 60 seconds.",
        parameters: [
          { $ref: "#/components/parameters/cursor" },
          { $ref: "#/components/parameters/limit" },
        ],
        responses: {
          200: {
            description: "Paginated list of users.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: { $ref: "#/components/schemas/UsersPage" },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },

    // ── Search ──
    "/search": {
      get: {
        tags: ["Search"],
        summary: "Unified full-text search",
        description:
          "Searches users (by email) and completed prompts (by text) using Postgres full-text search. Results are ranked by relevance (`ts_rank`) with exact matches scoring higher than partial matches. Both result sets are independently paginated.",
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            description: "Search query (1–200 characters).",
            schema: { type: "string", example: "lo-fi" },
          },
          { $ref: "#/components/parameters/cursor" },
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Number of items per result set (1–50, default 10).",
            schema: { type: "integer", minimum: 1, maximum: 50, default: 10 },
          },
        ],
        responses: {
          200: {
            description: "Search results.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      type: "object",
                      properties: {
                        users: { $ref: "#/components/schemas/UsersPage" },
                        prompts: { $ref: "#/components/schemas/PromptsPage" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          422: { $ref: "#/components/responses/ValidationError" },
        },
      },
    },
  },
};
