import { handleAIRequest } from "../../src/server/ai-handler.js";

interface VercelRequest {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
}

export async function POST(request: Request) {
  try {
    return await handleAIRequest(request);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
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
      data = { success: false, error: resText || "Server error occurred" };
    }
    return res.status(webRes.status).json(data);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return res.status(200).json({ success: false, error: errorMessage });
  }
}
