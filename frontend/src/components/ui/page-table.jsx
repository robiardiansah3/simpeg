/**
 * @file page-table.jsx
 * @description Komponen UI PageTable sebagai pembungkus (wrapper) tabel yang mengintegrasikan status loading,
 * status error, tampilan kosong (empty state), visualisasi baris/kolom TanStack Table, serta kontrol pagination & rows-per-page.
 */

import { flexRender } from '@tanstack/react-table';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import EmptyState from './empty-state';

/**
 * PageTable Component
 * Render tabel data interaktif terintegrasi dengan penanganan state asinkron otomatis dan kontrol pagination.
 *
 * @param {object} props
 * @param {object} props.table Instansi table dari useReactTable()
 * @param {boolean} props.isLoading Menunjukkan status pemuatan data
 * @param {string|null} [props.error] Pesan galat/error jika terjadi kegagalan
 * @param {React.ReactNode} [props.emptyIcon] Ikon untuk empty state jika data kosong
 * @param {string} props.emptyTitle Judul pesan untuk empty state
 * @param {string} [props.emptyDesc] Keterangan tambahan untuk empty state
 * @returns {JSX.Element}
 */
export default function PageTable({ table, isLoading, error, emptyIcon, emptyTitle, emptyDesc }) {
  const allRows = table.getRowModel().rows;
  const paginationState = table.getState().pagination;
  const hasPagination = !!paginationState && typeof table.getPageCount === 'function';

  const pageIndex = paginationState?.pageIndex ?? 0;
  const pageSize = paginationState?.pageSize ?? 10;

  const totalRows = table.getPrePaginationRowModel ? table.getPrePaginationRowModel().rows.length : allRows.length;
  const pageCount = table.getPageCount ? table.getPageCount() : 1;

  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  const getPageNumbers = () => {
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, i) => i);
    }
    const pages = [0];
    if (pageIndex > 2) pages.push('...left');
    const start = Math.max(1, pageIndex - 1);
    const end = Math.min(pageCount - 2, pageIndex + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (pageIndex < pageCount - 3) pages.push('...right');
    pages.push(pageCount - 1);
    return pages;
  };

  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
    }}>
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
          <Loader2 size={32} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center', gap: '8px' }}>
          <AlertCircle size={32} color="var(--color-danger)" />
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-danger)', fontFamily: 'var(--font-sans)' }}>{error}</p>
        </div>
      ) : allRows.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDesc} />
      ) : (
        <>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={header.column.columnDef.meta?.className}
                      onClick={header.column.getToggleSortingHandler?.()}
                      style={{ cursor: header.column.getCanSort?.() ? 'pointer' : 'default', userSelect: 'none' }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {allRows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {hasPagination && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-600 font-sans">
              
              {/* Selector Jumlah Data & Status Record */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">Tampilkan</span>
                  <select
                    value={pageSize >= totalRows && totalRows > 0 ? 'all' : pageSize}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'all') {
                        table.setPageSize(totalRows > 0 ? totalRows : 9999);
                      } else {
                        table.setPageSize(Number(val));
                      }
                    }}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-extrabold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-xs"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value="all">Semua</option>
                  </select>
                  <span className="font-bold text-slate-500">per halaman</span>
                </div>

                <span className="text-slate-300 hidden md:inline">•</span>

                <span className="font-semibold text-slate-600">
                  Menampilkan <strong className="text-slate-900 font-extrabold">{startRow}</strong> - <strong className="text-slate-900 font-extrabold">{endRow}</strong> dari <strong className="text-slate-900 font-extrabold">{totalRows}</strong> data
                </span>
              </div>

              {/* Slide Navigasi Halaman */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1 shadow-xs"
                >
                  <ChevronLeft size={14} />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((p, idx) => {
                    if (typeof p === 'string') {
                      return (
                        <span key={p + idx} className="px-2 py-1 text-slate-400 font-bold">
                          ...
                        </span>
                      );
                    }
                    const isCurrent = p === pageIndex;
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => table.setPageIndex(p)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center border ${
                          isCurrent
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20 font-black'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {p + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1 shadow-xs"
                >
                  <span className="hidden sm:inline">Selanjutnya</span>
                  <ChevronRight size={14} />
                </button>
              </div>

            </div>
          )}
        </>
      )}
    </div>
  );
}
