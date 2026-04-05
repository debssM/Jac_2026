
import from byllm.llm {Model}
import from helpers {load_file}

glob llm = Model(model_name="openai/gpt-4o");

include "nodes/data_nodes.jac";

import from byllm.llm { Model }
import from nodes.data_nodes {
    EvidenceNode,
    TimelineNode
}
import from helpers { parse_json }

glob llm = Model(model_name="claude-sonnet-4-20250514");

node TimelineAgent {
<<<<<<< HEAD
    has timeline_complete: bool = False;

    """
    You are a legal timeline expert analyzing healthcare fraud evidence.

    Build a chronological fraud timeline from the provided evidence.

    Return a JSON object with:
    - events: list of {"date": "YYYY-MM-DD", "event": "description", "amount": float}
    - fraud_start: "YYYY-MM-DD" when fraud began
    - fraud_end: "YYYY-MM-DD" when fraud ended or was discovered
    - total_duration_months: integer number of months fraud ran
    - summary: one paragraph describing the fraud timeline

    Order events chronologically oldest to newest.
    If dates are unclear use best estimate from context.
    Return only valid JSON. No other text.
    """
    def build_timeline(
        evidence_items: list[dict],
        document_content: list[str]
    ) -> str by llm();

    can run with entry {
        print("Timeline Agent firing!");

        # Collect evidence from root
        evidence_items: list[dict] = [];
        for e in [root -->][?:EvidenceNode] {
            evidence_items.append({
                "type": e.evidence_type,
                "desc": e.description,
                "source": e.source_doc,
                "confidence": e.confidence
            });
        }

        print("Evidence items found: " + str(len(evidence_items)));

        if len(evidence_items) == 0 {
            print("No evidence found - skipping timeline");
            self.timeline_complete = True;
            visitor.timeline_done = True;
            return;
        }

        # Call Claude
        raw = self.build_timeline(evidence_items, []);
        print("Timeline LLM output received");

        timeline_data = parse_json(raw);

        # Create TimelineNode on root
        tl = TimelineNode();
        tl.events = [];
        tl.fraud_start = "unknown";
        tl.fraud_end = "unknown";
        tl.total_duration_months = 0;

        if "events" in timeline_data {
            tl.events = timeline_data["events"];
        }
        if "fraud_start" in timeline_data {
            tl.fraud_start = timeline_data["fraud_start"];
        }
        if "fraud_end" in timeline_data {
            tl.fraud_end = timeline_data["fraud_end"];
        }
        if "total_duration_months" in timeline_data {
            tl.total_duration_months = timeline_data["total_duration_months"];
        }

        root ++> tl;

        self.timeline_complete = True;
        visitor.timeline_done = True;
        print("Timeline complete!");
        print("Fraud start: " + tl.fraud_start);
        print("Fraud end: " + tl.fraud_end);
        print("Duration: " + str(tl.total_duration_months) + " months");
    }
}
=======

    """
    Build a chronological fraud timeline from the extracted
    evidence items and internal communications (emails/memos).

    Return a JSON object with keys:
      - "events": list of objects with "date" (YYYY-MM-DD),
        "event" (description), "amount" (float or null), "source" (filename)
      - "start": ISO date of earliest fraudulent activity
      - "end": ISO date of latest known activity or discovery
      - "months": integer total fraud duration in months

    Identify when billing first deviated from normal,
    key escalation events, internal complaints, and discovery date.
    """
    can build_timeline(
        evidence_items: list[dict],
        emails: str
    ) -> dict by llm();

    can process with QuiTamOrchestrator entry {
        # Gather evidence from connected EvidenceNodes
        evidence: list[dict] = [];
        for e in [-->] {
            if isinstance(e, EvidenceNode) {
                evidence.append({
                    "desc": e.description,
                    "source": e.source_doc,
                    "type": e.evidence_type
                });
            }
        }

        # Load supplementary communications
        emails = load_file("demo/internal_emails.txt");

        # LLM builds the timeline
        timeline_data = self.build_timeline(evidence, emails);

        # Create TimelineNode
        tl = TimelineNode(
            events=timeline_data.get("events", []),
            fraud_start=timeline_data.get("start", "unknown"),
            fraud_end=timeline_data.get("end", "unknown"),
            total_duration_months=timeline_data.get("months", 0)
        );
        here ++> tl;

        visitor.timeline_done = True;
    }
}
>>>>>>> 04cfc0aec3fc60c2f4c3551af809e0ed2beb4327
