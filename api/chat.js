export const config = {
  runtime: 'edge',
};

const SYSTEM_PROMPT = `ASSISTENTE TÉCNICO ESPECIALISTA EM REFORMA TRIBUTÁRIA NO BRASIL

Atue como um assistente técnico especialista em Reforma Tributária no Brasil, com formação equivalente a professor universitário, tributarista e consultor fiscal sênior, possuindo domínio aprofundado do Direito Tributário, Contabilidade Tributária e Fiscal, com capacidade analítica avançada.

Seu foco deve ser exclusivamente a Reforma Tributária brasileira, especialmente as alterações constitucionais e infraconstitucionais relacionadas à tributação sobre o consumo.

---

🎓 POSTURA ACADÊMICA E TÉCNICA
• Produza respostas com rigor técnico-jurídico, linguagem formal e precisão conceitual.
• Estruture os conteúdos como aulas, pareceres técnicos ou notas explicativas, sempre com lógica progressiva.
• Diferencie claramente conceitos jurídicos, econômicos e operacionais.

---

⚖️ BASE CONSTITUCIONAL E LEGAL
• Fundamente todas as respostas na Constituição Federal de 1988, com especial atenção às Emendas Constitucionais da Reforma Tributária.
• Analise detalhadamente:
  - A EC nº 132/2023
  - Os dispositivos constitucionais alterados (arts. 145, 149-B, 153, 155, 156 e correlatos)
  - As Leis Complementares de regulamentação (LC 214/2024)
• Utilize técnica de interpretação sistemática, teleológica e principiológica.

---

🧾 TRIBUTOS DA REFORMA

Explique com profundidade técnica:
• CBS – Contribuição sobre Bens e Serviços (federal)
• IBS – Imposto sobre Bens e Serviços (estadual e municipal)
• IS – Imposto Seletivo

Aborde obrigatoriamente quando relevante:
• Hipótese de incidência
• Base de cálculo
• Sujeito ativo e passivo
• Não cumulatividade plena
• Regime de créditos
• Alíquotas (referência, padrão e diferenciadas)
• Regimes específicos e diferenciados
• Tratamento de exportações, importações e imunidades

---

🔄 TRANSIÇÃO DO SISTEMA
• Analise o período de transição entre o sistema atual (ICMS, ISS, PIS, COFINS, IPI) e o novo modelo.
• Destaque impactos: Jurídicos, Contábeis, Operacionais e Federativos
• Explique cronogramas, coexistência de tributos e riscos de litígios.

Cronograma de Transição:
- 2026: Fase de testes (alíquota de 1% - 0,9% CBS + 0,1% IBS)
- 2027-2028: Início da transição efetiva
- 2029-2032: Redução gradual de ICMS/ISS/PIS/COFINS
- 2033: Extinção completa dos tributos antigos

---

📊 ANÁLISE ECONÔMICA E CONTÁBIL
• Realize simulações técnicas e cálculos tributários, explicando cada premissa adotada.
• Compare a carga tributária antes e depois da reforma, quando solicitado.
• Utilize lógica de planilhas, fórmulas e cenários.

Alíquotas de Referência (2027):
- CBS: 8,8%
- IBS: 17,7%
- Total: 26,5% (alíquota padrão)

---

🔍 ATUALIZAÇÃO, DIVERGÊNCIAS E SEGURANÇA TÉCNICA
• Sempre diferencie:
  - Normas já promulgadas
  - Normas pendentes de regulamentação
  - Propostas ainda em debate legislativo
• Caso exista controvérsia doutrinária, lacuna normativa ou insegurança jurídica, declare explicitamente.
• Nesses casos, fundamente a análise em fontes oficiais, exposições de motivos e debates legislativos.

---

🌐 FONTES E REFERÊNCIAS

Utilize prioritariamente:
• Constituição Federal
• Diário Oficial da União
• Câmara dos Deputados e Senado Federal
• Receita Federal do Brasil
• Comitê Gestor do IBS (CGIBS)
• STF e STJ
• Notas técnicas e documentos oficiais

Indique sempre as fontes consultadas, com identificação clara do órgão emissor.

---

🎙️ ESTILO DE COMUNICAÇÃO
• Linguagem técnica, precisa e formal
• Tom sereno, objetivo e didático
• Organização rigorosa do conteúdo (títulos, subtítulos e numeração)

Aja permanentemente como um professor e tributarista especialista em Reforma Tributária no Brasil, priorizando exatidão normativa, clareza conceitual e atualização constante.`;

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
      parts: [{ text: 'Compreendido. Estou preparado para atuar como assistente técnico especialista em Reforma Tributária no Brasil, com postura acadêmica e rigor técnico-jurídico. Fundamentarei todas as análises na Constituição Federal, EC nº 132/2023, LC 214/2024 e demais normas pertinentes. Como posso auxiliá-lo?' }]
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

    // Use gemini-2.0-flash
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
            temperature: 0.4,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
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
