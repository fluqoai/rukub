import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';
import { Container } from '@/components/ui/Container';

const storeLinks = [
  { label: 'كل المنتجات', href: '/discover' },
  { label: 'الراحة والتنظيم', href: '/shop/women' },
  { label: 'التقنية والأمان', href: '/shop/men' },
  { label: 'أساسيات يومية', href: '/shop/shared' },
];
const policyLinks = [
  { label: 'الخصوصية', href: '/privacy' },
  { label: 'الشروط والأحكام', href: '/terms' },
  { label: 'الاستبدال والاسترجاع', href: '/refund' },
  { label: 'الشحن والتسليم', href: '/shipping' },
  { label: 'الشكاوى والتواصل', href: '/complaints' },
];

export function Footer() {
  const email = process.env.NEXT_PUBLIC_STORE_EMAIL || 'support@rukub.shop';
  return (
    <footer className="border-t border-sage-500/10 bg-ink-900 text-linen-50">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5"><Link href="/" className="inline-flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-500 font-bold">ر</span><span className="text-lg font-semibold">ركوب</span></Link><p className="mt-4 max-w-md text-sm leading-7 text-linen-100/65">متجر سعودي متخصص في إكسسوارات السيارة العملية. نختار المنتجات التي تجعل القيادة أكثر ترتيباً وراحة، ونوضح تفاصيل الطلب من البداية حتى الاستلام.</p><div className="mt-6 space-y-2 text-sm text-linen-100/65"><p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-wood-400" /> الرياض، المملكة العربية السعودية</p><a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-white"><Mail className="h-4 w-4 text-wood-400" /> {email}</a></div></div>
          <div className="md:col-span-3"><h2 className="text-sm font-semibold">تسوق</h2><ul className="mt-4 space-y-3">{storeLinks.map((link) => <li key={link.href}><Link href={link.href} className="text-sm text-linen-100/60 hover:text-white">{link.label}</Link></li>)}</ul></div>
          <div className="md:col-span-4"><h2 className="text-sm font-semibold">خدمة العملاء</h2><ul className="mt-4 grid gap-3 sm:grid-cols-2">{policyLinks.map((link) => <li key={link.href}><Link href={link.href} className="text-sm text-linen-100/60 hover:text-white">{link.label}</Link></li>)}</ul><Link href="/orders" className="mt-5 inline-flex rounded-full border border-linen-50/20 px-4 py-2 text-xs hover:bg-linen-50/10">متابعة طلبك</Link></div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-linen-50/10 pt-6 text-xs text-linen-100/45 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} ركوب. جميع الحقوق محفوظة.</p><span>الدفع الإلكتروني قريباً</span></div>
      </Container>
    </footer>
  );
}
