export function formatCard(card: any) {
  return {
    id: card.id,
    name: card.name,
    type: card.type,
    attribute: card.attribute,
    level: card.level,
    atk: card.atk,
    def: card.def,
    desc: card.desc,
    archetype: card.archetype,
    card_images: card.card_images || [],
    card_prices: card.card_prices || []
  }
}
