// @ts-nocheck
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'

export default function NewMaintenanceForm({
  buildingId,
  categories,
}: {
  buildingId: string
  categories: string[]
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

    const { error } = await supabase.from('maintenances').insert({
      building_id:    buildingId,
      title:          fd.get('title') as string,
      description:    fd.get('description') as string,
      category:       fd.get('category') as string,
      priority:       fd.get('priority') as string,
      assigned_to:    fd.get('assigned_to') as string || null,
      estimated_cost: fd.get('estimated_cost') ? Number(fd.get('estimated_cost')) : null,
      scheduled_date: fd.get('scheduled_date') as string || null,
      status:         'pending',
    })

    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard/mantenciones')
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl border border-[#0F6E56]/20 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[#E1F5EE] border-b border-[#0F6E56]/20">
        <h3 className="text-sm font-semibold text-[#085041]">Nueva mantención</h3>
        <a href="/dashboard/mantenciones" className="text-[#085041]/60 hover:text-[#085041]">
          <X size={16} />
        </a>
      </div>

      <form onSubmit={handleSubmit} className="p-5 grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Título *</label>
          <input name="title" required placeholder="Ej: Revisión ascensor principal"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] outline-none" />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
          <textarea name="description" rows={2} placeholder="Detalle del problema o trabajo..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] outline-none resize-none" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
          <select name="category"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-[#0F6E56] outline-none">
            {categories.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Prioridad</label>
          <select name="priority"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-[#0F6E56] outline-none">
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
            <option value="low">Baja</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Proveedor asignado</label>
          <input name="assigned_to" placeholder="Nombre del proveedor"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-[#0F6E56] outline-none" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Costo estimado ($)</label>
          <input name="estimated_cost" type="number" min="0" placeholder="0"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-[#0F6E56] outline-none" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Fecha programada</label>
          <input name="scheduled_date" type="date"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-[#0F6E56] outline-none" />
        </div>

        {error && (
          <div className="col-span-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="col-span-2 flex gap-2 justify-end pt-1">
          <a href="/dashboard/mantenciones"
            className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            Cancelar
          </a>
          <button type="submit" disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs text-white bg-[#0F6E56] rounded-lg hover:bg-[#085041] disabled:opacity-60 transition">
            {loading && <Loader2 size={12} className="animate-spin" />}
            {loading ? 'Guardando...' : 'Crear mantención'}
          </button>
        </div>
      </form>
    </div>
  )
}
