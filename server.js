// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3e3;
  const isProduction = process.env.NODE_ENV === "production";
  app.use(express.json());
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "SmartFlow AI Server",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY)
    });
  });
  app.post("/api/ask-smartflow", async (req, res) => {
    try {
      const { query, hospitalSnapshot } = req.body;
      if (!query || typeof query !== "string") {
        res.status(400).json({ error: "Query is required." });
        return;
      }
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.json({
          source: "deterministic_engine",
          reason: "No GEMINI_API_KEY configured; deterministic engine active."
        });
        return;
      }
      const ai = new GoogleGenAI();
      const systemInstruction = `You are SmartFlow AI, an intelligent hospital operations and resource optimization intelligence assistant for the SYNESIS 26 command center.
Your role is to help healthcare administrators, nursing supervisors, and bed management coordinators optimize patient flow, anticipate capacity bottlenecks, and coordinate beds.

IMPORTANT CONSTRAINTS & CLINICAL SAFETY:
1. Ground every answer strictly in the provided real-time hospital snapshot.
2. Distinguish measured real-time telemetry from statistical forecasts and scenario simulation assumptions.
3. Cite specific metric names, unit names (e.g. ED, ICU, Med-Surg, PACU), bed numbers (e.g. ED-104, ICU-208, MED-314), and numbers.
4. Never invent bed numbers, occupancy rates, patient counts, or diagnoses.
5. If data is insufficient, explicitly state so.
6. NEVER diagnose medical conditions, recommend drug dosages, or make triage decisions. Clinical triage priority is determined solely by attending physicians.
7. Format your response cleanly with clear markdown headings, bullet points, and a summary.`;
      const prompt = `Current Hospital Census and Operational Telemetry:
${JSON.stringify(hospitalSnapshot || {}, null, 2)}

User Query:
"${query}"

Provide a clear, professional, metric-cited operational response:`;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
          maxOutputTokens: 1e3
        }
      });
      const responseText = response.text || "";
      res.json({
        text: responseText,
        source: "gemini_api",
        confidenceNotice: "Generated via Gemini 2.5 Flash grounded in live hospital census data."
      });
    } catch (err) {
      console.warn("Gemini API call failed or encountered error, falling back to deterministic engine:", err?.message);
      res.json({
        source: "deterministic_engine",
        reason: err?.message || "Error executing Gemini API"
      });
    }
  });
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartFlow AI Server listening on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
