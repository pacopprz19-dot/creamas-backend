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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===============================
// 🟢 1️⃣ Endpoint: Guión Rápido
// ===============================
app.post("/api/guion", async (req, res) => {
  const { tema, tono, estilo, audiencia } = req.body;

  if (!tema) {
    return res.status(400).json({ error: "Falta el tema principal del guion." });
  }

  try {
    const prompt = `
Eres un experto guionista especializado en crear guiones cortos, dinámicos y adaptados a distintos tonos, estilos y públicos.

🎬 Detalles del guion:
- Tema o concepto principal: "${tema}"
- Tono o enfoque: "${tono || "neutro"}"
- Estilo narrativo: "${estilo || "natural"}"
- Audiencia objetivo: "${audiencia || "público general"}"

🧩 Instrucciones:
1. Crea un guion para un vídeo corto (de unos 30-40 segundos aprox.).
2. El guion debe estar estructurado en tres partes:
   - **Inicio:** Una frase atractiva que enganche rápido al espectador.
   - **Desarrollo:** Breve explicación o historia principal.
   - **Cierre:** Un final claro, emocional o con llamada a la acción.
3. Usa un lenguaje natural, cercano y adaptado al tono y la audiencia indicados.
4. Devuelve el resultado en el siguiente formato exacto:

TÍTULO:
[El título del guion aquí]

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

    const titulo = tituloMatch ? tituloMatch[1].trim() : "Guion generado";
    const guion = guionMatch ? guionMatch[1].trim() : respuesta;

    res.json({ titulo, guion });
  } catch (error) {
    console.error("Error al generar guion:", error);
    res.status(500).json({ error: "Hubo un error al generar el guion." });
  }
});

// =================================
// 🟣 2️⃣ Endpoint: Carta Fácil
// =================================
app.post("/api/cartafacil", async (req, res) => {
  const { texto, emocion, nivel, tipoRelacion } = req.body;

  if (!texto) {
    return res.status(400).json({ error: "Falta el texto del tema o motivo de la carta." });
  }

  try {
    const prompt = `
Eres un experto redactor especializado en comunicación emocional y cartas personalizadas.

Debes redactar una carta y un título breve según estas instrucciones:

🧩 Detalles del usuario:
- Tema o motivo: "${texto}"
- Intención emocional: "${emocion}"
- Nivel de formalidad: "${nivel}"
- Relación con el destinatario: "${tipoRelacion}"

✉️ Instrucciones:
1. Genera primero un título breve y natural, que refleje el contexto y tono. Ejemplo: "Disculpa a un amigo" o "Carta de agradecimiento profesional".
2. Luego redacta una carta de 5 a 7 líneas, fluida y humana.
3. No incluyas saludos o cierres robóticos.
4. Usa un estilo coherente con el nivel de formalidad y la relación indicada.
5. Devuelve el resultado en este formato exacto:

TÍTULO:
[El título aquí]

CARTA:
[El texto de la carta aquí]
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

    const titulo = tituloMatch ? tituloMatch[1].trim() : "Carta generada";
    const carta = cartaMatch ? cartaMatch[1].trim() : respuesta;

    res.json({ titulo, carta });
  } catch (error) {
    console.error("Error generando carta:", error);
    res.status(500).json({ error: "Error al generar la carta." });
  }
});

