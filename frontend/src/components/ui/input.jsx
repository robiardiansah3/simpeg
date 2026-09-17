/**
 * @file input.jsx
 * @description Komponen UI Input standar untuk form isian teks, password, dsb.
 */

import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Input Component
 * Elemen input form terbungkus dengan penyesuaian gaya focus ring dan state disabled.
 *
 * @param {object} props
 * @param {string} props.type Jenis tipe input (misal 'text', 'password', 'email', 'file')
 * @param {string} [props.className] Kelas CSS tambahan
 * @returns {JSX.Element}
 */
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-slate-400",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E3182] focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{
        backgroundColor: 'var(--input-bg)',
        borderColor: 'var(--input-border)',
        color: 'var(--input-text)',
        fontFamily: 'var(--font-sans)',
      }}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
