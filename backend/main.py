from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.model_lstm import predict_lstm
from models.model_prophet import predict_prophet
# from models.model_pycaret import predict_pycaret   # PyCaret removed


app = FastAPI(title="AI Stock Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "AI Stock Predictor API running"}

@app.get("/predict/{ticker}/{model_name}")
def predict_stock(ticker: str, model_name: str):
    ticker = ticker.upper()
    if model_name == "lstm":
        return predict_lstm(ticker)
    elif model_name == "prophet":
        return predict_prophet(ticker)
   # elif model_name == "pycaret":
  #      return predict_pycaret(ticker)
    else:
        return {"error": "Invalid model name. Use one of: lstm, prophet, pycaret"}