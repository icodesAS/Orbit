'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Orbit uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-canvas text-ink flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-[14px] border border-line bg-raised p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-bad">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h1 className="text-[15px] font-semibold text-ink">Something went wrong</h1>
            </div>
            <p className="text-[13px] text-ink-2 leading-relaxed">
              Orbit encountered an unexpected error. Your saved data is intact. You can reload or reset your local session.
            </p>
            {this.state.error?.message && (
              <pre className="p-3 rounded-[8px] bg-canvas border border-line-faint text-[11px] font-mono text-ink-3 overflow-x-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-primary text-[12px] flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload app</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="btn btn-secondary text-[12px]"
              >
                Reset session
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
