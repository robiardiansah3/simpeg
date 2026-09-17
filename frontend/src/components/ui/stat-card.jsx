/**
 * @file stat-card.jsx
 * @description Komponen UI StatCard untuk menyajikan tampilan ringkasan nilai metrik atau statistik
 * dengan ilustrasi ikon bundar.
 */

/**
 * StatCard Component
 * Kotak info ringkas statistik dashboard yang mendukung interaksi hover dan click-handler.
 *
 * @param {object} props
 * @param {React.ReactNode} props.icon React node ikon (misal Lucide icon)
 * @param {string} props.label Teks label kecil di bagian atas angka/nilai
 * @param {string|number} props.value Angka atau nilai utama metrik
 * @param {string} [props.subLabel] Keterangan atau teks kecil di bawah angka
 * @param {string} [props.iconColor='rgba(46,49,130,0.1)'] Warna latar belakang lingkaran ikon
 * @param {function} [props.onClick] Callback opsional saat card diklik
 * @returns {JSX.Element}
 */
export default function StatCard({ icon, label, value, subLabel, iconColor = 'rgba(46,49,130,0.1)', onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 200ms ease, transform 200ms ease',
        cursor: onClick ? 'pointer' : 'default',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Lingkaran ikon */}
      <div style={{
        width: '52px', height: '52px',
        borderRadius: '50%',
        backgroundColor: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>

      {/* Teks */}
      <div>
        <p style={{
          margin: 0,
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--weight-medium)',
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontFamily: 'var(--font-sans)',
        }}>
          {label}
        </p>
        <p style={{
          margin: '2px 0 4px',
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-heading)',
          lineHeight: 1,
        }}>
          {value ?? '—'}
        </p>
        {subLabel && (
          <p style={{
            margin: 0,
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-sans)',
          }}>
            {subLabel}
          </p>
        )}
      </div>
    </div>
  );
}
