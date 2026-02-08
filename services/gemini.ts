import { GoogleGenAI } from "@google/genai";
import { UserProfile, WorkoutPlan } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
// Using Gemini 3 Flash as the efficient, high-speed model for workout generation
const MODEL_NAME = 'gemini-3-flash-preview';

const SYSTEM_PROMPT = `Você é o Dr. Titan. Identidade: Biomecânico de Elite e Treinador Militar. 
Tom: Direto, técnico, curto e motivador.
Sua missão é gerar protocolos de treino hiper-otimizados.`;

export async function generateWorkoutPlan(profile: UserProfile): Promise<{ rotina: WorkoutPlan, analise: string } | null> {
    const prompt = `
    Gere um treino JSON (PT-BR).
    Usuário: ${profile.name}, Nível: ${['Iniciante','Intermediário','Avançado'][profile.maturity]}.
    Dias: ${profile.days.join(', ')}.
    Foco: ${profile.priorities.join(', ')}.
    Objetivo Extra: ${profile.customGoal}.
    Módulos: ${profile.modules.join(', ')}.
    
    Retorne APENAS um JSON com esta estrutura exata, sem markdown:
    {
        "analise": "Uma breve frase motivacional técnica sobre o plano.",
        "rotina": {
            "Seg": { "foco": "Peito", "exercicios": ["Supino", ...] },
            ... para cada dia selecionado
        }
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        if (!text) return null;
        
        return JSON.parse(text);
    } catch (e) {
        console.error("Gemini Error:", e);
        return null;
    }
}

export async function smartSwapExercise(exercise: string, reason: string): Promise<string | null> {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Troque o exercício "${exercise}" considerando este motivo: "${reason}". Retorne APENAS o nome do novo exercício. Sem explicações.`,
            config: { systemInstruction: SYSTEM_PROMPT }
        });
        return response.text?.replace(/["\n]/g, '').trim() || null;
    } catch (e) {
        console.error("Gemini Swap Error:", e);
        return null;
    }
}

export async function analyzeDebrief(logs: any[], name: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Analise este treino concluído. Nome: ${name}. Logs: ${JSON.stringify(logs)}. Seja curto, militar e analítico. Dê um feedback de 2 frases.`,
            config: { systemInstruction: SYSTEM_PROMPT }
        });
        return response.text || "Treino registrado com sucesso.";
    } catch (e) {
        return "Análise indisponível no momento.";
    }
}