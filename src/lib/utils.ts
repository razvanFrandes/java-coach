import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merges Tailwind class names, letting later classes override earlier ones. Used by shadcn components. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
