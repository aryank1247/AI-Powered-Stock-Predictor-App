import yfinance as yf
import pandas as pd
from pycaret.regression import setup, compare_models, predict_model

def predict_pycaret(ticker: str):
    # Prepare a simple supervised dataset
    df = yf.download(ticker, period="3y", interval="1d")[["Close"]].dropna().reset_index()
    if df.shape[0] < 200:
        return {"ticker": ticker, "model": "PyCaret", "error": "Not enough data"}

    # Create a simple feature: day index
    df["day_index"] = range(len(df))

    # PyCaret setup & model selection (silent for speed)
    setup(data=df, target="Close", session_id=42, silent=True, verbose=False)
    best = compare_models()  # Auto-select best baseline model

    preds = predict_model(best)
    tail = preds.tail(60)  # last 60 rows for charting

    return {
        "ticker": ticker,
        "model": "PyCaret",
        "predictions": tail["Label"].round(2).tolist()
    }