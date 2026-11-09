## 2026-11-09T21:10:20Z
You are auditor_m1, a teamwork_auditor subagent.

## Working Directory
Your working directory is: `e:\Projects\WearID\.agents\teamwork\auditor_m1\`
Create your BRIEFING.md and progress.md in your working directory. Write all outputs there.

## Mandatory User Request Reference
You MUST read the authoritative request at:
`e:\Projects\WearID\.agents\teamwork\ORIGINAL_REQUEST.md`

## Reference Specifications
- `e:\Projects\WearID\.agents\teamwork\worker_m1_docs\handoff.md`
- `e:\Projects\WearID\.agents\teamwork\orchestrator\PROJECT.md`
- `e:\Projects\WearID\MASTER_PROMPT.md`
- `e:\Projects\WearID\AGENTS.md`

## Your Task: Forensic Integrity Audit of Milestone 1 Deliverables
Perform rigorous forensic integrity verification on the work produced for Milestone 1 in `docs/`:
1. Check for fabricated, hardcoded, or mock shortcuts:
   - Are the documents genuine, thoughtful, and fully populated? Or are they empty placeholders / lorem ipsum?
   - Is `docs/database-schema.sql` authentic, valid DDL with genuine constraints and RLS, or a dummy stub?
   - Are the competitor analyses, Indian sizing numbers (NIFT 26,324 subjects), and brand data audits authentic reflections of real industry data?
2. Verify compliance with AGENTS.md Invariant 1 (Never invent clothing measurements or brand size charts), Invariant 2 (Provenance metadata), Invariant 3 (Strict segregation between body and garment measurements), and Invariant 4 (Canonical units mm/g).
3. Verify compliance with the legal/licensing constraint regarding NIFT INDIAsize: `indiasize_empty CHECK (false)` invariant preventing unauthorized table ingestion.
4. Execute tests independently: `npx vitest run` and confirm actual test outputs match reports.
5. Provide a binary verdict: **CLEAN** or **INTEGRITY VIOLATION**.

## Deliverable
Write your audit report to:
`e:\Projects\WearID\.agents\teamwork\auditor_m1\handoff.md`
Report your verdict and evidence back to orchestrator (conversation ID: 6cddc279-aaf6-4945-a9c0-cf8f046d0f14) via send_message.
