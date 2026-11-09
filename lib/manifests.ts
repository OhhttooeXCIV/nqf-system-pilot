export interface ManifestTopic {
  code: string;
  label: string;
  weight: number;
  description?: string;
}

export interface ManifestInstrument {
  type: string;
  format: string;
  questionCount?: number;
  passMark: number | string;
  eisa: boolean;
  label: string;
}

export interface ManifestGate {
  gateId: string;
  code: string;
  type: 'knowledge_module' | 'practical_skill_module' | 'workplace_based_learning';
  title: string;
  nqfLevel: number;
  credits: number;
  description: string;
  topics: ManifestTopic[];
  assessmentInstruments?: ManifestInstrument[];
}

export interface QualificationManifest {
  manifestVersion: string;
  id: string;
  saqa: {
    qualificationId: string;
    qualificationTitle: string;
    qualificationType: 'full_qualification' | 'part_qualification';
    nqfLevel: number;
    credits: number;
    assessmentBody: string;
    developmentQualityPartner: string;
    assessmentQualityPartner: string;
    pilotCostRisk: 'low' | 'medium' | 'high';
    partQualificationDisclosure?: string;
  };
  gates: ManifestGate[];
  progression?: {
    next: string[];
    previous: string[];
    pathway: string;
  };
}

export const MANIFEST_48573: QualificationManifest = {
  manifestVersion: '1.0',
  id: 'saqa-48573',
  saqa: {
    qualificationId: '48573',
    qualificationTitle: 'National Certificate: IT Systems Support',
    qualificationType: 'full_qualification',
    nqfLevel: 5,
    credits: 130,
    assessmentBody: 'MICT SETA',
    developmentQualityPartner: 'MICT SETA',
    assessmentQualityPartner: 'MICT SETA',
    pilotCostRisk: 'low'
  },
  gates: [
    {
      gateId: 'G1',
      code: 'P01',
      type: 'practical_skill_module',
      title: 'Hardware Fault Isolation & Diagnostic Sequencing',
      nqfLevel: 5,
      credits: 15,
      description: 'Isolate a hardware fault safely using a systematic diagnostic method and produce auditable evidence.',
      topics: [
        { code: 'safety', label: 'ESD and electrical safety', weight: 0.20 },
        { code: 'fault_isolation', label: 'Fault isolation method', weight: 0.25 },
        { code: 'evidence_reasoning', label: 'Evidence-based reasoning', weight: 0.25 },
        { code: 'networking', label: 'Network fault awareness', weight: 0.15 },
        { code: 'escalation', label: 'Professional escalation', weight: 0.15 }
      ],
      assessmentInstruments: [
        { type: 'practical_task', format: 'guided_lab', passMark: 0.70, eisa: false, label: 'P01 Diagnostic Lab Job Card' },
        { type: 'knowledge_check', format: 'scenario_mcq', passMark: 0.60, eisa: false, label: 'C01 Diagnostic Reasoning Check' },
        { type: 'formal_test', format: 'integrated_timed', passMark: 0.70, eisa: false, label: 'F01 Integrated Systems-Support Test' }
      ]
    }
  ],
  progression: {
    next: ['saqa-119438', 'saqa-118707'],
    previous: [],
    pathway: 'Foundational IT Systems Support -> Software Tester / Developer'
  }
};

