export type PromptType = "truth" | "dare";

export type PromptItem = {
  id: string;
  type: PromptType;
  text: string;
};

export const PROMPTS: PromptItem[] = [
  // VERDADES (10)
  { id: "t1", type: "truth", text: "¿Cuál fue tu primer crush famoso?" },
  { id: "t2", type: "truth", text: "¿Qué es lo más raro que te gusta comer?" },
  { id: "t3", type: "truth", text: "¿Cuál ha sido tu apodo más vergonzoso?" },
  { id: "t4", type: "truth", text: "¿Qué canción te prende aunque te dé pena admitirlo?" },
  { id: "t5", type: "truth", text: "¿Qué fue lo último que stalkeaste en redes?" },
  { id: "t6", type: "truth", text: "¿Qué fue lo más impulsivo que compraste este año?" },
  { id: "t7", type: "truth", text: "¿Cuál es tu red flag más clara?" },
  { id: "t8", type: "truth", text: "¿Qué es lo más random que te da miedo?" },
  { id: "t9", type: "truth", text: "¿Quién del grupo sería el peor para cuidar un secreto?" },
  { id: "t10", type: "truth", text: "¿Qué cosa te hace decir: ‘ok, ya estoy viejo’?" },

  // RETOS (10)
  { id: "d1", type: "dare", text: "Baila tu canción favorita por 10 segundos (sin explicaciones)." },
  { id: "d2", type: "dare", text: "Imita a alguien del grupo 15 segundos sin decir su nombre." },
  { id: "d3", type: "dare", text: "Habla con acento español durante 1 minuto." },
  { id: "d4", type: "dare", text: "Haz tu mejor pose para foto grupal (modo portada)." },
  { id: "d5", type: "dare", text: "Di 3 piropos creativos a 3 personas diferentes (rápido)." },
  { id: "d6", type: "dare", text: "Manda un emoji random al primer chat que tengas arriba (sin contexto)." },
  { id: "d7", type: "dare", text: "Cuenta una mini historia inventada del ‘DJ’ que estás escuchando." },
  { id: "d8", type: "dare", text: "Haz un brindis épico de 10 segundos como si fueras el host del antro." },
  { id: "d9", type: "dare", text: "Canta el coro de una canción (aunque sea tarareando) por 8 segundos." },
  { id: "d10", type: "dare", text: "Habla en ‘susurro dramático’ por el próximo turno." },
];
