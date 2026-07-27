import os
from fastapi.responses import FileResponse

from app.reports.pdf_generator import generate_security_report_to_file
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.database.database import Base, SessionLocal, engine
from app.models.analysis import Analysis

from app.schemas.prompt import PromptRequest
from app.schemas.response import AnalysisResponse

from fastapi import Depends
from app.models.log_model import PromptLogModel

from app.services.analyzer import analyze_prompt
from app.services.history_service import (
    save_analysis,
    get_all_analyses,
    get_dashboard_stats,
)

from fastapi.responses import StreamingResponse

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    description="AI Security Evaluation Platform",
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Welcome to Sentra"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/analyze", response_model=AnalysisResponse)
def analyze(
    request: PromptRequest,
    db: Session = Depends(get_db),
):
    # 1. Run your comprehensive security evaluation (Rule Engine + Gemini AI)
    result = analyze_prompt(request.prompt)

    # 2. Save the full analysis to your primary history table
    analysis = save_analysis(
        db=db,
        prompt=result["prompt"],
        risk_score=result["risk_score"],
        severity=result["severity"],
        message=result["message"],
        detections=result.get("detections"),
        ai_confidence=result.get("ai_confidence"),
        analysis_engine="Rule Engine + Gemini AI",
    )

    result["id"] = analysis.id

    # 3. Also record a runtime audit log in PostgreSQL (matching Phase 1 audit tracking)
    db_log = PromptLogModel(
        event_type="PROMPT_SCAN",
        severity=result["severity"],
        action_taken="BLOCKED" if result["risk_score"] > 70 else "ALLOWED",
        latency_ms=15.0,  # You can use actual tracked execution time if available
        payload_snapshot=request.prompt,
    )
    db.add(db_log)
    db.commit()

    return result


@app.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
):
    return get_dashboard_stats(db)


@app.get("/history")
def history(
    db: Session = Depends(get_db),
):
    return get_all_analyses(db)


from datetime import datetime
from fastapi.responses import FileResponse

from app.reports.pdf_generator import generate_security_report_to_file


@app.get("/report/{analysis_id}")
def download_report(
    analysis_id: int,
    db: Session = Depends(get_db),
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()

    if not analysis:
        return {"error": "Analysis not found"}

    # Determine overall status
    if analysis.severity == "Critical":
        status = "Critical"
    elif analysis.severity in ["High", "Medium"]:
        status = "Warning"
    else:
        status = "Safe"

    report = {
        "report_id": f"SENTRA-{analysis.id:04d}",
        "analysis_id": analysis.id,
        "generated_at": datetime.now(),
        "analysis_engine": analysis.analysis_engine,
        "risk_score": analysis.risk_score,
        "severity": analysis.severity,
        "status": status,
        "original_prompt": analysis.prompt,
        "ai_assessment": analysis.message,
        # Use the real detections from the database
        "detections": [
            {
                "name": d.get("name", "Unknown"),
                "threat_type": d.get("category", "LLM Security"),
                "severity": d.get("severity", "Medium"),
                "detection_engine": (
                    "Gemini AI" if d.get("rule") == "Gemini" else "Rule Engine"
                ),
                "description": d.get("description", ""),
                "recommendation": d.get("recommendation", ""),
                "owasp": d.get("owasp", "N/A"),
            }
            for d in (analysis.detections or [])
        ],
        "recommendations": [
            "Review prompts before production deployment.",
            "Monitor AI interactions for suspicious behavior.",
            "Keep prompt injection detection enabled.",
        ],
    }

    os.makedirs("generated_reports", exist_ok=True)

    filename = f"generated_reports/Sentra_Report_{analysis.id}.pdf"

    generate_security_report_to_file(report, filename)

    return FileResponse(
        filename,
        media_type="application/pdf",
        filename=f"Sentra_Report_{analysis.id}.pdf",
    )
