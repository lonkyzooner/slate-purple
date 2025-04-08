import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import ChatBox from './ChatBox';
import { orchestratorService } from '../services/OrchestratorService';

import debounce from 'lodash.debounce';

export const VoiceAssistantV2: React.FC = () => {
  const conversationId = 'demo-convo'; // static for now, could be dynamic
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant' | 'system'; content: string; timestamp?: number }[]>([]);
  const [inputText, setInputText] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const listener = (response: any) => {
      if (response.error) {
        setError(response.error);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response.content, timestamp: Date.now() }]);
        setError(null);
      }
    };
    orchestratorService.onResponse(conversationId, listener);
    return () => {
      orchestratorService.offResponse(conversationId, listener);
    };
  }, []);

  const handleSendImmediate = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: inputText.trim(), timestamp: Date.now() }]);
    try {
      orchestratorService.receiveInput({ userId: 'demo-user', type: 'text', content: inputText.trim() });
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to send message');
    }
    setInputText('');
  };

  const handleSend = debounce(handleSendImmediate, 500, { leading: true, trailing: false });

  const {
    listening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
    error: speechError,
  } = useSpeechRecognition();

  useEffect(() => {
    if (!listening && transcript.trim()) {
      setMessages(prev => [...prev, { role: 'user', content: transcript.trim(), timestamp: Date.now() }]);
      try {
        orchestratorService.receiveInput({ userId: 'demo-user', type: 'voice', content: transcript.trim() });
        setError(null);
      } catch (e: any) {
        setError(e.message || 'Failed to send voice input');
      }
    }
  }, [listening, transcript]);

  const repeatLastResponse = () => {
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistant) {
      orchestratorService.receiveInput({ userId: 'demo-user', type: 'text', content: lastAssistant.content });
    }
  };

  return (
    <div className="flex flex-col h-full p-4 bg-card rounded-xl border border-border">
      <ChatBox
        messages={messages}
        setMessages={setMessages}
        onMicClick={() => {
          if (!hasRecognitionSupport) {
            alert('Speech recognition not supported in this browser.');
            return;
          }
          if (listening) {
            stopListening();
          } else {
            startListening();
          }
        }}
        isSpeaking={speaking || listening}
      />
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm text-foreground"
        />
        <button
          onClick={handleSend}
          className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          disabled={!inputText.trim()}
        >
          Send
        </button>
        <button
          onClick={repeatLastResponse}
          className="p-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary/30"
        >
          Repeat
        </button>
      </div>
    </div>
  );
};

export default VoiceAssistantV2;