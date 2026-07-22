import React from "react";
import "../styles/ErrorBoundary.css";

// Catches render/runtime errors in the subtree so a single thrown error (e.g.
// in the RobotGame canvas loop) shows a graceful fallback instead of a blank
// white screen. Class component because error boundaries have no hooks API.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Kept lightweight; wire up a logging service here if desired.
    console.error("Uncaught error:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-code">:(</div>
          <h1 className="error-boundary-title">Something broke</h1>
          <p className="error-boundary-text">
            An unexpected error occurred. Try heading back to the home page.
          </p>
          <button
            type="button"
            className="error-boundary-btn"
            onClick={this.handleReload}
          >
            Back to home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
