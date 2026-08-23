import {env} from 'cloudflare:workers';
import {classMilestone,topicCodes} from '@/db/schema';
import {ensurePilotDatabase} from '@/lib/pilot-db';

type Actor={actorId:string;actorRole:'lecturer'};
type InterventionInput=Actor&{learnerId:string;topicCode:string;activity:string;reason:string;dueAt:string;severity:'observe'|'support'|'urgent'};
type GradeInput=Actor&{learnerId:string;artifactCode:string;rubric:Record<string,number>;decision:'draft'|'released'|'return';feedback:string};
const timestamp=()=>new Date().toISOString();
const uid=(prefix:string)=>`${prefix}-${crypto.randomUUID()}`;
function db(){const binding=(env as unknown as {DB?:D1Database}).DB;if(!binding)throw new Error('D1 binding DB is not configured');return binding}
function requireLecturer(actor:Actor){if(actor.actorRole!=='lecturer'||actor.actorId!=='lecturer-naledi')throw new Error('Pilot lecturer attribution is required. Production requires server-side RBAC.')}
async function audit(learnerId:string,actor:Actor,eventType:string,summary:string,detail:unknown){
  await db().prepare(`INSERT INTO audit_events (id,learner_id,actor_id,actor_role,event_type,summary,detail_json,created_at) VALUES (?,?,?,?,?,?,?,?)`)
    .bind(uid('evt'),learnerId,actor.actorId,actor.actorRole,eventType,summary,JSON.stringify(detail),timestamp()).run();
}

export async function listLecturerCohort(){
  await ensurePilotDatabase();
  const result=await db().prepare(`SELECT l.id,l.name,l.status,l.class_milestone AS classMilestone,l.overall_readiness AS overallReadiness,
    (SELECT COUNT(*) FROM signals s WHERE s.learner_id=l.id AND s.status!='resolved') AS activeSignals,
    (SELECT COUNT(*) FROM interventions i WHERE i.learner_id=l.id AND i.status!='closed') AS activeInterventions,
    COALESCE((SELECT g.status FROM gate_controls g WHERE g.learner_id=l.id AND g.artifact_code='F01'),'blocked') AS formalGate
    FROM learners l WHERE l.cohort_id='cohort-01' ORDER BY activeSignals DESC,l.overall_readiness ASC`).all();
  return {classDirection:classMilestone,learners:result.results};
}

export async function getLearnerControl(learnerId:string){
  await ensurePilotDatabase();const d1=db();
  const [learner,mastery,signals,interventions,gates,grades,auditEvents]=await Promise.all([
    d1.prepare(`SELECT id,name,status,class_milestone AS classMilestone,overall_readiness AS overallReadiness FROM learners WHERE id=?`).bind(learnerId).first(),
    d1.prepare(`SELECT topic_code AS topicCode,score,attempts,weakness_level AS weaknessLevel,last_evidence AS lastEvidence FROM topic_mastery WHERE learner_id=? ORDER BY topic_code`).bind(learnerId).all(),
    d1.prepare(`SELECT id,topic_code AS topicCode,severity,code,message,status,created_at AS createdAt FROM signals WHERE learner_id=? ORDER BY created_at DESC`).bind(learnerId).all(),
    d1.prepare(`SELECT id,topic_code AS topicCode,class_milestone AS classMilestone,activity,reason,owner_id AS ownerId,due_at AS dueAt,severity,status,learner_acknowledged AS learnerAcknowledged,closure_evidence AS closureEvidence,updated_at AS updatedAt FROM interventions WHERE learner_id=? ORDER BY updated_at DESC`).bind(learnerId).all(),
    d1.prepare(`SELECT artifact_code AS artifactCode,status,reason,updated_by AS updatedBy,updated_at AS updatedAt FROM gate_controls WHERE learner_id=?`).bind(learnerId).all(),
    d1.prepare(`SELECT artifact_code AS artifactCode,rubric_json AS rubricJson,provisional_score AS provisionalScore,decision,feedback,resubmission_required AS resubmissionRequired,assessor_status AS assessorStatus,updated_at AS updatedAt FROM grading_reviews WHERE learner_id=?`).bind(learnerId).all(),
    d1.prepare(`SELECT id,actor_id AS actorId,event_type AS eventType,summary,created_at AS createdAt FROM audit_events WHERE learner_id=? ORDER BY created_at DESC LIMIT 20`).bind(learnerId).all(),
  ]);
  if(!learner)throw new Error('Learner not found.');
  return {learner,mastery:mastery.results,signals:signals.results,interventions:interventions.results,gates:gates.results,grades:grades.results,audit:auditEvents.results,classDirection:classMilestone};
}

