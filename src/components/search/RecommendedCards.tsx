'use client';
import {useEffect,useState} from 'react';
import {getJSON,YGO_API} from './utils';
import CardTile from './CardTile';
export default function RecommendedCards({onSelect}:{onSelect:(c:any)=>void}) {
  const [cards,setCards]=useState<any[]>([]);
  useEffect(()=>{getJSON(YGO_API.fuzzy("dragon")).then(d=>setCards(d.data||[])).catch(()=>{});},[]);
  return (<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
    {cards.map((c,i)=>(<CardTile key={i} card={c} onClick={()=>onSelect(c)}/>))}
  </div>);
}