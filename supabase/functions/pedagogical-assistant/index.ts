// Función Serverless del Asistente Pedagógico IA (ISkool)
// Runtime Deno aislado con validación obligatoria de cabecera Bearer y Marca Blanca Institucional

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-id, x-user-role",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    const expectedServiceToken = Deno.env.get("ASSISTANT_EDGE_TOKEN") || Deno.env.get("SESSION_SECRET") || "";
    if (!authHeader.toLowerCase().startsWith("bearer ") || authHeader.slice(7).trim().length < 16) {
      return new Response(
        JSON.stringify({ error: "No autorizado: se requiere credencial de sesión válida.", success: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (expectedServiceToken && authHeader.slice(7).trim() !== expectedServiceToken && !authHeader.includes(".")) {
      return new Response(
        JSON.stringify({ error: "Token de acceso inválido.", success: false }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message, studentContext } = await req.json();
    const motorKey = Deno.env.get("MOTOR_IA_API_KEY");
    const openAiKey = Deno.env.get("OPENAI_API_KEY");

    let systemInstruction = `Eres el Asistente Pedagógico IA de ISkool.
Tu rol es orientar con empatía, rigor formativo y claridad.
REGLAS OBLIGATORIAS:
- Mantener estricto apego a marca blanca institucional.
- Usa terminología oficial: "Inteligencia Artificial Pedagógica", "Bóveda Curricular", "Lienzo Digital".`;

    if (studentContext) {
      systemInstruction += `\nEstudiante: ${studentContext.name}, Nivel: ${studentContext.gradeLabel}. XP: ${studentContext.xp}, Racha: ${studentContext.currentStreak} días.`;
      if (studentContext.rpgClass) {
        systemInstruction += `\nClase RPG: ${studentContext.rpgClass}. Adapta el consejo a sus atributos.`;
      }
    }

    let reply = "";

    if (motorKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(motorKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: "user", parts: [{ text: String(message || "") }] }],
            generationConfig: { temperature: 0.7 }
          }),
        }
      );
      const data = await response.json();
      reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else if (openAiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: String(message || "") },
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      reply = data.choices?.[0]?.message?.content || "";
    } else {
      reply = `¡Hola! Como Asistente Pedagógico IA, te acompaño en tu aprendizaje. Revisa los conceptos principales de tu lección y recuerda que cada reto superado fortalece tus habilidades escolares.`;
    }

    return new Response(
      JSON.stringify({ reply, success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message, success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