export const MANIFEST_119438: QualificationManifest = {
  manifestVersion: '1.0',
  id: 'saqa-119438',
  saqa: {
    qualificationId: '119438',
    qualificationTitle: 'Occupational Certificate: Software Tester',
    qualificationType: 'part_qualification',
    nqfLevel: 5,
    credits: 70,
    assessmentBody: 'MICT SETA',
    developmentQualityPartner: 'MICT SETA',
    assessmentQualityPartner: 'MICT SETA',
    pilotCostRisk: 'low',
    partQualificationDisclosure: 'PART-QUALIFICATION — Not a standalone QCTO Certificate. Learners achieve a Statement of Results.'
  },
  gates: [
    {
      gateId: 'G1',
      code: 'KM-SE',
      type: 'knowledge_module',
      title: 'Software Engineering Principles',
      nqfLevel: 6,
      credits: 20,
      description: 'SDLC models, software quality attributes, coding standards, and version control.',
      topics: [
        { code: 'sdlc_models', label: 'SDLC Models & Methodologies', weight: 0.25 },
        { code: 'quality_attrs', label: 'Software Quality Attributes', weight: 0.20 },
        { code: 'coding_standards', label: 'Coding Standards & Reviews', weight: 0.20 },
        { code: 'version_control', label: 'Version Control with Git', weight: 0.20 },
        { code: 'documentation', label: 'Technical Documentation', weight: 0.15 }
      ]
    },
    {
      gateId: 'G2',
      code: 'KM-MATH',
      type: 'knowledge_module',
      title: 'Digital & Business Mathematics',
      nqfLevel: 5,
      credits: 15,
      description: 'Logic, sets, statistics, and test coverage metrics.',
      topics: [
        { code: 'boolean_logic', label: 'Boolean Logic & Truth Tables', weight: 0.25 },
        { code: 'sets_relations', label: 'Sets & Equivalence Partitioning', weight: 0.20 },
        { code: 'stats_testing', label: 'Statistics for Testing', weight: 0.25 },
        { code: 'complexity', label: 'Algorithmic Complexity', weight: 0.15 },
        { code: 'metrics', label: 'Test Coverage Metrics', weight: 0.15 }
      ]
    },
    {
      gateId: 'G3',
      code: 'KM-PM',
      type: 'knowledge_module',
      title: 'Fundamentals of Project Management',
      nqfLevel: 5,
      credits: 5,
      description: 'Agile/Scrum basics, sprint planning, and risk-based testing.',
      topics: [
        { code: 'agile_scrum', label: 'Agile & Scrum for Testers', weight: 0.35 },
        { code: 'risk_mgmt', label: 'Risk-Based Testing', weight: 0.35 },
        { code: 'collaboration', label: 'Team Collaboration', weight: 0.30 }
      ]
    },
    {
      gateId: 'G4',
      code: 'PSM-TEST',
      type: 'practical_skill_module',
      title: 'Test and Debug Source Code',
      nqfLevel: 5,
      credits: 15,
      description: 'Hands-on unit testing, debugging, and API testing with Pytest, Jest, and Postman.',
      topics: [
        { code: 'test_design', label: 'Test Case Design Techniques', weight: 0.25 },
        { code: 'unit_testing', label: 'Unit Testing (Pytest/Jest)', weight: 0.25 },
        { code: 'debugging', label: 'Debugging Techniques', weight: 0.20 },
        { code: 'api_testing', label: 'API Testing with Postman', weight: 0.15 },
        { code: 'performance_basic', label: 'Basic Performance Testing', weight: 0.15 }
      ]
    },
    {
      gateId: 'G5',
      code: 'WBL-TEST',
      type: 'workplace_based_learning',
      title: 'Software Testing Workplace Experience (Logbook)',
      nqfLevel: 5,
      credits: 15,
      description: 'Simulated workplace test execution, bug triage, and structured logbook completion.',
      topics: [
        { code: 'test_plan_exec', label: 'Test Plan Execution', weight: 0.30 },
        { code: 'bug_tracking', label: 'Bug Tracking & Triage', weight: 0.30 },
        { code: 'metrics_report', label: 'Test Metrics & Reporting', weight: 0.20 },
        { code: 'retrospective', label: 'Testing Retrospective', weight: 0.20 }
      ]
    }
  ],
  progression: {
    next: ['saqa-119458'],
    previous: ['saqa-48573'],
    pathway: 'Systems Support -> Software Tester -> Software Engineer'
  }
};

export const SEED_MANIFESTS: Record<string, QualificationManifest> = {
  'saqa-48573': MANIFEST_48573,
  'saqa-119438': MANIFEST_119438
};
