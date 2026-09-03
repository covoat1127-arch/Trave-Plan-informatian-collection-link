import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: '私享旅程需求问卷｜观策·帧', description: '观策·帧高端商旅服务专属旅程需求问卷' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
