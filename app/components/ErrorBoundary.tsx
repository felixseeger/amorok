import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-4">
          <h1 className="text-4xl md:text-6xl font-mr-dafoe tracking-normal mb-6">
            Something went wrong
          </h1>
          <p className="text-white/60 text-center max-w-md mb-8">
            An unexpected error occurred. Please refresh the page or try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 border border-white/30 hover:bg-white hover:text-black transition-all font-mr-dafoe tracking-normal text-xl"
          >
            Refresh
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-8 text-xs text-red-400 max-w-2xl overflow-auto">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
