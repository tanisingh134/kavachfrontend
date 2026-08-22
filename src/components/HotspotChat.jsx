import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, User, ShieldAlert, CornerDownRight } from 'lucide-react';

const BACKEND_URL = 'https://kavachbackend-f77h.onrender.com';

export default function HotspotChat({ hotspot, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (hotspot) {
      // Clear previous history and set welcome message based on selected hotspot
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hello! I am the Kavach AI Threat Assessor. I am analyzing the reported "${hotspot.type}" incident near coordinates [${hotspot.lat.toFixed(4)}, ${hotspot.lng.toFixed(4)}]. Feel free to ask me about peak hour trends, security patrols, or safe alternatives.`
        }
      ]);
    }
  }, [hotspot]);

  useEffect(() => {
    // Auto-scroll chat to bottom
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg = { id: `u_${Date.now()}`, role: 'user', content: inputValue.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat-hotspot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: hotspot.type,
          riskLevel: hotspot.riskLevel,
          description: hotspot.description,
          message: userMsg.content
        })
      });
      const data = await res.json();
      
      setMessages((prev) => [
        ...prev,
        { id: `a_${Date.now()}`, role: 'assistant', content: data.response || "No response received." }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: `err_${Date.now()}`, role: 'assistant', content: "Sorry, I lost connection to the safety intelligence core." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputValue(question);
  };

  if (!hotspot) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] z-[3500] bg-safety-card border-l border-safety-border shadow-2xl flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-safety-border flex justify-between items-center bg-safety-dark/80">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-safety-accent" />
          <div>
            <h3 className="font-bold text-sm text-slate-100">Crime Explanation Agent</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hotspot Q&A</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-safety-border text-slate-400 hover:text-slate-200 transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Selected Hotspot Details Box */}
      <div className="p-4 border-b border-safety-border bg-safety-dark/30 flex flex-col gap-1.5 text-xs">
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-200 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-safety-rose" />
            {hotspot.type}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            hotspot.riskLevel === 'High' ? 'bg-safety-rose/15 text-safety-rose' :
            hotspot.riskLevel === 'Medium' ? 'bg-safety-amber/15 text-safety-amber' :
            'bg-safety-emerald/15 text-safety-emerald'
          }`}>
            {hotspot.riskLevel} Risk
          </span>
        </div>
        <p className="text-slate-400 italic font-medium">"{hotspot.description}"</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg) => {
          const isBot = msg.role === 'assistant';
          return (
            <div key={msg.id} className={`flex gap-2.5 max-w-[85%] ${isBot ? 'self-start' : 'self-end flex-row-reverse'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 ${
                isBot ? 'bg-safety-accent/20 text-safety-accent' : 'bg-slate-700'
              }`}>
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                isBot 
                  ? 'bg-safety-dark/50 border border-safety-border text-slate-200 rounded-tl-none' 
                  : 'bg-safety-accent text-white rounded-tr-none'
              }`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex gap-2.5 self-start">
            <div className="w-7 h-7 rounded-full bg-safety-accent/20 text-safety-accent flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-safety-dark/50 border border-safety-border p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Questions suggestion pills */}
      <div className="p-3 bg-safety-dark/35 border-t border-safety-border flex flex-wrap gap-2">
        <button 
          onClick={() => handleQuickQuestion("What time does this area get dangerous?")}
          className="text-[10px] bg-safety-card hover:bg-safety-border border border-safety-border text-slate-300 py-1.5 px-2.5 rounded-lg flex items-center gap-0.5 transition"
        >
          <CornerDownRight className="w-3 h-3 text-safety-accent" /> Dangerous hours?
        </button>
        <button 
          onClick={() => handleQuickQuestion("Are there active police patrols here?")}
          className="text-[10px] bg-safety-card hover:bg-safety-border border border-safety-border text-slate-300 py-1.5 px-2.5 rounded-lg flex items-center gap-0.5 transition"
        >
          <CornerDownRight className="w-3 h-3 text-safety-accent" /> Police presence?
        </button>
        <button 
          onClick={() => handleQuickQuestion("How can I cross this zone safely?")}
          className="text-[10px] bg-safety-card hover:bg-safety-border border border-safety-border text-slate-300 py-1.5 px-2.5 rounded-lg flex items-center gap-0.5 transition"
        >
          <CornerDownRight className="w-3 h-3 text-safety-accent" /> Safe precautions?
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 bg-safety-dark/80 border-t border-safety-border flex gap-2">
        <input
          type="text"
          placeholder="Ask about this threat..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-safety-card text-xs text-slate-100 border border-safety-border focus:border-safety-accent rounded-xl px-3 py-2.5 outline-none"
        />
        <button 
          type="submit" 
          disabled={isLoading || !inputValue.trim()}
          className="bg-safety-accent hover:bg-violet-700 text-white p-2.5 rounded-xl transition flex items-center justify-center disabled:opacity-50"
        >
          <Send className="w-4 h-4 fill-current" />
        </button>
      </form>
    </div>
  );
}
