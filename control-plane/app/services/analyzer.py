from app.detection.rules import detect_prompt_injection
from app.detection.scoring import calculate_risk_score
from app.ai.gemini_service import analyze_with_gemini


def analyze_prompt(prompt: str):
    # Existing rule-based detection
    detections = detect_prompt_injection(prompt)
    assessment = calculate_risk_score(detections)

    # Gemini analysis
    gemini = analyze_with_gemini(prompt)
    print(gemini)

    # Keep only the highest priority Gemini detection
    gemini_detections = []

    ai_detections = gemini.get("detections", [])

    if ai_detections:
        best = ai_detections[0]

        gemini_detections.append(
            {
                "id": "AI_DETECTION",
                "name": best.get("name", "AI Detection"),
                "category": "AI Analysis",
                "rule": "Gemini",
                "severity": gemini.get("severity", "Medium"),
                "score": int(gemini.get("risk_score", 50)),
                "description": best.get("description", ""),
                "owasp": best.get("owasp", "LLM01: Prompt Injection"),
                "recommendation": best.get("recommendation", ""),
            }
        )

    # Use Gemini summary if available
    message = gemini.get("summary", "No prompt injection patterns detected.")

    # Take the higher risk score
    risk_score = max(assessment["risk_score"], gemini.get("risk_score", 0))

    severity = gemini.get("severity", assessment["severity"])

    return {
        "prompt": prompt,
        "risk_score": risk_score,
        "severity": severity,
        "ai_confidence": gemini.get("confidence"),
        "message": message,
        "summary": message,
        "business_impact": gemini.get("business_impact", ""),
        "attack_scenario": gemini.get("attack_scenario", ""),
        "owasp": gemini.get("owasp", ""),
        "recommendations": gemini.get("recommendations", []),
        "secure_prompt": gemini.get("secure_prompt", prompt),
        "detections": detections + gemini_detections,
    }
