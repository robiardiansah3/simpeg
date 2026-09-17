/**
 * @file button.jsx
 * @description Komponen UI Button dengan variasi gaya dan ukuran pendukung tema aplikasi.
 */

import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Button Component
 * Tombol interaktif standard dengan opsi visual variatif (success, destructive, dsb).
 *
 * @param {object} props
 * @param {string} [props.variant='default'] Gaya varian ('default'|'destructive'|'outline'|'secondary'|'ghost'|'link'|'success')
 * @param {string} [props.size='default'] Ukuran tombol ('default'|'sm'|'lg'|'icon')
 * @param {string} [props.className] Kelas CSS tambahan
 * @returns {JSX.Element}
 */
const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium font-[Poppins,sans-serif] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  
  const variants = {
    // Tombol Utama — biru royal sesuai template
    default:     "bg-[#2563EB] text-white shadow hover:bg-[#1D4ED8] focus-visible:ring-[#2563EB]",
    // Tombol Bahaya — merah
    destructive: "bg-[#EF4444] text-white shadow-sm hover:bg-[#DC2626] focus-visible:ring-[#EF4444]",
    // Tombol Outline — border biru royal
    outline:     "border border-[#2563EB] bg-white text-[#2563EB] shadow-sm hover:bg-[#EFF6FF]",
    // Tombol Sekunder — biru sangat muda
    secondary:   "bg-[#EFF6FF] text-[#2563EB] shadow-sm hover:bg-[#DBEAFE]",
    // Tombol Ghost
    ghost:       "hover:bg-[#F1F5F9] hover:text-[#1E293B] text-slate-600",
    // Tombol Link
    link:        "text-[#2563EB] underline-offset-4 hover:underline",
    // Tombol Sukses — hijau
    success:     "bg-[#22C55E] text-white shadow-sm hover:bg-[#16A34A] focus-visible:ring-[#22C55E]",
  }

  const sizes = {
    default: "h-9 px-4 py-2",
    sm:      "h-8 rounded-md px-3 text-xs",
    lg:      "h-10 rounded-md px-8",
    icon:    "h-9 w-9",
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
