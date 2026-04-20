"use client";

import React from "react";

interface NavbarProps {
  onToggle: () => void;
  brandText?: string;
}

export default function Navbar({ onToggle, brandText = "QUIZAPP" }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-card-border z-[60] px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-white/5 transition-all text-white group"
          aria-label="Toggle Sidebar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-accent transition-colors"/>
            <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-accent transition-colors"/>
            <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-accent transition-colors"/>
          </svg>
        </button>
        <span className="text-xl font-syne font-black text-white tracking-tighter uppercase">{brandText}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Slot for profile or other info if needed */}
        <div className="hidden md:block h-8 w-[1px] bg-card-border mx-2" />
        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
          USR
        </div>
      </div>
    </header>
  );
}
