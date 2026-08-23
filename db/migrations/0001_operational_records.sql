CREATE TABLE IF NOT EXISTS learners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cohort_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  class_milestone TEXT NOT NULL,
  overall_readiness INTEGER NOT NULL DEFAULT 0 CHECK (overall_readiness BETWEEN 0 AND 100),
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS topic_mastery (
  learner_id TEXT NOT NULL,
  topic_code TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  attempts INTEGER NOT NULL DEFAULT 0,
  weakness_level TEXT NOT NULL DEFAULT 'unmeasured',
  last_evidence TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (learner_id, topic_code),
  FOREIGN KEY (learner_id) REFERENCES learners(id)
);

CREATE TABLE IF NOT EXISTS understanding_checks (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL,
  topic_code TEXT NOT NULL,
  observation TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  safe_action TEXT NOT NULL,
  confidence_before INTEGER NOT NULL CHECK (confidence_before BETWEEN 1 AND 5),
  confidence_after INTEGER NOT NULL CHECK (confidence_after BETWEEN 1 AND 5),
  answers_json TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  validation_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (learner_id) REFERENCES learners(id)
);

CREATE TABLE IF NOT EXISTS signals (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL,
  topic_code TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('observe','support','urgent')),
  code TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','resolved')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (learner_id) REFERENCES learners(id)
);

CREATE INDEX IF NOT EXISTS idx_learners_cohort ON learners(cohort_id);
CREATE INDEX IF NOT EXISTS idx_signals_learner_status ON signals(learner_id, status);
PRAGMA optimize;
