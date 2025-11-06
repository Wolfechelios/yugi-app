'use client';
export default function SuggestionsBox({items,onSelect}:{items:any[],onSelect:(c:any)=>void}) {
  if(!items?.length) return null;
  return (<div className="absolute bg-gray-900 w-full mt-2 rounded border border-gray-700 z-50">
    {items.map((c,i)=>(<div key={i} onClick={()=>onSelect(c)} className="p-2 hover:bg-gray-800 cursor-pointer flex gap-2">
      <img src={c.card_images?.[0]?.image_url_small||'/placeholder-card.png'} className="w-10 h-14 object-cover"/>
      <div className="text-sm text-white">{c.name}</div>
    </div>))}
  </div>);
}