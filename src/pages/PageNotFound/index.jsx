import React from "react";
import { Link } from "react-router-dom";
import "./index.css";

const PageNotFound = () => {
  return (
    <main className="nf-wrapper" aria-labelledby="nf-title">
      <div className="nf-card" role="region" aria-label="Page not found">
        <div className="nf-code" aria-hidden="true">404</div>

        <h1 id="nf-title" className="nf-title">Page not found</h1>
        <p className="nf-text">
          The page you’re looking for doesn’t exist or was moved.
        </p>

        <nav className="nf-actions" aria-label="404 actions">
          <Link className="nf-btn nf-btn-primary" to="/">Go Home</Link>
          <button
            className="nf-btn nf-btn-ghost"
            onClick={() => window.history.length > 1 ? window.history.back() : (window.location.href = "/")}
          >
            Go Back
          </button>
        </nav>
      </div>

      <footer className="nf-footer" aria-hidden="true">
        <span className="nf-dot"></span>
        <span className="nf-dot"></span>
        <span className="nf-dot"></span>
      </footer>
    </main>
  );
};

export default PageNotFound;
