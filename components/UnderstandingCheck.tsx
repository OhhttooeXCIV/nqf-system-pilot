'use client';
import {FormEvent,useMemo,useState} from 'react';

const questions=[
  {id:'signal',prompt:'What does a monitor message “No signal” prove?',options:[['incorrect','The graphics card has failed'],['correct','The monitor is not receiving a usable video signal']]},
  {id:'first_action',prompt:'Which is the strongest first response?',options:[['correct','Make the task safe and test the least-invasive point in the display path'],['incorrect','Replace the most likely failed part']]},
  {id:'evidence',prompt:'Which record can another technician verify?',options:[['incorrect','Cable checked; still broken'],['correct','Known-good HDMI cable tested on HDMI 2 at 10:14; “No signal” remained']]},
] as const;
type Result={score:number;weaknessLevel:string;signal?:{severity:string;message:string}|null};

export default function UnderstandingCheck(){
  const[observation,setObservation]=useState(''),[hypothesis,setHypothesis]=useState(''),[safeAction,setSafeAction]=useState('');
  const[confidenceBefore,setConfidenceBefore]=useState(2),[confidenceAfter,setConfidenceAfter]=useState(3);
  const[answers,setAnswers]=useState<Record<string,string>>({}),[step,setStep]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState<Result|null>(null);
  const total=7,currentQuestion=step>=4?questions[step-4]:null;
  const complete=[observation.trim().length>0,hypothesis.trim().length>0,safeAction.trim().length>0,true,...questions.map(question=>Boolean(answers[question.id]))];
  const summary=useMemo(()=>[
    ['Observation',observation],['Working explanation',hypothesis],['Safe test',safeAction],['Confidence',confidenceBefore+' before → '+confidenceAfter+' after'],
    ...questions.map(question=>[question.prompt,question.options.find(([value])=>value===answers[question.id])?.[1]||'Not answered'])
  ],[observation,hypothesis,safeAction,confidenceBefore,confidenceAfter,answers]);
  function next(){if(complete[step])setStep(current=>Math.min(total,current+1))}
  function previous(){setStep(current=>Math.max(0,current-1))}
  function swipe(event:React.TouchEvent<HTMLElement>){const start=Number(event.currentTarget.dataset.touchX||0),end=event.changedTouches[0]?.clientX||start;if(start-end>55)next();if(end-start>55)previous()}
  async function submit(event:FormEvent){
    event.preventDefault();setBusy(true);setError('');setResult(null);
    const payload={action:'record_understanding_check',check:{learnerId:'lrn-thando',topicCode:'fault_isolation',observation,hypothesis,safeAction,confidenceBefore,confidenceAfter,answers}};
    if(!navigator.onLine){
      const queue=JSON.parse(localStorage.getItem('b5-sync-queue')||'[]') as unknown[];queue.push(payload);localStorage.setItem('b5-sync-queue',JSON.stringify(queue));
      window.dispatchEvent(new CustomEvent('b5-sync-change'));window.dispatchEvent(new CustomEvent('b5-toast',{detail:'Saved offline. This check will sync automatically when connectivity returns.'}));
      setBusy(false);return;
    }
    try{
      const response=await fetch('/api/pilot',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      const data=await response.json() as {ok:boolean;message?:string;errors?:string[];score?:number;weaknessLevel?:string;signal?:Result['signal']};
      if(!response.ok)throw new Error(data.errors?.join(' ')||data.message||'The check could not be recorded.');
      setResult({score:data.score||0,weaknessLevel:data.weaknessLevel||'unmeasured',signal:data.signal});window.dispatchEvent(new CustomEvent('b5-toast',{detail:'Understanding check recorded and lecturer workspace updated.'}));
    }catch(reason){setError(reason instanceof Error?reason.message:'The check could not be recorded.')}finally{setBusy(false)}
  }
  return <section className="panel understanding"><div className="understanding-head"><div><p className="kicker">LEARNER ↔ LECTURER UNDERSTANDING CHECK</p><h2>Show what changed your mind</h2><p>This CBT-informed educational reflection checks evidence-based reasoning. It is not diagnosis or therapy.</p></div><span>Supports class milestone<br/><b>P01 Hardware fault isolation</b></span></div><form onSubmit={submit}><div className="check-progress" aria-label={step<total?`Question ${step+1} of ${total}`:'Confirmation'}><div><b>{step<total?`Question ${step+1} of ${total}`:'Confirm your responses'}</b><span>{step<total?'Draft only · nothing is recorded yet':'Ready to notify your lecturer'}</span></div><i><span style={{width:(step<total?Math.round(((step+1)/total)*100):100)+'%'}}/></i></div>{step<total?<section className="check-stage" data-touch-x="0" onTouchStart={event=>{event.currentTarget.dataset.touchX=String(event.touches[0]?.clientX||0)}} onTouchEnd={swipe}>{step===0&&<label>What did you observe?<textarea autoFocus value={observation} onChange={event=>setObservation(event.target.value)} placeholder="Record a visible fact, message, light, sound or measurement." required/></label>}{step===1&&<label>What do you think it means?<textarea autoFocus value={hypothesis} onChange={event=>setHypothesis(event.target.value)} placeholder="State one testable explanation—not a final diagnosis." required/></label>}{step===2&&<label>What safe action will test it?<textarea autoFocus value={safeAction} onChange={event=>setSafeAction(event.target.value)} placeholder="Name the least-invasive controlled test and expected result." required/></label>}{step===3&&<div className="confidence confidence-stage"><label>Confidence before<select value={confidenceBefore} onChange={event=>setConfidenceBefore(Number(event.target.value))}>{[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}</select></label><span>1 = unsure · 5 = can explain and demonstrate</span><label>Confidence after<select value={confidenceAfter} onChange={event=>setConfidenceAfter(Number(event.target.value))}>{[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}</select></label></div>}{currentQuestion&&<fieldset className="single-question"><legend>{currentQuestion.prompt}</legend>{currentQuestion.options.map(([value,label])=><label key={label}><input type="radio" name={currentQuestion.id} checked={answers[currentQuestion.id]===value} onChange={()=>setAnswers(current=>({...current,[currentQuestion.id]:value}))}/><i aria-hidden="true"/><span>{label}</span></label>)}</fieldset>}<div className="check-nav"><button type="button" className="action secondary" onClick={previous} disabled={step===0}>← Back</button><small>Swipe left or use Next. Your draft stays on this screen.</small><button type="button" className="action primary" onClick={next} disabled={!complete[step]}>{step===total-1?'Review':'Next'} →</button></div></section>:<section className="check-confirm"><h3>Confirm before submitting</h3><p>Review every response. You can change anything before submission. Confirming writes the check to the pilot record and updates the lecturer workspace.</p><dl>{summary.map(([label,value],index)=><div key={label}><dt>{index+1}. {label}</dt><dd>{value}</dd><button type="button" onClick={()=>setStep(index)}>Edit</button></div>)}</dl><div className="check-nav"><button type="button" className="action secondary" onClick={()=>setStep(total-1)}>← Back</button><button className="action primary" disabled={busy}>{busy?'Recording and notifying…':'Confirm, submit & notify lecturer'}</button></div></section>}{error&&<p className="check-error">{error}</p>}{result&&<div className={'check-result '+result.weaknessLevel}><b>{result.score}% · {result.weaknessLevel}</b><span>{result.signal?`${result.signal.severity} signal created for lecturer review.`:'Understanding is secure; the lecturer workspace has been updated.'}</span><small>Extra help may be suggested, but it cannot replace the class programme.</small></div>}</form></section>
}


