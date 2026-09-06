"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Sparkles, RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary atrapó un error no controlado:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-2xl mx-auto p-8 my-6 bg-white dark:bg-zinc-900 rounded-3xl border border-purple-200/80 dark:border-purple-900/50 shadow-2xl text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto shadow-inner border border-purple-300/40">
            <Sparkles className="w-10 h-10 animate-pulse text-amber-400" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="text-xs font-black px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300/40">
              🧙‍♂️ Asistente de Recuperación
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {this.props.fallbackTitle || 'Nuestros duendes mágicos están ocupados'}
            </h2>
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-400 leading-relaxed">
              {this.props.fallbackMessage || 'Hubo un inconveniente temporal al procesar el juego. No te preocupes, puedes reintentarlo en 1 solo clic.'}
            </p>
          </div>

          <button
            onClick={this.handleReset}
            className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all inline-flex items-center gap-2 shadow-lg shadow-purple-500/25"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Volver a Intentar</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
