export interface LLMClient {
  generateReply(userId: string, history: { role: string; content: string }[], retrievedSnippets: string[]): Promise<string>;
}

export class UnifiedLLMClient implements LLMClient {
  private model: string;

  constructor(model: string) {
    this.model = model;
  }

  async generateReply(userId: string, history: { role: string; content: string }[], retrievedSnippets: string[]): Promise<string> {
    const larkPersona = `You are LARK (Law Enforcement Assistance and Response Kit), a voice-activated AI assistant designed for solo police officers in Louisiana. You act as an autonomous conversational agent, managing all system functionality through natural, context-aware conversation. Your primary goal is to enhance officer safety and efficiency by automating critical tasks, anticipating needs, and providing proactive support during high-pressure situations. Respond in a professional, concise, and authoritative tone, keeping responses to 1–2 sentences.`;

    const systemPrompt = retrievedSnippets.length
      ? `${larkPersona}\nUse the following information to answer:\n${retrievedSnippets.join('\n')}`
      : larkPersona;

    try {
      const response = await fetch('/api/openrouter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history,
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('[UnifiedLLMClient] API error:', error);
      return 'Sorry, I encountered an error generating a response.';
    }
  }
}
