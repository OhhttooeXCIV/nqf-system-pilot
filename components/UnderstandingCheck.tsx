'use client';
import {FormEvent,useState} from 'react';

const questions=[
  {id:'signal',prompt:'What does a monitor message “No signal” prove?',options:[['incorrect','The graphics card has failed'],['correct','The monitor is not receiving a usable video signal']]},
  {id:'first_action',prompt:'Which is the strongest first response?',options:[['correct','Make the task safe and test the least-invasive point in the display path'],['incorrect','Replace the most likely failed part']]},
  {id:'evidence',prompt:'Which record can another technician verify?',options:[['incorrect','Cable checked; still broken'],['correct','Known-good HDMI cable tested on HDMI 2 at 10:14; “No signal” remained']]},
] as const;

type Result={score:number;weaknessLevel:string;signal?:{severity:string;message:string}|null};

export default function UnderstandingCheck(){
  const[observation,setObservation]=useState(''),[hypothesis,setHypothesis]=useState(''),[safeAction,setSafeAction]=useState('');
  const[confidenceBefore,setConfidenceBefore]=useState(2),[confidenceAfter,setConfidenceAfter]=useState(3);
  const[answers,setAnswers]=useState<Record<string,string>>({}),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState<Result|null>(null);
  async function submit(event:FormEvent){
    event.preventDefault();setBusy(true);setError('');setResult(null);
    try{
      const response=await fetch('/api/pilot',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'record_understanding_check',check:{learnerId:'lrn-thando',topicCode:'fault_isolation',observation,hypothesis,safeAction,confidenceBefore,confidenceAfter,answers}})});
      const data=await response.json() as {ok:boolean;message?:string;errors?:string[];score?:number;weaknessLevel?:string;signal?:Result['signal']};
      if(!response.ok)throw new Error(data.errors?.join(' ')||data.message||'The check could not be recorded.');
      setResult({score:data.score||0,weaknessLevel:data.weaknessLevel||'unmeasured',signal:data.signal});
    }catch(reason){setError(reason instanceof Error?reason.message:'The check could not be recorded.')}
    finally{setBusy(false)}
  }
  return <section className="panel understanding"><div className="understanding-head"><div><p className="kicker">LEARNER ↔ LECTURER UNDERSTANDING CHECK</p><h2>Show what changed your mind</h2><p>This CBT-informed educational reflection checks evidence-based reasoning. It is not diagnosis or therapy.</p></div><span>Supports class milestone<br/><b>P01 Hardware fault isolation</b></span></div><form onSubmit={submit}><div className="reflection-grid"><label>What did you observe?<textarea value={observation} onChange={event=>setObservation(event.target.value)} placeholder="Record a visible fact, message, light, sound or measurement." required/></label><label>What do you think it means?<textarea value={hypothesis} onChange={event=>setHypothesis(event.target.value)} placeholder="State one testable explanation—not a final diagnosis." required/></label><label>What safe action will test it?<textarea value={safeAction} onChange={event=>setSafeAction(event.target.value)} placeholder="Name the least-invasive controlled test and expected result." required/></label></div><div className="confidence"><label>Confidence before <select value={confidenceBefore} onChange={event=>setConfidenceBefore(Number(event.target.value))}>{[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}</select></label><span>1 = unsure · 5 = can explain and demonstrate</span><label>Confidence after <select value={confidenceAfter} onChange={event=>setConfidenceAfter(Number(event.target.value))}>{[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}</select></label></div><div className="understanding-questions">{questions.map(question=><fieldset key={question.id}><legend>{question.prompt}</legend>{question.options.map(([value,label])=><label key={label}><input type="radio" name={question.id} checked={answers[question.id]===value} onChange={()=>setAnswers(current=>({...current,[question.id]:value}))} required/><span>{label}</span></label>)}</fieldset>)}</div><button className="action primary" disabled={busy||Object.keys(answers).length<questions.length}>{busy?'Validating and recording…':'Submit understanding check'}</button>{error&&<p className="check-error">{error}</p>}{result&&<div className={'check-result '+result.weaknessLevel}><b>{result.score}% · {result.weaknessLevel}</b><span>{result.signal?`${result.signal.severity} signal created for lecturer review.`:'Understanding is secure; continue with the common class milestone.'}</span><small>Extra help may be suggested, but it cannot replace the class programme.</small></div>}</form></section>
}
