import { Component, type ErrorInfo, type ReactNode } from 'react';

type RouteErrorBoundaryProps = {
  children: ReactNode;
  title?: string;
  onRetry?: () => void;
};

type RouteErrorBoundaryState = {
  error: Error | null;
};

export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[RouteErrorBoundary]', error, info.componentStack);
  }

  private handleRetry = (): void => {
    this.setState({ error: null });
    this.props.onRetry?.();
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <main className="page">
          <section className="panel flow">
            <h2>{this.props.title ?? 'Something went wrong'}</h2>
            <p className="hint">{this.state.error.message}</p>
            <button type="button" className="btn-primary" onClick={this.handleRetry}>
              Try again
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
