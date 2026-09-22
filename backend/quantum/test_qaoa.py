import sys
import os
import numpy as np
import pytest

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from quantum.qaoa_optimizer import QAOAOptimizer, decode_bitstring, QISKIT_AVAILABLE


def test_decode_bitstring():
    """
    Validates endianness handling for Qiskit measurement bitstrings.
    Qiskit bitstrings format qubit i at index (n - 1 - i).
    """
    n_qubits = 4
    # '1010' -> qubit 3=1, qubit 2=0, qubit 1=1, qubit 0=0
    # Decoded vector [x_0, x_1, x_2, x_3] should be [0, 1, 0, 1]
    decoded = decode_bitstring("1010", n_qubits)
    assert decoded == [0, 1, 0, 1], f"Expected [0, 1, 0, 1], got {decoded}"

    # '1100' -> qubit 3=1, qubit 2=1, qubit 1=0, qubit 0=0
    # Decoded vector [x_0, x_1, x_2, x_3] should be [0, 0, 1, 1]
    decoded2 = decode_bitstring("1100", n_qubits)
    assert decoded2 == [0, 0, 1, 1], f"Expected [0, 0, 1, 1], got {decoded2}"


def test_small_known_qubo_qaoa():
    """
    Tests QAOA on a known 2-variable and 4-variable QUBO using Qiskit Aer simulator.
    """
    assert QISKIT_AVAILABLE, "Qiskit must be installed and available."

    # 1. 2-Variable QUBO:
    # min 2 x_0 + 3 x_1 - 4 x_0 x_1
    # Evaluations:
    # (0, 0) -> 0
    # (1, 0) -> 2
    # (0, 1) -> 3
    # (1, 1) -> 2 + 3 - 4 = 1
    # Minimum is at (0, 0) with energy 0.0
    Q_2 = np.array([
        [2.0, -2.0],
        [-2.0, 3.0]
    ])
    optimizer_2 = QAOAOptimizer(p_steps=1, shots=512, seed=42, max_evals=15)
    res_2 = optimizer_2.optimize(Q_2)

    print("\n--- QAOA 2-Variable Test Execution ---")
    print(f"Backend:          {res_2['backend']}")
    print(f"Qubit Count:      {res_2['num_qubits']}")
    print(f"QAOA Reps (p):    {res_2['qaoa_reps']}")
    print(f"Shots:            {res_2['shots']}")
    print(f"Bitstring:        '{res_2['bitstring']}'")
    print(f"Decoded Bits:     {res_2['decoded_bits']}")
    print(f"Objective Value:  {res_2['objective_value']}")
    print(f"Circuit Depth:    {res_2['circuit_depth']}")
    print(f"Execution Time:   {res_2['execution_time_ms']} ms")
    print(f"Optimal Gamma:    {res_2['optimal_gamma']}")
    print(f"Optimal Beta:     {res_2['optimal_beta']}")
    print(f"Sample Counts:    {res_2['counts_sample']}")

    assert res_2["status"] == "quantum_completed"
    assert res_2["num_qubits"] == 2
    assert res_2["circuit_depth"] > 0
    assert res_2["execution_time_ms"] > 0
    assert len(res_2["decoded_bits"]) == 2
    assert "00" in res_2["counts_sample"] or res_2["objective_value"] <= 1.0

    # 2. 4-Variable QUBO
    Q_4 = np.array([
        [1.5, -0.8, 0.2, 0.0],
        [-0.8, 2.0, -1.0, 0.5],
        [0.2, -1.0, 1.8, -0.7],
        [0.0, 0.5, -0.7, 2.2]
    ])
    optimizer_4 = QAOAOptimizer(p_steps=1, shots=512, seed=42, max_evals=15)
    res_4 = optimizer_4.optimize(Q_4)

    print("\n--- QAOA 4-Variable Test Execution ---")
    print(f"Backend:          {res_4['backend']}")
    print(f"Qubit Count:      {res_4['num_qubits']}")
    print(f"QAOA Reps (p):    {res_4['qaoa_reps']}")
    print(f"Shots:            {res_4['shots']}")
    print(f"Bitstring:        '{res_4['bitstring']}'")
    print(f"Decoded Bits:     {res_4['decoded_bits']}")
    print(f"Objective Value:  {res_4['objective_value']}")
    print(f"Circuit Depth:    {res_4['circuit_depth']}")
    print(f"Execution Time:   {res_4['execution_time_ms']} ms")

    assert res_4["status"] == "quantum_completed"
    assert res_4["num_qubits"] == 4
    assert res_4["circuit_depth"] > 0
    assert len(res_4["decoded_bits"]) == 4


if __name__ == "__main__":
    test_decode_bitstring()
    test_small_known_qubo_qaoa()
    print("\nAll QAOA base tests passed successfully!")
