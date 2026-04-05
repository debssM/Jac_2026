# server.py — FastAPI backend for QuiTam Copilot frontend demo

import os
import json
import anthropic
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("KEY:", os.environ.get("ANTHROPIC_API_KEY", "NOT SET")[:15], "...")

# In-memory state (shared across requests for the demo session)
_state: dict = {
    "analysis": None,
    "scores": None,
    "evidence": [],
    "timeline": None,
}

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Max characters per uploaded file sent to Claude (~2 000 tokens each).
# Keeps total input well under rate-limit thresholds.
MAX_DOC_CHARS = 8_000


def call_claude(user: str) -> str:
    msg = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        messages=[{"role": "user", "content": user}],
    )
    return msg.content[0].text


def parse_json(raw: str):
    try:
        clean = raw.strip()
        if clean.startswith("```"):
            parts = clean.split("```")
            clean = parts[1]
            if clean.startswith("json"):
                clean = clean[4:]
        parsed = json.loads(clean)
        return parsed if isinstance(parsed, dict) else {}
    except Exception:
        return {}


ANALYSIS_PROMPT = """You are a False Claims Act legal and healthcare fraud expert.

Analyze the provided documents in a single pass and return a JSON object with ALL of the following keys:

"evidence": list of objects, each with:
  - evidence_type: "billing_anomaly" | "email_evidence" | "pattern" | "provider" | "amount"
  - description: specific finding with numbers and details
  - source_doc: exact filename this came from (must match one of the FILE names provided)
  - confidence: float 0.0–1.0
  (Flag CPT code billed >70% of visits — national avg for 99215 is 15–40%. Flag emails showing intent to commit fraud.)

"timeline": object with:
  - fraud_start: "YYYY-MM"
  - fraud_end: "YYYY-MM"
  - total_duration_months: integer
  - events: list of short strings in chronological order

"fca": object with:
  - falsity:     { score: float 0–1, type: "factual"|"legal",                        evidence: [str] }
  - scienter:    { score: float 0–1, type: "actual"|"deliberate_ignorance"|"reckless", evidence: [str] }
  - materiality: { score: float 0–1, relied: bool,                                   evidence: [str] }
  - causation:   { score: float 0–1, chain: str,                                     evidence: [str] }

"damages": object with:
  - defendant: name of the fraudulent provider
  - total_false_claims: integer
  - overpayment_per_claim: float
  - base_damages: float
  - treble_damages: float  (base_damages × 3)
  - total_min_exposure: float  (treble_damages + 13946 × total_false_claims)
  - total_max_exposure: float  (treble_damages + 27894 × total_false_claims)
  - case_summary: two-sentence plain-English summary of the fraud

Return ONLY valid JSON. No other text."""


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.post("/walker/analyze_case")
async def analyze_case(request: Request):
    try:
        body = await request.json()
        files = body.get("files", [])

        # Truncate each file so the combined input stays manageable
        docs_text = "\n\n".join(
            f"FILE: {f['filename']}\nTYPE: {f['doc_type']}\nCONTENT:\n{f['content'][:MAX_DOC_CHARS]}"
            for f in files
        )

        raw = call_claude(f"{ANALYSIS_PROMPT}\n\nDOCUMENTS:\n{docs_text}")
        result = parse_json(raw)

        damages       = result.get("damages", {})
        fca_data      = result.get("fca", {})
        timeline_data = result.get("timeline", {})
        evidence_list = result.get("evidence", [])

        # Collect filenames for source fallback
        filenames = [f["filename"] for f in files]
        default_source = filenames[0] if filenames else ""

        _state["evidence"] = [
            {
                "type":        e.get("evidence_type", "billing_anomaly"),
                "description": e.get("description", ""),
                # Fall back to first filename if Claude omitted source_doc
                "source":      e.get("source_doc", "") or default_source,
                "confidence":  float(e.get("confidence", 0.9)),
            }
            for e in evidence_list
            if isinstance(e, dict)
        ]

        _state["timeline"] = {
            "fraud_start":           timeline_data.get("fraud_start", "2022-01"),
            "fraud_end":             timeline_data.get("fraud_end", "2022-12"),
            "total_duration_months": int(timeline_data.get("total_duration_months", 12)),
            "events":                timeline_data.get("events", []),
        }

        _state["scores"] = {
            "falsity":     float((fca_data.get("falsity")     or {}).get("score", 0.7)),
            "scienter":    float((fca_data.get("scienter")    or {}).get("score", 0.7)),
            "materiality": float((fca_data.get("materiality") or {}).get("score", 0.7)),
            "causation":   float((fca_data.get("causation")   or {}).get("score", 0.7)),
        }

        overall_strength = round(sum(_state["scores"].values()) / 4, 2)

        _state["analysis"] = {
            "defendant":          damages.get("defendant", "Unknown Provider"),
            "total_false_claims": int(damages.get("total_false_claims", 0)),
            "base_damages":       float(damages.get("base_damages", 0.0)),
            "treble_damages":     float(damages.get("treble_damages", 0.0)),
            "total_exposure":     float(damages.get("total_max_exposure", 0.0)),
            "case_summary":       damages.get("case_summary", ""),
            "overall_strength":   overall_strength,
        }

        return {"reports": [_state["analysis"]]}

    except anthropic.RateLimitError:
        return JSONResponse(status_code=429, content={"detail": "Claude rate limit hit. Please wait a minute and try again."})
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})


@app.post("/walker/get_scores")
async def get_scores():
    return {"reports": [_state["scores"]] if _state["scores"] else []}


@app.post("/walker/get_evidence")
async def get_evidence():
    return {"reports": _state["evidence"]}


@app.post("/walker/get_timeline")
async def get_timeline():
    return {"reports": [_state["timeline"]] if _state["timeline"] else []}


@app.post("/walker/reset_case")
async def reset_case():
    _state.update({"analysis": None, "scores": None, "evidence": [], "timeline": None})
    return {"reports": []}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
