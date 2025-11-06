'use client';
import {useEffect,useState} from 'react';
import {getJSON,YGO_API} from './utils';
export default function ArchetypeBrowser({onPick}:{onPick:(a:string)=>void}) {
  const [arc,setArc]=useState<any[]>([]);
  useEffect(()=>{getJSON(YGO_API.arche).then(d=>setArc(d||[]));},[]);
  return (<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
    {arc.map((a,i)=>(<div key={i} className="p-3 bg-gray-900 border border-gray-700 text-white rounded cursor-pointer hover:bg-gray-800"
      onClick={()=>onPick(a.archetype_name)}>{a.archetype_name}</div>))}
  </div>);
}