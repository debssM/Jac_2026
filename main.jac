# main.jac

import from agents.entity_extractor { EntityExtractorAgent }
import from agents.timeline_agent { TimelineAgent }
import from agents.fca_mapper { FCAMapperAgent }
import from agents.damage_estimator { DamageEstimatorAgent }
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
import from walkers.run { setup_graph }
import from walkers.ingest { ingest_documents }

with entry {
    print("QuiTam Copilot starting...");

    # Step 1 - setup graph
    root spawn setup_graph();

    # Step 2 - load demo documents
    demo_files = [
        {
            "filename": "billing_records.csv",
            "doc_type": "billing",
            "content": "claim_id,provider,cpt_code,amount\nCLM001,Northview Clinic,99215,173.00\nCLM002,Northview Clinic,99215,173.00\nCLM003,Northview Clinic,99215,173.00"
        },
        {
            "filename": "internal_emails.txt",
            "doc_type": "email",
            "content": "From: Manager\nTo: Staff\nAlways bill at 99215 regardless of complexity."
        }
    ];

    w = ingest_documents(files=demo_files);
    root spawn w;
}