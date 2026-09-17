/**
 * @file modal.jsx
 * @description Komponen UI Modal untuk dialog konfirmasi tindakan (dialog box pengganti window.confirm)
 * dengan varian aksi (danger, success, default) serta penanganan penutupan dialog.
 */

import { useEffect } from 'react';
import { X } from 'lucide-react';

const variantConfirmStyles = {
  danger:  { backgroundColor: '#EF4444', color: '#fff', border: 'none', hover: '#DC2626' },
  success: { backgroundColor: '#22C55E', color: '#fff', border: 'none', hover: '#16A34A' },
  default: { backgroundColor: '#2E3182', color: '#fff', border: 'none', hover: '#1B2559' },
};

/**
 * Modal Component
 * Kotak dialog konfirmasi interaktif untuk persetujuan atau pembatalan suatu proses.
 *
 * @param {object} props
 * @param {boolean} props.isOpen Menentukan apakah modal sedang ditampilkan
 * @param {string} [props.title='Konfirmasi'] Judul modal
 * @param {string} [props.message='Apakah Anda yakin?'] Pesan deskripsi isi modal
 * @param {string} [props.confirmText='Ya, Lanjutkan'] Teks untuk tombol konfirmasi
 * @param {string} [props.cancelText='Batal'] Teks untuk tombol pembatalan
 * @param {string} [props.variant='default'] Varian warna tombol konfirmasi ('danger'|'success'|'default')
 * @param {function} props.onConfirm Callback ketika tombol konfirmasi ditekan
 * @param {function} props.onCancel Callback ketika tombol batal ditekan atau backdrop diklik
 * @returns {JSX.Element|null}
 */
export default function Modal({
  isOpen,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'default',
  onConfirm,
  onCancel,
}) {
  // Tutup modal saat tekan Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmStyle = variantConfirmStyles[variant] ?? variantConfirmStyles.default;

  return (
    /* Backdrop gelap semi-transparan */
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 150ms ease',
      }}
      onClick={onCancel}         // klik luar modal → tutup
    >
      {/* Box Modal */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: '420px',
          padding: '24px',
          display: 'flex', flexDirection: 'column', gap: '16px',
          animation: 'slideUp 200ms ease',
        }}
        onClick={e => e.stopPropagation()}  // cegah klik modal menutup dirinya
      >
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{
            margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)',
            color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)',
          }}>
            {title}
          </h3>
          <button
            onClick={onCancel}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-secondary)', padding: '2px',
              borderRadius: 'var(--radius-sm)',
            }}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pesan */}
        <p style={{
          margin: 0, fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--leading-relaxed)',
        }}>
          {message}
        </p>

        {/* Tombol Aksi */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
          {/* Tombol Batal */}
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)',
              fontFamily: 'var(--font-sans)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'background-color 150ms ease',
            }}
            onMouseEnter={e => e.target.style.backgroundColor = 'var(--sidebar-hover-bg)'}
            onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
          >
            {cancelText}
          </button>

          {/* Tombol Konfirmasi */}
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)',
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              transition: 'background-color 150ms ease',
              ...confirmStyle,
            }}
            onMouseEnter={e => e.target.style.backgroundColor = confirmStyle.hover}
            onMouseLeave={e => e.target.style.backgroundColor = confirmStyle.backgroundColor}
          >
            {confirmText}
          </button>
        </div>
      </div>

      {/* Animasi CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
