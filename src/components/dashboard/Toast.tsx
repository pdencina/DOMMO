// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [duration, onClose])

  const config = {
    success: { icon: CheckCircle2, cls: 'toast toast-success' },
    error:   { icon: XCircle,      cls: 'toast toast-error'   },
    info:    { icon: Info,          cls: 'toast toast-info'    },
  }[type]

  const Icon = config.icon

  return (
    <div className={config.cls}>
      <Icon size={16} />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  )
}

// Hook para usar toasts
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: ToastType }>>([])

  function show(message: string, type: ToastType = 'success') {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  function remove(id: number) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return { toasts, show, remove }
}
