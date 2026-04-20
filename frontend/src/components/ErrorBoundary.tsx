"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full p-8 rounded-[32px] bg-card border border-error/20 shadow-2xl text-center">
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-syne font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-foreground/40 mb-8 font-dm-sans">
              An unexpected error occurred. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-accent text-background font-black rounded-2xl hover:scale-105 transition-all uppercase tracking-widest"
            >
              Reload Application
            </button>
            {process.env.NODE_ENV === "development" && (
              <pre className="mt-8 p-4 bg-black/40 rounded-xl text-left text-xs text-error/80 overflow-auto max-h-40 font-mono">
                {this.state.error?.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
