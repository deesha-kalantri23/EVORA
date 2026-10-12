import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('EVORA ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center bg-[#131B2B]/80 border border-rose-500/30 rounded-3xl m-4 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {this.props.fallbackTitle || 'Component Render Issue'}
            </h3>
            <p className="text-xs text-rose-300/90 font-mono mt-2 max-w-lg bg-black/40 p-3 rounded-xl border border-rose-900/50 break-words text-left">
              {this.state.error?.message || 'An unknown render error occurred.'}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Page</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
