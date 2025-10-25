import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createErrorReport, logError } from '@/lib/error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any | null;
}

/**
 * Global Error Boundary to catch and display React errors gracefully
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logError(error, 'ErrorBoundary');
    
    // Create error report
    const report = createErrorReport(error, errorInfo);
    console.error('Error Report:', report);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 dark:bg-red-900 p-3">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">Oops! Something went wrong</CardTitle>
              <CardDescription className="mt-2">
                We encountered an unexpected error. Don't worry, your progress is saved!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                    {this.state.error.toString()}
                  </p>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                        Stack trace
                      </summary>
                      <pre className="text-xs mt-2 overflow-x-auto text-gray-600 dark:text-gray-400">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-error-retry"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="flex-1"
                  data-testid="button-error-reload"
                >
                  Reload Page
                </Button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                If the problem persists, please contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
