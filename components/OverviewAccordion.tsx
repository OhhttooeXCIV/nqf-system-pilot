'use client';
import {ReactNode} from 'react';

export default function OverviewAccordion({title,summary,open,onToggle,children}:{title:string;summary:string;open:boolean;onToggle:()=>void;children:ReactNode}){
  return <section className={'overview-accordion '+(open?'open':'')}><button className="accordion-trigger" onClick={onToggle} aria-expanded={open}><span><b>{title}</b><small>{summary}</small></span><i>{open?'−':'+'}</i></button>{open&&<div className="accordion-content">{children}</div>}</section>
}
