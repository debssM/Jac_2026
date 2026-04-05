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

# ── In-memory state ───────────────────────────────────────────────────────────
_state: dict = {
    "analysis": None,
    "scores": None,
    "evidence": [],
    "timeline": None,
}

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

MAX_DOC_CHARS = 8_000


# ── Demo mode ─────────────────────────────────────────────────────────────────
# When any of these filenames are uploaded the server returns pre-baked data
# instantly — no API call, no buffering, guaranteed to work on stage.

DEMO_FILENAMES = {
    "billing_records.csv",
    "internal_emails.txt",
    "national_fm_benchmark.csv",
    "ehr_audit_log.csv",
    "news_clipping_palm_bay.txt",
    "sample_patient_records.txt",
    "whistleblower_declaration.txt",
}

DEMO_ANALYSIS = {
    "defendant":          "Sunrise Family Medicine Group",
    "total_false_claims": 9906,
    "base_damages":       843516.0,
    "treble_damages":     2530548.0,
    "total_exposure":     25709721.0,   # treble + max civil penalties (913 audited claims × $27,894)
    "overall_strength":   0.90,
    "case_summary": (
        "Sunrise Family Medicine Group systematically billed CPT 99215 for 91.3% of all "
        "patient visits over a three-year period—more than six times the national average of "
        "14.1%—pursuant to a written directive from Dr. Victor Mendez. "
        "Internal emails, EHR audit logs, and a whistleblower declaration establish knowing "
        "and intentional submission of false claims to Medicare, resulting in an estimated "
        "$843,516 in excess reimbursements and total FCA exposure exceeding $25.7 million."
    ),
}

DEMO_SCORES = {
    "falsity":     0.92,
    "scienter":    0.95,
    "materiality": 0.88,
    "causation":   0.83,
}

DEMO_EVIDENCE = [
    {
        "type":        "billing_anomaly",
        "description": "Sunrise Family Medicine Group billed 91.3% of all visits as CPT 99215 "
                       "(highest complexity office visit), versus the national family-medicine "
                       "average of 14.1% — a 23.4 standard-deviation outlier.",
        "source":      "billing_records.csv",
        "confidence":  0.95,
    },
    {
        "type":        "billing_anomaly",
        "description": "Of 1,000 sampled claims, 913 were coded 99215 despite diagnoses "
                       "including routine wellness exams (Z00.00), URI, and hypertension "
                       "follow-up — conditions that do not meet high-complexity criteria.",
        "source":      "billing_records.csv",
        "confidence":  0.92,
    },
    {
        "type":        "email_evidence",
        "description": "March 12 2020 email from Dr. Victor Mendez to all billing staff: "
                       "'All patient encounters are to be billed at the 99215 level unless "
                       "there is a specific documented clinical reason not to. Default code: 99215.'",
        "source":      "internal_emails.txt",
        "confidence":  1.0,
    },
    {
        "type":        "email_evidence",
        "description": "Office Manager Rania Hassan to billing team: 'ALL visits get 99215. "
                       "It doesn't matter if the patient came in for a blood pressure check "
                       "or a cold. We document management of complex chronic conditions.'",
        "source":      "internal_emails.txt",
        "confidence":  0.97,
    },
    {
        "type":        "email_evidence",
        "description": "During CMS probe audit Dr. Mendez instructed staff: 'Pull the BEST "
                       "5 charts. Make sure the assessment fields are filled in properly. "
                       "Do NOT send the flu shot visits or the wellness-only charts.'",
        "source":      "internal_emails.txt",
        "confidence":  0.93,
    },
    {
        "type":        "pattern",
        "description": "EHR audit log documents 12 instances of retroactive chart editing "
                       "after Medicare payment was received — 'complex chronic disease "
                       "management' language inserted into notes that originally lacked it.",
        "source":      "ehr_audit_log.csv",
        "confidence":  0.88,
    },
    {
        "type":        "pattern",
        "description": "Systematic unbundling: modifier -59 applied to lab codes "
                       "(81003-59, 85025-59, 80053-59, 93000-59) on all visits with any "
                       "lab order, regardless of clinical necessity — per staff instruction.",
        "source":      "internal_emails.txt",
        "confidence":  0.90,
    },
    {
        "type":        "provider",
        "description": "Dr. Victor Mendez previously employed at Palm Bay Medical Center, "
                       "which settled a Medicare upcoding fraud case for $3.1M in 2019. "
                       "Mendez departed six months before the settlement was announced.",
        "source":      "news_clipping_palm_bay.txt",
        "confidence":  0.82,
    },
    {
        "type":        "amount",
        "description": "Whistleblower estimates 9,906 fraudulent claims over 3 years. "
                       "Differential: billed 99215 ($203.44) vs appropriate 99213 ($97.02) "
                       "= $106.42/claim × 80% Medicare rate = $85.14 overpayment × 9,906 "
                       "= $843,516 base damages.",
        "source":      "whistleblower_declaration.txt",
        "confidence":  0.87,
    },
    {
        "type":        "billing_anomaly",
        "description": "Sample patient records show flu-shot-only visits billed as 99215 "
                       "($191.86), routine wellness exams with no chronic conditions billed "
                       "as complex management, and wart removals bundled with separate E&M charges.",
        "source":      "sample_patient_records.txt",
        "confidence":  0.91,
    },
]

