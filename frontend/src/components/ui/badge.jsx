/**
 * @file badge.jsx
 * @description Komponen UI Badge untuk menampilkan label status berwarna.
 */

import * as React from 'react';

/**
 * Badge Component
 * Label status dengan beberapa variasi warna untuk menandai status persetujuan, kehadiran, dsb.
 *
 * @param {object} props
 * @param {string} [props.variant='default'] Variasi warna ('success'|'warning'|'danger'|'info'|'default')
 * @param {React.ReactNode} props.children Teks label
 * @param {string} [props.className=''] Kelas CSS tambahan
 * @param {object} [props.style={}] Gaya CSS inline tambahan
 * @returns {JSX.Element}
 */

const variantStyles = {
  success: {
    backgroundColor: 'var(--color-success-bg)',
    color: 'var(--color-success)',
    border: '1px solid rgba(34,197,94,0.3)',
  },
  warning: {
    backgroundColor: 'var(--color-warning-bg)',
    color: '#92400E',               // coklat tua agar terbaca di kuning muda
    border: '1px solid rgba(245,158,11,0.3)',
  },
  danger: {
    backgroundColor: 'var(--color-danger-bg)',
    color: 'var(--color-danger)',
    border: '1px solid rgba(239,68,68,0.3)',
  },
  info: {
    backgroundColor: 'var(--badge-info-bg)',
    color: 'var(--badge-info-text)',
    border: '1px solid rgba(56,189,248,0.3)',
  },
  default: {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
  },
};

const Badge = React.forwardRef(({ variant = 'default', children, className = '', style = {}, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={`badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        lineHeight: 1.5,
        fontFamily: 'var(--font-sans)',
        ...variantStyles[variant] ?? variantStyles.default,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
});
Badge.displayName = 'Badge';

/**
 * Mengonversi string status API menjadi varian warna Badge yang sesuai.
 *
 * @param {string} [status=''] String status dari API.
 * @returns {string} Varian warna Badge ('success'|'warning'|'danger'|'info'|'default').
 */
export function statusToBadgeVariant(status = '') {
  const map = {
    disetujui: 'success',
    diajukan:  'warning',
    menunggu:  'warning',
    ditolak:   'danger',
    hadir:     'success',
    tidak_hadir: 'danger',
    izin:      'info',
    tugas_luar: 'info',
  };
  return map[status?.toLowerCase()] ?? 'default';
}

/**
 * Mengonversi string status API menjadi label bahasa Indonesia untuk tampilan UI.
 *
 * @param {string} [status=''] String status dari API.
 * @returns {string} Label status format bahasa Indonesia.
 */
export function statusLabel(status = '') {
  const labels = {
    diajukan:    'Menunggu',
    menunggu:    'Menunggu',
    disetujui:   'Disetujui',
    ditolak:     'Ditolak',
    hadir:       'Hadir',
    tidak_hadir: 'Tidak Hadir',
    izin:        'Izin',
    tugas_luar:  'Tugas Luar',
  };
  return labels[status?.toLowerCase()] ?? status;
}

export { Badge };
