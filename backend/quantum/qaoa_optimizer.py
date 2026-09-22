import time
import logging
from typing import Dict, Any, Tuple, List, Optional
import numpy as np
import warnings

# Suppress benign scipy or numerical warnings
warnings.filterwarnings("ignore")

logger = logging.getLogger("nexforge.quantum")

try:
    from qiskit import QuantumCircuit, transpile
    from qiskit_aer import AerSimulator
    from qiskit.quantum_info import SparsePauliOp
    QISKIT_AVAILABLE = True
except ImportError:
    QISKIT_AVAILABLE = False


def decode_bitstring(bitstring: str, n_qubits: int) -> List[int]:
    """
    Decodes a Qiskit measurement bitstring into a binary decision vector x.
    
    CRITICAL BIT-ORDERING SPECIFICATION:
    In Qiskit, measurement bitstrings from get_counts() are formatted in little-endian order:
        bitstring = "c_{n-1} c_{n-2} ... c_1 c_0"
        
    Therefore:
      - Variable x_0 (corresponding to qubit 0) is at character index: (n_qubits - 1 - 0) = n_qubits - 1
      - Variable x_i (corresponding to qubit i) is at character index: (n_qubits - 1 - i)
      - Variable x_{n-1} (corresponding to qubit n-1) is at character index: 0
      
    Returns:
      List[int] representing [x_0, x_1, ..., x_{n-1}], where each x_i in {0, 1}.
    """
    cleaned = bitstring.strip()
    if len(cleaned) != n_qubits:
        raise ValueError(
            f"Bitstring length {len(cleaned)} ('{cleaned}') does not match expected qubit count {n_qubits}."
        )
    return [int(cleaned[n_qubits - 1 - i]) for i in range(n_qubits)]


