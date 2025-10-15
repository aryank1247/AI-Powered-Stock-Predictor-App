import os
import re
import os
import pandas as pd
from prophet import Prophet
from alpha_vantage.timeseries import TimeSeries

# ---------- CONFIG ----------
# Option A: Hardcode your key
ALPHA_KEY = "149OCNE3O9X2TPRJ"

# Option B: Read from environment variable (preferred)
# If you used setx ALPHAVANTAGE_API_KEY, this will pick it up automatically:
ALPHA_KEY = os.getenv("ALPHAVANTAGE_API_KEY", ALPHA_KEY)

CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", "cache")
os.makedirs(CACHE_DIR, exist_ok=True)
# -----------------------------

def _safe_name(ticker: str) -> str:
    return re.sub(r"[^A-Za-z0-9_]+", "_", ticker.upper())

def _load_cache(ticker: str):
    path = os.path.join(CACHE_DIR, f"{_safe_name(ticker)}.csv")
    return pd.read_csv(path) if os.path.exists(path) else None

def _save_cache(ticker: str, df: pd.DataFrame):
    path = os.path.join(CACHE_DIR, f"{_safe_name(ticker)}.csv")
    df.to_csv(path, index=False)

def _download_df(ticker: str) -> pd.DataFrame:
    """
    Download full daily adjusted history from Alpha Vantage and
    standardize to Prophet format: columns ds (datetime), y (float).
    """
    try:
        ts = TimeSeries(key=ALPHA_KEY, output_format="pandas")
        data, _ = ts.get_daily(symbol=ticker, outputsize="full")
        df = data.reset_index()
        # Alpha Vantage column names are like '5. adjusted close'
        df = df.rename(columns={"date": "ds", "4. close": "y"})
        df["ds"] = pd.to_datetime(df["ds"])              # tz-naive already
        df = df.sort_values("ds").dropna(subset=["ds", "y"]).reset_index(drop=True)
        return df
    except Exception as e:
        print(f"AlphaVantage download failed: {e}")
        return pd.DataFrame()

def predict_prophet(ticker: str):
    try:
        # 1) Load cache or download
        df = _load_cache(ticker)
        if df is None or len(df) < 2:
            df = _download_df(ticker)
            if df.empty or len(df) < 2:
                return {"error": f"Failed to get data for {ticker}. Check API key or try again."}
            _save_cache(ticker, df)

        # 2) Forecast with Prophet
        m = Prophet(daily_seasonality=True)
        m.fit(df)
        future = m.make_future_dataframe(periods=30)
        forecast = m.predict(future)
        tail = forecast.tail(60)

        # 3) Clean dates for the frontend chart (plain 'YYYY-MM-DD' strings)
        dates = [d.strftime("%Y-%m-%d") for d in tail["ds"]]
        return {
            "ticker": ticker.upper(),
            "model": "Prophet",
            "dates": dates,
            "predictions": tail["yhat"].round(2).tolist(),
        }

    except Exception as e:
        return {"error": f"Prediction failed for {ticker}: {e}"}

