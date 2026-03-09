// Note: This must be a class component. React error boundaries require
// getDerivedStateFromError and componentDidCatch, which are only available
// on class components. This is the sole exception to the project's
// functional-components-only convention.
import { Component, Fragment } from 'react';
import { AlertTriangle, RefreshCw, List } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, resetKey: 0 };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState(s => ({ hasError: false, error: null, resetKey: s.resetKey + 1 }));
  };

  handleGoToList = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState(s => ({ hasError: false, error: null, resetKey: s.resetKey + 1 }));
  };

  render() {
    if (!this.state.hasError) {
      return <Fragment key={this.state.resetKey}>{this.props.children}</Fragment>;
    }

    const { level = 'view' } = this.props;

    if (level === 'top') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              The application encountered an unexpected error. Please reload to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={16} />
              Reload
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-sm w-full text-center">
          <AlertTriangle size={36} className="text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            This view encountered an error
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Something went wrong loading this content.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
            {this.props.onReset && (
              <button
                onClick={this.handleGoToList}
                className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                <List size={14} />
                Go to List View
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
