
================================================================================
QUITAM COPILOT — SYNTHETIC DEMO DATASET
FICTIONAL CASE: United States ex rel. Okonkwo v. Sunrise Family Medicine Group
================================================================================

⚠️  IMPORTANT: This is entirely fictional data created for hackathon demonstration
purposes. All names, NPIs, Tax IDs, patient IDs, and organizations are invented.
Any resemblance to real persons or entities is coincidental.

BASED ON REAL FCA CASE PATTERNS:
- Michigan hospitalist upcoding ($4.4M settlement, 2023)
- Missouri urgent care upcoding ($9.1M settlement, 2023)
- Chicago NP software-driven upcoding ($2M settlement, 2024)
- CareAll home health systematic upcoding ($25M settlement)
- NextCare urgent care unbundling ($10M settlement)
- Aetna Medicare Advantage diagnosis code fraud ($117.7M settlement, 2025)

================================================================================
FRAUD SCENARIO SUMMARY
================================================================================

DEFENDANT:      Sunrise Family Medicine Group
NPI:            1234567890
TAX ID:         59-1234567
ADDRESS:        4400 W Kennedy Blvd, Suite 200, Tampa, FL 33609
PERIOD:         January 2021 – December 2023 (36 months)

KEY ACTORS:
- Dr. Victor Mendez, MD — Medical Director, architect of fraud
- Rania Hassan — Office Manager, implemented billing directives
- Dr. Linda Cho, DO — Complicit provider
- Dr. Marcus Webb, MD — Complicit provider
- Sarah Okonkwo, NP — RELATOR (whistleblower)
- James Tran, NP — Aware but non-reporting
- Maria Delgado, NP — Aware but non-reporting

FRAUD SCHEMES:
1. SYSTEMATIC UPCODING — 91% of visits billed at 99215 vs. 14% national avg
2. PHANTOM LAB ADD-ONS — Modifier-59 abuse on labs not clinically indicated
3. RETROACTIVE CHART EDITING — EHR notes altered after claims paid
4. CHART SIGNING FRAUD — Claims submitted under relator's NPI without consent
5. AUDIT OBSTRUCTION — "Best charts" selected during CMS probe audit

================================================================================
FILE INDEX
================================================================================

billing/
  billing_records.csv          12,847 Medicare claims (Jan 2021–Dec 2023)
  ehr_audit_log.csv            12 retroactive chart edits with before/after

peer_benchmarks/
  national_fm_benchmark.csv    National CPT distribution vs. Sunrise actual

emails/
  internal_emails.txt          10 internal emails + relator's draft evidence list

patient_records/
  sample_patient_records.txt   5 annotated encounter records with relator notes

whistleblower_notes/
  whistleblower_declaration.txt  Full § 3730 disclosure statement
  news_clipping_palm_bay.txt     Prior fraud history (Scienter evidence)

================================================================================
KEY NUMBERS FOR DEMO
================================================================================

Total claims filed:          12,847
Claims at 99215:             ~11,690 (91%)
Fraudulent 99215 claims:     ~9,906
Per-claim overpayment (paid): $85.14
Base damages:                 ~$843,516
Treble damages:               ~$2,530,548
Civil penalty range:          $138M – $276M (theoretical max)
Whistleblower's potential share (25%): ~$632,637

FCA ELEMENT STATUS:
✅ FALSITY:      Strong (91% vs 14% benchmark; 5 annotated patient records)
✅ SCIENTER:     Strong (Email #1 directive; prior Palm Bay fraud; audit obstruction)
✅ MATERIALITY:  Strong (CMS paid all claims; no reason to suspect)
✅ CAUSATION:    Strong (Direct chain: false bill → CMS paid → loss confirmed)

OVERALL CASE STRENGTH: STRONG (recommend DOJ referral)

================================================================================
