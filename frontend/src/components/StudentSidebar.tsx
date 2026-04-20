"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = [
    { name: "The Arena", href: "/dashboard", icon: <HomeIcon /> },
    { name: "Attempt Lore", href: "/history", icon: <ScrollIcon /> },
  ];

  return (
    <>
      {/* OVERLAY for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[70] md:hidden" 
          onClick={onClose}
        />
      )}

      <aside className={`fixed left-0 top-0 h-screen w-72 bg-card border-r border-card-border flex flex-col z-[80] transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-8 pb-4 flex justify-between items-center">
          <h2 className="text-xl font-syne font-black text-accent tracking-tighter uppercase italic">Vanguard</h2>
          <button onClick={onClose} className="text-foreground/20 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg">✕</button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <div className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.3em] mb-6 pl-4 font-mono">Quests</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => { if (window.innerWidth < 768) onClose(); }}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm group ${
                pathname === item.href 
                  ? "bg-accent text-background shadow-[0_15px_30px_rgba(200,255,0,0.15)]" 
                  : "text-foreground/40 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={`transition-colors ${pathname === item.href ? "text-background" : "text-accent group-hover:text-white"}`}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-card-border bg-background/20">
          <div className="mb-6 px-4 py-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-foreground/40 uppercase tracking-[0.2em] mt-1">SQUIRE</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-error text-sm font-bold border border-error/20 hover:bg-error/10 transition-all font-syne uppercase"
          >
            <span>🚪</span> Terminate Session
          </button>
        </div>
      </aside>
    </>
  );
}

// Icons
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const ScrollIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