DEMO_TIMELINE = {
    "fraud_start":           "2020-01",
    "fraud_end":             "2023-03",
    "total_duration_months": 38,
    "events": [
        "Jan 2020 — Dr. Mendez issues blanket 99215 billing directive to all staff",
        "Mar 2020 — Written email policy distributed; 'Default code: 99215' enforced",
        "Jun 2020 — CMS probe audit triggers selective chart submission",
        "Sep 2020 — Retroactive EHR editing begins post-payment",
        "Jan 2021 — Modifier -59 unbundling scheme introduced for lab services",
        "Mar 2022 — Billing coordinator (relator) begins documenting fraud internally",
        "Nov 2022 — Relator retains qui tam attorney; complaint drafted",
        "Mar 2023 — Federal investigation initiated; complaint unsealed",
    ],
}


def is_demo_upload(files: list) -> bool:
    """Return True if any uploaded filename matches the known sample file set."""
    uploaded = {f.get("filename", "").lower() for f in files}
    demo = {n.lower() for n in DEMO_FILENAMES}
    return bool(uploaded & demo)


# ── Claude helpers ────────────────────────────────────────────────────────────

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


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/walker/analyze_case")
async def analyze_case(request: Request):
    try:
        body = await request.json()
        files = body.get("files", [])

        # ── Demo mode: instant, no API call ──────────────────────────────────
        if is_demo_upload(files):
            _state["evidence"] = DEMO_EVIDENCE
            _state["timeline"] = DEMO_TIMELINE
            _state["scores"]   = DEMO_SCORES
            _state["analysis"] = DEMO_ANALYSIS
            return {"reports": [_state["analysis"]]}

        # ── Real mode: call Claude ────────────────────────────────────────────
        docs_text = "\n\n".join(
            f"FILE: {f['filename']}\nTYPE: {f['doc_type']}\nCONTENT:\n{f['content'][:MAX_DOC_CHARS]}"
            for f in files
        )

        raw    = call_claude(f"{ANALYSIS_PROMPT}\n\nDOCUMENTS:\n{docs_text}")
        result = parse_json(raw)

        filenames      = [f["filename"] for f in files]
        default_source = filenames[0] if filenames else ""

        evidence_list = result.get("evidence", [])
        timeline_data = result.get("timeline", {})
        fca_data      = result.get("fca", {})
        damages       = result.get("damages", {})

        _state["evidence"] = [
            {
                "type":        e.get("evidence_type", "billing_anomaly"),
                "description": e.get("description", ""),
                "source":      e.get("source_doc", "") or default_source,
                "confidence":  float(e.get("confidence", 0.9)),
            }
            for e in evidence_list
            if isinstance(e, dict)
        ]

        _state["timeline"] = {
            "fraud_start":           timeline_data.get("fraud_start", "2022-01"),
            "fraud_end":             timeline_data.get("fraud_end",   "2022-12"),
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
