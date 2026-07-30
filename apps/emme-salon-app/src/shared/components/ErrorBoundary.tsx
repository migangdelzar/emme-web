import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
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

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 font-sans text-foreground">
          <div className="max-w-md w-full premium-card flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="size-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight mb-2">
              Algo salió mal
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              Ocurrió un error inesperado. Hemos registrado el problema para solucionarlo lo antes posible.
            </p>
            
            <button
              onClick={this.handleReload}
              className="apple-button w-full bg-primary text-primary-foreground"
            >
              <RefreshCw className="size-4" />
              Recargar aplicación
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 p-4 bg-muted rounded-xl w-full text-left overflow-auto text-xs font-mono text-muted-foreground">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
