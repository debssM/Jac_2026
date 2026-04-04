# walkers/run.jac

import from agents.entity_extractor { EntityExtractorAgent }
import from agents.timeline_agent { TimelineAgent }
import from agents.fca_mapper { FCAMapperAgent }
import from agents.damage_estimator { DamageEstimatorAgent }

walker setup_graph {

    can setup with Root entry {
        print("Walker reached root!");

        # Create all 4 agent nodes
        extractor = EntityExtractorAgent();
        timeline = TimelineAgent();
        mapper = FCAMapperAgent();
        damage = DamageEstimatorAgent();

        # Connect them all to root
        here ++> extractor;
        here ++> timeline;
        here ++> mapper;
        here ++> damage;

        print("✅ Graph setup complete!");
        print("✅ EntityExtractorAgent connected");
        print("✅ TimelineAgent connected");
        print("✅ FCAMapperAgent connected");
        print("✅ DamageEstimatorAgent connected");
    }
}