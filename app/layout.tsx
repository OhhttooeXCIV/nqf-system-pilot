import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Bridge5 | NQF 5 Systems Support Pilot',description:'Evidence-led NQF 5 systems support learning and compliance readiness.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
