# walkers/orchestrator.jac

import from agents.entity_extractor { EntityExtractorAgent }
import from agents.timeline_agent { TimelineAgent }
import from agents.fca_mapper { FCAMapperAgent }
import from agents.damage_estimator { DamageEstimatorAgent }
import from nodes.data_nodes { CaseMemoNode }

walker QuiTamOrchestrator {
    has extraction_done: bool = False;
    has timeline_done: bool = False;
    has mapping_done: bool = False;
    has damage_done: bool = False;

    can run with Root entry {
        print("🚀 QuiTam Orchestrator started!");
        print("Step 1: Entity Extraction...");
        for n in [-->][?:EntityExtractorAgent] {
            visit n;
        }

        print("Step 2: Timeline Building...");
        for n in [-->][?:TimelineAgent] {
            visit n;
        }

        print("Step 3: FCA Mapping...");
        for n in [-->][?:FCAMapperAgent] {
            visit n;
        }

        print("Step 4: Damage Estimation...");
        for n in [-->][?:DamageEstimatorAgent] {
            visit n;
        }

        print("✅ All steps complete!");
    }
}