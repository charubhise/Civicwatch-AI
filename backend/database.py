import os
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base, Transaction, ReconciliationRecord, AnomalyReport, DataGovSource
from .services.anomaly_detection import analyze_single_transaction
from .services.reconciliation import run_full_reconciliation

DB_PATH = os.path.join(os.path.dirname(__file__), "civicwatch.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_initial_civic_data():
    """Initializes SQLite database and populates with realistic data.gov.in civic spending datasets."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # If transactions already exist, run reconciliation and return
    if db.query(Transaction).count() > 0:
        run_full_reconciliation(db)
        db.close()
        return

    # Seed data.gov.in source references
    sources = [
        DataGovSource(
            dataset_title="Smart Cities Mission - Physical and Financial Progress (OGD India)",
            resource_id="ee1b7348-18e9-4e5a-8b17-742a77ec6b89",
            api_endpoint="https://api.data.gov.in/resource/ee1b7348-18e9-4e5a-8b17-742a77ec6b89",
            records_count=42,
            status="Active Connected"
        ),
        DataGovSource(
            dataset_title="Pradhan Mantri Gram Sadak Yojana (PMGSY) Road Works Disbursals",
            resource_id="9ef8426f-d5d2-476c-9419-bf729b8c919d",
            api_endpoint="https://api.data.gov.in/resource/9ef8426f-d5d2-476c-9419-bf729b8c919d",
            records_count=38,
            status="Active Connected"
        ),
        DataGovSource(
            dataset_title="AMRUT Municipal Water & Drainage Infrastructure Outlays",
            resource_id="c3a4f107-1602-4ec1-a9f8-58da50d60d31",
            api_endpoint="https://api.data.gov.in/resource/c3a4f107-1602-4ec1-a9f8-58da50d60d31",
            records_count=29,
            status="Active Connected"
        ),
        DataGovSource(
            dataset_title="National Health Mission (NHM) District Healthcare Equipment Procurement",
            resource_id="7b3112d4-3a21-4fa9-b883-91c28f141870",
            api_endpoint="https://api.data.gov.in/resource/7b3112d4-3a21-4fa9-b883-91c28f141870",
            records_count=25,
            status="Active Connected"
        )
    ]
    for s in sources:
        db.add(s)

    # Initial realistic Indian Civic Expenditure datasets (matching data.gov.in formats)
    sample_transactions = [
        # --- Smart Cities Mission ---
        {
            "reference_id": "GEM/2026/B/892101",
            "department": "Ministry of Housing & Urban Affairs",
            "scheme_name": "Smart Cities Mission",
            "vendor_name": "Larsen & Turbo Infotech Ltd",
            "vendor_gst": "27AAACL1245G1Z8",
            "amount": 14500000.0,
            "allocated_budget": 50000000.0,
            "transaction_date": "2026-02-14",
            "category": "Smart Infrastructure & IoT",
            "state": "Maharashtra",
            "district": "Pune",
            "source_platform": "data.gov.in / OGD India",
            "status": "Completed"
        },
        {
            "reference_id": "GEM/2026/B/892102",
            "department": "Ministry of Housing & Urban Affairs",
            "scheme_name": "Smart Cities Mission",
            "vendor_name": "TechPulse Mobility Solutions Pvt Ltd",
            "vendor_gst": "27AABCT9981K1Z2",
            "amount": 8200000.0,
            "allocated_budget": 50000000.0,
            "transaction_date": "2026-02-28",
            "category": "Intelligent Traffic Management",
            "state": "Maharashtra",
            "district": "Pune",
            "source_platform": "data.gov.in / OGD India",
            "status": "Completed"
        },
        # Anomaly 1: Exact round sum without itemized bill
        {
            "reference_id": "GEM/2026/B/892103",
            "department": "Ministry of Housing & Urban Affairs",
            "scheme_name": "Smart Cities Mission",
            "vendor_name": "Apex Civic Consultancy LLP",
            "vendor_gst": "27AAZFA4412L1Z9",
            "amount": 5000000.0, # Exactly ₹50 Lakh round sum
            "allocated_budget": 50000000.0,
            "transaction_date": "2026-03-02",
            "category": "Consultancy & Supervision",
            "state": "Maharashtra",
            "district": "Pune",
            "source_platform": "data.gov.in / OGD India",
            "status": "Under Review"
        },

        # --- PMGSY Rural Roads ---
        {
            "reference_id": "PMGSY/MP/2026/410",
            "department": "Ministry of Rural Development",
            "scheme_name": "PM Gram Sadak Yojana (PMGSY)",
            "vendor_name": "Shree Ram Infratech Pvt Ltd",
            "vendor_gst": "23AAMCS5412Q1Z4",
            "amount": 12850000.0,
            "allocated_budget": 35000000.0,
            "transaction_date": "2026-01-18",
            "category": "Rural Connectivity",
            "state": "Madhya Pradesh",
            "district": "Bhopal",
            "source_platform": "data.gov.in / OGD India",
            "status": "Completed"
        },
        {
            "reference_id": "PMGSY/MP/2026/411",
            "department": "Ministry of Rural Development",
            "scheme_name": "PM Gram Sadak Yojana (PMGSY)",
            "vendor_name": "Shree Ram Infratech Pvt Ltd",
            "vendor_gst": "23AAMCS5412Q1Z4",
            "amount": 11400000.0,
            "allocated_budget": 35000000.0,
            "transaction_date": "2026-02-12",
            "category": "Rural Connectivity",
            "state": "Madhya Pradesh",
            "district": "Sehore",
            "source_platform": "data.gov.in / OGD India",
            "status": "Completed"
        },
        # Anomaly 2: Budget Overrun on scheme
        {
            "reference_id": "PMGSY/MP/2026/412",
            "department": "Ministry of Rural Development",
            "scheme_name": "PM Gram Sadak Yojana (PMGSY)",
            "vendor_name": "Vindhya Buildcon Ltd",
            "vendor_gst": "23AAACV8892D1Z3",
            "amount": 16500000.0, # Cumulative will exceed 35,000,000
            "allocated_budget": 35000000.0,
            "transaction_date": "2026-03-10",
            "category": "Rural Connectivity",
            "state": "Madhya Pradesh",
            "district": "Raisen",
            "source_platform": "data.gov.in / OGD India",
            "status": "Flagged"
        },

        # --- AMRUT Water & Sewage ---
        {
            "reference_id": "AMRUT/TN/CHE/109",
            "department": "Ministry of Jal Shakti",
            "scheme_name": "AMRUT Urban Water Mission",
            "vendor_name": "Chennai Water Treatment Consortium",
            "vendor_gst": "33AACCT9901M1Z1",
            "amount": 22400000.0,
            "allocated_budget": 60000000.0,
            "transaction_date": "2026-01-25",
            "category": "Drinking Water Supply",
            "state": "Tamil Nadu",
            "district": "Chennai",
            "source_platform": "data.gov.in / OGD India",
            "status": "Completed"
        },
        {
            "reference_id": "AMRUT/TN/CHE/110",
            "department": "Ministry of Jal Shakti",
            "scheme_name": "AMRUT Urban Water Mission",
            "vendor_name": "Kaveri Hydro Pipelines Ltd",
            "vendor_gst": "33AAACK4411P1Z7",
            "amount": 18900000.0,
            "allocated_budget": 60000000.0,
            "transaction_date": "2026-02-20",
            "category": "Sewage Treatment Plant",
            "state": "Tamil Nadu",
            "district": "Chennai",
            "source_platform": "data.gov.in / OGD India",
            "status": "Completed"
        },
        # Anomaly 3: Duplicate invoice submitted on same date & amount
        {
            "reference_id": "AMRUT/TN/CHE/110-DUP",
            "department": "Ministry of Jal Shakti",
            "scheme_name": "AMRUT Urban Water Mission",
            "vendor_name": "Kaveri Hydro Pipelines Ltd",
            "vendor_gst": "33AAACK4411P1Z7",
            "amount": 18900000.0, # Exact duplicate
            "allocated_budget": 60000000.0,
            "transaction_date": "2026-02-20",
            "category": "Sewage Treatment Plant",
            "state": "Tamil Nadu",
            "district": "Chennai",
            "source_platform": "data.gov.in / OGD India",
            "status": "Flagged"
        },

        # --- Swachh Bharat Mission (Urban) ---
        {
            "reference_id": "SBM-U/UP/VAR/301",
            "department": "Ministry of Housing & Urban Affairs",
            "scheme_name": "Swachh Bharat Mission (Urban)",
            "vendor_name": "CleanCity Waste Management Solutions",
            "vendor_gst": "09AAACC5589F1Z0",
            "amount": 7650000.0,
            "allocated_budget": 25000000.0,
            "transaction_date": "2026-01-10",
            "category": "Waste Processing & Sanitation",
            "state": "Uttar Pradesh",
            "district": "Varanasi",
            "source_platform": "data.gov.in / OGD India",
            "status": "Completed"
        },
        # Anomaly 4: Split billing below GFR statutory limit
        {
            "reference_id": "SBM-U/UP/VAR/302",
            "department": "Ministry of Housing & Urban Affairs",
            "scheme_name": "Swachh Bharat Mission (Urban)",
            "vendor_name": "CleanCity Waste Management Solutions",
            "vendor_gst": "09AAACC5589F1Z0",
            "amount": 495000.0, # Just below ₹5,00,000 threshold
            "allocated_budget": 25000000.0,
            "transaction_date": "2026-01-12",
            "category": "Sanitation Fleet Spare Parts",
            "state": "Uttar Pradesh",
            "district": "Varanasi",
            "source_platform": "data.gov.in / OGD India",
            "status": "Under Review"
        },
        # Anomaly 5: Structuring second split bill
        {
            "reference_id": "SBM-U/UP/VAR/303",
            "department": "Ministry of Housing & Urban Affairs",
            "scheme_name": "Swachh Bharat Mission (Urban)",
            "vendor_name": "CleanCity Waste Management Solutions",
            "vendor_gst": "09AAACC5589F1Z0",
            "amount": 492000.0, # Another ₹4.92 Lakh bill right after
            "allocated_budget": 25000000.0,
            "transaction_date": "2026-01-13",
            "category": "Sanitation Fleet Spare Parts",
            "state": "Uttar Pradesh",
            "district": "Varanasi",
            "source_platform": "data.gov.in / OGD India",
            "status": "Under Review"
        },

        # --- National Health Mission (NHM) ---
        {
            "reference_id": "NHM/KA/BLR/881",
            "department": "Ministry of Health & Family Welfare",
            "scheme_name": "National Health Mission (NHM)",
            "vendor_name": "Meditech Systems India Pvt Ltd",
            "vendor_gst": "29AAACM4002H1Z5",
            "amount": 9400000.0,
            "allocated_budget": 40000000.0,
            "transaction_date": "2026-02-05",
            "category": "Medical Equipment & ICU Setup",
            "state": "Karnataka",
            "district": "Bengaluru Urban",
            "source_platform": "data.gov.in / OGD India",
            "status": "Completed"
        },
        {
            "reference_id": "NHM/KA/BLR/882",
            "department": "Ministry of Health & Family Welfare",
            "scheme_name": "National Health Mission (NHM)",
            "vendor_name": "LifeCare Diagnostics Ltd",
            "vendor_gst": "29AAACL7721N1Z3",
            "amount": 6250000.0,
            "allocated_budget": 40000000.0,
            "transaction_date": "2026-02-18",
            "category": "Diagnostics & Lab Upgrades",
            "state": "Karnataka",
            "district": "Bengaluru Urban",
            "source_platform": "data.gov.in / OGD India",
            "status": "Completed"
        },
        # Anomaly 6: Invalid GSTIN / Shell Vendor
        {
            "reference_id": "NHM/KA/BLR/883",
            "department": "Ministry of Health & Family Welfare",
            "scheme_name": "National Health Mission (NHM)",
            "vendor_name": "QuickCure Global Enterprises",
            "vendor_gst": "99INVALIDGST999", # Broken format
            "amount": 4800000.0,
            "allocated_budget": 40000000.0,
            "transaction_date": "2026-02-25",
            "category": "Hospital Consumables",
            "state": "Karnataka",
            "district": "Bengaluru Urban",
            "source_platform": "data.gov.in / OGD India",
            "status": "Flagged"
        },

        # --- Jal Jeevan Mission ---
        {
            "reference_id": "JJM/RJ/JAI/550",
            "department": "Ministry of Jal Shakti",
            "scheme_name": "Jal Jeevan Mission (Har Ghar Jal)",
            "vendor_name": "Marwar Water Works Co",
            "vendor_gst": "08AAACM6312R1Z2",
            "amount": 14200000.0,
            "allocated_budget": 45000000.0,
            "transaction_date": "2026-01-20",
            "category": "Tap Water Pipeline Network",
            "state": "Rajasthan",
            "district": "Jaipur",
            "source_platform": "data.gov.in / OGD India",
            "status": "Completed"
        },
        {
            "reference_id": "JJM/RJ/JAI/551",
            "department": "Ministry of Jal Shakti",
            "scheme_name": "Jal Jeevan Mission (Har Ghar Jal)",
            "vendor_name": "Thar Borewells & Infrastructure",
            "vendor_gst": "08AAACT1940E1Z6",
            "amount": 11300000.0,
            "allocated_budget": 45000000.0,
            "transaction_date": "2026-02-15",
            "category": "Solar Pumps & Borewells",
            "state": "Rajasthan",
            "district": "Jodhpur",
            "source_platform": "data.gov.in / OGD India",
            "status": "Completed"
        },
        # Anomaly 7: High round sum payout
        {
            "reference_id": "JJM/RJ/JAI/552",
            "department": "Ministry of Jal Shakti",
            "scheme_name": "Jal Jeevan Mission (Har Ghar Jal)",
            "vendor_name": "Sunrise Tech Services",
            "vendor_gst": "08AAACS8819Q1Z8",
            "amount": 10000000.0, # Exactly ₹1 Crore round sum
            "allocated_budget": 45000000.0,
            "transaction_date": "2026-03-05",
            "category": "Project Supervision & Audit",
            "state": "Rajasthan",
            "district": "Jaipur",
            "source_platform": "data.gov.in / OGD India",
            "status": "Under Review"
        },

        # --- PM e-Bus Sewa ---
        {
            "reference_id": "EBUS/GJ/AHM/701",
            "department": "Ministry of Heavy Industries",
            "scheme_name": "PM e-Bus Sewa Scheme",
            "vendor_name": "Gujarat Electric Mobility Ltd",
            "vendor_gst": "24AAACG8812J1Z3",
            "amount": 31500000.0,
            "allocated_budget": 80000000.0,
            "transaction_date": "2026-02-10",
            "category": "Electric Bus Charging Infrastructure",
            "state": "Gujarat",
            "district": "Ahmedabad",
            "source_platform": "data.gov.in / OGD India",
            "status": "Completed"
        },
        {
            "reference_id": "EBUS/GJ/SUR/702",
            "department": "Ministry of Heavy Industries",
            "scheme_name": "PM e-Bus Sewa Scheme",
            "vendor_name": "Surat Clean Transit Solutions",
            "vendor_gst": "24AAACS3341H1Z9",
            "amount": 28400000.0,
            "allocated_budget": 80000000.0,
            "transaction_date": "2026-02-22",
            "category": "Electric Bus Charging Infrastructure",
            "state": "Gujarat",
            "district": "Surat",
            "source_platform": "data.gov.in / OGD India",
            "status": "Completed"
        }
    ]

    saved_txs = []
    for tx_dict in sample_transactions:
        # Evaluate anomaly
        eval_result = analyze_single_transaction(tx_dict, existing_txs=saved_txs)
        
        tx = Transaction(
            reference_id=tx_dict["reference_id"],
            department=tx_dict["department"],
            scheme_name=tx_dict["scheme_name"],
            vendor_name=tx_dict["vendor_name"],
            vendor_gst=tx_dict["vendor_gst"],
            amount=tx_dict["amount"],
            allocated_budget=tx_dict["allocated_budget"],
            transaction_date=tx_dict["transaction_date"],
            category=tx_dict["category"],
            state=tx_dict["state"],
            district=tx_dict["district"],
            source_platform=tx_dict["source_platform"],
            status="Flagged" if eval_result["is_anomaly"] else tx_dict["status"],
            is_anomaly=eval_result["is_anomaly"],
            anomaly_type=eval_result["anomaly_type"],
            anomaly_score=eval_result["anomaly_score"],
            risk_level=eval_result["risk_level"],
            anomaly_reason=eval_result["anomaly_reason"]
        )
        db.add(tx)
        db.flush() # get tx.id

        # If anomaly, add report
        if eval_result["is_anomaly"]:
            for flag in eval_result["flag_details"]:
                report = AnomalyReport(
                    transaction_id=tx.id,
                    rule_name=flag["rule"],
                    severity=flag["severity"],
                    confidence_score=92.5,
                    evidence=flag["evidence"],
                    resolution_status="Open"
                )
                db.add(report)

        saved_txs.append({
            "id": tx.id,
            "reference_id": tx.reference_id,
            "vendor_name": tx.vendor_name,
            "amount": tx.amount,
            "transaction_date": tx.transaction_date
        })

    db.commit()
    # Now run reconciliation across schemes
    run_full_reconciliation(db)
    db.close()
