// app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 🔑 Cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ======================================================
   🟢 1️⃣ ENDPOINT: GUION RÁPIDO
====================================================== */
app.post("/api/guion", async (req, res) => {
  const { tema, tono, estilo, audiencia } = req.body;

  if (!tema) {
    return res.status(400).json({ error: "Falta el tema principal del guion." });
  }

  try {
    const prompt = `
Eres un experto guionista especializado en guiones cortos.

🎬 Detalles:
- Tema: "${tema}"
- Tono: "${tono || "neutro"}"
- Estilo: "${estilo || "natural"}"
- Audiencia: "${audiencia || "general"}"

Instrucciones:
1. Estructura en Inicio, Desarrollo y Cierre.
2. Responde EXACTAMENTE en este formato:

TÍTULO:
[El título aquí]

GUION:
[El guion completo aquí]
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      max_tokens: 600,
    });

    const respuesta = completion.choices[0].message.content.trim();

    const tituloMatch = respuesta.match(/TÍTULO:\s*(.+)/i);
    const guionMatch = respuesta.match(/GUION:\s*([\s\S]+)/i);

    res.json({
      titulo: tituloMatch ? tituloMatch[1].trim() : "Guion generado",
      guion: guionMatch ? guionMatch[1].trim() : respuesta,
    });

  } catch (error) {
    console.error("Error al generar guion:", error);
    res.status(500).json({ error: "Hubo un error al generar el guion." });
  }
});

/* ======================================================
   🟣 2️⃣ ENDPOINT: CARTA FÁCIL
====================================================== */
app.post("/api/cartafacil", async (req, res) => {
  const { texto, emocion, nivel, tipoRelacion } = req.body;

  if (!texto) {
    return res.status(400).json({ error: "Falta el texto del tema o motivo." });
  }

  try {
    const prompt = `
Eres un redactor experto en cartas personalizadas.

Datos:
- Tema: "${texto}"
- Emoción: "${emocion}"
- Formalidad: "${nivel}"
- Relación: "${tipoRelacion}"

Formato requerido:

TÍTULO:
[El título aquí]

CARTA:
[El texto de 5-7 líneas aquí]
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 500,
    });

    const respuesta = completion.choices[0].message.content.trim();

    const tituloMatch = respuesta.match(/TÍTULO:\s*(.+)/i);
    const cartaMatch = respuesta.match(/CARTA:\s*([\s\S]+)/i);

    res.json({
      titulo: tituloMatch ? tituloMatch[1].trim() : "Carta generada",
      carta: cartaMatch ? cartaMatch[1].trim() : respuesta,
    });

  } catch (error) {
    console.error("Error generando carta:", error);
    res.status(500).json({ error: "Error al generar la carta." });
  }
});

/* ======================================================
   💡 3️⃣ ENDPOINT: IDEA BOOST
====================================================== */
app.post("/api/ideaboost", async (req, res) => {
  const { tipo, originalidad, objetivo, ideaBase, contexto, modoCreativo } = req.body;

  try {
    let prompt = "";

    if (modoCreativo) {
      prompt = `
Modo creativo activado.

Modo: "${modoCreativo}"
Contexto: "${contexto || "Sin contexto"}"

Devuelve:

IDEAS:
[contenido aquí]
`;
    } else {
      prompt = `
Eres un experto creativo.

Datos:
- Tipo: "${tipo}"
- Originalidad: "${originalidad}"
- Objetivo: "${objetivo}"
- Idea base: "${ideaBase}"
- Contexto: "${contexto}"

Responde EXACTAMENTE así:

VERSIÓN EMOCIONAL:
[texto aquí]

VERSIÓN PROFESIONAL:
[texto aquí]

VERSIÓN VIRAL:
[texto aquí]
`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.95,
      max_tokens: 700,
    });

    const respuesta = completion.choices[0].message.content.trim();

    if (modoCreativo) {
      const ideas = respuesta.match(/IDEAS:\s*([\s\S]*)/i)?.[1]?.trim() || respuesta;
      return res.json({ idea: ideas });
    }

    res.json({
      emocional:
        respuesta.match(/VERSIÓN EMOCIONAL:\s*([\s\S]*?)VERSIÓN PROFESIONAL:/i)?.[1]?.trim() || "",
      profesional:
        respuesta.match(/VERSIÓN PROFESIONAL:\s*([\s\S]*?)VERSIÓN VIRAL:/i)?.[1]?.trim() || "",
      viral:
        respuesta.match(/VERSIÓN VIRAL:\s*([\s\S]*)/i)?.[1]?.trim() || "",
    });

  } catch (error) {
    console.error("Error generando idea:", error);
    res.status(500).json({ error: "Error al generar la idea." });
  }
});

