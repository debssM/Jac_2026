# ── DATA NODES ──────────────────────────────────────

node DocumentNode {
    has filename: str;
    has content: str;
    has doc_type: str;  # "billing", "email", "records"
}

node EvidenceNode {
    has evidence_type: str;   # "entity", "amount", "date", "pattern"
    has description: str;
    has source_doc: str;
    has confidence: float;
}

node TimelineNode {
    has events: list[dict];   # [{date, event, amount}]
    has fraud_start: str;
    has fraud_end: str;
    has total_duration_months: int;
}

# ── FCA ELEMENT NODES ────────────────────────────────

node FalsityNode {
    has evidence_list: list[str];
    has falsity_type: str;   # "factual" or "legal"
    has strength_score: float;  # 0.0 - 1.0
}

node ScientorNode {
    has evidence_list: list[str];
    has knowledge_type: str;  # "actual", "deliberate_ignorance", "reckless"
    has strength_score: float;
}

node MaterialityNode {
    has evidence_list: list[str];
    has government_relied: bool;
    has strength_score: float;
}

node CausationNode {
    has evidence_list: list[str];
    has causal_chain: str;
    has strength_score: float;
}

# ── OUTPUT NODE ──────────────────────────────────────

node CaseMemoNode {
    has case_summary: str;
    has defendant: str;
    has total_false_claims: int;
    has base_damages: float;
    has treble_damages: float;
    has per_claim_penalty: float;
    has total_exposure: float;
    has gap_analysis: list[str];
    has overall_strength: str;  # "Strong", "Moderate", "Weak"
}