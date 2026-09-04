import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export default function NotFound() {
  return <main className="py-24"><Container><div className="mx-auto max-w-lg rounded-4xl border border-sage-500/10 bg-linen-50 p-10 text-center"><Search className="mx-auto h-10 w-10 text-sage-500" /><p className="mt-5 font-mono text-xs text-ink-300">404</p><h1 className="mt-2 text-2xl font-semibold text-ink-900">هذه الصفحة غير موجودة</h1><p className="mt-3 text-sm leading-6 text-ink-500">ربما تغيّر الرابط أو لم يعد المنتج متاحاً. يمكنك العودة إلى المتجر ومتابعة التصفح.</p><Link href="/discover" className="mt-7 inline-flex items-center gap-2 rounded-full bg-sage-500 px-6 py-3 text-sm font-medium text-linen-50">العودة إلى المتجر <ArrowLeft className="h-4 w-4" /></Link></div></Container></main>;
}
