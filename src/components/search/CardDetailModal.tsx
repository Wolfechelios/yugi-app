'use client';
export default function CardDetailModal({card,onClose}:{card:any,onClose:()=>void}) {
  if(!card) return null;
  return (<div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
    <div className="bg-gray-900 p-4 rounded max-w-md w-full border border-gray-700">
      <button onClick={onClose} className="text-white mb-2">Close</button>
      <img src={card.card_images?.[0]?.image_url||'/placeholder-card.png'} className="w-full h-auto rounded"/>
      <div className="text-white mt-4 text-lg font-bold">{card.name}</div>
      <div className="text-gray-300 mt-2 text-sm whitespace-pre-line">{card.desc}</div>
    </div>
  </div>);
}