class QAOAOptimizer:
    """
    Genuine Quantum Approximate Optimization Algorithm (QAOA) optimizer.
    Executes actual parameterized quantum circuits using Qiskit and Qiskit Aer simulator.
    
    Circuit Architecture:
      1. Initial State: |+>^n state generated via Hadamard gates on all qubits.
      2. Alternating Operator Layers (repeated for p steps):
         a. Cost Unitary U(C, gamma) = exp(-i * gamma * H_C)
            - Single-qubit Z rotations: Rz(2 * h_i * gamma, qubit_i)
            - Two-qubit ZZ interactions: Rzz(2 * J_ij * gamma, qubit_i, qubit_j)
         b. Mixer Unitary U(B, beta) = exp(-i * beta * H_B)
            - Transverse field X rotations: Rx(2 * beta, qubit_i)
      3. Measurement: Complete register measurement into classical bits.
      4. Classical Parameter Optimization: COBYLA iterates (gamma, beta) to minimize energy.
      5. Final Sample Execution: Executes optimal circuit on Qiskit Aer with configured shots.
    """

    def __init__(
        self,
        p_steps: int = 1,
        shots: int = 1024,
        optimizer_name: str = "COBYLA",
        seed: Optional[int] = 42,
        max_evals: int = 20
    ):
        self.p_steps = max(1, p_steps)
        self.shots = max(100, shots)
        self.optimizer_name = optimizer_name
        self.seed = seed
        self.max_evals = max_evals

    def optimize(
        self,
        Q: np.ndarray,
        offset: float = 0.0,
        variable_names: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Executes genuine QAOA on the provided symmetric QUBO matrix Q.
        
        Returns a dictionary containing:
          - status: "quantum_completed"
          - backend: "Qiskit AerSimulator"
          - num_qubits: int
          - qaoa_reps: int
          - shots: int
          - bitstring: raw measured bitstring from Qiskit
          - decoded_bits: decoded binary decision vector [x_0, ..., x_{n-1}]
          - objective_value: float, exact QUBO objective x^T Q x + offset
          - circuit_depth: int, from quantum circuit depth
          - execution_time_ms: float
          - optimal_gamma: list of floats
          - optimal_beta: list of floats
          - counts_sample: dict of measured sample frequencies
        """
        if not QISKIT_AVAILABLE:
            raise RuntimeError(
                "Qiskit or Qiskit Aer is not available in the current environment. "
                "Ensure qiskit and qiskit-aer are installed."
            )

        start_time = time.perf_counter()
        n_qubits = Q.shape[0]

        logger.info(f"[QUANTUM] Initializing Qiskit QAOA: {n_qubits} qubits, p={self.p_steps}, shots={self.shots}")

        # Step 1: Extract Ising Hamiltonian coefficients (h_i and J_ij) from QUBO matrix Q
        # x_i = (I - Z_i)/2
        h_linear = np.zeros(n_qubits, dtype=np.float64)
        J_coupling: Dict[Tuple[int, int], float] = {}
        total_offset = float(offset)

        for i in range(n_qubits):
            q_ii = float(Q[i, i])
            total_offset += q_ii / 2.0
            h_linear[i] -= q_ii / 2.0

        for i in range(n_qubits):
            for j in range(i + 1, n_qubits):
                q_ij = float(Q[i, j] + Q[j, i]) / 2.0
                if abs(q_ij) > 1e-12:
                    total_offset += q_ij / 2.0
                    h_linear[i] -= q_ij / 2.0
                    h_linear[j] -= q_ij / 2.0
                    J_coupling[(i, j)] = q_ij / 2.0

        # Step 2: Circuit builder function
        def build_circuit(gamma_vec: List[float], beta_vec: List[float], add_measure: bool = True) -> QuantumCircuit:
            qc = QuantumCircuit(n_qubits)
            # Initial state: |+>^n via Hadamard gates
            qc.h(range(n_qubits))

            # p alternating layers of Cost and Mixer unitaries
            for step in range(self.p_steps):
                g = gamma_vec[step]
                b = beta_vec[step]

                # Cost unitary U(C, gamma) = exp(-i * gamma * H_C)
                # Single-qubit Z rotations
                for i in range(n_qubits):
                    if abs(h_linear[i]) > 1e-10:
                        qc.rz(2.0 * h_linear[i] * g, i)

                # Two-qubit ZZ rotations
                for (i, j), j_val in J_coupling.items():
                    if abs(j_val) > 1e-10:
                        qc.rzz(2.0 * j_val * g, i, j)

                # Mixer unitary U(B, beta) = exp(-i * beta * H_B)
                for i in range(n_qubits):
                    qc.rx(2.0 * b, i)

            if add_measure:
                qc.measure_all()
            return qc

        # Initialize Qiskit Aer Simulator
        simulator = AerSimulator(seed_simulator=self.seed)

        # Step 3: Classical Parameter Optimization (COBYLA)
        # Parameter vector has length 2 * p: [gamma_1, ..., gamma_p, beta_1, ..., beta_p]
        from scipy.optimize import minimize

        # Evaluate expected energy from circuit execution on Aer
        def energy_objective(params: np.ndarray) -> float:
            gamma_vals = list(params[:self.p_steps])
            beta_vals = list(params[self.p_steps:])
            qc = build_circuit(gamma_vals, beta_vals, add_measure=True)
            t_qc = transpile(qc, simulator)
            # Use smaller shot count during parameter search for fast convergence
            eval_shots = min(256, self.shots)
            job = simulator.run(t_qc, shots=eval_shots)
            counts = job.result().get_counts()

            # Compute sampled expectation value: sum_s (count(s) / shots) * (x^T Q x)
            exp_val = 0.0
            for bs, count in counts.items():
                x = np.array(decode_bitstring(bs, n_qubits), dtype=np.float64)
                energy = float(x @ Q @ x)
                exp_val += energy * count
            return exp_val / float(eval_shots)

        initial_params = np.concatenate([
            np.full(self.p_steps, 0.4),  # initial gamma
            np.full(self.p_steps, 0.3)   # initial beta
        ])

        logger.info(f"[QUANTUM] Running classical parameter optimizer (COBYLA, maxiter={self.max_evals})...")
        opt_res = minimize(
            energy_objective,
            initial_params,
            method="COBYLA",
            options={"maxiter": self.max_evals}
        )

        opt_gamma = list(opt_res.x[:self.p_steps])
        opt_beta = list(opt_res.x[self.p_steps:])
        logger.info(f"[QUANTUM] Parameter optimization converged: gamma={opt_gamma}, beta={opt_beta}")

        # Step 4: Full Circuit Execution on Aer with Configured Shots
        optimal_circuit = build_circuit(opt_gamma, opt_beta, add_measure=True)
        circuit_depth = optimal_circuit.depth()
        
        logger.info(f"[QUANTUM] Transpiling and executing optimal QAOA circuit on Aer Simulator ({self.shots} shots)...")
        transpiled_circuit = transpile(optimal_circuit, simulator)
        final_job = simulator.run(transpiled_circuit, shots=self.shots)
        measurement_counts = final_job.result().get_counts()

        # Step 5: Candidate Selection & Verification
        # Find the best bitstring among actual measured samples
        best_bitstring = ""
        best_decoded: List[int] = []
        best_energy = float("inf")

        for bs, count in measurement_counts.items():
            x_vec = decode_bitstring(bs, n_qubits)
            x_arr = np.array(x_vec, dtype=np.float64)
            energy = float(x_arr @ Q @ x_arr) + offset
            if energy < best_energy:
                best_energy = energy
                best_bitstring = bs
                best_decoded = x_vec

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        logger.info(f"[QUANTUM] QAOA completed in {elapsed_ms:.2f} ms. Best measured bitstring: '{best_bitstring}', energy: {best_energy:.4f}")

        # Return sample of top counts (up to 8 most frequent)
        sorted_counts = sorted(measurement_counts.items(), key=lambda kv: kv[1], reverse=True)
        top_counts = {k: v for k, v in sorted_counts[:8]}

        return {
            "status": "quantum_completed",
            "backend": "Qiskit AerSimulator",
            "num_qubits": n_qubits,
            "qaoa_reps": self.p_steps,
            "shots": self.shots,
            "bitstring": best_bitstring,
            "decoded_bits": best_decoded,
            "objective_value": round(best_energy, 4),
            "circuit_depth": circuit_depth,
            "execution_time_ms": round(elapsed_ms, 2),
            "optimal_gamma": [round(float(g), 4) for g in opt_gamma],
            "optimal_beta": [round(float(b), 4) for b in opt_beta],
            "counts_sample": top_counts,
            "total_samples": self.shots
        }
