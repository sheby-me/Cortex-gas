import { handleAIRequest } from "../../src/server/ai-handler";

interface VercelRequest {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => VercelResponse;
}

export async function POST(request: Request) {
  return handleAIRequest(request);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const webReq = new Request("http://localhost/api/ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: typeof req.body === "string" ? req.body : JSON.stringify(req.body || {}),
    });

    const webRes = await handleAIRequest(webReq);
    const data = await webRes.json();
    return res.status(webRes.status).json(data);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return res.status(500).json({ error: errorMessage });
  }
}
