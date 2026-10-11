from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..models import Transaction, ReconciliationRecord


def run_full_reconciliation(db: Session) -> List[Dict[str, Any]]:
    """
    Executes automated financial reconciliation across all schemes and departments.
    Compares sanctioned budget envelopes against verified disbursed payments.
    """
    transactions = db.query(Transaction).all()
    if not transactions:
        return []

    # Group transactions by (scheme_name, department)
    grouped: Dict[tuple, List[Transaction]] = {}
    for tx in transactions:
        key = (tx.scheme_name, tx.department)
        if key not in grouped:
            grouped[key] = []
        grouped[key].append(tx)

    records_summary = []

    for (scheme, dept), tx_list in grouped.items():
        # Get maximum budget allocated for this scheme
        allocated_budget = max([tx.allocated_budget for tx in tx_list] or [0.0])
        disbursed_total = sum([tx.amount for tx in tx_list])
        flagged_count = sum([1 for tx in tx_list if tx.is_anomaly])

        unspent = max(0.0, allocated_budget - disbursed_total)
        overrun = max(0.0, disbursed_total - allocated_budget)
        discrepancy_amount = overrun if overrun > 0 else (allocated_budget - disbursed_total if disbursed_total < allocated_budget * 0.4 else 0.0)
        
        discrepancy_rate = 0.0
        if allocated_budget > 0:
            discrepancy_rate = round((abs(disbursed_total - allocated_budget) / allocated_budget) * 100, 2)

        # Determine status
        if disbursed_total > allocated_budget:
            status = "Overspent (Critical)"
            notes = f"Disbursement exceeded sanctioned outlay by ₹{overrun:,.2f} ({discrepancy_rate}% overrun). Immediate audit freeze recommended."
        elif discrepancy_rate > 50 and disbursed_total < allocated_budget * 0.5:
            status = "Under-utilized (Lapse Risk)"
            notes = f"Funds under-utilized by ₹{unspent:,.2f}. Risk of budgetary lapse before fiscal year end."
        elif flagged_count > 0:
            status = "High Variance (Flagged)"
            notes = f"{flagged_count} suspect disbursement transactions identified for investigation."
        else:
            status = "Balanced (Compliant)"
            notes = "Spending matches approved project milestones and GFR procurement quotas."

        # Find or create ReconciliationRecord in DB
        existing = db.query(ReconciliationRecord).filter(
            ReconciliationRecord.scheme_name == scheme,
            ReconciliationRecord.department == dept
        ).first()

        if existing:
            existing.allocated_budget = allocated_budget
            existing.disbursed_amount = disbursed_total
            existing.unspent_balance = unspent
            existing.discrepancy_amount = discrepancy_amount
            existing.discrepancy_rate = discrepancy_rate
            existing.status = status
            existing.flagged_transactions_count = flagged_count
            existing.notes = notes
            existing.updated_at = datetime.utcnow()
        else:
            new_record = ReconciliationRecord(
                scheme_name=scheme,
                department=dept,
                financial_year="2025-2026",
                allocated_budget=allocated_budget,
                disbursed_amount=disbursed_total,
                unspent_balance=unspent,
                discrepancy_amount=discrepancy_amount,
                discrepancy_rate=discrepancy_rate,
                status=status,
                flagged_transactions_count=flagged_count,
                notes=notes
            )
            db.add(new_record)

        records_summary.append({
            "scheme_name": scheme,
            "department": dept,
            "allocated_budget": allocated_budget,
            "disbursed_amount": disbursed_total,
            "unspent_balance": unspent,
            "discrepancy_amount": discrepancy_amount,
            "discrepancy_rate": discrepancy_rate,
            "status": status,
            "flagged_count": flagged_count,
            "notes": notes
        })

    db.commit()
    return records_summary
