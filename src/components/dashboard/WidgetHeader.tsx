import React from 'react';

interface WidgetHeaderProps {
  title: string;
  category?: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  orderIndex?: number;
  totalWidgets?: number;
  widgetId?: string;
  isReorderMode?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onHide?: () => void;
  children?: React.ReactNode;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  title,
  category,
  badge,
  badgeColor = 'bg-purple-50 text-[#6A1BFF] border-purple-100',
  icon,
  children,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
      {/* Left: Icon, Title, Category Badge */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6A1BFF] flex items-center justify-center font-bold shrink-0">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
              {title}
            </h3>
            {badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                {badge}
              </span>
            )}
          </div>
          {category && (
            <p className="text-[10px] text-slate-400 font-medium">
              {category}
            </p>
          )}
        </div>
      </div>

      {/* Right: Widget-specific Actions / Navigation Links */}
      {children && (
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {children}
        </div>
      )}
    </div>
  );
};
