export interface CommandResponse {
  command: string;
  action: 'miranda' | 'statute' | 'threat' | 'tactical' | 'unknown' | 'general_query';
  parameters?: Record<string, any>;
  executed: boolean;
  result?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export async function getChatCompletion(messages: { role: string; content: string }[], model = 'gpt-4'): Promise<string> {
  const response = await fetch('/api/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
