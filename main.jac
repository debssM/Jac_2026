include "walkers/setup.jac";
include "walkers/ingest.jac";
include "walkers/orchestrator.jac";

with entry {
    # Initialize the graph
    setup_graph() spawn root;
    print("QuiTam Copilot initialized.");
}
