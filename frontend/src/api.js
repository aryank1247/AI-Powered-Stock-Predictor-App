import axios from "axios";

const BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

export async function fetchPredictions(ticker, model) {
  const url = `${BASE}/predict/${ticker}/${model}`;
  const res = await axios.get(url);
  return res.data;
}