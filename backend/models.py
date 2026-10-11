from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    reference_id = Column(String(64), unique=True, index=True)
    department = Column(String(128), index=True)
    scheme_name = Column(String(128), index=True)
    vendor_name = Column(String(128), index=True)
    vendor_gst = Column(String(32), index=True)
    amount = Column(Float, nullable=False)
    allocated_budget = Column(Float, nullable=False, default=0.0)
    transaction_date = Column(String(16), nullable=False)
    category = Column(String(64), default="Public Works")
    state = Column(String(64), index=True)
    district = Column(String(64), index=True)
    source_platform = Column(String(64), default="data.gov.in / OGD India")
    status = Column(String(32), default="Completed")
    
    # Anomaly fields
    is_anomaly = Column(Boolean, default=False, index=True)
    anomaly_type = Column(String(64), default="None")
    anomaly_score = Column(Float, default=0.0)
    risk_level = Column(String(16), default="Low")  # Low, Medium, High, Critical
    anomaly_reason = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    anomalies = relationship("AnomalyReport", back_populates="transaction", cascade="all, delete-orphan")


class ReconciliationRecord(Base):
    __tablename__ = "reconciliation_records"

    id = Column(Integer, primary_key=True, index=True)
    scheme_name = Column(String(128), index=True)
    department = Column(String(128), index=True)
    financial_year = Column(String(16), default="2025-2026")
    allocated_budget = Column(Float, nullable=False)
    disbursed_amount = Column(Float, nullable=False)
    unspent_balance = Column(Float, default=0.0)
    discrepancy_amount = Column(Float, default=0.0)
    discrepancy_rate = Column(Float, default=0.0)  # percentage
    status = Column(String(32), default="Balanced") # Balanced, Overspent, Under-utilized, High Variance
    flagged_transactions_count = Column(Integer, default=0)
    notes = Column(Text, default="")
    updated_at = Column(DateTime, default=datetime.utcnow)


class AnomalyReport(Base):
    __tablename__ = "anomaly_reports"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), index=True)
    rule_name = Column(String(64))
    severity = Column(String(16))  # Low, Medium, High, Critical
    confidence_score = Column(Float, default=90.0)
    evidence = Column(Text)
    detected_at = Column(DateTime, default=datetime.utcnow)
    resolution_status = Column(String(32), default="Open") # Open, Under Investigation, False Positive, Resolved
    resolution_notes = Column(Text, default="")

    transaction = relationship("Transaction", back_populates="anomalies")


class DataGovSource(Base):
    __tablename__ = "datagov_sources"

    id = Column(Integer, primary_key=True, index=True)
    dataset_title = Column(String(256))
    resource_id = Column(String(128))
    api_endpoint = Column(String(512))
    records_count = Column(Integer, default=0)
    last_synced = Column(DateTime, default=datetime.utcnow)
    status = Column(String(32), default="Connected")
