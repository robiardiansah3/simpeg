/**
 * @file card.jsx
 * @description Komponen UI Card untuk pembungkus (wrapper) konten dengan bayangan lembut dan border bulat.
 */

import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Card Component
 * Pembungkus kotak konten utama.
 *
 * @param {object} props
 * @param {string} [props.className] Kelas CSS tambahan
 * @returns {JSX.Element}
 */
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-white text-slate-900 shadow-sm transition-shadow hover:shadow-md",
      className
    )}
    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm", className)}
    style={{ color: 'var(--color-text-secondary)' }}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
