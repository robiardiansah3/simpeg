/**
 * @file utils.js
 * @description Modul utilitas pembantu (helpers) untuk kebutuhan frontend.
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Menggabungkan nama kelas CSS secara dinamis dengan dukungan tailwind-merge.
 *
 * @param {...any} inputs Nama-nama kelas CSS atau objek kondisional.
 * @returns {string} Gabungan nama kelas CSS yang bersih.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
