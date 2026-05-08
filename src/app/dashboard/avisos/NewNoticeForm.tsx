// @ts-nocheck
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'

export default function NewNoticeForm({
  buildingId,
  authorName,
}: {
  buildingId: string
  authorName: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    const { error } = await supabase.from('notices').insert({
      building_id:  buildingId,
      title:        fd.get('title') as string,
      body:         fd.get('body') as string,
      category:     fd.get('category') as string,
      pinned:       fd.get('pinned') === 'on',
      published_at: new Date().toISOString(),
    })

    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard/avisos')
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl border border-[#0F6E56]/20 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[#E1F5EE] border-b border-[#0F6E56]/20">
        <h3 className="text-sm font-semibold text-[#085041]">Nuevo aviso</h3>
        <a href="/dashboard/avisos" className="text-[#085041]/60 hover:text-[#085041]">
          <X size={16} />
        </a>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Título *</label>
          <input name="title" required placeholder="Ej: Corte de agua programado"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] outline-none" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Mensaje *</label>
          <textarea name="body" required rows={4}
            placeholder="Estimados residentes, les comunicamos que..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] outline-none resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
            <select name="category"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-[#0F6E56] outline-none">
              <option value="general">General</option>
              <option value="urgent">Urgente</option>
              <option value="event">Evento</option>
              <option value="rule">Norma</option>
            </select>
          </div>

          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input name="pinned" type="checkbox"
                className="w-4 h-4 rounded accent-[#0F6E56]" />
              <span className="text-xs text-gray-600">Fijar aviso (aparece primero)</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-1">
          <a href="/dashboard/avisos"
            className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            Cancelar
          </a>
          <button type="submit" disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs text-white bg-[#0F6E56] rounded-lg hover:bg-[#085041] disabled:opacity-60 transition">
            {loading && <Loader2 size={12} className="animate-spin" />}
            {loading ? 'Publicando...' : 'Publicar aviso'}
          </button>
        </div>
      </form>
    </div>
  )
}
