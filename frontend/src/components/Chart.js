// src/components/Chart.js
import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function ChartDashboard() {
  const [model, setModel] = useState("prophet"); // "prophet" | "lstm" (lowercase for API)
  const [ticker, setTicker] = useState("NVDA");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handlePredict() {
    setLoading(true);
    setError(null);
    try {
      const url = `http://127.0.0.1:8000/predict/${ticker}/${model}`;
      const res = await fetch(url);

      // Handle non-200 HTTP statuses safely
      if (!res.ok) {
        throw new Error(`API error ${res.status}: ${res.statusText}`);
      }

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Failed to parse API response as JSON.");
      }

      // Backend can return { error: "..." }
      if (!data || data.error) {
        throw new Error(data?.error || "Unknown error from API.");
      }

      // Hard guards to prevent runtime crashes
      if (!Array.isArray(data.dates) || !Array.isArray(data.predictions)) {
        throw new Error("API did not return dates/predictions arrays.");
      }
      if (data.dates.length === 0 || data.predictions.length === 0) {
        throw new Error("No data returned for this selection.");
      }

      const borderColor = model === "prophet" ? "#38bdf8" : "#22c55e";
      const backgroundColor =
        model === "prophet" ? "rgba(56,189,248,0.15)" : "rgba(34,197,94,0.15)";

      setChartData({
        labels: data.dates,
        datasets: [
          {
            label: `${ticker} (${model.toUpperCase()})`,
            data: data.predictions,
            borderColor,
            backgroundColor,
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 0,
          },
        ],
      });
    } catch (err) {
      setChartData(null); // ensure chart unmounts on error
      setError(err.message || "Prediction failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        color: "#f8fafc",
        padding: 30,
        borderRadius: 16,
        boxShadow: "0 4px 25px rgba(0,0,0,0.4)",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      {/* Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            backgroundColor: "#0f172a",
            color: "#f8fafc",
            border: "1px solid #334155",
            fontSize: "0.95rem",
            transition: "0.2s",
          }}
        >
          <option value="prophet">Prophet</option>
          <option value="lstm">LSTM</option>
        </select>

        <select
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            backgroundColor: "#0f172a",
            color: "#f8fafc",
            border: "1px solid #334155",
            fontSize: "0.95rem",
            transition: "0.2s",
          }}
        >
          <option value="NVDA">NVIDIA</option>
          <option value="TSLA">Tesla</option>
          <option value="MA">Mastercard</option>
          <option value="AAPL">Apple</option>
          <option value="SPY">S&P 500 (SPY)</option>
        </select>

        <button
          onClick={handlePredict}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            backgroundColor: loading ? "#7dd3fc" : "#38bdf8",
            color: "#0f172a",
            fontWeight: "bold",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "0.95rem",
            transition: "0.2s ease-in-out",
          }}
          onMouseOver={(e) => {
            if (!loading) e.target.style.backgroundColor = "#0ea5e9";
          }}
          onMouseOut={(e) => {
            if (!loading) e.target.style.backgroundColor = "#38bdf8";
          }}
        >
          {loading ? "Predicting..." : "Predict"}
        </button>
      </div>

      {/* Status */}
      {loading && (
        <p style={{ marginTop: 8, color: "#94a3b8", fontStyle: "italic" }}>
          Fetching prediction from AI model…
        </p>
      )}
      {error && (
        <p style={{ marginTop: 8, color: "#f87171" }}>
          Error: {error}
        </p>
      )}

      {/* Chart */}
      {chartData && (
        <div
          style={{
            height: "350px",
            marginTop: 24,
            backgroundColor: "#0f172a",
            borderRadius: 12,
            padding: 10,
          }}
        >
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: { color: "#e2e8f0" },
                },
              },
              scales: {
                x: { ticks: { color: "#94a3b8" } },
                y: { ticks: { color: "#94a3b8" } },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
