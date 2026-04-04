# main.jac

import from nodes.data_nodes {
    DocumentNode,
    EvidenceNode,
    TimelineNode,
    FalsityNode,
    ScientorNode,
    MaterialityNode,
    CausationNode,
    CaseMemoNode
}

with entry {
    # Test DocumentNode
    doc = DocumentNode(
        filename="billing_records.csv",
        content="test content",
        doc_type="billing"
    );

    # Test EvidenceNode
    ev = EvidenceNode(
        evidence_type="billing_anomaly",
        description="99215 billed 92% of the time",
        source_doc="billing_records.csv",
        confidence=0.95
    );

    # Store in variables first then print
    doc_name = doc.filename;
    ev_desc = ev.description;
    ev_conf = ev.confidence;

    print("✅ All nodes imported!");
    print("Document: " + doc_name);
    print("Evidence: " + ev_desc);
}