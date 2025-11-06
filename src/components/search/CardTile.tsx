'use client';
export default function CardTile({card,onClick}:{card:any,onClick:()=>void}) {
  return (<div onClick={onClick} className="bg-gray-900 border border-gray-700 p-2 rounded hover:bg-gray-800 cursor-pointer">
    <img src={card.card_images?.[0]?.image_url_small||'/placeholder-card.png'} className="w-full h-48 object-cover rounded"/>
    <div className="text-white mt-2 text-sm">{card.name}</div>
  </div>);
}