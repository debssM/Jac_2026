# helpers.py

import pandas as pd
import os
import json

def extract_provider_names(evidence: list) -> list:
    providers = []
    for e in evidence:
        desc = e.get("desc", "")
        if "clinic" in desc.lower() or "provider" in desc.lower():
            providers.append(desc.split()[0])
    return providers

def check_oig_leie(providers: list, leie_path: str) -> bool:
    if not os.path.exists(leie_path):
        return False
    try:
        leie = pd.read_csv(leie_path)
        for provider in providers:
            if provider.upper() in leie["LASTNAME"].str.upper().values:
                return True
        return False
    except:
        return False

def parse_json(raw: str) -> dict:
    try:
        # Remove markdown code blocks if present
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