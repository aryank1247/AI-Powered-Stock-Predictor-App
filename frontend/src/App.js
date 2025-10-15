import React from "react";
import ChartDashboard from "./components/Chart";

export default function App() {
  return (
    <div
      style={{
        backgroundColor: "#0f172a", // full background color
        minHeight: "100vh",
        color: "#f8fafc",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
        padding: "40px 20px",
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            color: "#38bdf8", // bright blue title
            marginBottom: "10px",
          }}
        >
          AI Stock Predictor
        </h1>
        <h3
          style={{
            fontSize: "1.2rem",
            color: "#94a3b8",
            fontWeight: "400",
          }}
        >
          by <span style={{ color: "#facc15" }}>Aryan Kohli</span> {/* gold name */}
        </h3>
        <p
          style={{
            marginTop: "10px",
            fontSize: "0.95rem",
            color: "#cbd5e1",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Explore how AI models like Prophet and LSTM forecast S&P 500 stocks
          such as NVIDIA, Tesla, and Mastercard in real time.
        </p>
      </header>

      {/* Chart Section */}
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <ChartDashboard /> {/* this is your working chart logic */}
      </div>

      {/* Footer */}
      <footer
        style={{
          marginTop: "40px",
          fontSize: "0.85rem",
          color: "#64748b",
        }}
      >
        <p>
          <em>
            Created using React, FastAPI, and AI-powered forecasting models.
          </em>
        </p>
        <p>Educational demo — not financial advice.</p>
      </footer>
    </div>
  );
}
