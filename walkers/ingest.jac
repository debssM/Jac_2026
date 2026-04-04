# walkers/ingest.jac

import from nodes.data_nodes { DocumentNode }

walker ingest_documents {

    has files: list = [];

    can ingest with Root entry {

        for f in self.files {
            doc = DocumentNode();
            doc.filename = f["filename"];
            doc.content = f["content"];
            doc.doc_type = f["doc_type"];

            here ++> doc;

            print("📄 Loaded: " + f["filename"]);
        }

        print("✅ All documents ingested!");
    }
}