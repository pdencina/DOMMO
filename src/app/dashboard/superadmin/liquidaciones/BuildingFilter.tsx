// @ts-nocheck
'use client'

import { useRouter } from 'next/navigation'

interface Building { id: string; name: string }

export default function BuildingFilter({
  buildings,
  selected,
  status,
}: {
  buildings: Building[]
  selected: string
  status: string
}) {
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    const url = new URL(window.location.href)
    if (val) url.searchParams.set('building', val)
    else url.searchParams.delete('building')
    url.searchParams.set('status', status)
    router.push(url.pathname + url.search)
  }

  return (
    <select
      value={selected}
      onChange={handleChange}
      className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600 outline-none focus:border-[#0F6E56] transition-colors"
    >
      <option value="">Todos los edificios</option>
      {buildings.map(b => (
        <option key={b.id} value={b.id}>{b.name}</option>
      ))}
    </select>
  )
}
