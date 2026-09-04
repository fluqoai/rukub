import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ركوب — إكسسوارات سيارة عملية';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', direction: 'rtl', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#2c2a26,#536047)', color: '#f5f1ea', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: 980 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 34 }}><div style={{ display: 'flex', width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', background: '#6b7a5a', fontWeight: 700 }}>ر</div>ركوب</div>
        <div style={{ display: 'flex', marginTop: 54, fontSize: 72, lineHeight: 1.25, fontWeight: 700 }}>سيارتك، بشكل أرتب.<br />رحلتك، بشكل أفضل.</div>
        <div style={{ display: 'flex', marginTop: 30, fontSize: 28, color: '#d7d1c7' }}>إكسسوارات عملية مختارة للسائق في السعودية</div>
      </div>
    </div>,
    size
  );
}
