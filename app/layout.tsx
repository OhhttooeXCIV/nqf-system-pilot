import type {Metadata} from 'next';
import {Geist} from 'next/font/google';
import './globals.css';
const geist=Geist({variable:'--font-geist-sans',subsets:['latin']});
export const metadata:Metadata={title:'Bridge5 | NQF 5 Systems Support Pilot',description:'Evidence-led NQF 5 systems support learning and compliance readiness.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className={geist.variable}>{children}</body></html>}
