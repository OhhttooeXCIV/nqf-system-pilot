import Link from 'next/link';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper, #f5f7f3)' }}>
      <header style={{
        padding: '16px 32px',
        background: '#143f39',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid var(--lime, #caec6b)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ color: 'var(--lime, #caec6b)', textDecoration: 'none', fontWeight: 800, fontSize: '18px' }}>
            Bridge5
          </Link>
          <span style={{ color: '#8aa6a0', fontSize: '14px' }}>|</span>
          <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px' }}>
            PROVIDER ADMIN CONSOLE
          </span>
          <span style={{
            fontSize: '10px',
            background: '#ffffff22',
            padding: '3px 8px',
            borderRadius: '12px',
            color: '#caec6b'
          }}>
            Multi-Provider Ready
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#a5bdb8' }}>Active Provider:</span>
            <select
              defaultValue="prv-demo"
              style={{
                background: '#0d2d28',
                color: '#fff',
                border: '1px solid #23544d',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px'
              }}
            >
              <option value="prv-demo">TVET Metro South (Demo ATP)</option>
              <option value="prv-prov2">Highlands Tech Institute (Accredited SDP)</option>
            </select>
          </div>
          <Link href="/" style={{ color: '#fff', textDecoration: 'none', background: '#23544d', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
            ← Return to Pilot
          </Link>
        </div>
      </header>

      <div style={{ flex: 1, padding: '32px' }}>
        {children}
      </div>
    </div>
  );
}
