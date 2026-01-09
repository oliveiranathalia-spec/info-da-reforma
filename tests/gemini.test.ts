import { describe, it, expect } from "vitest";

describe("Gemini API Key Validation", () => {
  it("should have GEMINI_API_KEY environment variable set", () => {
    const apiKey = process.env.GEMINI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
    expect(apiKey?.length).toBeGreaterThan(10);
  });

  it("should validate Gemini API key format", () => {
    const apiKey = process.env.GEMINI_API_KEY;
    // Gemini API keys typically start with specific patterns
    expect(apiKey).toBeDefined();
    // Basic format validation - should be a non-empty string
    expect(typeof apiKey).toBe("string");
  });

  it("should be able to make a test request to Gemini API", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not set");
    }

    // Test with a simple request to validate the key works
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Responda apenas com 'OK' se você está funcionando.",
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API Error:", JSON.stringify(data, null, 2));
      throw new Error(`Gemini API failed: ${response.status} - ${JSON.stringify(data)}`);
    }
    
    expect(response.ok).toBe(true);
    expect(data.candidates).toBeDefined();
    expect(data.candidates.length).toBeGreaterThan(0);
  });
});