export async function assignIntervention(input:InterventionInput){
  requireLecturer(input);await ensurePilotDatabase();const errors:string[]=[];
  if(!topicCodes.includes(input.topicCode as typeof topicCodes[number]))errors.push('A valid topic is required.');
  if(input.activity.trim().length<20)errors.push('Extra-help activity must be specific.');
  if(input.reason.trim().length<15)errors.push('Reason must identify the observed weakness.');
  if(Number.isNaN(Date.parse(input.dueAt))||Date.parse(input.dueAt)<=Date.now())errors.push('Due date must be in the future.');
  if(errors.length)return {accepted:false,errors};
  const id=uid('int'),at=timestamp();
  await db().prepare(`INSERT INTO interventions (id,learner_id,topic_code,class_milestone,activity,reason,owner_id,due_at,severity,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,'assigned',?,?)`)
    .bind(id,input.learnerId,input.topicCode,classMilestone,input.activity.trim(),input.reason.trim(),input.actorId,input.dueAt,input.severity,at,at).run();
  await audit(input.learnerId,input,'intervention_assigned',`Extra help assigned for ${input.topicCode.replaceAll('_',' ')}.`,{interventionId:id,classMilestone,extraHelpOnly:true,dueAt:input.dueAt});
  return {accepted:true,id,status:'assigned',classMilestone,extraHelpOnly:true};
}

export async function changeSignal(input:Actor&{learnerId:string;signalId:string;status:'acknowledged'|'resolved';note:string}){
  requireLecturer(input);await ensurePilotDatabase();if(input.note.trim().length<10)return {accepted:false,errors:['A review note of at least 10 characters is required.']};
  const current=await db().prepare(`SELECT status FROM signals WHERE id=? AND learner_id=?`).bind(input.signalId,input.learnerId).first<{status:string}>();
  if(!current)return {accepted:false,errors:['Signal not found.']};
  if(current.status==='resolved')return {accepted:false,errors:['Resolved signals cannot be changed.']};
  await db().prepare(`UPDATE signals SET status=? WHERE id=? AND learner_id=?`).bind(input.status,input.signalId,input.learnerId).run();
  await audit(input.learnerId,input,`signal_${input.status}`,`Signal ${input.status} after lecturer review.`,{signalId:input.signalId,note:input.note.trim()});
  return {accepted:true,status:input.status};
}

const transitions:Record<string,string[]>={assigned:['in_progress'],in_progress:['awaiting_recheck'],awaiting_recheck:['closed'],closed:[]};
export async function changeIntervention(input:Actor&{learnerId:string;interventionId:string;status:'in_progress'|'awaiting_recheck'|'closed';closureEvidence?:string}){
  requireLecturer(input);await ensurePilotDatabase();const d1=db();
  const current=await d1.prepare(`SELECT status,topic_code AS topicCode FROM interventions WHERE id=? AND learner_id=?`).bind(input.interventionId,input.learnerId).first<{status:string;topicCode:string}>();
  if(!current)return {accepted:false,errors:['Intervention not found.']};
  if(!transitions[current.status]?.includes(input.status))return {accepted:false,errors:[`Invalid transition from ${current.status} to ${input.status}.`]};
  if(input.status==='closed'){
    const mastery=await d1.prepare(`SELECT score FROM topic_mastery WHERE learner_id=? AND topic_code=?`).bind(input.learnerId,current.topicCode).first<{score:number}>();
    if(!mastery||mastery.score<70)return {accepted:false,errors:['A recorded understanding recheck of at least 70% is required before closure.']};
    if((input.closureEvidence||'').trim().length<20)return {accepted:false,errors:['Closure evidence of at least 20 characters is required.']};
  }
  await d1.prepare(`UPDATE interventions SET status=?,closure_evidence=?,updated_at=? WHERE id=? AND learner_id=?`).bind(input.status,input.closureEvidence?.trim()||null,timestamp(),input.interventionId,input.learnerId).run();
  await audit(input.learnerId,input,'intervention_transition',`Intervention moved to ${input.status}.`,{interventionId:input.interventionId,from:current.status,to:input.status});
  return {accepted:true,status:input.status};
}

