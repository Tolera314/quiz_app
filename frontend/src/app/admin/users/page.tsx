"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/utils/api";
import AdminSidebar from "@/components/AdminSidebar";
import Navbar from "@/components/Navbar";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { attempts: number };
}

export default function UserDirectoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/dashboard");
      return;
    }

    const fetchUsers = async () => {
      try {
        const data = await apiFetch("/admin/users");
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user?.role === "admin") {
      fetchUsers();
    }
  }, [user, authLoading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-accent">Loading records...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar onToggle={() => setIsSidebarOpen(!isSidebarOpen)} brandText="Admin Core" />
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className={`transition-all duration-300 pt-16 ${isSidebarOpen ? "md:pl-72" : "pl-0"}`}>
        <div className="p-6 md:p-12 font-dm-sans">
          <header className="mb-12">
            <h1 className="text-4xl font-syne font-black text-white uppercase tracking-tighter">User Directory</h1>
            <p className="text-foreground/40 italic">Manage platform access and monitor user statistics.</p>
          </header>

          <section>
            <div className="bg-card border border-card-border rounded-[32px] overflow-hidden shadow-2xl">
              <table className="w-full text-left font-dm-sans">
                <thead>
                  <tr className="border-b border-card-border bg-white/5">
                    <th className="p-6 text-[10px] font-bold uppercase text-foreground/40 tracking-[0.2em]">Identity</th>
                    <th className="p-6 text-[10px] font-bold uppercase text-foreground/40 tracking-[0.2em]">Role</th>
                    <th className="p-6 text-[10px] font-bold uppercase text-foreground/40 tracking-[0.2em] text-right">Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-card-border last:border-0 hover:bg-white/5 transition-all group">
                      <td className="p-6">
                        <p className="font-bold text-white group-hover:text-accent transition-colors">{u.name}</p>
                        <p className="text-[10px] text-foreground/40 truncate max-w-[200px]">{u.email}</p>
                      </td>
                      <td className="p-6">
                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${u.role === 'admin' ? 'bg-accent/20 text-accent border border-accent/20' : 'bg-white/5 text-foreground/40'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <span className="inline-block px-4 py-2 rounded-xl bg-background/50 text-white text-xs font-black">
                          {u._count.attempts} Attempts
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="p-20 text-center text-foreground/20 italic">No users registered in the system yet.</div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
