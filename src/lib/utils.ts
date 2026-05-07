import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formateo de moneda chilena
export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Formateo de fecha en español
export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric',
    ...opts
  }).format(d)
}

export function formatMonth(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(d)
}

// Días hasta vencimiento
export function daysUntil(date: string): number {
  const d = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

// Status de pago → label y color
export function paymentStatusLabel(status: string) {
  const map = {
    paid:    { label: 'Pagado',      color: 'green'  },
    pending: { label: 'Pendiente',   color: 'amber'  },
    overdue: { label: 'Vencido',     color: 'red'    },
    waived:  { label: 'Condonado',   color: 'gray'   },
  } as const
  return map[status as keyof typeof map] ?? { label: status, color: 'gray' }
}

// Iniciales para avatar
export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

// Porcentaje de recaudación
export function collectionRate(paid: number, total: number): number {
  if (total === 0) return 0
  return Math.round((paid / total) * 100)
}
