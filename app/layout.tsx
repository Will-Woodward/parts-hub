import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'PARTS HUB | 电子元器件现货商城', description: '专业电子元器件现货采购平台' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
