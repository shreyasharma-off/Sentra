import {
  DETECTION_CATEGORIES,
  CONTEXT_OPTIONS,
} from "../../constants/detection";

export { DETECTION_CATEGORIES, CONTEXT_OPTIONS };

export const PROMPT_MAX_LENGTH = 8000;

const API_BASE = "http://localhost:8000";

export async function analyzePrompt(
  { prompt, context },
  { onEngineUpdate } = {},
) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt cannot be empty.");
  }

  for (const category of DETECTION_CATEGORIES) {
    onEngineUpdate?.(category.id, "scanning");
  }

  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
    }),
  });

  if (!response.ok) {
    throw new Error("Analysis failed.");
  }

  const data = await response.json();

  const detections = {};

  DETECTION_CATEGORIES.forEach((category) => {
    detections[category.id] = {
      status: "clear",
      confidence: data.confidence || 0,
      reasoning: "No threats detected.",
    };
  });

  (data.detections || []).forEach((detection) => {
    const key = detection.category;

    if (!detections[key]) return;

    detections[key] = {
      status:
        detection.severity === "Critical"
          ? "flagged-critical"
          : "flagged-warning",
      confidence: data.confidence || 0,
      reasoning: detection.description,
    };
  });

  for (const category of DETECTION_CATEGORIES) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    onEngineUpdate?.(
      category.id,
      detections[category.id].status,
      detections[category.id],
    );
  }

  return {
    id: data.id,

    prompt,

    context,

    riskScore: data.risk_score,

    riskLevel:
      data.severity === "Critical"
        ? "critical"
        : data.severity === "High" || data.severity === "Medium"
          ? "warning"
          : "safe",

    businessImpact: data.business_impact,

    attackScenario: data.attack_scenario,

    owasp: data.owasp,

    recommendations: data.recommendations || [],

    securePrompt: data.secure_prompt,

    summary: data.summary,

    detections,

    analyzedAt: new Date().toISOString(),
  };
}
