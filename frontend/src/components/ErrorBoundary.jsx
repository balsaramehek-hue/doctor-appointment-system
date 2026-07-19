import { Component } from 'react'
import { Link } from 'react-router-dom'
import { FaExclamationTriangle, FaHome, FaRedo } from 'react-icons/fa'

/**
 * Global error boundary. Catches unexpected render errors anywhere in the
 * component tree and shows a friendly fallback with reload / home actions
 * instead of a blank screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Log server-side only in production; keep console clean in dev.
    if (import.meta.env.PROD) {
      // eslint-disable-next-line no-console
      console.error('Unhandled application error:', error, info)
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <FaExclamationTriangle size={36} />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-slate-900">
            Something went wrong
          </h1>
          <p className="mt-3 max-w-md text-sm text-slate-500">
            An unexpected error occurred while displaying this page. You can try
            reloading, or return to the home page.
          </p>
          {this.state.error?.message && import.meta.env.DEV && (
            <pre className="mt-4 max-w-md overflow-auto rounded-xl bg-slate-100 p-3 text-left text-xs text-slate-600">
              {this.state.error.message}
            </pre>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={this.handleReload} className="btn-primary">
              <FaRedo /> Reload Page
            </button>
            <Link to="/" className="btn-outline">
              <FaHome /> Return to Home
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
