import {NextResponse} from 'next/server';

const manifest={
  mode:'stakeholder-pilot',
  persistence:'browser-local',
  qualificationClaim:'readiness-model-only',
  governingRoute:'Verify the exact registered qualification and provider scope with SAQA/QCTO before delivery.',
  modules:['hardware-diagnostics','operating-systems','networking','service-desk-simulation'],
};

export async function GET(){return NextResponse.json(manifest)}
export async function POST(request:Request){const body=await request.json();return NextResponse.json({accepted:true,durable:false,receivedAt:new Date().toISOString(),record:body,warning:'Pilot acknowledgement only; no official learner record was created.'},{status:202})}
