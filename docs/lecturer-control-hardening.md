# Lecturer-control hardening — remaining 50%

## Reassessment

The first 50% correctly established durable synthetic learners, topic mastery, understanding checks and observable weakness signals. It did not yet create an operational lecturer decision loop. The main residual security limitation is that the private site is authenticated by ChatGPT, while application roles remain simulated in the frontend. This release validates and attributes lecturer actions on the server but does not claim production role-based authorisation.

## Implemented control loop

1. Lecturer opens a persisted learner record from the live cohort.
2. Lecturer reviews topic mastery and open warning context.
3. Warning must be acknowledged or resolved with a review note.
4. Extra help requires a weakness, specific activity, owner, severity and future due date.
5. The activity is always linked to `P01 Hardware fault isolation` and marked as extra-help only.
6. Intervention states follow `assigned → in progress → awaiting recheck → closed`.
7. Closure requires a recorded topic recheck of at least 70% and written closure evidence.
8. Formal-test release is refused while support or urgent warnings remain unresolved.
9. Practical grading uses four 0–4 criteria; the server calculates the provisional percentage.
10. Results below 70% cannot be released. Returned work creates a resubmission gate.
11. The assessor status remains pending; lecturer scoring never becomes the final assessor decision.
12. Every material action creates an attributed audit event.

## Critic loop

### Control strength

Free-form status editing was rejected. Server-enforced transitions prevent skipping directly from assignment to closure.

### Learner protection

Automated warning closure and automated gate release were rejected. Both require a lecturer-attributed action and explanatory evidence.

### Class-direction integrity

Independent personalised curricula were rejected. Every intervention records the common P01 class milestone and can only add support work.

### Assessment integrity

Lecturer scores remain provisional. Final assessor judgement, moderation and official results remain outside this pilot.

## Remaining production limitations

- Server-verified application identity and RBAC.
- POPIA consent, retention, access and deletion controls.
- Approved assessment instruments and registered assessor identities.
- Immutable external audit retention and official MIS integration.
- Notification delivery and safeguarding escalation outside the application.
