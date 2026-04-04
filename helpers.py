
import pandas as pd
import os


def load_csv(path: str) -> list[dict]:
    """Load a CSV file and return as list of dicts."""
    if not os.path.exists(path):
        print(f"Warning: {path} not found, returning empty list")
        return []
    return pd.read_csv(path).to_dict(orient="records")


def load_file(path: str) -> str:
    """Load a text file and return contents as string."""
    if not os.path.exists(path):
        print(f"Warning: {path} not found, returning empty string")
        return ""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def check_oig_leie(provider_names: list[str], leie_path: str) -> bool:
    """Check if any provider appears on the OIG exclusion list."""
    if not os.path.exists(leie_path):
        print(f"Warning: {leie_path} not found, skipping OIG check")
        return False
    leie = pd.read_csv(leie_path)
    if "LASTNAME" not in leie.columns:
        return False
    excluded = leie["LASTNAME"].str.upper().tolist()
    return any(p.upper() in excluded for p in provider_names)


def check_ncci_violations(
    billing_records: list[dict], ncci_path: str
) -> list[dict]:
    """Check billing records against NCCI edit rules."""
    if not os.path.exists(ncci_path):
        print(f"Warning: {ncci_path} not found, skipping NCCI check")
        return []
    ncci = pd.read_csv(ncci_path)
    violations = []
    # Build a set of forbidden code pairs for fast lookup
    if "col1_code" in ncci.columns and "col2_code" in ncci.columns:
        forbidden = set(
            zip(ncci["col1_code"].astype(str), ncci["col2_code"].astype(str))
        )
        for record in billing_records:
            cpt1 = str(record.get("cpt1", ""))
            cpt2 = str(record.get("cpt2", ""))
            if (cpt1, cpt2) in forbidden or (cpt2, cpt1) in forbidden:
                violations.append({
                    "date": record.get("date", ""),
                    "codes": (cpt1, cpt2),
                    "modifier": record.get("modifier", "")
                })
    return violations


def extract_provider_names(evidence: list[dict]) -> list[str]:
    """Extract provider names from evidence items."""
    names = []
    for e in evidence:
        desc = e.get("desc", "") or e.get("description", "")
        etype = e.get("type", "") or e.get("evidence_type", "")
        if etype == "provider" and desc:
            # Try to get the name before the first colon
            name = desc.split(":")[0].strip()
            if name:
                names.append(name)
    return names