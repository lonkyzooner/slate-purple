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

export async function processVoiceCommand(transcript: string): Promise<CommandResponse> {
  const prompt = `
As LARK (Law Enforcement Assistance and Response Kit), interpret the following police voice command and respond with a JSON object containing:
{
  "command": "original command",
  "action": "miranda|statute|threat|tactical|general_query|unknown",
  "parameters": {
    "language": "...",
    "statute": "...",
    "threat": "...",
    "query": "..."
  }
}

Transcript: "${transcript}"
`;

  const reply = await getChatCompletion([
    { role: 'system', content: 'You are LARK, a police AI assistant.' },
    { role: 'user', content: prompt }
  ]);

  try {
    const parsed = JSON.parse(reply);
    return { ...parsed, executed: true };
  } catch {
    return {
      command: transcript,
      action: 'unknown',
      executed: false,
      error: 'Failed to parse LLM response'
    };
  }
}

export async function getGeneralKnowledge(query: string): Promise<string> {
  return getChatCompletion([
    { role: 'system', content: 'You are LARK, a police AI assistant.' },
    { role: 'user', content: query }
  ]);
}

export async function assessTacticalSituation(situation: string): Promise<string> {
  const prompt = `
As LARK, assess the following tactical situation and provide concise, actionable advice for police officers:

"${situation}"
`;

  return getChatCompletion([
    { role: 'system', content: 'You are LARK, a tactical police AI assistant.' },
    { role: 'user', content: prompt }
  ]);
}

export async function getLegalInformation(statute: string): Promise<string> {
  const prompt = `
As LARK, a Louisiana legal assistant, provide a brief explanation of the following statute:

"${statute}"

If it is not a valid Louisiana statute, say so.
`;

  return getChatCompletion([
    { role: 'system', content: 'You are LARK, a Louisiana legal assistant.' },
    { role: 'user', content: prompt }
  ]);
}
