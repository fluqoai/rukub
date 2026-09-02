// Client-side icon name → LucideIcon map.
// Used by client components to resolve the iconName from PublicProduct.

import {
  Package, Smartphone, Wind, Snowflake, Camera, Backpack, Gauge, Plug,
  Lightbulb, Sun, Search, Trash2, CircleDot, Heart, Tag, ShieldCheck,
  CupSoda, MonitorSmartphone, type LucideIcon,
} from 'lucide-react';

const map: Record<string, LucideIcon> = {
  Package,
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
  ShieldCheck,
  CupSoda,
  MonitorSmartphone,
};

export function getIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Package;
  return map[name] ?? Package;
}
