import { useMemo } from 'react';
import { useItemsStore } from '@/store/itemsStore';
import type { CollectionId, IntentCategoryId } from '@/types';

export function useFilteredItems(opts?: {
  category?: IntentCategoryId | 'all';
  collection?: CollectionId | null;
  query?: string;
}) {
  const items = useItemsStore((s) => s.items);
  const sort = useItemsStore((s) => s.sort);
  const stateCategory = useItemsStore((s) => s.activeCategory);
  const stateCollection = useItemsStore((s) => s.activeCollection);
  const stateQuery = useItemsStore((s) => s.query);

  const category = opts?.category ?? stateCategory;
  const collection = opts?.collection ?? stateCollection;
  const query = (opts?.query ?? stateQuery).trim().toLowerCase();

  return useMemo(() => {
    let out = items.filter((i) => !i.archived);
    if (category && category !== 'all') out = out.filter((i) => i.category === category);
    if (collection) out = out.filter((i) => i.collection === collection);
    if (query) {
      out = out.filter((i) => {
        const hay = `${i.title} ${i.summary} ${i.tags.join(' ')} ${i.notes ?? ''}`.toLowerCase();
        return hay.includes(query);
      });
    }
    out = [...out].sort((a, b) => {
      if (sort === 'oldest') return +new Date(a.createdAt) - +new Date(b.createdAt);
      if (sort === 'category') return a.category.localeCompare(b.category);
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
    return out;
  }, [items, category, collection, query, sort]);
}
