
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { sendMessageToAI } from './services/geminiService';

// Helper component for the typing indicator, defined outside the main component
const LoadingIndicator: React.FC = () => (
  <div className="flex justify-start items-center">
    <div className="bg-gray-700 text-white rounded-lg p-3 max-w-lg">
      <div className="flex items-center justify-center space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  </div>
);

// Helper component for individual chat messages, defined outside the main component
interface ChatMessageProps {
  message: Message;
}
const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex items-end ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`px-4 py-2 rounded-xl max-w-lg whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-700 text-gray-200 rounded-bl-none'
        }`}
        {...(!isUser && { dangerouslySetInnerHTML: { __html: message.text.replace(/\n/g, '<br />') } })}
      >
        {isUser ? message.text : null}
      </div>
    </div>
  );
};

function App() {
  const initialMessage: Message = {
    id: 'init-1',
    sender: 'ai',
    text: 'Dobar dan. Krećemo s vježbanjem. Očekujem potpunu pažnju.\nPrvi zadatak: Koliko je <strong>5 + 4</strong>?\n\nTrebaš li detaljno objašnjenje?'
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userInput.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    const aiResponseText = await sendMessageToAI(userMessage.text);
    
    const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <header className="bg-gray-800 shadow-md p-4">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-200">AI Vijeće Mentora: Matematika</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-4">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && <LoadingIndicator />}
          <div ref={chatEndRef} />
        </div>
      </main>

      <footer className="p-4 sm:p-6 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2 sm:space-x-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Unesi svoj odgovor..."
            disabled={isLoading}
            className="flex-1 bg-gray-800 border border-gray-600 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-gray-200"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="sr-only">Pošalji</span>
          </button>
        </form>
      </footer>
    </div>
  );
}

export default App;
