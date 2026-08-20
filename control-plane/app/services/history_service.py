from sqlalchemy.orm import Session

from app.models.analysis import Analysis


def save_analysis(
    db: Session,
    prompt: str,
    risk_score: int,
    severity: str,
    message: str,
    detections=None,
    ai_confidence=None,
    analysis_engine="Rule Engine + Gemini AI",

    summary=None,
    business_impact=None,
    attack_scenario=None,
    secure_prompt=None,
    owasp=None,
    recommendations=None,
):
    analysis = Analysis(
        prompt=prompt,
        risk_score=risk_score,
        severity=severity,

        message=message,

        summary=summary,
        business_impact=business_impact,
        attack_scenario=attack_scenario,
        secure_prompt=secure_prompt,
        owasp=owasp,
        recommendations=recommendations,

        detections=detections,
        ai_confidence=ai_confidence,
        analysis_engine=analysis_engine,
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return analysis


def get_all_analyses(db: Session):
    return db.query(Analysis).order_by(Analysis.created_at.desc()).all()


def get_dashboard_stats(db: Session):
    analyses = db.query(Analysis).all()

    total = len(analyses)

    critical = sum(1 for a in analyses if a.severity == "Critical")
    high = sum(1 for a in analyses if a.severity == "High")
    medium = sum(1 for a in analyses if a.severity == "Medium")
    low = sum(1 for a in analyses if a.severity == "Low")

    security_score = round(sum(a.risk_score for a in analyses) / total) if total else 0

    detection_rate = (
        round(((critical + high + medium) / total) * 100, 1) if total else 0
    )

    return {
    "security_score": security_score,
    "critical_threats": critical,
    "total_analyses": total,
    "detection_rate": detection_rate,

    "timeline": {
        "labels": [a.created_at.strftime("%d %b") for a in analyses[-7:]],
        "safe": [1 if a.severity == "Low" else 0 for a in analyses[-7:]],
        "warning": [
            1 if a.severity in ["Medium", "High"] else 0
            for a in analyses[-7:]
        ],
        "critical": [
            1 if a.severity == "Critical" else 0
            for a in analyses[-7:]
        ],
    },

    "distribution": [
        {
            "label": "Prompt Injection",
            "value": sum(
                1
                for a in analyses
                for d in (a.detections or [])
                if d.get("name") == "Prompt Injection"
            ),
        },
        {
            "label": "Jailbreak Attempt",
            "value": sum(
                1
                for a in analyses
                for d in (a.detections or [])
                if d.get("name") == "Jailbreak Attempt"
            ),
        },
        {
            "label": "Sensitive Information Disclosure",
            "value": sum(
                1
                for a in analyses
                for d in (a.detections or [])
                if d.get("name") == "Sensitive Information Disclosure"
            ),
        },
        {
            "label": "Role Manipulation",
            "value": sum(
                1
                for a in analyses
                for d in (a.detections or [])
                if d.get("name") == "Role Manipulation"
            ),
        },
        {
            "label": "Unsafe Instructions",
            "value": sum(
                1
                for a in analyses
                for d in (a.detections or [])
                if d.get("name") == "Unsafe Instructions"
            ),
        },
    ],
}
