CREATE TABLE IF NOT EXISTS interventions (
  id TEXT PRIMARY KEY,learner_id TEXT NOT NULL,topic_code TEXT NOT NULL,class_milestone TEXT NOT NULL,
  activity TEXT NOT NULL,reason TEXT NOT NULL,owner_id TEXT NOT NULL,due_at TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('observe','support','urgent')),
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned','in_progress','awaiting_recheck','closed')),
  learner_acknowledged INTEGER NOT NULL DEFAULT 0 CHECK (learner_acknowledged IN (0,1)),
  closure_evidence TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,
  FOREIGN KEY (learner_id) REFERENCES learners(id)
);
CREATE TABLE IF NOT EXISTS gate_controls (
  learner_id TEXT NOT NULL,artifact_code TEXT NOT NULL,status TEXT NOT NULL CHECK (status IN ('blocked','released','resubmission')),
  reason TEXT NOT NULL,updated_by TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY (learner_id,artifact_code),
  FOREIGN KEY (learner_id) REFERENCES learners(id)
);
CREATE TABLE IF NOT EXISTS grading_reviews (
  learner_id TEXT NOT NULL,artifact_code TEXT NOT NULL,rubric_json TEXT NOT NULL,
  provisional_score INTEGER NOT NULL CHECK (provisional_score BETWEEN 0 AND 100),
  decision TEXT NOT NULL CHECK (decision IN ('draft','released','return')),feedback TEXT NOT NULL,
  resubmission_required INTEGER NOT NULL DEFAULT 0 CHECK (resubmission_required IN (0,1)),
  assessor_status TEXT NOT NULL DEFAULT 'pending',updated_by TEXT NOT NULL,updated_at TEXT NOT NULL,
  PRIMARY KEY (learner_id,artifact_code),FOREIGN KEY (learner_id) REFERENCES learners(id)
);
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,learner_id TEXT NOT NULL,actor_id TEXT NOT NULL,actor_role TEXT NOT NULL,
  event_type TEXT NOT NULL,summary TEXT NOT NULL,detail_json TEXT NOT NULL,created_at TEXT NOT NULL,
  FOREIGN KEY (learner_id) REFERENCES learners(id)
);
CREATE INDEX IF NOT EXISTS idx_interventions_learner_status ON interventions(learner_id,status);
CREATE INDEX IF NOT EXISTS idx_audit_learner_created ON audit_events(learner_id,created_at);
PRAGMA optimize;
