import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRestart = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container" style={{
          padding: '2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          margin: '2rem'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#d32f2f', marginBottom: '1rem' }}>Something went wrong</h2>
          <p style={{ color: '#666', maxWidth: '500px', marginBottom: '2rem' }}>
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', margin: '1rem 0', padding: '1rem', background: '#f5f5f5', borderRadius: '4px', width: '100%', maxWidth: '600px' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '0.5rem', fontWeight: 'bold' }}>Error Details (Dev Only)</summary>
              {this.state.error && this.state.error.toString()}
            </details>
          )}
          <button
            onClick={this.handleRestart}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1565c0'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1976d2'}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
