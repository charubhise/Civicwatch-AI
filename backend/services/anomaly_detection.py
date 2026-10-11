import math
import re
from typing import List, Dict, Any, Tuple
from datetime import datetime


# Standard state code mappings in Indian GSTIN
VALID_STATE_CODES = {
    "01": "JAMMU AND KASHMIR", "02": "HIMACHAL PRADESH", "03": "PUNJAB",
    "04": "CHANDIGARH", "05": "UTTARAKHAND", "06": "HARYANA", "07": "DELHI",
    "08": "RAJASTHAN", "09": "UTTAR PRADESH", "10": "BIHAR", "19": "WEST BENGAL",
    "24": "GUJARAT", "27": "MAHARASHTRA", "29": "KARNATAKA", "32": "KERALA",
    "33": "TAMIL NADU", "36": "TELANGANA", "37": "ANDHRA PRADESH"
}

# Benford's ideal first-digit probability: P(d) = log10(1 + 1/d)
BENFORD_IDEAL = {
    1: 0.301,
    2: 0.176,
    3: 0.125,
    4: 0.097,
    5: 0.079,
    6: 0.067,
    7: 0.058,
    8: 0.051,
    9: 0.046
}


def validate_gstin(gstin: str) -> Tuple[bool, str]:
    """Validates Indian 15-character GSTIN format."""
    if not gstin or len(gstin) != 15:
        return False, "Invalid GSTIN length (must be 15 alphanumeric characters)"
    pattern = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
    if not re.match(pattern, gstin):
        return False, "GSTIN structure violates standard Indian Tax format [2-digit State + PAN + Entity + Z + Checksum]"
    return True, "Valid"


def is_round_number(amount: float) -> bool:
    """Detects high round-value transactions (e.g. 50,00,000 or 25,00,000) that often signal non-itemized payouts."""
    if amount >= 100000:
        # Check if divisible by 100,000 or 50,000 with zero decimals
        if amount % 100000 == 0 or (amount >= 500000 and amount % 50000 == 0):
            return True
    return False


def is_split_threshold(amount: float) -> bool:
    """
    Detects structuring/split transactions right below GFR (General Financial Rules)
    statutory procurement limits (e.g. 49,000 - 49,999 or 4,80,000 - 4,99,999) designed to bypass open tender calls.
    """
    # GFR threshold 1: INR 50,000 (direct procurement without quotation)
    if 45000 <= amount < 50000:
        return True
    # GFR threshold 2: INR 5,00,000 (quotation threshold before national e-tender)
    if 480000 <= amount < 500000:
        return True
    # GFR threshold 3: INR 25,00,000 (limited tender threshold)
    if 2400000 <= amount < 2500000:
        return True
    return False


