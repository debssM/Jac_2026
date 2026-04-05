
import from byllm.llm {Model}
import from helpers {load_csv, check_ncci_violations}

glob llm = Model(model_name="openai/gpt-4o");

include "nodes/data_nodes.jac";

import from byllm.llm { Model }
import from nodes.data_nodes {
    EvidenceNode,
    TimelineNode,
    CaseMemoNode
}
import from helpers { parse_json, calculate_damages }

glob llm = Model(model_name="claude-sonnet-4-20250514");

node DamageEstimatorAgent {
<<<<<<< HEAD
    has damage_complete: bool = False;

    """
    You are a False Claims Act damages expert.

    Calculate total damages based on the evidence and timeline provided.

    The False Claims Act allows:
    - Treble damages: actual damages x 3
    - Civil penalties: $13,946 to $27,894 per false claim

    Return a JSON object with:
    - total_false_claims: integer number of false claims
    - actual_cpt_code: the correct CPT code that should have been billed
    - billed_cpt_code: the CPT code that was actually billed
    - overpayment_per_claim: float dollar amount overbilled per claim
    - base_damages: float total overpayment amount
    - treble_damages: float base_damages x 3
    - min_penalties: float minimum civil penalties (13946 x claims)
    - max_penalties: float maximum civil penalties (27894 x claims)
    - total_min_exposure: float treble_damages + min_penalties
    - total_max_exposure: float treble_damages + max_penalties
    - defendant: name of the fraudulent provider
    - case_summary: two sentence summary of the fraud

    Return only valid JSON. No other text.
    """
    def estimate_damages(
        evidence_items: list[dict],
        timeline: dict,
        billing_records: str
    ) -> str by llm();

    can run with entry {
        print("Damage Estimator firing!");

        # Collect evidence from root
        evidence_items: list[dict] = [];
        for e in [root -->][?:EvidenceNode] {
            evidence_items.append({
                "type": e.evidence_type,
                "desc": e.description,
                "source": e.source_doc
            });
        }

        # Get timeline from root
        timeline: dict = {};
        for t in [root -->][?:TimelineNode] {
            timeline = {
                "fraud_start": t.fraud_start,
                "fraud_end": t.fraud_end,
                "total_duration_months": t.total_duration_months
            };
        }

        print("Evidence items: " + str(len(evidence_items)));

        # Call Claude
        raw = self.estimate_damages(
            evidence_items,
            timeline,
            "billing_records.csv"
        );
        print("Damage LLM output received");

        damage_data = parse_json(raw);

        # Create CaseMemoNode
        memo = CaseMemoNode();
        memo.defendant = "Unknown";
        memo.total_false_claims = 0;
        memo.base_damages = 0.0;
        memo.treble_damages = 0.0;
        memo.per_claim_penalty = 13946.0;
        memo.total_exposure = 0.0;
        memo.overall_strength = "Moderate";
        memo.gap_analysis = [];
        memo.case_summary = "";

        if "defendant" in damage_data {
            memo.defendant = damage_data["defendant"];
        }
        if "total_false_claims" in damage_data {
            memo.total_false_claims = damage_data["total_false_claims"];
        }
        if "base_damages" in damage_data {
            memo.base_damages = damage_data["base_damages"];
        }
        if "treble_damages" in damage_data {
            memo.treble_damages = damage_data["treble_damages"];
        }
        if "total_min_exposure" in damage_data {
            memo.total_exposure = damage_data["total_min_exposure"];
        }
        if "case_summary" in damage_data {
            memo.case_summary = damage_data["case_summary"];
        }

        root ++> memo;

        self.damage_complete = True;
        visitor.damage_done = True;
        print("Damage estimation complete!");
        print("Defendant: " + memo.defendant);
        print("False claims: " + str(memo.total_false_claims));
        print("Base damages: $" + str(memo.base_damages));
        print("Treble damages: $" + str(memo.treble_damages));
        print("Total exposure: $" + str(memo.total_exposure));
    }
}
=======

    """
    Calculate False Claims Act damages from billing records.

    Using the billing records, CMS fee schedule, and NCCI violations:
    1. Per-claim overpayment using CMS fee schedule rates
    2. Total base damages across all false claims
    3. Treble damages (base x 3) under 31 U.S.C. 3729
    4. Per-claim civil penalties ($13,946 to $27,894 each)
    5. Total maximum government exposure

    Return a JSON object with keys:
      - "claim_count": int
      - "base": float (total base damages)
      - "treble": float (base x 3)
      - "penalty": float (per-claim penalty amount used)
      - "total": float (treble + penalties)
      - "breakdown": str (human-readable calculation summary)
    """
    can calculate_damages(
        billing_records: list[dict],
        fee_schedule: list[dict],
        ncci_violations: list[dict]
    ) -> dict by llm();

    can process with QuiTamOrchestrator entry {
        records = load_csv("demo/billing_records.csv");
        fees = load_csv("data/fee_schedule.csv");
        ncci = check_ncci_violations(records, "data/ncci_edits.csv");

        damages = self.calculate_damages(records, fees, ncci);

        visitor.damage_data = damages;
        visitor.damage_done = True;
    }
}
>>>>>>> 04cfc0aec3fc60c2f4c3551af809e0ed2beb4327
