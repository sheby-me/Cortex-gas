import { GoogleGenAI } from "@google/genai";

interface AttachedFile {
  name: string;
  type: string;
  size?: number;
  data: string; // Base64 string or data URL
}

interface AIRequestPayload {
  prompt: string;
  toolId?: string;
  toolName?: string;
  context?: string;
  systemInstruction?: string;
  files?: AttachedFile[];
}

export async function handleAIRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "GEMINI_API_KEY is missing. Please configure GEMINI_API_KEY in your environment variables.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const body: AIRequestPayload = await request.json();
    const { prompt, toolId = "study", toolName, context, systemInstruction, files } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    let defaultSystemInstruction =
      "You are Cortex AI, an intelligent, empathetic academic assistant, tutor, and study companion for college and high school students. " +
      "Provide clear, structured, engaging, and highly accurate educational responses. " +
      "Format your output cleanly using Markdown headers, bullet points, code blocks, or bold text where appropriate.";

    if (toolId === "quiz") {
      defaultSystemInstruction +=
        "\n\nSpecialized mode: Quiz Generator. When generating a quiz, provide 3 to 5 clear multiple-choice questions with options (A, B, C, D) and specify the correct answer with a short explanation for each question.";
    } else if (toolId === "flash") {
      defaultSystemInstruction +=
        "\n\nSpecialized mode: Flashcard Generator. Create clear, concise Front (Question) and Back (Answer/Explanation) pairs ideal for active recall and spaced repetition.";
    } else if (toolId === "lecture") {
      defaultSystemInstruction +=
        "\n\nSpecialized mode: Lecture Generator. Structure the response like a 30-minute interactive lecture outline with learning objectives, core concepts, real-world analogies, and review questions.";
    } else if (toolId === "road") {
      defaultSystemInstruction +=
        "\n\nSpecialized mode: Multi-Week Roadmap. Break down the goal into a week-by-week curriculum with key milestones and actionable study tasks.";
    } else if (toolId === "code") {
      defaultSystemInstruction +=
        "\n\nSpecialized mode: Coding Assistant. Provide working, elegant code, line-by-line debugging explanations, and best practices.";
    } else if (toolId === "hw") {
      defaultSystemInstruction +=
        "\n\nSpecialized mode: Homework Guide. Provide helpful hints, guiding questions, and step-by-step reasoning without revealing direct answers immediately so the student learns.";
    }

    if (systemInstruction) {
      defaultSystemInstruction += `\n\nAdditional user guidelines: ${systemInstruction}`;
    }

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    // Attach reference material files (PDFs, images, notes, audio, code docs)
    if (files && Array.isArray(files) && files.length > 0) {
      for (const file of files) {
        if (!file || !file.data) continue;
        const cleanBase64 = file.data.includes(",") ? file.data.split(",")[1] : file.data;
        const mimeType = file.type || "application/octet-stream";

        // Gemini natively supports inlineData for application/pdf, image/*, audio/*
        if (
          mimeType.startsWith("image/") ||
          mimeType === "application/pdf" ||
          mimeType.startsWith("audio/")
        ) {
          parts.push({
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          });
          parts.push({
            text: `[Attached Reference Material: ${file.name}]`,
          });
        } else {
          // Plain text / Markdown / Source Code / CSV / JSON
          let textContent = "";
          try {
            textContent = Buffer.from(cleanBase64, "base64").toString("utf-8");
          } catch {
            textContent = "[Unreadable content]";
          }
          parts.push({
            text: `\n=== Attached Reference Document: ${file.name} (${mimeType}) ===\n${textContent}\n=== End of Attached Document ===\n`,
          });
        }
      }
    }

    let mainPromptText = prompt.trim();
    if (context) {
      mainPromptText = `Context / Text Material provided by user:\n"""\n${context}\n"""\n\nUser Question / Instruction:\n${mainPromptText}`;
    }
    if (toolName) {
      mainPromptText = `[Tool Context: ${toolName}]\n${mainPromptText}`;
    }

    parts.push({ text: mainPromptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts },
      config: {
        systemInstruction: defaultSystemInstruction,
      },
    });

    const outputText = response.text || "No response generated.";

    return new Response(
      JSON.stringify({
        success: true,
        text: outputText,
        toolId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err: unknown) {
    console.error("Gemini API handler error:", err);
    const errorMessage = err instanceof Error ? err.message : "An unexpected AI error occurred.";
    return new Response(
      JSON.stringify({
        error: `AI Generation Error: ${errorMessage}`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
