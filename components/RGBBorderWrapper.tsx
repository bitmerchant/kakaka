import React from 'react';

interface RGBBorderWrapperProps {
  children: React.ReactNode;
  className?: string; // For additional classes on the outermost div (p-px wrapper)
  contentClassName?: string; // For additional classes on the inner content div
  innerBgColor?: string; // e.g. 'bg-slate-800'
  innerPadding?: string; // e.g. 'p-6'
  rounded?: string; // e.g. 'rounded-lg' for outer, influences inner rounding
}

const RGBBorderWrapper: React.FC<RGBBorderWrapperProps> = ({
  children,
  className = '',
  contentClassName = '',
  innerBgColor = 'bg-slate-800',
  innerPadding = 'p-6',
  rounded = 'rounded-lg',
}) => {
  // Basic logic to adjust inner rounding based on outer, can be refined
  let innerRounded = 'rounded-[7px]'; // Default for rounded-lg
  if (rounded === 'rounded-xl') {
    innerRounded = 'rounded-[15px]';
  } else if (rounded === 'rounded-md') {
    innerRounded = 'rounded-[5px]';
  } else if (rounded === 'rounded-full') {
    innerRounded = 'rounded-full';
  }


  return (
    <div className={`relative p-px overflow-hidden group ${rounded} ${className}`}>
      <div
        className="absolute inset-0 animate-spin-slow-border z-0"
        style={{
          background: 'conic-gradient(from 90deg at 50% 50%, #ec4899, #ef4444, #f59e0b, #8b5cf6, #3b82f6, #14b8a6, #ec4899)',
        }}
        aria-hidden="true"
      />
      <div className={`relative ${innerBgColor} ${innerPadding} ${innerRounded} z-10 h-full ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default RGBBorderWrapper;
