
import from byllm.llm {Model}
import from helpers {load_file}

glob llm = Model(model_name="openai/gpt-4o");

include "nodes/data_nodes.jac";

node TimelineAgent {

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