export async function setGate(input:Actor&{learnerId:string;artifactCode:'F01';status:'blocked'|'released'|'resubmission';reason:string}){
  requireLecturer(input);await ensurePilotDatabase();if(input.reason.trim().length<15)return {accepted:false,errors:['Gate reason must explain the evidence decision.']};
  if(input.status==='released'){
    const active=await db().prepare(`SELECT COUNT(*) AS count FROM signals WHERE learner_id=? AND severity IN ('support','urgent') AND status!='resolved'`).bind(input.learnerId).first<{count:number}>();
    if((active?.count||0)>0)return {accepted:false,errors:['Resolve support or urgent signals before releasing the formal gate.']};
  }
  await db().prepare(`INSERT INTO gate_controls (learner_id,artifact_code,status,reason,updated_by,updated_at) VALUES (?,'F01',?,?,?,?) ON CONFLICT(learner_id,artifact_code) DO UPDATE SET status=excluded.status,reason=excluded.reason,updated_by=excluded.updated_by,updated_at=excluded.updated_at`)
    .bind(input.learnerId,input.status,input.reason.trim(),input.actorId,timestamp()).run();
  await audit(input.learnerId,input,'gate_decision',`Formal gate set to ${input.status}.`,{artifactCode:'F01',reason:input.reason.trim()});
  return {accepted:true,status:input.status};
}

export async function saveGrade(input:GradeInput){
  requireLecturer(input);await ensurePilotDatabase();const criteria=['safeSequence','observationInference','testResult','closure'];
  if(criteria.some(key=>!Number.isInteger(input.rubric[key])||input.rubric[key]<0||input.rubric[key]>4))return {accepted:false,errors:['Each rubric criterion must be an integer from 0 to 4.']};
  if(input.feedback.trim().length<20)return {accepted:false,errors:['Actionable feedback of at least 20 characters is required.']};
  const score=Math.round(criteria.reduce((total,key)=>total+input.rubric[key],0)/16*100);
  if(input.decision==='released'&&score<70)return {accepted:false,errors:['A score below 70% must remain draft or be returned for evidence.']};
  const resubmission=input.decision==='return'?1:0;
  await db().prepare(`INSERT INTO grading_reviews (learner_id,artifact_code,rubric_json,provisional_score,decision,feedback,resubmission_required,assessor_status,updated_by,updated_at) VALUES (?,?,?,?,?,?,?,'pending',?,?) ON CONFLICT(learner_id,artifact_code) DO UPDATE SET rubric_json=excluded.rubric_json,provisional_score=excluded.provisional_score,decision=excluded.decision,feedback=excluded.feedback,resubmission_required=excluded.resubmission_required,updated_by=excluded.updated_by,updated_at=excluded.updated_at`)
    .bind(input.learnerId,input.artifactCode,JSON.stringify(input.rubric),score,input.decision,input.feedback.trim(),resubmission,input.actorId,timestamp()).run();
  await audit(input.learnerId,input,'grade_review',`P01 grade review saved as ${input.decision}.`,{artifactCode:input.artifactCode,score,assessorStatus:'pending'});
  if(input.decision==='return')await setGate({...input,artifactCode:'F01',status:'resubmission',reason:`P01 evidence returned: ${input.feedback.trim()}`});
  return {accepted:true,score,decision:input.decision,resubmissionRequired:Boolean(resubmission),assessorStatus:'pending'};
}

export type {InterventionInput,GradeInput,Actor};
