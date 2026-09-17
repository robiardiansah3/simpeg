/**
 * @file page-header.jsx
 * @description Komponen UI PageHeader untuk bagian atas halaman yang menampilkan judul, subjudul, dan aksi/tombol.
 */

/**
 * PageHeader Component
 * Menampilkan bagian kepala halaman dengan struktur tata letak responsif.
 *
 * @param {object} props
 * @param {React.ReactNode} props.title Judul halaman (berupa teks atau elemen React)
 * @param {string} [props.subtitle] Deskripsi penjelasan singkat halaman
 * @param {React.ReactNode} [props.children] Slot aksi opsional di sisi kanan
 * @returns {JSX.Element}
 */
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6 flex-wrap">
      {/* Teks judul & subjudul */}
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Slot aksi (tombol dll) */}
      {children && (
        <div className="flex items-center gap-2 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
