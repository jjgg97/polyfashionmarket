'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6 text-center px-8">
          <p className="text-5xl">⚠</p>
          <h2 className="font-serif text-3xl">Something went wrong</h2>
          <p className="text-gray-400 text-sm max-w-sm font-mono">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="border border-white/20 px-8 py-3 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
