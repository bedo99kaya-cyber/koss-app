import React from 'react';
import { Zap } from 'lucide-react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'vertical';
  showSubtitle?: boolean;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
  id?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  layout = 'horizontal',
  showSubtitle = false,
  subtitle = '',
  className = '',
  onClick,
  id,
}) => {
  const isVertical = layout === 'vertical';

  // Dimension classes for emblem
  const emblemSizes = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-9 h-9 sm:w-10 sm:h-10 rounded-2xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-16 h-16 rounded-3xl',
  };

  const innerRadius = {
    sm: 'rounded-[10px]',
    md: 'rounded-[14px]',
    lg: 'rounded-[14px]',
    xl: 'rounded-[22px]',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-8 h-8',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const subtitleSizes = {
    sm: 'text-[8px]',
    md: 'text-[9px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`flex ${isVertical ? 'flex-col items-center text-center' : 'items-center'} gap-2.5 ${
        onClick ? 'cursor-pointer group select-none' : ''
      } ${className}`}
    >
      {/* Icon Emblem Container */}
      <div className="relative flex items-center justify-center shrink-0">
        {/* Ambient glow */}
        <div
          className={`absolute -inset-1 bg-gradient-to-r from-orange-600 via-amber-500 to-rose-500 rounded-2xl blur-[6px] opacity-50 ${
            onClick ? 'group-hover:opacity-80 transition-opacity duration-300' : ''
          }`}
        />

        {/* Logo emblem */}
        <div
          className={`relative ${emblemSizes[size]} bg-gradient-to-br from-orange-500 via-amber-500 to-rose-600 p-[1.5px] shadow-lg shadow-orange-500/25 ring-1 ring-white/20 ${
            onClick ? 'group-hover:scale-105 group-active:scale-95 transition-transform duration-200' : ''
          }`}
        >
          <div
            className={`w-full h-full bg-slate-950/40 backdrop-blur-xs ${innerRadius[size]} flex items-center justify-center relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/25 via-transparent to-transparent opacity-60" />
            <div className="relative flex items-center justify-center">
              <Zap
                className={`${iconSizes[size]} text-amber-300 fill-amber-300 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)] ${
                  onClick ? 'group-hover:rotate-6 transition-transform duration-200' : ''
                }`}
              />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-400" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Brand typography */}
      <div className={`flex flex-col ${isVertical ? 'items-center mt-1' : ''}`}>
        <div className="flex items-center">
          <span
            className={`${titleSizes[size]} font-black tracking-tight text-white ${
              onClick ? 'group-hover:text-orange-400 transition-colors' : ''
            }`}
          >
            Koşş
          </span>
        </div>
        {showSubtitle && subtitle && (
          <span
            className={`${subtitleSizes[size]} font-medium text-slate-400 ${
              isVertical ? 'mt-0.5' : '-mt-0.5'
            } tracking-tight ${onClick ? 'group-hover:text-slate-300 transition-colors' : ''}`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
