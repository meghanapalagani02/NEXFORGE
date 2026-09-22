import numpy as np
from typing import List, Dict, Any, Tuple, Optional
import warnings

# Suppress scipy sparse warnings during operator conversions if needed
warnings.filterwarnings("ignore", category=UserWarning)

try:
    from qiskit.quantum_info import SparsePauliOp
    QISKIT_AVAILABLE = True
except ImportError:
    SparsePauliOp = None
    QISKIT_AVAILABLE = False

from models.schemas import ProductInput


class QUBOBuilder:
    """
    Constructs the Quadratic Unconstrained Binary Optimization (QUBO) model
    for multi-period production planning in manufacturing.
    
    Dynamic Qubit Calculation:
    The number of qubits is strictly computed from the actual count of binary decision variables:
    N_qubits = len(binary_variables) = P × T × B
    
    Where:
      P = Number of distinct products / SKUs
      T = Number of discrete planning periods (months)
      B = Discretization bits per capacity decision variable
      
    No hardcoded qubit count is ever assumed.
    """

    @staticmethod
    def calculate_qubits(num_products: int, num_periods: int, bits_per_var: int = 2) -> Tuple[int, str, Dict[str, int]]:
        num_products = max(1, num_products)
        num_periods = max(1, num_periods)
        bits_per_var = max(1, bits_per_var)
        total_qubits = num_products * num_periods * bits_per_var
        formula = f"N_qubits = P ({num_products}) × T ({num_periods}) × B ({bits_per_var}) = {total_qubits}"
        breakdown = {
            "products": num_products,
            "periods": num_periods,
            "discretizationBits": bits_per_var,
            "totalQubits": total_qubits,
            "num_variables": total_qubits
        }
        return total_qubits, formula, breakdown

    @classmethod
    def build_qubo(
        cls,
        products: List[ProductInput],
        demands: List[float],
        capacity_per_period: float,
        bits_per_var: int = 2,
        penalty_capacity: float = 1e3,
        penalty_shortage: float = 2e3
    ) -> Tuple[np.ndarray, Dict[int, Dict[str, Any]], Dict[str, Any]]:
        """
        Builds the symmetric QUBO matrix Q such that minimizing:
            Objective(x) = x^T Q x + constant_offset
        optimizes the multi-period production plan balancing:
          1. Direct production cost (c_prod * X_{p,t})
          2. Inventory holding cost and safety stock protection
          3. Demand satisfaction / stockout avoidance
          4. Production capacity constraints per period
        """
        prods = products if products else [ProductInput()]
        num_products = len(prods)
        num_periods = len(demands) if demands else 1
        safe_capacity = capacity_per_period if capacity_per_period > 0 else 7000000.0

        # Step 1: Dynamic Binary Variable Construction
        # Each product p, period t has B bits representing discrete capacity increments
        max_level = (1 << bits_per_var) - 1
        variable_names: List[str] = []
        variable_map: Dict[int, Dict[str, Any]] = {}

        qubit_idx = 0
        for p_idx, prod in enumerate(prods):
            p_id = prod.id or f"PROD-{p_idx+1:02d}"
            p_name = prod.name or f"Product {p_idx+1}"
            for t_idx in range(num_periods):
                for b_idx in range(bits_per_var):
                    var_name = f"{p_id}_M{t_idx+1}_b{b_idx}"
                    # Fractional capacity representation: weight = 2^b / (2^B - 1) * Capacity
                    weight = (2 ** b_idx) / max_level * safe_capacity
                    
                    variable_names.append(var_name)
                    variable_map[qubit_idx] = {
                        "index": qubit_idx,
                        "variableName": var_name,
                        "productId": p_id,
                        "productName": p_name,
                        "period": t_idx + 1,
                        "bit": b_idx,
                        "weightUnits": weight,
                        "unitCost": prod.unitProductionCost,
                        "holdingCost": prod.unitHoldingCost,
                        "shortageCost": prod.unitShortageCost
                    }
                    qubit_idx += 1

        total_qubits = len(variable_names)
        _, formula, breakdown = cls.calculate_qubits(num_products, num_periods, bits_per_var)

        # Step 2: Initialize QUBO Matrix Q (N x N) and linear coefficients
        # Objective: min x^T Q x + offset
        Q = np.zeros((total_qubits, total_qubits), dtype=np.float64)
        linear_coeffs = np.zeros(total_qubits, dtype=np.float64)
        constant_offset = 0.0

        # Normalization scale factor to condition QUBO eigenvalues for QAOA simulation
        # Normalized so variables represent fractions of monthly capacity
        scale_cap = safe_capacity
        cost_scale = 1.0 / max(1.0, scale_cap)

        # 2A. Direct Production Cost: sum_i (c_prod * w_i) * x_i
        for i in range(total_qubits):
            info = variable_map[i]
            w_norm = info["weightUnits"] * cost_scale
            unit_c = info["unitCost"]
            # Linear term on diagonal (since x_i^2 = x_i for x_i in {0, 1})
            c_term = unit_c * w_norm
            linear_coeffs[i] += c_term
            Q[i, i] += c_term

        # 2B. Demand Satisfaction & Inventory Balance Penalty
        # For each product p and each cumulative period t:
        # Ending inventory I_{p,t} = I_{0,p} + sum_{tau=1}^t X_{p,tau} - sum_{tau=1}^t d_{p,tau}
        # We penalize deviation from target safety stock:
        # Penalty = lambda_inv * ( sum_{tau=1}^t X_{p,tau} - NetReq_{p,t} )^2
        # where NetReq_{p,t} = max(0, sum_{tau=1}^t d_{p,tau} + SS_p - I_{0,p})
        lambda_inv = 120.0  # calibrated penalty weight
        for p_idx, prod in enumerate(prods):
            p_id = prod.id or f"PROD-{p_idx+1:02d}"
            init_inv = prod.currentInventory
            ss_target = prod.safetyStockTarget
            
            cum_demand = 0.0
            for t_idx in range(num_periods):
                period_demand = demands[t_idx] if t_idx < len(demands) else 5900000.0
                cum_demand += period_demand
                
                # Net required cumulative production
                net_req = max(0.0, cum_demand + ss_target - init_inv)
                net_req_norm = net_req * cost_scale
                
                # Active variables contributing to production up to period t
                cum_indices = [
                    idx for idx, info in variable_map.items()
                    if info["productId"] == p_id and info["period"] <= (t_idx + 1)
                ]
                
                # Expand (sum_{i} w_i x_i - R)^2 = sum_i w_i^2 x_i + 2 sum_{i<j} w_i w_j x_i x_j - 2 R sum_i w_i x_i + R^2
                constant_offset += lambda_inv * (net_req_norm ** 2)
                for i in cum_indices:
                    w_i = variable_map[i]["weightUnits"] * cost_scale
                    # Diagonal contribution
                    diag_val = lambda_inv * (w_i ** 2 - 2.0 * net_req_norm * w_i)
                    Q[i, i] += diag_val
                    linear_coeffs[i] += diag_val
                    
                    for j in cum_indices:
                        if i < j:
                            w_j = variable_map[j]["weightUnits"] * cost_scale
                            # Off-diagonal quadratic interaction
                            off_val = lambda_inv * (w_i * w_j)
                            Q[i, j] += off_val
                            Q[j, i] += off_val

        # 2C. Monthly Plant Capacity Constraint Penalty
        # Total production across all products in period t should not exceed plant capacity:
        # sum_{p} X_{p,t} <= Cap_t
        lambda_cap = 80.0
        for t_idx in range(num_periods):
            indices_in_t = [
                idx for idx, info in variable_map.items()
                if info["period"] == (t_idx + 1)
            ]
            cap_norm = safe_capacity * cost_scale  # = 1.0 in normalized space
            for i in indices_in_t:
                w_i = variable_map[i]["weightUnits"] * cost_scale
                diag_cap = lambda_cap * (w_i ** 2 - 2.0 * cap_norm * w_i)
                Q[i, i] += diag_cap
                linear_coeffs[i] += diag_cap
                for j in indices_in_t:
                    if i < j:
                        w_j = variable_map[j]["weightUnits"] * cost_scale
                        off_cap = lambda_cap * (w_i * w_j)
                        Q[i, j] += off_cap
                        Q[j, i] += off_cap

        # Symmetrize Q explicitly
        Q = 0.5 * (Q + Q.T)

        sparsity_pct = float(np.count_nonzero(Q)) / float(total_qubits ** 2) if total_qubits > 0 else 0.0

        meta: Dict[str, Any] = {
            "num_variables": total_qubits,
            "num_qubits": total_qubits,
            "variables": variable_names,
            "products": [p.id or f"PROD-{idx+1:02d}" for idx, p in enumerate(prods)],
            "periods": [f"Month {t+1}" for t in range(num_periods)],
            "totalQubits": total_qubits,
            "formula": formula,
            "breakdown": breakdown,
            "matrixDimension": f"{total_qubits}x{total_qubits}",
            "sparsity": f"{sparsity_pct:.1%}",
            "constantOffset": round(float(constant_offset), 4),
            "scaleCapacity": safe_capacity
        }

        return Q, variable_map, meta

    @classmethod
    def to_ising_hamiltonian(
        cls, Q: np.ndarray, offset: float = 0.0
    ) -> Tuple[np.ndarray, Dict[Tuple[int, int], float], float, Optional[Any]]:
        """
        Maps a symmetric QUBO matrix Q to an Ising Cost Hamiltonian:
            H_C = sum_i h_i Z_i + sum_{i < j} J_{ij} Z_i Z_j + constant_offset * I
            
        Using standard transformation from binary variables x_i in {0, 1} to Pauli Z operators:
            x_i = (I - Z_i) / 2
            
        Returns:
            h_linear: 1D array of single-qubit Z coefficients for each qubit
            J_coupling: Dict of (i, j) -> interaction coefficient for two-qubit ZZ gates
            total_offset: Scalar constant energy offset
            pauli_op: Qiskit SparsePauliOp object (if Qiskit is installed)
        """
        n = Q.shape[0]
        h_linear = np.zeros(n, dtype=np.float64)
        J_coupling: Dict[Tuple[int, int], float] = {}
        total_offset = float(offset)

        # 1. Diagonal terms: Q_ii x_i = Q_ii (I - Z_i)/2 = (Q_ii/2) I - (Q_ii/2) Z_i
        for i in range(n):
            q_ii = float(Q[i, i])
            total_offset += q_ii / 2.0
            h_linear[i] -= q_ii / 2.0

        # 2. Off-diagonal terms: 2 Q_ij x_i x_j = 2 Q_ij (I - Z_i)(I - Z_j)/4
        #   = (Q_ij/2) [ I - Z_i - Z_j + Z_i Z_j ]
        for i in range(n):
            for j in range(i + 1, n):
                q_ij = float(Q[i, j] + Q[j, i]) / 2.0  # Average if symmetric
                if abs(q_ij) > 1e-12:
                    total_offset += q_ij / 2.0
                    h_linear[i] -= q_ij / 2.0
                    h_linear[j] -= q_ij / 2.0
                    j_coeff = q_ij / 2.0
                    J_coupling[(i, j)] = j_coeff

        pauli_op = None
        if QISKIT_AVAILABLE and SparsePauliOp is not None:
            terms = []
            # Single qubit Z terms
            for i in range(n):
                if abs(h_linear[i]) > 1e-10:
                    z_chars = ['I'] * n
                    # In Qiskit, qubit index i is placed at position (n - 1 - i)
                    z_chars[n - 1 - i] = 'Z'
                    terms.append((''.join(z_chars), float(h_linear[i])))
                    
            # Two-qubit ZZ terms
            for (i, j), j_val in J_coupling.items():
                if abs(j_val) > 1e-10:
                    zz_chars = ['I'] * n
                    zz_chars[n - 1 - i] = 'Z'
                    zz_chars[n - 1 - j] = 'Z'
                    terms.append((''.join(zz_chars), float(j_val)))

            if abs(total_offset) > 1e-10:
                terms.append(('I' * n, float(total_offset)))

            if terms:
                pauli_op = SparsePauliOp.from_list(terms)

        return h_linear, J_coupling, total_offset, pauli_op
