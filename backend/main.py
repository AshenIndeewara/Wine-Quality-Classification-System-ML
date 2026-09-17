"""Wine quality prediction API.

Run: uvicorn main:app --reload --app-dir backend

Loads the pipeline exported by ml/notebooks/wine_quality.ipynb and serves predictions from it.
Nothing here trains, and nothing is written -- /api/predict is stateless. There
is no authentication because the service holds no user data and exposes nothing
beyond the published model metrics; deploying it beyond localhost would need
that revisited.
"""

from contextlib import asynccontextmanager
from functools import lru_cache
from pathlib import Path
from typing import Literal

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator

ROOT = Path(__file__).resolve().parents[1]
PIPELINE_PATH = ROOT / "ml" / "models" / "wine_quality_pipeline.pkl"
CLASS_ORDER = ["Low", "Medium", "High"]




class ModelNotAvailable(RuntimeError):
    """Raised when the artefacts are missing -- i.e. training has not been run."""


@lru_cache(maxsize=1)
def load_pipeline():
    if not PIPELINE_PATH.exists():
        raise ModelNotAvailable(f"{PIPELINE_PATH.name} not found. Run the wine_quality notebook first.")
    return joblib.load(PIPELINE_PATH)


def is_ready() -> bool:
    return PIPELINE_PATH.exists()


def model_name(pipeline) -> str:
    return pipeline.named_steps["model"].__class__.__name__



class WineFeatures(BaseModel):
    """The 12 inputs a user supplies.

    The bounds reject physically impossible input (negative sulphur dioxide, a
    pH of 40); they are deliberately wider than the training data, so a real
    but unusual wine is still accepted.
    """

    fixed_acidity: float = Field(..., gt=0, le=30, description="Tartaric acid, g/dm^3")
    volatile_acidity: float = Field(..., ge=0, le=3, description="Acetic acid, g/dm^3")
    citric_acid: float = Field(..., ge=0, le=3, description="Citric acid, g/dm^3")
    residual_sugar: float = Field(..., ge=0, le=100, description="Sugar after fermentation, g/dm^3")
    chlorides: float = Field(..., ge=0, le=2, description="Sodium chloride, g/dm^3")
    free_sulfur_dioxide: float = Field(..., ge=0, le=500, description="Free SO2, mg/dm^3")
    total_sulfur_dioxide: float = Field(..., gt=0, le=600, description="Total SO2, mg/dm^3")
    # Wine is mostly water (1.0); fortified or very sweet wines sit a little either side.
    density: float = Field(..., gt=0.90, lt=1.20, description="Density, g/cm^3")
    # Wine is an acidic beverage. Outside 2-5 is not wine.
    ph: float = Field(..., ge=2.0, le=5.0, description="Acidity on the pH scale")
    sulphates: float = Field(..., ge=0, le=5, description="Potassium sulphate, g/dm^3")
    # Unfortified wine cannot realistically exceed ~25% ABV.
    alcohol: float = Field(..., gt=0, le=25, description="Alcohol, % by volume")
    wine_type: Literal["red", "white"] = Field(..., description="Wine variant")

    @model_validator(mode="after")
    def check_sulfur_dioxide_consistency(self) -> "WineFeatures":
        """Free SO2 is a component of total SO2, so it cannot exceed it.

        Range checks alone cannot catch this -- it is a relationship between two
        fields, and both values can be individually plausible while the pair is
        impossible.
        """
        if self.free_sulfur_dioxide > self.total_sulfur_dioxide:
            raise ValueError(
                "free_sulfur_dioxide cannot exceed total_sulfur_dioxide "
                f"(got {self.free_sulfur_dioxide} > {self.total_sulfur_dioxide})"
            )
        return self


class PredictionResponse(BaseModel):
    """Predicted class plus the per-class probability.

    Named `probabilities`, never `confidence`: these are the model's estimated
    class probabilities and have not been calibrated, so calling them confidence
    would overstate what they mean.
    """

    prediction: str
    probabilities: dict[str, float]
    model_name: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: str | None = None



@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the pipeline at startup so the first request is not slow.

    A missing artefact is logged, not fatal: /api/health should still respond so
    the cause is diagnosable.
    """
    try:
        load_pipeline()
        print(f"[startup] model loaded: {model_name(load_pipeline())}")
    except ModelNotAvailable as exc:
        print(f"[startup] WARNING: {exc}")
    yield


app = FastAPI(
    lifespan=lifespan,
    title="Wine Quality Classification API",
    description=(
        "Classifies wine into Low / Medium / High quality from 11 physicochemical "
        "measurements plus the wine variant. Four derived features are calculated "
        "before prediction. Backed by a scikit-learn pipeline "
        "trained on the UCI Wine Quality dataset (Cortez et al., 2009)."
    ),
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
def health() -> dict:
    """Liveness plus whether the model artefacts are actually present."""
    ready = is_ready()
    return {
        "status": "ok" if ready else "degraded",
        "model_loaded": ready,
        "model_name": model_name(load_pipeline()) if ready else None,
    }


@app.post("/api/predict", response_model=PredictionResponse)
def predict(features: WineFeatures) -> dict:
    """Classify one wine.

    Pydantic has already validated ranges and the SO2 relationship by this point;
    a 422 with field details is returned automatically on invalid input.
    """
    try:
        pipeline = load_pipeline()
    except ModelNotAvailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

   
    row = features.model_dump()
    row["wine_type"] = 1 if row["wine_type"] == "white" else 0

    row["total_acidity"] = row["fixed_acidity"] + row["volatile_acidity"] + row["citric_acid"]
    row["bound_sulfur_dioxide"] = row["total_sulfur_dioxide"] - row["free_sulfur_dioxide"]
    row["free_sulfur_ratio"] = row["free_sulfur_dioxide"] / row["total_sulfur_dioxide"]
    row["alcohol_density_ratio"] = row["alcohol"] / row["density"]

   
    X = pd.DataFrame([row])[pipeline.feature_names_in_]

   
    proba = pipeline.predict_proba(X)[0]
    probabilities = {cls: float(p) for cls, p in zip(pipeline.classes_, proba)}

    return {
       
        "prediction": max(probabilities, key=probabilities.get),
        "probabilities": {c: probabilities[c] for c in CLASS_ORDER},
        "model_name": model_name(pipeline),
    }
