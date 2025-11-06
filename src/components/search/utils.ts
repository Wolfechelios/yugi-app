export const YGO_API = {
  exact: (n:string)=>`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(n)}`,
  fuzzy: (n:string)=>`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(n)}`,
  arche:`https://db.ygoprodeck.com/api/v7/archetypes.php`,
};
export async function getJSON(u:string){const r=await fetch(u);if(!r.ok)throw new Error("API");return r.json();}