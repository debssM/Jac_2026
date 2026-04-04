
import from byllm.llm {Model}
import from helpers {load_csv, check_ncci_violations}

glob llm = Model(model_name="openai/gpt-4o");

include "nodes/data_nodes.jac";

node DamageEstimatorAgent {

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
