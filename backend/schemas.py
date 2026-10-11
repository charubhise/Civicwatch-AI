from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class TransactionBase(BaseModel):
    reference_id: str
    department: str
    scheme_name: str
    vendor_name: str
    vendor_gst: str
    amount: float
    allocated_budget: float
    transaction_date: str
    category: Optional[str] = "Public Works"
    state: str
    district: str
    source_platform: Optional[str] = "data.gov.in / OGD India"
    status: Optional[str] = "Completed"


class TransactionCreate(TransactionBase):
    pass


class AnomalyReportSchema(BaseModel):
    id: int
    transaction_id: int
    rule_name: str
    severity: str
    confidence_score: float
    evidence: str
    detected_at: datetime
    resolution_status: str
    resolution_notes: Optional[str] = ""

    class Config:
        from_attributes = True


class TransactionResponse(TransactionBase):
    id: int
    is_anomaly: bool
    anomaly_type: str
    anomaly_score: float
    risk_level: str
    anomaly_reason: str
    created_at: datetime
    anomalies: List[AnomalyReportSchema] = []

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[TransactionResponse]


class ReconciliationResponse(BaseModel):
    id: int
    scheme_name: str
    department: str
    financial_year: str
    allocated_budget: float
    disbursed_amount: float
    unspent_balance: float
    discrepancy_amount: float
    discrepancy_rate: float
    status: str
    flagged_transactions_count: int
    notes: str
    updated_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_monitored_amount: float
    total_budget_allocated: float
    total_transactions: int
    flagged_anomalies_count: int
    flagged_anomaly_amount: float
    reconciliation_rate: float
    high_risk_count: int
    critical_risk_count: int
    department_count: int
    schemes_count: int
    risk_distribution: Dict[str, int]
    anomaly_type_distribution: Dict[str, int]
    top_discrepancy_schemes: List[Dict[str, Any]]
    state_expenditure: List[Dict[str, Any]]


class BenfordAnalysisResult(BaseModel):
    digit: int
    actual_count: int
    actual_frequency: float
    benford_expected_frequency: float
    deviation: float


class BenfordResponse(BaseModel):
    conformity_status: str  # Conforms, Moderate Deviation, High Non-Conformity
    total_samples: int
    chi_square_stat: float
    distribution: List[BenfordAnalysisResult]
    analysis_summary: str


class AnomalyResolutionRequest(BaseModel):
    resolution_status: str  # Resolved, Under Investigation, False Positive
    resolution_notes: str


class DataGovSyncRequest(BaseModel):
    api_key: Optional[str] = None
    resource_id: Optional[str] = None
    dataset_title: Optional[str] = None
    state_filter: Optional[str] = None
    records_limit: Optional[int] = 50


class DataGovSyncResponse(BaseModel):
    success: bool
    message: str
    records_synced: int
    dataset_title: str
    anomalies_detected: int
    sync_source: str


class DataGovDatasetItem(BaseModel):
    id: str
    title: str
    ministry: str
    description: str
    resource_id: str
    records_estimate: int
    category: str


class AuditReportResponse(BaseModel):
    generated_at: str
    total_audited_transactions: int
    total_expenditure: float
    total_budget: float
    fiscal_integrity_score: float
    risk_summary: Dict[str, Any]
    departmental_health: List[Dict[str, Any]]
    key_findings: List[str]
    compliance_recommendations: List[str]
