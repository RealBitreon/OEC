'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    if (isOpen) {
      // Save currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus modal after a brief delay to ensure it's rendered
      const focusTimer = setTimeout(() => {
        modalRef.current?.focus()
      }, 100)

      return () => {
        clearTimeout(focusTimer)
        document.body.style.overflow = 'unset';
        previousFocusRef.current?.focus()
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
      
      // Restore focus to previously focused element
      setTimeout(() => {
        previousFocusRef.current?.focus()
      }, 100)
    }
  }, [isOpen, isMounted]);

  useEffect(() => {
    if (!isMounted || !isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    // Focus trap
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return
      
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
      
      if (focusableElements.length === 0) return

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
    
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('keydown', handleTab);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('keydown', handleTab);
    };
  }, [isOpen, onClose, isMounted]);

  if (!isMounted || !isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ direction: 'rtl' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative bg-white rounded-xl shadow-2xl
          w-full ${sizes[size]}
          max-h-[90vh] overflow-y-auto
          animate-in fade-in zoom-in-95 duration-200
          focus:outline-none
        `}
        role="document"
      >
        {title && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-200">
            <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-neutral-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-lg hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400"
              aria-label="إغلاق النافذة"
              title="إغلاق"
              type="button"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
