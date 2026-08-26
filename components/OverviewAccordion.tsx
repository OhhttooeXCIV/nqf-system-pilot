'use client';
import {ReactNode,useRef} from 'react';
export default function OverviewAccordion({title,summary,open,onToggle,children}:{title:string;summary:string;open:boolean;onToggle:()=>void;children:ReactNode}){
  const triggerRef=useRef<HTMLButtonElement>(null);
  function toggle(){
    const top=triggerRef.current?.getBoundingClientRect().top;
    onToggle();
    if(top===undefined)return;
    requestAnimationFrame(()=>{
      const nextTop=triggerRef.current?.getBoundingClientRect().top;
      if(nextTop!==undefined&&Math.abs(nextTop-top)>1)window.scrollBy({top:nextTop-top,behavior:'auto'});
    });
  }
  return <section className={'overview-accordion '+(open?'open':'')}><button ref={triggerRef} className="accordion-trigger" onClick={toggle} aria-expanded={open} data-tooltip={open?'Collapse section':'Expand section'}><span><b>{title}</b><small>{summary}</small></span><i aria-hidden="true" className="accordion-indicator">{open?'−':'+'}</i></button>{open&&<div className="accordion-content">{children}</div>}</section>
}