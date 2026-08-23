# Bridge5 lightweight backend plan

## Target

Raise the pilot from a visually convincing workflow to approximately 85% operational realism without creating a resource-intensive LMS. The backend remains limited to synthetic pilot identities and readiness records. It does not create official enrolments, results, certification, psychological diagnoses, or QCTO/SAQA claims.

## Architecture

- One serverless `/api/pilot` route; no always-on application server.
- One D1/SQLite database for structured operational records.
- No file storage in this phase.
- Deterministic validation and weakness rules; no generative-AI decisions.
- Browser storage remains temporary draft/UI state only.
- Every support activity references the fixed class milestone it supports.
- Personalised work is extra help only and cannot replace, reorder, or remove class outcomes.

## Data boundary

The pilot stores learner, topic-mastery, understanding-check and signal records. Production still requires verified identity, server-side role authorisation, POPIA controls, retention rules, approved assessment instruments and accredited-provider governance.

## Four implementation slices

### Slice 1 — operational learner record (implemented)

- Durable synthetic multi-learner cohort.
- Fixed class milestone for every learner.
- Topic-level scores, attempts and weakness levels.
- Indexed open-signal lookup.

### Slice 2 — understanding validation (implemented)

- Learner observation → hypothesis → safe action reflection.
- Confidence before and after.
- Three knowledge checks.
- Server validation, score, weakness level and lecturer-review signal.
- Explicit educational CBT framing: not diagnosis or therapy.

### Slice 3 — lecturer intervention control (deferred)

- Open learner profile from live cohort data.
- Acknowledge, assign and resolve warnings.
- Create an extra-help activity tied to the common class milestone.
- Owner, due date, severity and learner acknowledgement.
- Lecturer-controlled gate release/block.

### Slice 4 — grading and closure (deferred)

- Editable practical rubric and provisional grading.
- Return-for-evidence and resubmission workflow.
- Lecturer understanding recheck and intervention closure.
- Assessor decision separation and immutable audit events.
- Cohort-versus-support-path reporting.

## Critic loop

### Pass 1 — feasibility

Rejected a conventional hosted service because it would add an always-on runtime and operational overhead. D1/SQLite fits the small relational workload.

### Pass 2 — validity and learner protection

Rejected automatic diagnosis and opaque AI path generation. Signals are observable, deterministic and require lecturer review. CBT is educational reflection only.

### Pass 3 — class-direction protection

Rejected free-form personalised curricula. Each support record is subordinate to the common class milestone and must return the learner to it.

## Stop point

This implementation stops after slices 1 and 2: exactly 50% of the four-slice plan. Slices 3 and 4 require stakeholder review before implementation.
