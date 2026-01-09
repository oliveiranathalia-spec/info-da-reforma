import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

// Contexto do sistema para o assistente tributário
const SYSTEM_PROMPT = `Você é o Assistente Tributário do Info da Reforma, um especialista em direito tributário brasileiro com foco na Reforma Tributária (EC 132/2023 e LC 214/2024).

SUAS RESPONSABILIDADES:
1. Responder perguntas sobre IBS (Imposto sobre Bens e Serviços), CBS (Contribuição sobre Bens e Serviços) e IS (Imposto Seletivo)
2. Explicar o período de transição (2026-2033) e suas implicações
3. Orientar sobre adaptações necessárias para empresas
4. Esclarecer diferenças entre o sistema atual (ICMS, ISS, PIS, COFINS, IPI) e o novo sistema
5. Informar sobre alíquotas, créditos, não-cumulatividade e regimes especiais

DIRETRIZES:
- Sempre cite a base legal quando aplicável (LC 214/2024, EC 132/2023, etc.)
- Use linguagem clara e acessível, evitando jargões desnecessários
- Quando não souber algo com certeza, indique que a informação pode precisar de confirmação
- Forneça exemplos práticos quando possível
- Seja objetivo e direto nas respostas

INFORMAÇÕES CHAVE DA REFORMA:
- IBS: Tributo de competência compartilhada entre Estados e Municípios, substitui ICMS e ISS
- CBS: Contribuição federal que substitui PIS e COFINS
- Alíquota de referência estimada: 26,5% (IBS + CBS)
- Período de transição: 2026 (fase educativa) até 2033 (implementação completa)
- Princípio do destino: tributo cobrado onde ocorre o consumo
- Não-cumulatividade plena: crédito amplo de todas as aquisições
- Comitê Gestor do IBS (CG-IBS): órgão responsável pela administração do IBS

CRONOGRAMA DA TRANSIÇÃO:
- 2026: Fase educativa, sem penalidades
- 2027: Início da CBS (0,9%) e IBS (0,1%)
- 2028: CBS sobe para 0,9%, IBS para 0,1%
- 2029-2032: Redução gradual de ICMS, ISS, PIS, COFINS
- 2033: Extinção completa dos tributos antigos

Responda sempre em português brasileiro.`;

// Função para chamar a API do Gemini
async function callGeminiAPI(userMessage: string, conversationHistory: Array<{role: string, content: string}>) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada");
  }

  // Construir o histórico de conversa para o Gemini
  const contents = [
    // System prompt como primeira mensagem do usuário (Gemini não tem role "system")
    {
      role: "user",
      parts: [{ text: SYSTEM_PROMPT }]
    },
    {
      role: "model",
      parts: [{ text: "Entendido! Sou o Assistente Tributário do Info da Reforma. Estou pronto para ajudar com dúvidas sobre a Reforma Tributária brasileira, IBS, CBS, período de transição e muito mais. Como posso ajudá-lo?" }]
    },
    // Histórico de conversa anterior
    ...conversationHistory.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    })),
    // Nova mensagem do usuário
    {
      role: "user",
      parts: [{ text: userMessage }]
    }
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Gemini API Error:", errorData);
    
    // Verificar se é erro de quota
    if (response.status === 429) {
      throw new Error("Limite de consultas atingido. Por favor, tente novamente em alguns segundos.");
    }
    
    throw new Error(`Erro na API do Gemini: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("Nenhuma resposta gerada pela IA");
  }

  const textResponse = data.candidates[0]?.content?.parts?.[0]?.text;
  
  if (!textResponse) {
    throw new Error("Resposta vazia da IA");
  }

  return textResponse;
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Router de chat com IA
  chat: router({
    // Enviar mensagem e receber resposta da IA
    sendMessage: publicProcedure
      .input(z.object({
        message: z.string().min(1).max(2000),
        history: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string()
        })).optional().default([])
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await callGeminiAPI(input.message, input.history);
          
          return {
            success: true,
            response,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          console.error("Chat error:", error);
          
          // Retornar mensagem de erro amigável
          return {
            success: false,
            response: error instanceof Error 
              ? error.message 
              : "Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.",
            timestamp: new Date().toISOString()
          };
        }
      }),

    // Endpoint de health check
    health: publicProcedure.query(() => {
      const hasApiKey = !!process.env.GEMINI_API_KEY;
      return {
        status: hasApiKey ? "ok" : "missing_api_key",
        timestamp: new Date().toISOString()
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
