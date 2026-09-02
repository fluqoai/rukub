import {
  Sparkles,
  Smartphone,
  Wind,
  Snowflake,
  Camera,
  Backpack,
  Gauge,
  Plug,
  Lightbulb,
  Sun,
  Search,
  Trash2,
  CircleDot,
  Heart,
  Tag,
  Package,
  ShieldCheck,
  CupSoda,
  MonitorSmartphone,
  type LucideIcon,
} from 'lucide-react';

export type Audience = 'women' | 'men' | 'shared';
export type PriceTier = 1 | 2 | 3 | 4;

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  audience: Audience;
  price: number;        // سعر البيع SAR
  oldPrice?: number;    // للـ anchor pricing
  cost: number;         // تكلفة المنتج
  icon: LucideIcon;
  tagline: string;
  description: string;
  features: [string, string, string];
  badge?: 'الأكثر مبيعاً' | 'جديد' | 'شحن سريع' | 'لمسة شخصية';
  tier: PriceTier;
  isHero?: boolean;
};

export const products: Product[] = [
  {
    id: 'p01',
    slug: 'seat-gap-organizer',
    name: 'منظم فراغ المقعد الجانبي',
    shortName: 'منظم فراغ المقعد',
    audience: 'shared',
    price: 49,
    oldPrice: 79,
    cost: 12,
    icon: Package,
    tagline: 'وداعاً للجوال اللي يطيح بين المقاعد',
    description:
      'الحل النهائي للفوضى بين المقعد ونقطة التوقف. يمنع سقوط الجوال، المفاتيح، النقود، وبطاقات الـ VIP في تلك المنطقة المستحيلة الوصول. تصميم بسيط يناسب 99% من السيارات.',
    features: [
      'تركيب فوري — لا يحتاج مفكات أو لصق',
      'يحمي من سقوط الجوال أثناء الفرملة',
      'جلد صناعي سهل التنظيف بممسحة واحدة',
    ],
    badge: 'الأكثر مبيعاً',
    tier: 1,
    isHero: true,
  },
  {
    id: 'p02',
    slug: 'magsafe-car-charger',
    name: 'شاحن السيارة المغناطيسي 15W',
    shortName: 'شاحن مغناطيسي',
    audience: 'men',
    price: 149,
    oldPrice: 199,
    cost: 45,
    icon: Smartphone,
    tagline: 'يثبّت جوالك ويشحنه في نفس الوقت',
    description:
      'شاحن لاسلكي بتقنية MagSafe يثبّت جوالك بقبضة مغناطيسية قوية أثناء الطريق ويشحنه في نفس الوقت بـ 15W. متوافق مع iPhone 12 وما بعده، ومع أجهزة Android الداعمة للشحن اللاسلكي.',
    features: [
      'مغناطيس N52 بقوة 1.2kg',
      'شحن سريع 15W — 3x أسرع',
      'دوران 360° لمشاهدة الخرائط',
    ],
    badge: 'الأكثر مبيعاً',
    tier: 3,
    isHero: true,
  },
  {
    id: 'p03',
    slug: 'oud-air-freshener',
    name: 'معطر السيارة الفاخر — مجموعة عود/مسك/عنبر',
    shortName: 'معطر عود فاخر',
    audience: 'shared',
    price: 29,
    cost: 6,
    icon: Wind,
    tagline: 'نفحة هوية سعودية في كل رحلة',
    description:
      'معطر سيارة بتصميم أنيق بنفحات عود ملكي، مسك أبيض، وعنبر دافئ — مصممة خصيصاً للذوق السعودي. عبوة معدنية متينة بغطاء خشبي طبيعي، تدوم 60-90 يوم.',
    features: [
      'تركيبة عطرية سعودية الأصل',
      'تدوم حتى 90 يوم',
      'تغليف جاهز للإهداء',
    ],
    badge: 'الأكثر مبيعاً',
    tier: 1,
    isHero: true,
  },
  {
    id: 'p04',
    slug: 'cooling-seat-cushion',
    name: 'وسادة التبريد المائية — هدية الصيف',
    shortName: 'وسادة تبريد',
    audience: 'shared',
    price: 129,
    oldPrice: 169,
    cost: 38,
    icon: Snowflake,
    tagline: 'تقطع 15° عن مقعدك في 30 ثانية',
    description:
      'وسادة مقعد بتقنية التبريد المائي و gel — تخفض حرارة المقعد بـ 15° في 30 ثانية. مروحة هادئة بـ 3 سرعات، USB-C للشحن، تغطية قابلة للغسل.',
    features: [
      'تخفيض 15° خلال 30 ثانية',
      'مروحة هادئة ≤25dB',
      'غطاء قابل للغسل',
    ],
    badge: 'جديد',
    tier: 3,
    isHero: true,
  },
  {
    id: 'p05',
    slug: 'dash-cam-4k',
    name: 'كاميرا السيارة الذكية 4K',
    shortName: 'داش كام 4K',
    audience: 'men',
    price: 349,
    cost: 95,
    icon: Camera,
    tagline: 'شاهد كل شيء، ليلاً ونهاراً',
    description:
      'كاميرا داش بـ 4K حقيقية، زاوية عريضة 170°، رؤية ليلية بـ Sony IMX335، تسجيل حلقي تلقائي، مستشعر حركة، وحساس G لتسجيل الحوادث. ذاكرة 64GB مرفقة.',
    features: [
      '4K حقيقي + Night Vision',
      'حساس G لتسجيل الحوادث تلقائياً',
      'ذاكرة 64GB هدية',
    ],
    badge: 'شحن سريع',
    tier: 4,
  },
  {
    id: 'p06',
    slug: 'backseat-organizer',
    name: 'منظم المقعد الخلفي — مجموعة العائلة',
    shortName: 'منظم العائلة',
    audience: 'women',
    price: 99,
    cost: 28,
    icon: Backpack,
    tagline: 'العائلة كلها مرتّبة في مقعد واحد',
    description:
      'منظم يثبت على ظهر المقعد الأمامي، يحتوي على 6 جيوب للألعاب، الكتب، المناديل، القناني، والأجهزة اللوحية. مقاوم للماء، سهل التنظيف، يناسب جميع السيارات.',
    features: [
      '6 جيوب لكل احتياجات الأطفال',
      'مقاوم للماء',
      'خفيف الوزن 380g',
    ],
    badge: 'جديد',
    tier: 2,
    isHero: true,
  },
  {
    id: 'p07',
    slug: 'tire-inflator',
    name: 'منفاخ الإطارات المحمول الرقمي',
    shortName: 'منفاخ إطارات',
    audience: 'men',
    price: 199,
    cost: 55,
    icon: Gauge,
    tagline: 'نفخ إطار في دقيقتين، في أي مكان',
    description:
      'منفاخ إطارات محمول ببطارية ليثيوم قابلة للشحن، شاشة رقمية لقراءة الضغط، إطفاء تلقائي عند الضغط المستهدف. مصباح LED مدمج للطوارئ.',
    features: [
      'إطفاء تلقائي عند الضغط المستهدف',
      'بطارية قابلة للشحن — لا تحتاج سيارة',
      'مصباح LED للطوارئ',
    ],
    tier: 3,
  },
  {
    id: 'p08',
    slug: 'car-charger-65w',
    name: 'شاحن سيارة USB-C + USB-A 65W',
    shortName: 'شاحن سريع 65W',
    audience: 'men',
    price: 59,
    cost: 14,
    icon: Plug,
    tagline: 'اشحن جوالك ولابتوبك من نفس المكان',
    description:
      'شاحن سيارة بمنفذين USB-C و USB-A بقدرة إجمالية 65W. يدعم PD و QC للشحن السريع. حجم مدمج، إضاءة LED زرقاء خفيفة.',
    features: [
      '65W PD — يشحن لابتوب أيضاً',
      'منفذين USB-C + USB-A',
      'حماية من الحرارة والتيار الزائد',
    ],
    tier: 2,
  },
  {
    id: 'p09',
    slug: 'led-interior-lights',
    name: 'طقم الإضاءة الداخلية RGB',
    shortName: 'إضاءة LED',
    audience: 'men',
    price: 89,
    cost: 22,
    icon: Lightbulb,
    tagline: 'أضف شخصية لسيارتك',
    description:
      'طقم إضاءة LED داخلية بـ 6-8 قطع RGB، تركيب بدون أسلاك، تحكم من التطبيق أو الريموت. موسيقى متزامنة، 16 مليون لون.',
    features: [
      '16 مليون لون + أوضاع موسيقى',
      'تركيب بدون أسلاك',
      'تحكم بالتطبيق أو الريموت',
    ],
    tier: 2,
  },
  {
    id: 'p10',
    slug: 'foldable-sunshade',
    name: 'واقي الشمس القلاب 5-طبقات',
    shortName: 'واقي شمس',
    audience: 'shared',
    price: 69,
    cost: 18,
    icon: Sun,
    tagline: 'درع سيارتك من لهيب الشمس',
    description:
      'واقي شمس قلاب 5-طبقات بعزل حراري قوي. يناسب معظم السيارات، طي مدمج، تخزين سهل. يقلل حرارة المقصورة الداخلية حتى 30°.',
    features: [
      'عزل حراري 5-طبقات',
      'ينطوي بحجم 30cm للتخزين',
      'يناسب 99% من السيارات',
    ],
    tier: 2,
  },
  {
    id: 'p11',
    slug: 'led-magnifier',
    name: 'مكبرة LED بوق + هوائي',
    shortName: 'مكبرة LED',
    audience: 'men',
    price: 169,
    cost: 45,
    icon: Search,
    tagline: 'أمان إضافي للقيادة الليلية والصحراوية',
    description:
      'مكبرة سيارة LED طويلة المدى بقوة 60W مع هوائي 4G مدمج. مقاومة للماء IP67، تركيب بدون تعديلات في السيارة. إضاءة 360° قابلة للتعديل.',
    features: [
      'إضاءة قوية 60W — مدى 200m',
      'هوائي 4G مدمج',
      'مقاومة للماء IP67',
    ],
    tier: 3,
  },
  {
    id: 'p12',
    slug: 'car-vacuum',
    name: 'مكنسة السيارة اللاسلكية المحمولة',
    shortName: 'مكنسة سيارة',
    audience: 'shared',
    price: 179,
    cost: 48,
    icon: Trash2,
    tagline: 'تنظيف عميق بقوة شفط 15000Pa',
    description:
      'مكنسة سيارة لاسلكية بقوة شفط 15000Pa، بطارية قابلة للشحن 30 دقيقة تشغيل مستمر. 4 فوهات لجميع الزوايا، فلتر HEPA قابل للغسل.',
    features: [
      'قوة شفط 15000Pa',
      '4 فوهات لجميع الزوايا',
      'فلتر HEPA قابل للغسل',
    ],
    tier: 3,
  },
  {
    id: 'p13',
    slug: 'steering-cover',
    name: 'غطاء المقود الجلدي — 4 مقاسات',
    shortName: 'غطاء مقود',
    audience: 'men',
    price: 79,
    cost: 22,
    icon: CircleDot,
    tagline: 'قبضة أريح، شكل أرقى',
    description:
      'غطاء مقود جلد طبيعي بـ 4 مقاسات (S/M/L/XL) تناسب كل السيارات. تركيب بدون أدوات، ملمس مريح، مقاوم للعرق والحرارة.',
    features: [
      'جلد طبيعي 100%',
      '4 مقاسات لكل السيارات',
      'مقاوم للعرق والحرارة',
    ],
    tier: 2,
  },
  {
    id: 'p14',
    slug: 'lumbar-cushion',
    name: 'وسادة الظهر الميموري فوم',
    shortName: 'وسادة ظهر',
    audience: 'women',
    price: 119,
    cost: 32,
    icon: Heart,
    tagline: 'دعم قطني لساعات من القيادة المريحة',
    description:
      'وسادة ظهر ميموري فوم طبية، تدعم الفقرات القطنية، تقلل الضغط على العصعص. غطاء مخملي قابل للإزالة والغسل. مثالية لمن يقودون أكثر من ساعة يومياً.',
    features: [
      'ميموري فوم طبي',
      'دعم للفقرات القطنية',
      'غطاء مخملي قابل للغسل',
    ],
    tier: 3,
  },
  {
    id: 'p15',
    slug: 'mirror-pendant',
    name: 'تعاليق المرآة — مجموعة Premium',
    shortName: 'تعاليق مرآة',
    audience: 'women',
    price: 29,
    cost: 5,
    icon: Tag,
    tagline: 'لمسة شخصية على كل رحلة',
    description:
      '7 تصاميم أنيقة مستوحاة من الفن العربي والخطوط الكلاسيكية — عود، هلال، نجوم، خطوط هندسية. خشب طبيعي أو أكريليك فاخر مع حبل قطني.',
    features: [
      '7 تصاميم للاختيار',
      'خشب طبيعي أو أكريليك فاخر',
      'لمسة شخصية للسيارة',
    ],
    badge: 'لمسة شخصية',
    tier: 1,
    isHero: true,
  },
  {
    id: 'p16',
    slug: 'trunk-organizer',
    name: 'منظم شنطة السيارة القابل للطي',
    shortName: 'منظم شنطة',
    audience: 'men',
    price: 139,
    cost: 38,
    icon: Package,
    tagline: 'شنطة مرتّبة = رحلات بلا فوضى',
    description:
      'منظم شنطة قابل للطي، 3 حجرات، جيوب جانبية. يتحمل حتى 30kg. يفتح وينطوي في ثوانٍ، يناسب جميع السيارات. مثالي للعائلات والمسافرين.',
    features: [
      '3 حجرات + جيوب جانبية',
      'يتحمل حتى 30kg',
      'ينطوي في 5 ثوانٍ',
    ],
    tier: 3,
  },
  {
    id: 'p17',
    slug: 'anti-glare-mirror',
    name: 'مرآة مضادة للوهج بميزة Night Mode',
    shortName: 'مرآة مضادة للوهج',
    audience: 'shared',
    price: 59,
    cost: 14,
    icon: ShieldCheck,
    tagline: 'قيادة ليلية أكثر أماناً',
    description:
      'مرآة سيارة إضافية بمشبك، زجاج مضاد للوهج، وضع ليلي تلقائي يقلل إضاءة المصابيح الخلفية. رؤية عريضة بزاوية 180°.',
    features: [
      'وضع ليلي تلقائي',
      'زاوية رؤية 180°',
      'تركيب بمشبك بدون أدوات',
    ],
    tier: 2,
  },
  {
    id: 'p18',
    slug: 'aroma-diffuser',
    name: 'ناشر العطور بالموجات فوق الصوتية',
    shortName: 'ناشر عطور',
    audience: 'women',
    price: 149,
    cost: 42,
    icon: Sparkles,
    tagline: 'سيارة برائحة الـ spa',
    description:
      'ناشر عطور بالموجات فوق الصوتية بـ 7 نفحات، إضاءة LED مهدّئة، USB-C للشحن. تقنية الضباب البارد الآمنة على الأقمشة. خزان 200ml يكفي لشهر كامل.',
    features: [
      '7 نفحات عطرية مختلفة',
      'إضاءة LED مهدّئة بـ 7 ألوان',
      'خزان 200ml — شهر كامل',
    ],
    badge: 'جديد',
    tier: 3,
  },
  {
    id: 'p19',
    slug: 'bento-tray',
    name: 'صينية الأكواب والمسكة للسائق',
    shortName: 'صينية أكواب',
    audience: 'women',
    price: 49,
    cost: 12,
    icon: CupSoda,
    tagline: 'كل شيء في متناول يدك بأمان',
    description:
      'صينية بثلاثة جيوب + فتحة للقناني، تثبت على المقعد أو الكونسول الوسطي. سطح مضاد للانزلاق، سهلة التنظيف. تصميم أنيق بلون بيج هادئ.',
    features: [
      'مضادة للانزلاق',
      '3 جيوب + فتحة قناني',
      'سهلة التنظيف',
    ],
    tier: 1,
  },
  {
    id: 'p20',
    slug: 'smart-rear-view',
    name: 'مرآة الرؤية الخلفية الذكية',
    shortName: 'مرآة ذكية',
    audience: 'men',
    price: 449,
    cost: 130,
    icon: MonitorSmartphone,
    tagline: 'استبدل مرآتك بكاميرا وشاشة',
    description:
      'مرآة رؤية خلفية ذكية بشاشة 10.88" IPS، كاميرا أمامية 4K + كاميرا خلفية، تسجيل حلقي، GPS مدمج، رؤية ليلية. تتصل بالهاتف عبر WiFi.',
    features: [
      'شاشة 10.88" IPS',
      'كاميرتين: أمامية 4K + خلفية',
      'GPS + WiFi مدمج',
    ],
    badge: 'شحن سريع',
    tier: 4,
  },
];

export const heroProducts = products.filter((p) => p.isHero);

export const audienceLabel: Record<Audience, string> = {
  women: 'للنساء',
  men: 'للرجال',
  shared: 'مشترك',
};
