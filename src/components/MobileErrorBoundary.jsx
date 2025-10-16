import React from 'react';

class MobileErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error for mobile debugging
    console.error('Mobile Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 p-4 flex flex-col items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Error en Móvil Detectado
            </h2>
            <div className="text-sm text-gray-700 mb-4">
              <strong>Error:</strong> {this.state.error && this.state.error.toString()}
            </div>
            <div className="text-xs text-gray-500 mb-4">
              <strong>Stack:</strong>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
            <button 
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MobileErrorBoundary;