export type PromptType = "truth" | "dare";

export type PromptItem = {
  id: string;
  type: PromptType;
  text: string;
  extreme: boolean;
};

export const PROMPTS: PromptItem[] = [
  /* =========================
     VERDADES (20)
     ========================= */

  { id: "t1", type: "truth", text: "¿Cuál fue el peor oso que has hecho en una peda o antro?", extreme: false },
  { id: "t2", type: "truth", text: "¿Qué canción te prende aunque digas que no te gusta?", extreme: false },
  { id: "t3", type: "truth", text: "¿Cuál es tu tipo real, sin filtro?", extreme: false },
  { id: "t4", type: "truth", text: "¿Qué hábito tuyo te da pena pero no dejas?", extreme: false },
  { id: "t5", type: "truth", text: "¿Qué es lo más caro que compraste por impulso?", extreme: false },
  { id: "t6", type: "truth", text: "¿Qué fue lo último que stalkeaste y por qué?", extreme: false },
  { id: "t7", type: "truth", text: "Si pudieras borrar un mensaje que mandaste, ¿cuál sería?", extreme: false },
  { id: "t8", type: "truth", text: "¿Qué mentira pequeña dices seguido?", extreme: false },
  { id: "t9", type: "truth", text: "¿Cuál es tu red flag más real?", extreme: false },
  { id: "t10", type: "truth", text: "¿Qué cosa te ha hecho decir: ‘ya me estoy poniendo grande’?", extreme: false },

  // 🔥 EXTREMAS
  { id: "t11", type: "truth", text: "¿Quién del grupo te atrae más físicamente? Sin justificar.", extreme: true },
  { id: "t12", type: "truth", text: "¿A quién del grupo NO le confiarías un secreto y por qué?", extreme: true },
  { id: "t13", type: "truth", text: "¿Qué es lo más tóxico que has hecho por celos?", extreme: true },
  { id: "t14", type: "truth", text: "¿Cuál ha sido tu peor crush, el que más pena te da?", extreme: true },
  { id: "t15", type: "truth", text: "Describe el DM más vergonzoso que has mandado (sin nombres).", extreme: true },
  { id: "t16", type: "truth", text: "¿Qué haces cuando estás solo que nadie se imaginaría?", extreme: true },
  { id: "t17", type: "truth", text: "Si tu ex viera tu vida hoy, ¿qué crees que diría?", extreme: true },
  { id: "t18", type: "truth", text: "¿Qué es lo más manipulador que has hecho para salirte con la tuya?", extreme: true },
  { id: "t19", type: "truth", text: "¿Cuál es tu inseguridad número uno que escondes mejor?", extreme: true },
  { id: "t20", type: "truth", text: "¿Qué verdad te daría miedo decirle a alguien que te importa?", extreme: true },

  /* =========================
     RETOS (20)
     ========================= */

  { id: "d1", type: "dare", text: "Baila 10 segundos como si fueras el main character del antro.", extreme: false },
  { id: "d2", type: "dare", text: "Habla con acento (el que quieras) por 45 segundos.", extreme: false },
  { id: "d3", type: "dare", text: "Haz tu mejor pose de portada y quédate quieto 5 segundos.", extreme: false },
  { id: "d4", type: "dare", text: "Imita a alguien del grupo 15 segundos sin decir quién es.", extreme: false },
  { id: "d5", type: "dare", text: "Di 3 cumplidos reales a 3 personas diferentes.", extreme: false },
  { id: "d6", type: "dare", text: "Canta o tararea un coro durante 8 segundos.", extreme: false },
  { id: "d7", type: "dare", text: "Haz un brindis épico de 10 segundos como host del antro.", extreme: false },
  { id: "d8", type: "dare", text: "Cambia tu voz (grave o aguda) durante el próximo turno.", extreme: false },
  { id: "d9", type: "dare", text: "Inventa una mini historia de 20 segundos sobre el DJ.", extreme: false },
  { id: "d10", type: "dare", text: "Haz una entrada dramática como si llegaras tarde a tu fiesta.", extreme: false },

  // 🔥 EXTREMOS
  { id: "d11", type: "dare", text: "Declárale tu amor por 20 segundos a un objeto cercano.", extreme: true },
  { id: "d12", type: "dare", text: "Manda un audio de 7–10 segundos diciendo: ‘Estoy en mi era fiestera 😎’.", extreme: true },
  { id: "d13", type: "dare", text: "Publica una story solo con un emoji y déjala 10 minutos.", extreme: true },
  { id: "d14", type: "dare", text: "Haz un roast ligero a cada persona del grupo, una frase cada uno.", extreme: true },
  { id: "d15", type: "dare", text: "Haz una pasarela de modelo con giro final (8 pasos).", extreme: true },
  { id: "d16", type: "dare", text: "Di tu top 3 del grupo por vibra y explica en una frase cada uno.", extreme: true },
  { id: "d17", type: "dare", text: "Haz un coqueteo exagerado de 12 segundos a la cámara o espejo.", extreme: true },
  { id: "d18", type: "dare", text: "Cuenta un secreto medio y termina diciendo: ‘y lo dije’.", extreme: true },
  { id: "d19", type: "dare", text: "Pide perdón dramáticamente por algo que no hiciste.", extreme: true },
  { id: "d20", type: "dare", text: "Entrevista incómoda: hazle 3 preguntas rápidas a alguien del grupo.", extreme: true },
];
