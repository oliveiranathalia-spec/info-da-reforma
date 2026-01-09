import { describe, it, expect } from "vitest";

describe("Chat API Integration", () => {
  const API_URL = "http://127.0.0.1:3000/api/trpc";

  it("should have chat.health endpoint responding", async () => {
    const response = await fetch(`${API_URL}/chat.health`);
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.result).toBeDefined();
    expect(data.result.data).toBeDefined();
    // tRPC wraps response in json property
    expect(data.result.data.json.status).toBe("ok");
  });

  it("should send message and receive AI response", async () => {
    const response = await fetch(`${API_URL}/chat.sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        json: {
          message: "O que é IBS?",
          history: []
        }
      }),
    });

    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.result).toBeDefined();
    expect(data.result.data).toBeDefined();
    expect(data.result.data.json.response).toBeDefined();
    expect(typeof data.result.data.json.response).toBe("string");
    expect(data.result.data.json.response.length).toBeGreaterThan(10);
  }, 60000); // Timeout de 60s para a IA responder

  it("should handle conversation history", async () => {
    const history = [
      { role: "user" as const, content: "O que é IBS?" },
      { role: "assistant" as const, content: "O IBS é o Imposto sobre Bens e Serviços..." }
    ];

    const response = await fetch(`${API_URL}/chat.sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        json: {
          message: "E qual a alíquota?",
          history
        }
      }),
    });

    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.result.data.json.response).toBeDefined();
  }, 60000);
});
