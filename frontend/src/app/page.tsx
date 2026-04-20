import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-6xl md:text-8xl font-syne font-black text-white leading-tight">
          TEST YOUR <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-white">POTENTIAL.</span>
        </h1>

        <p className="text-lg md:text-xl text-foreground/60 font-dm-sans max-w-2xl mx-auto leading-relaxed">
          The ultimate quiz platform for experts. Real-time persistent attempts, a powerful admin engine, and a design that moves with you.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link
            href="/auth/register"
            className="w-full sm:w-auto px-10 py-4 bg-accent text-background font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all text-lg shadow-[0_0_20px_rgba(200,255,0,0.3)]"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-10 py-4 border border-card-border text-white font-bold rounded-2xl hover:bg-white/5 transition-all text-lg"
          >
            Login to Account
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-10 text-foreground/20 text-xs font-mono tracking-widest uppercase">
        Built for the Next Generation of Learners
      </footer>
    </main>
  );
}
