import {NextResponse} from 'next/server';
import {listCohort,recordUnderstandingCheck,type CheckInput} from '@/lib/pilot-db';

const manifest={
  mode:'stakeholder-pilot',
  persistence:'D1 SQLite for synthetic operational records',
  qualificationClaim:'readiness-model-only',
  classDirection:'P01 Hardware fault isolation',
  personalisationRule:'Extra-help activities may support but never replace or reorder the class programme.',
  governingRoute:'Verify the exact registered qualification and provider scope with SAQA/QCTO before delivery.',
  implementedSlices:['multi-learner records','topic mastery','validated understanding checks','weakness signals'],
  deferredSlices:['lecturer intervention controls','grading and recheck closure'],
};

function problem(message:string,status=400,details?:unknown){
  return NextResponse.json({ok:false,message,details},{status});
}

export async function GET(request:Request){
  const url=new URL(request.url);
  if(url.searchParams.get('resource')!=='cohort')return NextResponse.json({ok:true,manifest});
  try{return NextResponse.json({ok:true,...await listCohort(url.searchParams.get('cohortId')||'cohort-01')})}
  catch(error){return problem('Operational store is unavailable.',503,error instanceof Error?error.message:'Unknown storage error')}
}

export async function POST(request:Request){
  let body:unknown;
  try{body=await request.json()}catch{return problem('Request body must be valid JSON.')}
  if(!body||typeof body!=='object')return problem('Request body is required.');
  const payload=body as {action?:string;check?:CheckInput};
  if(payload.action!=='record_understanding_check'||!payload.check)return problem('Unsupported action.');
  try{
    const result=await recordUnderstandingCheck(payload.check);
    return NextResponse.json({ok:result.accepted,...result},{status:result.accepted?201:422});
  }catch(error){return problem('Understanding check could not be recorded.',503,error instanceof Error?error.message:'Unknown storage error')}
}
