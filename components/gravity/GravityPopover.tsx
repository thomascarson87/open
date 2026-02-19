import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface GravityPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  anchorRef?: React.RefObject<HTMLElement>;
}

const GravityPopover: React.FC<GravityPopoverProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      // Delay to prevent immediate close from the trigger click
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="
        absolute top-full left-1/2 -translate-x-1/2 mt-2
        bg-white dark:bg-surface
        rounded-2xl shadow-2xl
        border border-border
        w-[480px] max-w-[calc(100vw-2rem)]
        z-50
        overflow-hidden
        animate-in fade-in zoom-in-95 duration-200
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-gray-50 dark:bg-gray-900/50">
        <h2 className="font-heading text-base text-primary">{title}</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-muted rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-5 py-4 bg-white dark:bg-surface">
        {children}
      </div>
    </div>
  );
};

export default GravityPopover;
