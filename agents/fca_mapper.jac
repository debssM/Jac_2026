# agents/fca_mapper.jac

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
    Return a JSON string with keys:
      - "falsity": {"evidence": [str], "type": "factual"|"legal", "score": 0.0-1.0}
      - "scienter": {"evidence": [str], "type": "actual"|"deliberate_ignorance"|"reckless", "score": 0.0-1.0}
      - "materiality": {"evidence": [str], "relied": bool, "score": 0.0-1.0}
      - "causation": {"evidence": [str], "chain": str, "score": 0.0-1.0}
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