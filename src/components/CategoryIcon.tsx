import React from 'react';
import { 
  Trophy, 
  Coffee, 
  Gamepad2, 
  Sparkles, 
  PartyPopper, 
  Zap, 
  Laptop, 
  Flame, 
  Compass,
  Users,
  MapPin,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Share2,
  Plus,
  Filter,
  Search,
  ChevronRight,
  ArrowLeft,
  X,
  Send,
  ThumbsUp,
  Award,
  AlertCircle
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = "w-5 h-5" }) => {
  switch (name) {
    case 'Trophy':
    case 'Spor & Halı Saha':
      return <Trophy className={className} />;
    case 'Coffee':
    case 'Kahve & Sohbet':
      return <Coffee className={className} />;
    case 'Gamepad2':
    case 'Oyun & Kutu Oyunu':
      return <Gamepad2 className={className} />;
    case 'Sparkles':
    case 'Satranç & Zeka Oyunları':
      return <Sparkles className={className} />;
    case 'PartyPopper':
    case 'Parti & Müzik':
      return <PartyPopper className={className} />;
    case 'Zap':
    case 'Spor & Koşu':
      return <Zap className={className} />;
    case 'Laptop':
    case 'Çalışma & Kodlama':
      return <Laptop className={className} />;
    case 'Compass':
    case 'all':
      return <Compass className={className} />;
    default:
      return <Flame className={className} />;
  }
};

export {
  Trophy,
  Coffee,
  Gamepad2,
  Sparkles,
  PartyPopper,
  Zap,
  Laptop,
  Flame,
  Compass,
  Users,
  MapPin,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Share2,
  Plus,
  Filter,
  Search,
  ChevronRight,
  ArrowLeft,
  X,
  Send,
  ThumbsUp,
  Award,
  AlertCircle
};
