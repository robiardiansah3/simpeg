/**
 * @file form-modal.jsx
 * @description Komponen UI FormModal sebagai wadah dialog interaktif (modal overlay)
 * yang dapat menampung formulir, detail info, maupun konten kustom dengan berbagai opsi ukuran.
 */

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * FormModal Component
 * Dialog modal overlay dengan animasi transisi masuk, pencegah scrolling body, dan penanganan penutupan via tombol Escape.
 *
 * @param {object} props
 * @param {boolean} props.isOpen Menentukan apakah modal sedang terbuka
 * @param {function} props.onClose Callback ketika modal ditutup
 * @param {string} props.title Judul modal di bagian header
 * @param {React.ReactNode} props.children Konten di dalam modal body
 * @param {string} [props.size='lg'] Lebar maksimal modal ('md'|'lg'|'xl')
 * @returns {JSX.Element|null}
 */
export default function FormModal({ isOpen, onClose, title, children, size = 'lg' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = { md: '480px', lg: '680px', xl: '860px' };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(15,21,36,0.5)',
        backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0',
      }}
      className="sm:items-center sm:p-4"
    >
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
        width: '100%',
        maxWidth: maxWidths[size] || '680px',
        maxHeight: '92dvh',
        display: 'flex',
        flexDirection: 'column',
        animation: 'modalSlideIn 220ms ease',
      }}
      className="sm:rounded-2xl sm:shadow-[0_20px_50px_rgba(0,0,0,0.15)] sm:max-h-[90vh]"
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #F1F5F9',
          flexShrink: 0,
        }}
        className="sm:px-6 sm:py-5"
        >
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1E293B', fontFamily: 'Poppins, sans-serif' }}
              className="sm:text-[17px]"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '8px',
              background: '#F1F5F9', border: 'none', cursor: 'pointer',
              color: '#64748B', transition: 'background 150ms', flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
            onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div style={{ overflowY: 'auto', padding: '20px', flex: 1 }}
             className="sm:p-6"
        >
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 640px) {
          @keyframes modalSlideIn {
            from { opacity: 0; transform: translateY(-12px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        }
      `}</style>
    </div>
  );
}
