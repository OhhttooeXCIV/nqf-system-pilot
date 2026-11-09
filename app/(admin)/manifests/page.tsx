'use client';

import { useState } from 'react';
import { SEED_MANIFESTS, QualificationManifest } from '@/lib/manifests';

export default function AdminManifestPage() {
  const [selectedId, setSelectedId] = useState<string>('saqa-48573');
  const manifest = SEED_MANIFESTS[selectedId];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted, #69797d)', letterSpacing: '1px' }}>
            QUALIFICATION INGESTION ENGINE
          </span>
          <h1 style={{ fontSize: '26px', margin: '6px 0 8px', color: '#16282e' }}>
            Curriculum Manifest Registry
          </h1>
          <p style={{ fontSize: '13px', color: '#556965', margin: 0 }}>
            Inspect, validate, and select qualifications aligned to SAQA, NCV, and QCTO occupational standards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => alert('Manifest JSON export ready for QCTO Form 4 mapping.')}
            style={{
              background: '#fff',
              border: '1px solid #cfdad6',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Export Form 4 Mapping
          </button>
        </div>
      </div>

      {/* Qualification Selector Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {Object.values(SEED_MANIFESTS).map((m: QualificationManifest) => {
          const isSelected = m.id === selectedId;
          return (
            <div
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              style={{
                cursor: 'pointer',
                background: '#fff',
                border: isSelected ? '2px solid #143f39' : '1px solid #dce5e2',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: isSelected ? '0 8px 24px #143f391a' : 'none',
                position: 'relative'
              }}
            >
              {isSelected && (
                <span style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#143f39',
                  color: '#caec6b',
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '10px'
                }}>
                  ACTIVE
                </span>
              )}
              <span style={{ fontSize: '10px', color: '#687e79', fontWeight: 800, textTransform: 'uppercase' }}>
                SAQA ID {m.saqa.qualificationId} · NQF Level {m.saqa.nqfLevel}
              </span>
              <h3 style={{ fontSize: '17px', margin: '8px 0', color: '#16282e' }}>
                {m.saqa.qualificationTitle}
              </h3>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', fontSize: '11px' }}>
                <span style={{ background: '#eef4f1', padding: '4px 8px', borderRadius: '6px' }}>
                  {m.saqa.credits} Credits
                </span>
                <span style={{ background: '#eef4f1', padding: '4px 8px', borderRadius: '6px' }}>
                  {m.saqa.qualificationType === 'part_qualification' ? 'Part-Qualification' : 'Full Qualification'}
                </span>
                <span style={{ background: '#e8f7ee', color: '#1c694a', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  Cost: {m.saqa.pilotCostRisk.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manifest Detail Inspector */}
      {manifest && (
        <div style={{ background: '#fff', border: '1px solid #dce5e2', borderRadius: '14px', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #dce5e2', paddingBottom: '20px', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#143f39' }}>MANIFEST SPECIFICATION · v{manifest.manifestVersion}</span>
              <h2 style={{ fontSize: '22px', margin: '6px 0 4px', color: '#16282e' }}>
                {manifest.saqa.qualificationTitle} (SAQA {manifest.saqa.qualificationId})
              </h2>
              {manifest.saqa.partQualificationDisclosure && (
                <div style={{ marginTop: '8px', padding: '8px 12px', background: '#fff9e7', borderLeft: '3px solid #d4a95a', fontSize: '11px', color: '#73571d' }}>
                  {manifest.saqa.partQualificationDisclosure}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#556965' }}>
              <div>SETA / AQP: <strong>{manifest.saqa.assessmentQualityPartner}</strong></div>
              <div>Progression: <strong>{manifest.progression?.pathway || 'Direct'}</strong></div>
            </div>
          </div>

          <h3 style={{ fontSize: '16px', margin: '0 0 16px', color: '#16282e' }}>
            Curriculum Gates & Modular Evidence Gates ({manifest.gates.length} Gates)
          </h3>

          <div style={{ display: 'grid', gap: '16px' }}>
            {manifest.gates.map((gate) => (
              <div key={gate.gateId} style={{ border: '1px solid #e1e9e6', borderRadius: '10px', padding: '18px', background: '#fbfcfb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: '#143f39', color: '#fff', fontWeight: 800, fontSize: '11px', padding: '4px 8px', borderRadius: '6px' }}>
                      {gate.gateId} · {gate.code}
                    </span>
                    <strong style={{ fontSize: '15px', color: '#16282e' }}>{gate.title}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: '#687e79' }}>
                    NQF L{gate.nqfLevel} · {gate.credits} Credits · <em>{gate.type.replace(/_/g, ' ')}</em>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: '#556965', margin: '0 0 14px' }}>
                  {gate.description}
                </p>

                <div style={{ fontSize: '11px', fontWeight: 700, color: '#143f39', marginBottom: '6px' }}>
                  Mapped Topics & Assessment Criteria:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {gate.topics.map((t) => (
                    <span key={t.code} style={{ background: '#eef4f1', padding: '4px 9px', borderRadius: '6px', fontSize: '11px', color: '#2a5b4f' }}>
                      {t.label} ({(t.weight * 100).toFixed(0)}%)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
