import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fetch from "node-fetch";
import OpenAI from "openai";

dotenv.config();
const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Test endpoint
app.get("/", (req, res) => res.send("Backend running"));

// --- Remove Background Endpoint (remove.bg) ---
app.post("/api/remove-background", async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: "Image missing" });

  try {
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_file_b64: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
        size: "auto",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: "Remove.bg API error", details: errText });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    res.json({ result: base64Image });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Background removal failed", details: err.message });
  }
});

// --- Execute Canvas Command using OpenAI ---
app.post("/api/execute-command", async (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: "Command missing" });

  try {
    const prompt = `
      You are a canvas image editor assistant.
      Convert the user's command into valid JSON with the following structure:

      {
        "action": "draw_circle" | "adjust_brightness",
        "color": "<color>",       // for draw_circle
        "x": <number>,            // for draw_circle
        "y": <number>,            // for draw_circle
        "radius": <number>,       // for draw_circle
        "percent": <number>       // for adjust_brightness
      }

      Only return JSON. No explanations. Command: "${command}"
    `;

     const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
    });

    const message = completion.choices[0].message.content.trim();
    const actionJSON = JSON.parse(message);

    res.json(actionJSON);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI command execution failed", details: error.message });
  }
});

// --- Hugging Face Image Generation ---
app.post("/api/generate-image", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) return res.status(400).json({ error: "Prompt is required" });

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt, options: { wait_for_model: true } }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Hugging Face API error: ${errText}` });
    }

    const contentType = response.headers.get("content-type");
    let base64Image = "";

    if (contentType && contentType.includes("application/json")) {
      const json = await response.json();
      if (json.error) return res.status(500).json({ error: `HF Error: ${json.error}` });
      base64Image = json[0]?.image || json[0]?.generated_image || "";
    } else {
      const arrayBuffer = await response.arrayBuffer();
      base64Image = Buffer.from(arrayBuffer).toString("base64");
    }

    if (!base64Image) return res.status(500).json({ error: "Failed to generate image" });

    res.json({ image: base64Image });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message || "Unknown server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
