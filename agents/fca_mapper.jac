
import from byllm.llm {Model}
import from helpers {extract_provider_names, check_oig_leie}

glob llm = Model(model_name="openai/gpt-4o");

include "nodes/data_nodes.jac";

node FCAMapperAgent {

    """
    Map each piece of evidence to one of the four False Claims Act
    legal elements: Falsity, Scienter, Materiality, or Causation.

    For each element, return a JSON object with keys:
      - "falsity": {"evidence": [str], "type": "factual"|"legal", "score": 0.0-1.0}
      - "scienter": {"evidence": [str], "type": "actual"|"deliberate_ignorance"|"reckless", "score": 0.0-1.0}
      - "materiality": {"evidence": [str], "relied": bool, "score": 0.0-1.0}
      - "causation": {"evidence": [str], "chain": str, "score": 0.0-1.0}

    Assess implied false certification under Universal Health Services v. Escobar.
    Consider whether the defendant submitted claims to Medicare/Medicaid that were
    factually false or legally false (violated conditions of payment).
    """
    can map_to_fca_elements(
        evidence: list[dict],
        timeline_events: list[dict],
        oig_match: bool
    ) -> dict by llm();

    can process with QuiTamOrchestrator entry {
        # Gather evidence
        evidence: list[dict] = [];
        for e in [-->] {
            if isinstance(e, EvidenceNode) {
                evidence.append({
                    "desc": e.description,
                    "source": e.source_doc
                });
            }
        }

        # Get timeline events
        timeline_events: list[dict] = [];
        for t in [-->] {
            if isinstance(t, TimelineNode) {
                timeline_events = t.events;
            }
        }

        # Check OIG exclusion list
        providers = extract_provider_names(evidence);
        oig_match = check_oig_leie(providers, "data/oig_leie.csv");

        # LLM maps to FCA elements
        mapping = self.map_to_fca_elements(evidence, timeline_events, oig_match);

        # Create the 4 FCA element nodes
        falsity = mapping.get("falsity", {});
        here ++> FalsityNode(
            evidence_list=falsity.get("evidence", []),
            falsity_type=falsity.get("type", "factual"),
            strength_score=falsity.get("score", 0.0)
        );

        scienter = mapping.get("scienter", {});
        here ++> ScientorNode(
            evidence_list=scienter.get("evidence", []),
            knowledge_type=scienter.get("type", "actual"),
            strength_score=scienter.get("score", 0.0)
        );

        materiality = mapping.get("materiality", {});
        here ++> MaterialityNode(
            evidence_list=materiality.get("evidence", []),
            government_relied=materiality.get("relied", False),
            strength_score=materiality.get("score", 0.0)
        );

        causation = mapping.get("causation", {});
        here ++> CausationNode(
            evidence_list=causation.get("evidence", []),
            causal_chain=causation.get("chain", ""),
            strength_score=causation.get("score", 0.0)
        );

        visitor.mapping_done = True;
    }
}
