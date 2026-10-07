import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Without this, ANY uncaught error in ANY component's render — anywhere in
 * the tree — unmounts the whole React app and leaves a blank white page,
 * with no indication anything went wrong. This catches it and shows a
 * recoverable screen instead. It does not catch errors in event handlers
 * (e.g. a bad onClick) — only render-time errors; that's a React limitation.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
          <div className="surface-card max-w-sm p-8 text-center">
            <AlertTriangle className="mx-auto mb-3 text-danger" size={32} />
            <h1 className="text-lg font-semibold text-ink">Something went wrong</h1>
            <p className="mt-2 text-sm text-ink-muted">
              This page hit an unexpected error. Reloading usually fixes it.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-3 max-h-32 overflow-auto rounded-control bg-canvas p-3 text-left text-xs text-danger">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="mt-4 w-full rounded-control bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}