// =================================
// 💡 3️⃣ Endpoint: IDEA Boost
// =================================
app.post("/api/ideaboost", async (req, res) => {
  const { tipo, originalidad, objetivo, ideaBase, contexto, modoCreativo } = req.body;

  try {
    let prompt = "";

    if (modoCreativo) {
      prompt = `
Eres un asistente creativo llamado IdeaBoost AI.
Tu tarea es generar ideas creativas basadas en el modo seleccionado por el usuario.

🧩 Modo seleccionado: "${modoCreativo}"
📘 Contexto o descripción adicional: "${contexto || "sin contexto definido"}"

🎨 Instrucciones:
- Si el modo es "No sé qué quiero", genera una idea libre, sorprendente y original.
- Si el modo es "Inspiración rápida", genera 3 ideas breves y directas.
- Si el modo es "Explorador de ideas", genera una secuencia de 3 pasos para desarrollar una idea inicial en algo más grande.

💬 Formato de respuesta:
IDEAS:
[Texto con las ideas o secuencia generada aquí]
      `;
    } else {
      prompt = `
Eres un experto creativo que ayuda a generar ideas potentes, originales y bien estructuradas para distintos proyectos, negocios, vídeos o contenidos.

🎯 Datos del usuario:
- Tipo de idea: "${tipo || "No especificado"}"
- Nivel de originalidad: "${originalidad || "Medio"}"
- Objetivo principal: "${objetivo || "Inspirar o innovar"}"
- Idea base: "${ideaBase || "sin idea base"}"
- Contexto adicional: "${contexto || "ninguno"}"

🧠 Instrucciones:
1. Genera tres versiones diferentes de la misma idea:
   - **Versión emocional:** conecta con sentimientos y empatía.
   - **Versión profesional:** estructurada, útil y realista.
   - **Versión viral:** diseñada para captar atención y compartirse.
2. Cada versión debe tener 3 a 5 líneas.
3. Devuelve el resultado con este formato exacto:

VERSIÓN EMOCIONAL:
[Idea emocional aquí]

VERSIÓN PROFESIONAL:
[Idea profesional aquí]

VERSIÓN VIRAL:
[Idea viral aquí]
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

    const emocional = (respuesta.match(/VERSIÓN EMOCIONAL:\s*([\s\S]*?)VERSIÓN PROFESIONAL:/i)?.[1] || "").trim();
    const profesional = (respuesta.match(/VERSIÓN PROFESIONAL:\s*([\s\S]*?)VERSIÓN VIRAL:/i)?.[1] || "").trim();
    const viral = (respuesta.match(/VERSIÓN VIRAL:\s*([\s\S]*)/i)?.[1] || "").trim();

    res.json({ emocional, profesional, viral });
  } catch (error) {
    console.error("Error generando idea:", error);
    res.status(500).json({ error: "Error al generar la idea." });
  }
});

// =================================
// 🔵 4️⃣ Endpoint: PlanifyIA
// =================================
app.post("/api/planify", async (req, res) => {
  const { title, idea, type, start, end, tasks } = req.body;

  if (!idea) {
    return res.status(400).json({ error: "Falta la idea base o concepto para planificar." });
  }

  try {
    const prompt = `
Eres un planificador inteligente llamado PlanifyIA, experto en organización creativa y gestión de proyectos.

🧩 DATOS DEL PROYECTO:
- Título o nombre del proyecto: "${title || "Sin título"}"
- Idea base: "${idea}"
- Tipo de proyecto: "${type || "general"}"
- Fecha de inicio: "${start || "no especificada"}"
- Fecha de finalización: "${end || "no especificada"}"
- Tareas existentes: ${tasks?.length ? tasks.map(t => t.name).join(", ") : "ninguna"}

🎯 OBJETIVO:
Organiza la idea en un plan de acción práctico y equilibrado, con una secuencia de tareas ordenadas y tiempos estimados.

🧠 INSTRUCCIONES:
1. Genera un plan claro, con tareas numeradas (máximo 8-10 tareas).
2. Cada tarea debe incluir un nombre breve y, entre paréntesis, una duración o prioridad aproximada.
3. Añade una breve introducción con visión general del plan.
4. Finaliza con una breve recomendación o cierre motivacional.
5. Devuelve el texto completo en español.

💬 FORMATO EXACTO:
PLAN:
[Texto del plan completo aquí]

TAREAS:
[
  { "name": "Nombre de la tarea 1", "prio": "alta", "date": "opcional" },
  { "name": "Nombre de la tarea 2", "prio": "media" }
]
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 900,
    });

    const response = completion.choices[0].message.content.trim();

    const planTextMatch = response.match(/PLAN:\s*([\s\S]*?)(?=TAREAS:|$)/i);
    const tasksMatch = response.match(/TAREAS:\s*(\[[\s\S]*\])/i);

    const planText = planTextMatch ? planTextMatch[1].trim() : response;
    let generatedTasks = [];

    if (tasksMatch) {
      try {
        generatedTasks = JSON.parse(tasksMatch[1]);
      } catch (err) {
        console.warn("No se pudo parsear el bloque de tareas:", err);
      }
    }

    res.json({ planText, tasks: generatedTasks });
  } catch (error) {
    console.error("Error generando plan:", error);
    res.status(500).json({ error: "Error al generar el plan con IA." });
  }
});

// ===============================
// 🚀 Iniciar servidor
// ===============================
app.listen(port, () => {
  console.log(`✅ Servidor iniciado en puerto ${port}`);
});
