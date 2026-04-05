# helpers.py

import pandas as pd
import os
import json
from dotenv import load_dotenv

load_dotenv()


def load_csv(path: str) -> list:
    if not os.path.exists(path):
        print(f"Warning: {path} not found, returning empty list")
        return []
    return pd.read_csv(path).to_dict(orient="records")


def load_file(path: str) -> str:
    if not os.path.exists(path):
        print(f"Warning: {path} not found, returning empty string")
        return ""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def extract_provider_names(evidence: list) -> list:
    names = []
    for e in evidence:
        desc = e.get("desc", "") or e.get("description", "")
        etype = e.get("type", "") or e.get("evidence_type", "")
        if etype == "provider" and desc:
            name = desc.split(":")[0].strip()
            if name:
                names.append(name)
        elif "clinic" in desc.lower() or "provider" in desc.lower():
            names.append(desc.split()[0])
    return names


def check_oig_leie(providers: list, leie_path: str) -> bool:
    if not os.path.exists(leie_path):
        return False
    try:
        leie = pd.read_csv(leie_path)
        if "LASTNAME" not in leie.columns:
            return False
        excluded = leie["LASTNAME"].str.upper().tolist()
        return any(p.upper() in excluded for p in providers)
    except:
        return False


def check_ncci_violations(billing_records: list, ncci_path: str) -> list:
    if not os.path.exists(ncci_path):
        return []
    try:
        ncci = pd.read_csv(ncci_path)
        violations = []
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
    except:
        return []


def parse_json(raw: str) -> dict:
    try:
        clean = raw.strip()
        if clean.startswith("```"):
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]
        return json.loads(clean)
    except:
        return {}


def calculate_damages(
    claim_count: int,
    billed_rate: float,
    correct_rate: float
) -> dict:
    overpayment = billed_rate - correct_rate
    base = overpayment * claim_count
    treble = base * 3
    min_penalty = 13946 * claim_count
    max_penalty = 27894 * claim_count
    return {
        "base_damages": base,
        "treble_damages": treble,
        "min_penalties": min_penalty,
        "max_penalties": max_penalty,
        "total_min_exposure": treble + min_penalty,
        "total_max_exposure": treble + max_penalty
    }