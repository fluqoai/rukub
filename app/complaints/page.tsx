import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = { title: 'الشكاوى والتواصل', description: 'قنوات وخطوات تقديم الشكاوى ومتابعتها مع متجر ركوب.' };
export default function ComplaintsPage() {
  return <LegalPage title="الشكاوى والتواصل" subtitle="نستقبل استفسارات الطلبات والشكاوى عبر قناة مكتوبة وواضحة." lastUpdated="4 سبتمبر 2026" sections={[
    { id: 'contact', title: '1. طريقة التواصل', paragraphs: ['أرسل رسالتك إلى support@rukub.shop، واذكر رقم الطلب ورقم الجوال المستخدم في الطلب ووصفاً مختصراً للمشكلة.'] },
    { id: 'response', title: '2. متابعة الشكوى', paragraphs: ['نؤكد استلام الرسالة عبر البريد، ثم نراجع بيانات الطلب والشحن. تختلف مدة الحل حسب نوع المشكلة والطرف الخارجي المعني، وسنشاركك التحديثات كتابياً.'] },
    { id: 'returns', title: '3. المنتجات التالفة أو غير المطابقة', paragraphs: ['أرفق صوراً واضحة للمنتج والتغليف خلال أقرب وقت من الاستلام. تخضع طلبات الاستبدال والاسترجاع للسياسة المنشورة في صفحة الاستبدال والاسترجاع.'] },
    { id: 'escalation', title: '4. التصعيد', paragraphs: ['إذا لم تصل إلى حل، يمكنك الرد على سلسلة البريد نفسها وطلب تصعيد المراجعة مع إرفاق أي معلومات إضافية تدعم طلبك.'] },
  ]} />;
}
