#!/usr/bin/env bash
# NexForge Manufacturing Intelligence Backend Launcher
set -e

echo "=== Initializing NexForge Manufacturing Intelligence Engine ==="

# Check Python version
python3 --version

# Create virtual environment if not present
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing dependencies from requirements.txt..."
pip install -r requirements.txt

# Run Unit Tests
echo "Executing test suite..."
python -m pytest tests/test_planning.py -v

# Start FastAPI server on port 8000
echo "Starting FastAPI Server on http://0.0.0.0:8000..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
