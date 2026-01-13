export const config = {
  runtime: 'edge',
};

const SYSTEM_PROMPT = `Você é um assistente especializado na Reforma Tributária brasileira, com conhecimento profundo sobre:

1. **IBS (Imposto sobre Bens e Serviços)**: Tributo estadual/municipal que substituirá ICMS e ISS
2. **CBS (Contribuição sobre Bens e Serviços)**: Tributo federal que substituirá PIS e COFINS
3. **Imposto Seletivo (IS)**: Tributo sobre produtos prejudiciais à saúde e ao meio ambiente
4. **Período de Transição (2026-2033)**: Cronograma de implementação gradual

Base Legal Principal:
- Emenda Constitucional 132/2023 (EC 132/2023)
- Lei Complementar 214/2024 (LC 214/2024)
- Resoluções do Comitê Gestor do IBS

Alíquotas de Referência (2027):
- CBS: 8,8%
- IBS: 17,7%
- Total: 26,5% (alíquota padrão)

Cronograma de Transição:
- 2026: Fase de testes (alíquota de 1% - 0,9% CBS + 0,1% IBS)
- 2027-2028: Início da transição
- 2029-2032: Redução gradual de ICMS/ISS/PIS/COFINS
- 2033: Extinção completa dos tributos antigos

Regras de Resposta:
1. Sempre cite a base legal quando relevante (EC 132/2023, LC 214/2024)
2. Use linguagem clara e acessível
3. Forneça exemplos práticos quando possível
4. Se não souber algo específico, indique que a pessoa deve consultar um contador ou advogado tributarista
5. Mantenha as respostas objetivas e diretas`;

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { message, history = [] } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build conversation history for Gemini
    const contents = [];
    
    // Add system instruction as first user message
    contents.push({
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: 'Entendido! Sou o assistente especializado na Reforma Tributária brasileira. Estou pronto para ajudar com dúvidas sobre IBS, CBS, período de transição e toda a legislação relacionada. Como posso ajudá-lo?' }]
    });

    // Add conversation history
    for (const msg of history) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Use gemini-1.5-flash (correct model name for v1beta)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return new Response(JSON.stringify({ 
        error: 'Failed to get AI response', 
        details: errorData?.error?.message || 'Unknown error'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui gerar uma resposta.';

    return new Response(JSON.stringify({ response: aiResponse }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
