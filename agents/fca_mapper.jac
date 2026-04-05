
import from byllm.llm {Model}
import from helpers {extract_provider_names, check_oig_leie}

glob llm = Model(model_name="openai/gpt-4o");

include "nodes/data_nodes.jac";

import from byllm.llm { Model }
import from nodes.data_nodes {
    FalsityNode,
    ScientorNode,
    MaterialityNode,
    CausationNode,
    EvidenceNode,
    TimelineNode
}
import from helpers { extract_provider_names, check_oig_leie, parse_json }

glob llm = Model(model_name="claude-sonnet-4-20250514");

node FCAMapperAgent {

    """
    Map each piece of evidence to one of the four False Claims Act
    legal elements: Falsity, Scienter, Materiality, or Causation.
<<<<<<< HEAD
    Return a JSON string with keys:
=======

    For each element, return a JSON object with keys:
>>>>>>> 04cfc0aec3fc60c2f4c3551af809e0ed2beb4327
      - "falsity": {"evidence": [str], "type": "factual"|"legal", "score": 0.0-1.0}
      - "scienter": {"evidence": [str], "type": "actual"|"deliberate_ignorance"|"reckless", "score": 0.0-1.0}
      - "materiality": {"evidence": [str], "relied": bool, "score": 0.0-1.0}
      - "causation": {"evidence": [str], "chain": str, "score": 0.0-1.0}
<<<<<<< HEAD
    If oig_match is True, score scienter minimum 0.9.
    Return only valid JSON string. No other text.
    """
    def map_to_fca_elements(
        evidence: list[dict],
        timeline_events: list[dict],
        oig_match: bool
    ) -> str by llm();

    can run with entry {
        print("FCA Mapper ability firing!");

        evidence: list[dict] = [];
        for e in [root -->][?:EvidenceNode] {
            evidence.append({
                "desc": e.description,
                "source": e.source_doc
            });
        }

        timeline_events: list[dict] = [];
        for t in [root -->][?:TimelineNode] {
            timeline_events = t.events;
        }

        providers = extract_provider_names(evidence);
        oig_match = check_oig_leie(providers, "data/oig_leie.csv");

        raw = self.map_to_fca_elements(
            evidence,
            timeline_events,
            oig_match
        );
        mapping = parse_json(raw);

        f_node = FalsityNode();
        f_node.evidence_list = [];
        f_node.falsity_type = "factual";
        f_node.strength_score = 0.0;
        self ++> f_node;

        s_node = ScientorNode();
        s_node.evidence_list = [];
        s_node.knowledge_type = "actual";
        s_node.strength_score = 0.0;
        self ++> s_node;

        m_node = MaterialityNode();
        m_node.evidence_list = [];
        m_node.government_relied = False;
        m_node.strength_score = 0.0;
        self ++> m_node;

        c_node = CausationNode();
        c_node.evidence_list = [];
        c_node.causal_chain = "";
        c_node.strength_score = 0.0;
        self ++> c_node;

        visitor.mapping_done = True;
        print("FCA mapping complete!");
        print("Falsity score: " + str(mapping.get("falsity", {}).get("score", 0.0)));
        print("Scienter score: " + str(mapping.get("scienter", {}).get("score", 0.0)));
        print("Materiality score: " + str(mapping.get("materiality", {}).get("score", 0.0)));
        print("Causation score: " + str(mapping.get("causation", {}).get("score", 0.0)));
    }
}
=======

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
>>>>>>> 04cfc0aec3fc60c2f4c3551af809e0ed2beb4327
