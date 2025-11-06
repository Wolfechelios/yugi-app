'use client';
import {useState} from 'react';
import SuggestionsBox from './SuggestionsBox';
import SearchFilters from './SearchFilters';
import RecommendedCards from './RecommendedCards';
import CardDetailModal from './CardDetailModal';
import CardTile from './CardTile';
import {getJSON,YGO_API} from './utils';

export default function SearchTab(){
  const [query,setQuery]=useState('');
  const [results,setResults]=useState<any[]>([]);
  const [suggestions,setSuggestions]=useState<any[]>([]);
  const [filters,setFilters]=useState({type:''});
  const [selected,setSelected]=useState<any>(null);

  async function runSearch(q:string){
    if(!q) return setResults([]);
    try{
      // exact
      let d = await getJSON(YGO_API.exact(q));
      setResults(d.data||[]);
      return;
    }catch{}
    try{
      // fuzzy
      let d = await getJSON(YGO_API.fuzzy(q));
      setResults(d.data||[]);
      return;
    }catch{
      setResults([]);
    }
  }

  async function updateSuggestions(q:string){
    if(!q) return setSuggestions([]);
    try{
      let d=await getJSON(YGO_API.fuzzy(q));
      setSuggestions((d.data||[]).slice(0,6));
    }catch{setSuggestions([]);}
  }

  return (
    <div className="mt-4 relative">
      <input value={query} onChange={e=>{setQuery(e.target.value);updateSuggestions(e.target.value);}}
        onKeyDown={e=>e.key==='Enter'&&runSearch(query)}
        className="w-full p-3 bg-gray-900 border border-gray-700 text-white rounded"
        placeholder="Search for a card..."
      />

      <SuggestionsBox items={suggestions} onSelect={(c)=>{setQuery(c.name);setSuggestions([]);runSearch(c.name);}}/>

      <SearchFilters filters={filters} setFilters={setFilters}/>

      {selected && <CardDetailModal card={selected} onClose={()=>setSelected(null)}/>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {results.map((c,i)=>(<CardTile key={i} card={c} onClick={()=>setSelected(c)}/>))}
      </div>

      <div className="mt-6">
        <div className="text-white text-lg mb-2">Recommended</div>
        <RecommendedCards onSelect={(c)=>setSelected(c)}/>
      </div>
    </div>
  );
}