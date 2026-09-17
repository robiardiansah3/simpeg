/**
 * @file table.jsx
 * @description Komponen UI Tabel modular penunjang struktur layout baris-kolom (table components).
 */

import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Table Component
 * Elemen pembungkus tabel (table wrapper).
 *
 * @param {object} props
 * @param {string} [props.className] Kelas CSS tambahan
 * @returns {JSX.Element}
 */
const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      style={{ fontFamily: 'var(--font-sans)' }}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("[&_tr]:border-b", className)}
    style={{ backgroundColor: 'var(--color-bg)' }}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
))
TableBody.displayName = "TableBody"

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn("border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-50", className)}
    style={{ borderColor: 'var(--color-border)' }}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn("h-12 px-4 text-left align-middle font-semibold text-xs uppercase tracking-wider [&:has([role=checkbox])]:pr-0", className)}
    style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-heading)' }}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    style={{ color: 'var(--color-text-primary)' }}
    {...props}
  />
))
TableCell.displayName = "TableCell"

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
