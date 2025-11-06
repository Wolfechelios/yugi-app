'use client';
export default function SearchFilters({filters,setFilters}:{filters:any,setFilters:(f:any)=>void}) {
  return (<div className="flex gap-2 mt-2">
    <select className="bg-gray-900 text-white p-2 rounded border border-gray-700"
      value={filters.type} onChange={e=>setFilters({...filters,type:e.target.value})}>
      <option value="">All Types</option>
      <option>Monster</option><option>Spell</option><option>Trap</option>
    </select>
  </div>);
}