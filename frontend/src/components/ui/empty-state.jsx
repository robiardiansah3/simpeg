/**
 * @file empty-state.jsx
 * @description Komponen UI EmptyState untuk menyajikan umpan balik visual ketika tabel 
 * atau daftar data tidak memiliki entri apa pun (kosong).
 */

/**
 * EmptyState Component
 * Menampilkan pesan informatif berikon serta tombol aksi opsional saat data kosong.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.icon] React node ikon (misal Lucide icon)
 * @param {string} props.title Judul pesan kosong
 * @param {string} [props.description] Keterangan deskripsi tambahan
 * @param {React.ReactNode} [props.action] Elemen tombol/link aksi
 * @returns {JSX.Element}
 */
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      gap: '12px',
    }}>
      {/* Ikon dalam lingkaran */}
      {icon && (
        <div style={{
          width: '80px', height: '80px',
          borderRadius: '50%',
          backgroundColor: 'var(--sidebar-active-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '4px',
        }}>
          {icon}
        </div>
      )}

      {/* Judul */}
      <h3 style={{
        margin: 0,
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--weight-semibold)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-heading)',
      }}>
        {title}
      </h3>

      {/* Deskripsi */}
      {description && (
        <p style={{
          margin: 0,
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          maxWidth: '320px',
          lineHeight: 'var(--leading-relaxed)',
        }}>
          {description}
        </p>
      )}

      {/* Aksi */}
      {action && (
        <div style={{ marginTop: '8px' }}>
          {action}
        </div>
      )}
    </div>
  );
}
