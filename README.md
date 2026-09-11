# Wine Quality Classification System


## Project Structure

```
Wine-Quality-Classification-System-ML/
├───.venv/                  # Virtual environment (managed by uv, auto-created)
├───data/
│   └───raw/                # Raw data files (winequality-red.csv, winequality-white.csv, etc.)
├───ml/
│   └───notebook/           # Jupyter notebooks
├───.python-version         # Pinned Python version used by uv
├───pyproject.toml          # Project metadata & dependencies
├───uv.lock                 # Locked, exact dependency versions
└───README.md
```

## Installing the Project

1. Clone the repository:
   ```bash
   git clone https://github.com/AshenIndeewara/Wine-Quality-Classification-System-ML.git
   cd Wine-Quality-Classification-System-ML
   ```

2. Sync the environment. This single command creates `.venv`, installs the exact Python version pinned in `.python-version`, and installs every dependency locked in `uv.lock`:
   ```bash
   uv sync
   ```

## Running the Project

### Run the Jupyter notebook

```bash
uv run jupyter notebook
```


### Run a Python script

```bash
uv run python path/to/script.py
```

### Activating the environment manually (optional)

You generally don't need this since `uv run` handles it automatically, but if you want an activated shell:

```bash
# macOS / Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

## Adding a New Dependency

If you need to add a package later, don't use `pip install` — add it through `uv` so `pyproject.toml` and `uv.lock` stay in sync for everyone:

```bash
uv add pandas
```
