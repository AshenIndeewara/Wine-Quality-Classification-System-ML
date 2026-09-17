# Wine Quality Classification System

A full-stack machine learning application that predicts wine quality (Low, Medium, High) based on physicochemical measurements using the UCI Wine Quality Dataset.

**Live Demo**: [https://technology-dry-drawing-gauge.trycloudflare.com/](https://technology-dry-drawing-gauge.trycloudflare.com/)

## Project Overview

This project combines a Python-based machine learning pipeline with a modern React frontend to create a complete wine quality classification system. The system uses a Random Forest classifier trained on the UCI Wine Quality Dataset, which contains physicochemical measurements of red and white Portuguese "Vinho Verde" wines.

### Features

- **Machine Learning Pipeline**: Complete workflow from data preprocessing to model training and evaluation
- **Interactive Web Interface**: React frontend with real-time predictions
- **API Integration**: FastAPI backend serving the trained model
- **Comprehensive Visualizations**: Data exploration and model analysis in Jupyter notebook

## Live Demo

Try the application live: [https://technology-dry-drawing-gauge.trycloudflare.com/](https://technology-dry-drawing-gauge.trycloudflare.com/)

Test the prediction interface with sample wine data and see the quality classification in action!

## Table of Contents

- [Project Overview](#project-overview)
- [Live Demo](#live-demo)
- [Dataset Information](#dataset-information)
- [Technical Stack](#technical-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Machine Learning Pipeline](#machine-learning-pipeline)
- [Frontend Application](#frontend-application)
- [Project Structure](#project-structure)
- [Team Members](#team-members)
- [Contributing](#contributing)

## Dataset Information

### Source

The **UCI Wine Quality Dataset** was created by Paulo Cortez (Univ. Minho) and colleagues in 2009. It contains physicochemical measurements and sensory evaluations of Portuguese "Vinho Verde" wines.

**Citation**:
```
P. Cortez, A. Cerdeira, F. Almeida, T. Matos and J. Reis.
Modeling wine preferences by data mining from physicochemical properties.
In Decision Support Systems, Elsevier, 47(4):547-553. ISSN: 0167-9236.
Available at: http://dx.doi.org/10.1016/j.dss.2009.05.016
```

### Dataset Statistics

| Wine Type | Samples | Features | Quality Range |
|-----------|---------|----------|---------------|
| Red | 1,599 | 12 | 3-9 |
| White | 4,898 | 12 | 3-9 |
| **Total** | **6,497** | **13** (with wine_type) | **3-9** |

### Input Features (Physicochemical Tests)

| Feature | Description | Unit |
|---------|-------------|------|
| `fixed_acidity` | Fixed acidity | g/dm³ |
| `volatile_acidity` | Volatile acidity | g/dm³ |
| `citric_acid` | Citric acid | g/dm³ |
| `residual_sugar` | Residual sugar | g/dm³ |
| `chlorides` | Chlorides | g/dm³ |
| `free_sulfur_dioxide` | Free sulfur dioxide | mg/dm³ |
| `total_sulfur_dioxide` | Total sulfur dioxide | mg/dm³ |
| `density` | Density | g/cm³ |
| `ph` | pH level | - |
| `sulphates` | Sulphates | g/dm³ |
| `alcohol` | Alcohol content | % vol |
| `wine_type` | Wine type (0=red, 1=white) | - |

### Output Variable

- **quality**: Sensory quality score (0-10), median of at least 3 evaluations by wine experts
- **quality_class**: Binned into 3 classes for classification:
  - **Low**: scores 3, 4, 5 (37.4% of samples)
  - **Medium**: score 6 (43.7% of samples)
  - **High**: scores 7, 8, 9 (19.0% of samples)

## Technical Stack

### Backend

- **Python**: 3.14+ (managed by uv)
- **Machine Learning**: scikit-learn 1.9.1+
- **Data Processing**: pandas 3.0.5+, numpy 2.5.3+
- **API**: FastAPI 0.141.1+, Uvicorn 0.52.4+
- **Model Persistence**: joblib 1.6.0+
- **Visualization**: matplotlib 3.11.1+
- **Validation**: pydantic 2.13.5+

### Frontend

- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.0.7
- **Styling**: Tailwind CSS 3.4.17
- **PostCSS**: 8.4.49

### Infrastructure

- **Dependency Management**: uv (Python), npm (JavaScript)
- **Notebooks**: Jupyter

## Installation

### Prerequisites

- Python 3.14+ (automatically installed by uv if not present)
- Node.js 18+ (for frontend development)
- Git

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AshenIndeewara/Wine-Quality-Classification-System-ML.git
   cd Wine-Quality-Classification-System-ML
   ```

2. **Install Python dependencies using uv:**
   ```bash
   uv sync
   ```
   This command:
   - Creates a `.venv` virtual environment
   - Installs the exact Python version pinned in `.python-version`
   - Installs all dependencies from `pyproject.toml` and `uv.lock`

### Frontend Setup

3. **Navigate to the frontend directory and install dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

## Usage

### Running the Jupyter Notebook

To explore the data and train the model:

```bash
uv run jupyter notebook
```

Then open the notebook at `ml/notebook/wine_quality.ipynb` in your browser.

### Running the API Backend

```bash
uv run uvicorn main:app --reload --app-dir backend
```

*Note: The backend directory structure may need to be created. The API serves the trained model for predictions.*

### Running the Frontend Application

```bash
cd frontend
npm run dev
```

Then open `http://localhost:5173` in your browser to use the interactive prediction interface.

### Running a Python Script

```bash
uv run python path/to/script.py
```

### Activating the Virtual Environment (Optional)

You generally don't need to manually activate the environment since `uv run` handles it automatically. However, if you need an activated shell:

**macOS / Linux:**
```bash
source .venv/bin/activate
```

**Windows:**
```cmd
.venv\Scripts\activate
```

## Machine Learning Pipeline

The complete ML workflow is documented in `ml/notebook/wine_quality.ipynb`:

### 1. Data Loading
- Loads red wine dataset (1,599 samples)
- Loads white wine dataset (4,898 samples)
- Combines datasets with `wine_type` column (0=red, 1=white)
- Renames columns for consistency

### 2. Data Exploration
- Displays dataset shape and structure
- Shows summary statistics for all features
- Confirms no missing values
- Identifies and removes 1,177 duplicate rows (5,320 unique samples remaining)

### 3. Feature Engineering

#### Technique 1: Binning (Quality Classification)
- Transforms continuous quality scores (3-9) into 3 discrete classes:
  - **Low**: scores 3, 4, 5
  - **Medium**: score 6
  - **High**: scores 7, 8, 9
- Addresses class imbalance for better model learning

#### Technique 2: Feature Creation
- Creates domain-derived features based on chemical relationships
- Enhances model's ability to capture complex patterns

#### Technique 3: Outlier Treatment
- Uses IQR (Interquartile Range) clipping
- Reduces impact of extreme values on model performance

#### Technique 4: Encoding
- Encodes categorical variables (wine_type) for model compatibility

#### Technique 6: Feature Selection
- Selects most relevant features based on statistical analysis
- Removes redundant or less informative features

### 4. Data Splitting
- Train/Test split: 80% training, 20% testing
- Stratified sampling to maintain class distribution

### 5. Model Training

Two classifiers are trained and evaluated:

#### Random Forest Classifier
- **Algorithm**: Ensemble of decision trees
- **Advantages**: Handles non-linear relationships, feature importance analysis
- **Performance**: Primary model used in production

#### Logistic Regression
- **Algorithm**: Linear model for classification
- **Purpose**: Baseline comparison
- **Use Case**: Interpretable coefficients for understanding feature relationships

### 6. Model Evaluation

Metrics computed for both models:
- **Accuracy**: Overall correctness
- **Precision**: True positives / (True positives + False positives)
- **Recall**: True positives / (True positives + False negatives)
- **F1-Score**: Harmonic mean of precision and recall
- **Confusion Matrix**: Detailed class-by-class performance
- **Classification Report**: Comprehensive metric breakdown

### 7. Feature Importance Analysis

- Random Forest feature importances visualized
- Identifies which physicochemical measurements most influence quality prediction
- Helps understand the relationship between chemistry and perceived quality

### 8. Model Export

- Trained pipeline saved as `ml/models/wine_quality_pipeline.pkl`
- Includes preprocessing steps and model
- Ready for deployment and inference

## Frontend Application

The React frontend provides an interactive interface for making predictions.

### Features

- **Input Form**: Enter 11 physicochemical measurements
- **Preset Loaders**: Quick-load sample red or white wine profiles
- **Real-time Validation**: Client-side input validation
- **Prediction Results**: Displays predicted quality class with probability distribution
- **Responsive Design**: Works on desktop and mobile devices
- **Health Monitoring**: Shows API status and model loading state

### User Interface Components

1. **Header**: Project title and API health badge
2. **Input Panel**: Form with all 11 features plus wine type selector
3. **Result Panel**: Shows prediction with probability bars
4. **Preset Buttons**: Load typical red or white wine values

### Input Fields

All fields include:
- Appropriate min/max values based on dataset ranges
- Correct step increments for precision
- Unit labels (g/dm³, mg/dm³, %, etc.)
- Required validation

## Project Structure

```
Wine-Quality-Classification-System-ML/
├── .gitignore
├── .python-version                    # Pinned Python version (3.14)
├── pyproject.toml                     # Python project metadata & dependencies
├── uv.lock                            # Locked dependency versions
├── README.md
├── data/
│   └── raw/
│       ├── winequality-red.csv       # Red wine samples (1,599)
│       ├── winequality-white.csv     # White wine samples (4,898)
│       └── winequality.names          # Dataset documentation
├── ml/
│   ├── notebook/
│   │   └── wine_quality.ipynb         # Complete ML workflow
│   └── models/
│       └── wine_quality_pipeline.pkl  # Trained model pipeline
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx                  # React entry point
│       ├── App.jsx                   # Main application component
│       ├── index.css                 # Global styles
│       ├── api.js                    # API client functions
│       └── pages/
│           └── Predict.jsx            # Prediction interface
└── .venv/                             # Virtual environment (auto-created)
```

## Team Members

| Name | GitHub Profile | Role |
|------|----------------|------|
| Nishadi | [@nishadii99](https://github.com/nishadii99) | Data Preparation |
| Ashen Indeewara | [@AshenIndeewara](https://github.com/AshenIndeewara) | Feature Engineering & EDA |
| Indu Makaweeshvara | [@indumakaweeshvara](https://github.com/indumakaweeshvara) | Modeling & Evaluation |

## Adding Dependencies

### Python (Backend)

Use `uv` to add new Python packages:

```bash
uv add package-name
```

This automatically updates `pyproject.toml` and `uv.lock`.

### JavaScript (Frontend)

Navigate to the frontend directory and use npm:

```bash
cd frontend
npm install package-name
```

## Contributing

1. **Fork the repository** on GitHub
2. **Create a feature branch**:
   ```bash
   git checkout -b feature-name
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "feat: add new feature"
   ```
4. **Push to the branch**:
   ```bash
   git push origin feature-name
   ```
5. **Open a Pull Request** on GitHub

## Acknowledgments

- **Dataset**: UCI Machine Learning Repository - Wine Quality Dataset
- **Research Paper**: Cortez et al., 2009, "Modeling wine preferences by data mining from physicochemical properties"
- **Technologies**: Python, scikit-learn, React, FastAPI, Jupyter, Vite, Tailwind CSS
