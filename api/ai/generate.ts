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
  try {
    return await handleAIRequest(request);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const bodyString = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
    const webReq = new Request("http://localhost/api/ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: bodyString,
    });

    const webRes = await handleAIRequest(webReq);
    const resText = await webRes.text();
    let data: unknown;
    try {
      data = JSON.parse(resText);
    } catch {
      data = { error: resText || "Server error occurred" };
    }
    return res.status(webRes.status).json(data);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return res.status(500).json({ error: errorMessage });
  }
}
