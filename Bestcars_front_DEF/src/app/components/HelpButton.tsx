import React from 'react';
import { MessageCircle } from 'lucide-react';

export function HelpButton() {
  return (
    <button
      type="button"
      className="fixed right-6 bottom-6 w-14 h-14 rounded-full border border-white/10 bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-600/30 grid place-items-center cursor-pointer hover:scale-110 transition-all duration-200 group z-50"
      aria-label="Ayuda"
    >
      <MessageCircle className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
    </button>
  );
}