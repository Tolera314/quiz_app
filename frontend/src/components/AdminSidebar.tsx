"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user || user.role !== "admin") return null;

  const navItems = [
    { name: "Command Center", href: "/admin",        icon: <StatsIcon /> },
    { name: "User Directory", href: "/admin/users",  icon: <UsersIcon /> },
    { name: "Create Quiz",    href: "/admin/create", icon: <PlusIcon />  },
    { name: "Import QuizAPI", href: "/admin/import", icon: <ImportIcon /> },
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
          <h2 className="text-xl font-syne font-black text-white tracking-widest uppercase">Admin Port</h2>
          <button onClick={onClose} className="text-foreground/20 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg">✕</button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <div className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.3em] mb-6 pl-4 font-mono">Operations</div>
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
            <p className="text-[10px] text-accent font-black uppercase tracking-[0.2em] mt-1">SUPER_USER</p>
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
const StatsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const ImportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
