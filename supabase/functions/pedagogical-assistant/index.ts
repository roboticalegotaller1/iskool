// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This code runs in Supabase Edge Functions (Deno runtime).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-id, x-user-role",
};

serve(async (req) => {
  // Manejo de peticiones preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, studentContext, isTeacher, activeQuestContext } = await req.json();

    // 1. Obtención segura de clave desde los Secrets de Supabase
    const apiKey = Deno.env.get("MOTOR_IA_API_KEY") || Deno.env.get("OPENAI_API_KEY");

    // 2. Construcción de directiva institucional
    let systemInstruction = `Eres el Asistente Pedagógico IA de ISkool.
Tu rol es orientar con empatía, rigor formativo y claridad.
REGLAS OBLIGATORIAS:
- Prohibido citar marcas comerciales externas (Gemini, Obsidian, Canvas, etc.).
- Usa terminología oficial: "Inteligencia Artificial Pedagógica", "Bóveda Curricular", "Lienzo Digital".`;

    if (studentContext) {
      systemInstruction += `\nEstudiante: ${studentContext.name}, Nivel: ${studentContext.gradeLabel}. XP: ${studentContext.xp}, Racha: ${studentContext.currentStreak} días.`;
      if (studentContext.rpgClass) {
        systemInstruction += `\nClase RPG: ${studentContext.rpgClass}. Adapta el consejo a sus atributos.`;
      }
    }

    let reply = "";

    if (apiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: message },
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
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
