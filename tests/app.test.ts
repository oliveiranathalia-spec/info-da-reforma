import { describe, it, expect } from "vitest";

// Test tax calculation functions
describe("Tax Calculations", () => {
  const CBS_RATE = 0.009; // 0.9% em 2027
  const IBS_RATE = 0.001; // 0.1% em 2027
  const PIS_RATE = 0.0165;
  const COFINS_RATE = 0.076;

  function calculateNewTaxes(valor: number) {
    const cbs = valor * CBS_RATE;
    const ibs = valor * IBS_RATE;
    const total = cbs + ibs;
    const aliquotaEfetiva = (total / valor) * 100;
    return { cbs, ibs, total, aliquotaEfetiva };
  }

  function calculateCurrentTaxes(valor: number, icmsRate: number, issRate: number) {
    const pis = valor * PIS_RATE;
    const cofins = valor * COFINS_RATE;
    const icms = valor * (icmsRate / 100);
    const iss = valor * (issRate / 100);
    const total = pis + cofins + icms + iss;
    return { pis, cofins, icms, iss, total };
  }

  it("should calculate CBS correctly for 2027 test period", () => {
    const result = calculateNewTaxes(10000);
    expect(result.cbs).toBe(90); // 0.9% of 10000
  });

  it("should calculate IBS correctly for 2027 test period", () => {
    const result = calculateNewTaxes(10000);
    expect(result.ibs).toBe(10); // 0.1% of 10000
  });

  it("should calculate total new taxes correctly", () => {
    const result = calculateNewTaxes(10000);
    expect(result.total).toBe(100); // CBS + IBS
  });

  it("should calculate effective tax rate correctly", () => {
    const result = calculateNewTaxes(10000);
    expect(result.aliquotaEfetiva).toBe(1); // 1% effective rate
  });

  it("should calculate current PIS correctly", () => {
    const result = calculateCurrentTaxes(10000, 0, 0);
    expect(result.pis).toBe(165); // 1.65% of 10000
  });

  it("should calculate current COFINS correctly", () => {
    const result = calculateCurrentTaxes(10000, 0, 0);
    expect(result.cofins).toBe(760); // 7.6% of 10000
  });

  it("should calculate ICMS for commerce sector", () => {
    const result = calculateCurrentTaxes(10000, 18, 0);
    expect(result.icms).toBe(1800); // 18% of 10000
  });

  it("should calculate ISS for services sector", () => {
    const result = calculateCurrentTaxes(10000, 0, 5);
    expect(result.iss).toBe(500); // 5% of 10000
  });

  it("should handle zero value input", () => {
    const result = calculateNewTaxes(0);
    expect(result.cbs).toBe(0);
    expect(result.ibs).toBe(0);
    expect(result.total).toBe(0);
  });

  it("should handle large values correctly", () => {
    const result = calculateNewTaxes(1000000);
    expect(result.cbs).toBe(9000);
    expect(result.ibs).toBe(1000);
    expect(result.total).toBe(10000);
  });
});

// Test greeting function
describe("Greeting Function", () => {
  function getGreeting(hour: number): string {
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  }

  it("should return 'Bom dia' for morning hours", () => {
    expect(getGreeting(8)).toBe("Bom dia");
    expect(getGreeting(0)).toBe("Bom dia");
    expect(getGreeting(11)).toBe("Bom dia");
  });

  it("should return 'Boa tarde' for afternoon hours", () => {
    expect(getGreeting(12)).toBe("Boa tarde");
    expect(getGreeting(15)).toBe("Boa tarde");
    expect(getGreeting(17)).toBe("Boa tarde");
  });

  it("should return 'Boa noite' for evening hours", () => {
    expect(getGreeting(18)).toBe("Boa noite");
    expect(getGreeting(21)).toBe("Boa noite");
    expect(getGreeting(23)).toBe("Boa noite");
  });
});

// Test currency formatting
describe("Currency Formatting", () => {
  function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function parseCurrency(text: string): number {
    const cleaned = text.replace(/[^\d,]/g, "").replace(",", ".");
    return parseFloat(cleaned) || 0;
  }

  it("should format currency correctly", () => {
    const formatted = formatCurrency(1000);
    expect(formatted).toContain("1.000");
    expect(formatted).toContain("R$");
  });

  it("should parse currency string correctly", () => {
    expect(parseCurrency("R$ 1.000,00")).toBe(1000);
    expect(parseCurrency("10000")).toBe(10000);
    expect(parseCurrency("")).toBe(0);
  });
});

// Test FAQ filtering
describe("FAQ Filtering", () => {
  const FAQ_DATA = [
    { id: "1", question: "O que é o IBS?", answer: "IBS é...", category: "geral" },
    { id: "2", question: "Como fica o comércio?", answer: "O comércio...", category: "comercio" },
    { id: "3", question: "Serviços e a reforma", answer: "Os serviços...", category: "servicos" },
  ];

  function filterFAQ(items: typeof FAQ_DATA, category: string, searchQuery: string) {
    return items.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesSearch = 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  it("should return all items when category is 'all' and no search", () => {
    const result = filterFAQ(FAQ_DATA, "all", "");
    expect(result.length).toBe(3);
  });

  it("should filter by category correctly", () => {
    const result = filterFAQ(FAQ_DATA, "comercio", "");
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("2");
  });

  it("should filter by search query correctly", () => {
    const result = filterFAQ(FAQ_DATA, "all", "IBS");
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("1");
  });

  it("should combine category and search filters", () => {
    const result = filterFAQ(FAQ_DATA, "geral", "IBS");
    expect(result.length).toBe(1);
  });

  it("should return empty array when no matches", () => {
    const result = filterFAQ(FAQ_DATA, "all", "xyz123");
    expect(result.length).toBe(0);
  });
});

// Test AI response matching
describe("AI Response Matching", () => {
  const AI_RESPONSES: Record<string, { text: string; sources: string[] }> = {
    "o que é o ibs": { text: "O IBS é...", sources: ["LC 214/2024"] },
    "cbs e pis": { text: "A CBS substitui...", sources: ["EC 132/2023"] },
  };

  function getAIResponse(question: string): { text: string; sources: string[] } | null {
    const normalizedQuestion = question.toLowerCase().trim();
    
    for (const [key, response] of Object.entries(AI_RESPONSES)) {
      if (normalizedQuestion.includes(key)) {
        return response;
      }
    }
    
    return null;
  }

  it("should match question about IBS", () => {
    const result = getAIResponse("O que é o IBS?");
    expect(result).not.toBeNull();
    expect(result?.sources).toContain("LC 214/2024");
  });

  it("should match question with different casing", () => {
    const result = getAIResponse("O QUE É O IBS?");
    expect(result).not.toBeNull();
  });

  it("should return null for unknown questions", () => {
    const result = getAIResponse("Qual é o prazo?");
    expect(result).toBeNull();
  });

  it("should handle empty input", () => {
    const result = getAIResponse("");
    expect(result).toBeNull();
  });
});
