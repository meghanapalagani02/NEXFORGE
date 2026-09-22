# NexForge Manufacturing Intelligence Backend

FastAPI service powering **Use Case 062: Manufacturing & Industry 4.0 — Demand Forecasting, Production Planning, Inventory Safety Optimization, and Hybrid Quantum Optimization**.

---

## 1. Quick Start (Local Execution)

```bash
cd backend

# Option A: Run automated setup script
chmod +x run_backend.sh
./run_backend.sh

# Option B: Manual setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m pytest tests/test_planning.py
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive OpenAPI Swagger documentation will be available at:
`http://localhost:8000/docs`

---

## 2. API Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and registered optimization engines |
| `POST` | `/api/forecast` | Classical time-series forecasting with chronological validation |
| `POST` | `/api/inventory/analyze` | Statistical safety buffer ($Z \cdot \sigma_d \sqrt{L}$), ROP, and runway |
| `POST` | `/api/production/plan` | Linear Programming cost minimization (SciPy HiGHS) |
| `POST` | `/api/scheduling/plan` | Shop-floor machine dispatching and bottleneck cell detection |
| `POST` | `/api/scenario/run` | Dynamic sensitivity and capacity constraint recalculations |
| `POST` | `/api/quantum/optimize` | QUBO formulation & QAOA simulation with dynamic qubit allocation |
| `POST` | `/api/planning/agent` | Contextual AI reasoning explainer grounded in live planning metrics |

---

## 3. Dynamic Qubit Allocation Formula

The quantum optimization module formulates multi-period scheduling into a Quadratic Unconstrained Binary Optimization (QUBO) problem for QAOA. Qubits are computed dynamically based on:

$$N_{\text{qubits}} = P \times T \times B$$

Where:
- $P$ = Number of distinct products / SKUs
- $T$ = Number of discrete planning periods
- $B$ = Discretization bits per capacity decision variable

No hardcoded qubit counts are used. If quantum candidate validation detects constraint violations, the system automatically engages the validated classical Linear Programming fallback.
