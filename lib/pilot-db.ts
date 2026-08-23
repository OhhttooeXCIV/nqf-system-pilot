import {env} from 'cloudflare:workers';
import {schemaStatements,seedLearners,topicCodes} from '@/db/schema';

type CheckInput={
  learnerId:string;
  topicCode:string;
  observation:string;
  hypothesis:string;
  safeAction:string;
  confidenceBefore:number;
  confidenceAfter:number;
  answers:Record<string,string>;
};

const now=()=>new Date().toISOString();
const id=(prefix:string)=>`${prefix}-${crypto.randomUUID()}`;

function db(){
  const binding=(env as unknown as {DB?:D1Database}).DB;
  if(!binding)throw new Error('D1 binding DB is not configured');
  return binding;
}

export async function ensurePilotDatabase(){
  const d1=db();
  await d1.batch(schemaStatements.map(sql=>d1.prepare(sql)));
  const timestamp=now();
  await d1.batch(seedLearners.map(([learnerId,name,cohortId,milestone,readiness])=>d1.prepare(
    `INSERT OR IGNORE INTO learners (id,name,cohort_id,class_milestone,overall_readiness,updated_at)
     VALUES (?,?,?,?,?,?)`,
  ).bind(learnerId,name,cohortId,milestone,readiness,timestamp)));
  await d1.batch(seedLearners.flatMap(([learnerId])=>topicCodes.map(topic=>d1.prepare(
    `INSERT OR IGNORE INTO topic_mastery (learner_id,topic_code,updated_at) VALUES (?,?,?)`,
  ).bind(learnerId,topic,timestamp))));
}

export async function listCohort(cohortId='cohort-01'){
  await ensurePilotDatabase();
  const d1=db();
  const learners=await d1.prepare(
    `SELECT l.id,l.name,l.status,l.class_milestone AS classMilestone,l.overall_readiness AS overallReadiness,
      COUNT(CASE WHEN s.status='open' THEN 1 END) AS openSignals
     FROM learners l LEFT JOIN signals s ON s.learner_id=l.id
     WHERE l.cohort_id=? GROUP BY l.id ORDER BY l.name`,
  ).bind(cohortId).all();
  const mastery=await d1.prepare(
    `SELECT tm.learner_id AS learnerId,tm.topic_code AS topicCode,tm.score,tm.attempts,tm.weakness_level AS weaknessLevel
     FROM topic_mastery tm JOIN learners l ON l.id=tm.learner_id WHERE l.cohort_id=?
     ORDER BY tm.learner_id,tm.topic_code`,
  ).bind(cohortId).all();
  return {cohortId,classDirection:'P01 Hardware fault isolation',learners:learners.results,mastery:mastery.results};
}

function validateCheck(input:CheckInput){
  const errors:string[]=[];
  if(!input.learnerId)errors.push('Learner is required.');
  if(!topicCodes.includes(input.topicCode as typeof topicCodes[number]))errors.push('Unknown topic code.');
  if(input.observation.trim().length<12)errors.push('Observation must contain a specific visible fact.');
  if(input.hypothesis.trim().length<12)errors.push('Hypothesis must be testable and explained.');
  if(input.safeAction.trim().length<12)errors.push('Safe action must identify the next controlled test.');
  if(!Number.isInteger(input.confidenceBefore)||input.confidenceBefore<1||input.confidenceBefore>5)errors.push('Starting confidence must be 1–5.');
  if(!Number.isInteger(input.confidenceAfter)||input.confidenceAfter<1||input.confidenceAfter>5)errors.push('Ending confidence must be 1–5.');
  return errors;
}

export async function recordUnderstandingCheck(input:CheckInput){
  await ensurePilotDatabase();
  const errors=validateCheck(input);
  if(errors.length)return {accepted:false,errors};
  const answerScore=Object.values(input.answers).filter(value=>value==='correct').length;
  const answerTotal=Math.max(1,Object.keys(input.answers).length);
  const structuredScore=[input.observation,input.hypothesis,input.safeAction].filter(value=>value.trim().length>=24).length;
  const score=Math.round(((answerScore/answerTotal)*70)+((structuredScore/3)*30));
  const weaknessLevel=score<50?'high':score<70?'developing':'secure';
  const timestamp=now();
  const validation={framework:'educational CBT-informed reflection; not diagnosis or therapy',classDirection:'P01 Hardware fault isolation',extraHelpOnly:true,errors:[]};
  const d1=db();
  await d1.batch([
    d1.prepare(
      `INSERT INTO understanding_checks
       (id,learner_id,topic_code,observation,hypothesis,safe_action,confidence_before,confidence_after,answers_json,score,validation_json,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).bind(id('chk'),input.learnerId,input.topicCode,input.observation.trim(),input.hypothesis.trim(),input.safeAction.trim(),input.confidenceBefore,input.confidenceAfter,JSON.stringify(input.answers),score,JSON.stringify(validation),timestamp),
    d1.prepare(
      `UPDATE topic_mastery SET score=?,attempts=attempts+1,weakness_level=?,last_evidence=?,updated_at=?
       WHERE learner_id=? AND topic_code=?`,
    ).bind(score,weaknessLevel,`Understanding check ${timestamp}`,timestamp,input.learnerId,input.topicCode),
  ]);
  let signal=null;
  if(score<70){
    signal={id:id('sig'),severity:score<50?'support':'observe',code:'understanding_gap',message:`${input.topicCode.replaceAll('_',' ')} understanding scored ${score}%. Lecturer review required.`};
    await d1.prepare(
      `INSERT INTO signals (id,learner_id,topic_code,severity,code,message,status,created_at) VALUES (?,?,?,?,?,?,'open',?)`,
    ).bind(signal.id,input.learnerId,input.topicCode,signal.severity,signal.code,signal.message,timestamp).run();
  }
  return {accepted:true,score,weaknessLevel,signal,validation};
}

export type {CheckInput};