def analyze_single_transaction(tx_data: Dict[str, Any], existing_txs: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Evaluates a transaction for anomalies against fiscal rules, GST compliance,
    statutory thresholds, duplicate patterns, and budget overruns.
    """
    amount = float(tx_data.get("amount", 0.0))
    allocated = float(tx_data.get("allocated_budget", 0.0))
    vendor = tx_data.get("vendor_name", "").strip()
    gstin = tx_data.get("vendor_gst", "").strip()
    tx_date = tx_data.get("transaction_date", "")
    ref_id = tx_data.get("reference_id", "")

    anomaly_flags = []
    anomaly_score = 0.0

    # 1. GSTIN Validation
    gst_valid, gst_msg = validate_gstin(gstin)
    if not gst_valid:
        anomaly_flags.append({
            "rule": "Invalid Vendor GSTIN / Shell Entity",
            "severity": "Critical",
            "score_impact": 40.0,
            "evidence": f"Vendor '{vendor}' has unverified GSTIN '{gstin}': {gst_msg}"
        })
        anomaly_score += 40.0

    # 2. Budget Overrun check
    if allocated > 0 and amount > allocated:
        overrun_pct = round(((amount - allocated) / allocated) * 100, 2)
        severity = "Critical" if overrun_pct > 20 else "High"
        anomaly_flags.append({
            "rule": "Fiscal Overrun / Unauthorized Disbursement",
            "severity": severity,
            "score_impact": 35.0,
            "evidence": f"Transaction of ₹{amount:,.2f} exceeds allocated scheme budget of ₹{allocated:,.2f} by {overrun_pct}%."
        })
        anomaly_score += 35.0

    # 3. Round-Sum Heuristic
    if is_round_number(amount):
        anomaly_flags.append({
            "rule": "Round-Sum Non-Itemized Disbursement",
            "severity": "Medium",
            "score_impact": 20.0,
            "evidence": f"Payout amount ₹{amount:,.2f} is an exact round figure without itemized milestone deductions."
        })
        anomaly_score += 20.0

    # 4. GFR Threshold Evading (Split Billing)
    if is_split_threshold(amount):
        anomaly_flags.append({
            "rule": "GFR E-Tender Avoidance / Split Billing Pattern",
            "severity": "High",
            "score_impact": 30.0,
            "evidence": f"Disbursement amount ₹{amount:,.2f} falls precisely beneath statutory competitive procurement threshold."
        })
        anomaly_score += 30.0

    # 5. Check duplicate or clustered payments in existing pool
    if existing_txs:
        for prev in existing_txs:
            if prev.get("id") == tx_data.get("id"):
                continue
            prev_vendor = prev.get("vendor_name", "").strip().lower()
            prev_amount = float(prev.get("amount", 0.0))
            prev_date = prev.get("transaction_date", "")

            # Exact duplicate invoice
            if prev_vendor == vendor.lower() and abs(prev_amount - amount) < 0.01 and prev_date == tx_date:
                anomaly_flags.append({
                    "rule": "Duplicate Payment / Double Invoicing",
                    "severity": "Critical",
                    "score_impact": 45.0,
                    "evidence": f"Identical amount ₹{amount:,.2f} paid to '{vendor}' on same date ({tx_date}) under Ref '{prev.get('reference_id')} vs {ref_id}'."
                })
                anomaly_score += 45.0
                break

    # Cap anomaly score at 100
    anomaly_score = min(100.0, round(anomaly_score, 1))

    # Determine risk level
    if anomaly_score >= 70.0:
        risk_level = "Critical"
    elif anomaly_score >= 40.0:
        risk_level = "High"
    elif anomaly_score >= 20.0:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    is_anomaly = anomaly_score >= 20.0
    primary_type = anomaly_flags[0]["rule"] if anomaly_flags else "None"
    primary_reason = " | ".join([f"{f['rule']}: {f['evidence']}" for f in anomaly_flags]) if anomaly_flags else "Normal verified transaction."

    return {
        "is_anomaly": is_anomaly,
        "anomaly_type": primary_type,
        "anomaly_score": anomaly_score,
        "risk_level": risk_level,
        "anomaly_reason": primary_reason,
        "flag_details": anomaly_flags
    }


def calculate_benford_distribution(amounts: List[float]) -> Dict[str, Any]:
    """
    Computes Benford's Law distribution on first digits of disbursement amounts.
    Detects financial manipulation and fabricated numbers.
    """
    first_digits = []
    for amt in amounts:
        if amt > 0:
            first_char = str(f"{amt:.2f}").lstrip("0.").replace(",", "")
            if first_char and first_char[0].isdigit() and first_char[0] != '0':
                first_digits.append(int(first_char[0]))

    total_samples = len(first_digits)
    if total_samples < 5:
        return {
            "conformity_status": "Insufficient Data",
            "total_samples": total_samples,
            "chi_square_stat": 0.0,
            "distribution": [
                {
                    "digit": d,
                    "actual_count": 0,
                    "actual_frequency": 0.0,
                    "benford_expected_frequency": round(BENFORD_IDEAL[d] * 100, 2),
                    "deviation": 0.0
                }
                for d in range(1, 10)
            ],
            "analysis_summary": "At least 5 transactions are needed for Benford distribution analysis."
        }

    counts = {d: first_digits.count(d) for d in range(1, 10)}
    chi_square = 0.0
    results = []

    for d in range(1, 10):
        actual_freq = round((counts[d] / total_samples) * 100, 2)
        expected_freq = round(BENFORD_IDEAL[d] * 100, 2)
        dev = round(actual_freq - expected_freq, 2)
        expected_count = total_samples * BENFORD_IDEAL[d]
        chi_square += ((counts[d] - expected_count) ** 2) / expected_count if expected_count > 0 else 0

        results.append({
            "digit": d,
            "actual_count": counts[d],
            "actual_frequency": actual_freq,
            "benford_expected_frequency": expected_freq,
            "deviation": dev
        })

    chi_square = round(chi_square, 2)

    # Degrees of freedom = 8. Critical value at p=0.05 is 15.51, at p=0.01 is 20.09
    if chi_square > 20.09:
        status = "High Non-Conformity (High Risk of Manipulation)"
        summary = f"Chi-Square statistic ({chi_square}) significantly exceeds threshold (20.09). High likelihood of non-random, artificial invoice pricing."
    elif chi_square > 15.51:
        status = "Moderate Deviation (Investigate Further)"
        summary = f"Chi-Square statistic ({chi_square}) indicates noticeable deviation from natural civic disbursement distribution."
    else:
        status = "Conforms to Natural Distribution"
        summary = f"Chi-Square statistic ({chi_square}) confirms disbursements conform closely to Benford's Law distribution."

    return {
        "conformity_status": status,
        "total_samples": total_samples,
        "chi_square_stat": chi_square,
        "distribution": results,
        "analysis_summary": summary
    }