/* ======================================================
   🟡 3.1️⃣ ENDPOINT: EXPLICACIÓN DE IDEA
====================================================== */
app.post("/api/ideaboost/explicacion", async (req, res) => {
  const { idea } = req.body;

  if (!idea) {
    return res.status(400).json({ error: "No se proporcionó ninguna idea." });
  }

  try {
    const prompt = `
Explica de manera clara por qué esta idea es buena.

IDEA:
"${idea}"

Instrucciones:
- Explicación en 4–6 líneas.
- Nada de títulos.
- Solo texto limpio.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300
    });

    const explicacion = completion.choices[0].message.content.trim();

    res.json({ explicacion });
  } catch (error) {
    console.error("❌ Error generando explicación:", error);
    res.status(500).json({ error: "Error al generar la explicación." });
  }
});

/* ======================================================
   🔵 4️⃣ ENDPOINT: PLANIFY IA
====================================================== */
app.post("/api/planify", async (req, res) => {
  const { title, idea, type, start, end, tasks } = req.body;

  if (!idea) {
    return res.status(400).json({ error: "Falta la idea base." });
  }

  try {
    const prompt = `
Planificador experto: convierte esta idea en un plan ordenado.

Datos:
- Título: "${title}"
- Idea: "${idea}"
- Tipo: "${type}"
- Inicio: "${start}"
- Fin: "${end}"
- Tareas previas: ${tasks?.length ? tasks.map(t => t.name).join(", ") : "ninguna"}

Formato requerido:

PLAN:
[plan aquí]

TAREAS:
[ { "name": "", "prio": "" }, ... ]
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 900,
    });

    const response = completion.choices[0].message.content.trim();

    const planText = response.match(/PLAN:\s*([\s\S]*?)(?=TAREAS:|$)/i)?.[1]?.trim();
    const tasksBlock = response.match(/TAREAS:\s*(\[[\s\S]*\])/i)?.[1];

    let parsedTasks = [];
    try {
      if (tasksBlock) parsedTasks = JSON.parse(tasksBlock);
    } catch (e) {}

    res.json({ planText, tasks: parsedTasks });

  } catch (error) {
    console.error("Error generando plan:", error);
    res.status(500).json({ error: "Error al generar el plan." });
  }
});

/* ======================================================
   🔴 5️⃣ ENDPOINT: GENERADOR DE TÍTULOS YOUTUBE
====================================================== */
app.post("/api/titulos", async (req, res) => {
  const { topic, style } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Falta el tema principal." });
  }

  try {
    const prompt = `
Eres un experto en viralidad de YouTube.

Genera EXACTAMENTE 10 títulos únicos, muy atractivos y optimizados para CTR.
Tema del vídeo: "${topic}"
Estilo solicitado: "${style}"

Entrégalos así:

TITULOS:
1. ...
2. ...
3. ...
4. ...
5. ...
6. ...
7. ...
8. ...
9. ...
10. ...
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.95,
      max_tokens: 650,
    });

    const content = completion.choices[0].message.content;

    const block = content.match(/TITULOS:\s*([\s\S]*)/i)?.[1] || content;

    const titles = block
      .split("\n")
      .map(t => t.replace(/^\d+\.\s*/, "").trim())
      .filter(t => t.length > 3);

    res.json({ titles });

  } catch (error) {
    console.error("❌ Error generando títulos:", error);
    res.status(500).json({ error: "Error interno generando títulos." });
  }
});

/* ======================================================
   🚀 SERVIDOR
====================================================== */

/* ======================================================
   🔵 ENDPOINT DE STATUS PARA CRON-JOB
====================================================== */
app.get("/status", (req, res) => {
  res.send("OK");
});

app.listen(port, () => {
  console.log(`✅ Servidor iniciado en puerto ${port}`);
});
