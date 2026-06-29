import React, { Component } from 'react';
import { BiErrorCircle } from 'react-icons/bi';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error('Unhandled App Crash caught by Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md border border-slate-100 space-y-4 text-center">
            <div className="inline-flex rounded-full bg-red-50 p-3 text-red-500">
              <BiErrorCircle size={32} />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800">Something went wrong</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              An unexpected error occurred in the user interface. Please try refreshing the webpage.
            </p>
            <div className="pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-500 shadow-md transition-all focus:outline-none"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
