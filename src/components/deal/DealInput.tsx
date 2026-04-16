"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Mic, SendHorizontal, Paperclip } from 'lucide-react';

export const DealInput = ({ onSend }: { onSend: (val: string) => Promise<void> | void }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Main action handler (async + loader)
  const handleAction = async (text: string = input) => {
    if (!text.trim() || loading) return;

    try {
      setLoading(true); // start spinner
      await onSend(text);
      setInput("");
    } catch (error) {
      console.error("Error processing deal:", error);
    } finally {
      setLoading(false); // stop spinner
    }
  };

  // Chips click handler
  const handleChipClick = (suggestion: string) => {
    const cleanText = suggestion.replace(/"/g, "");
    handleAction(cleanText);
  };

  return (
    <footer className="fixed bottom-0 left-80 right-0 p-8 z-40 bg-gradient-to-t from-primary-dark via-primary-dark to-transparent">
      <div className="max-w-4xl mx-auto">
        
        <div className="glass-panel border border-white/10 rounded-[2rem] p-2 flex items-center gap-2 shadow-[0_-20px_60px_rgba(0,0,0,0.5)] bg-primary-dark/80 backdrop-blur-2xl transition-all focus-within:border-secondary/40">
          
          <button className="ml-2 p-2 text-secondary-light/60 hover:text-secondary transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAction();
              }
            }}
            className="flex-grow bg-transparent border-none focus:ring-0 px-4 py-2 text-neutral text-sm placeholder:text-secondary-light/40 resize-none max-h-40 custom-scrollbar outline-none disabled:opacity-50"
            placeholder="Ask follow-up or provide deal details..."
          />

          <div className="flex items-center gap-2 pr-1">
            
            {/* Process Button with Spinner */}
            <button 
              onClick={() => handleAction()}
              disabled={loading}
              className="px-8 py-2.5 rounded-full text-xs font-bold bg-accent text-primary-dark shadow-lg shadow-black/20 hover:bg-secondary transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-primary-dark border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </>
              ) : (
                <>
                  Process Deal
                  <SendHorizontal className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <button 
              disabled={loading}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-primary hover:bg-secondary/20 text-secondary transition-all border border-white/5 disabled:opacity-50"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Suggestion Chips */}
        <div className="mt-4 flex justify-center gap-4 text-[10px] text-secondary-light/40 uppercase tracking-widest font-medium">
          {[
            '"Summarize contingencies"',
            '"Check FHA requirements"',
            '"Draft follow-up email"'
          ].map((suggestion, idx) => (
            <React.Fragment key={idx}>
              <span 
                onClick={() => handleChipClick(suggestion)}
                className="hover:text-secondary cursor-pointer transition-colors hover:scale-105 active:scale-95"
              >
                {suggestion}
              </span>
              {idx < 2 && <span className="text-primary-light">•</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </footer>
  );
};