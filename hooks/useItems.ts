import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsService } from '@/services/items';
import { useItemsStore } from '@/store/itemsStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import type { SavePayload, SavedItem } from '@/types';

function useAuthedFlag(): boolean {
  return useAuthStore((s) => Boolean(s.user));
}

const KEYS = {
  list: ['items'] as const,
  detail: (id: string) => ['items', id] as const,
};

export function useItemsQuery() {
  const hydrate = useItemsStore((s) => s.hydrate);
  const authed = useAuthedFlag();
  const hydratedRef = useRef(false);

  const query = useQuery({
    queryKey: KEYS.list,
    queryFn: () => itemsService.list(),
    enabled: authed,
  });

  useEffect(() => {
    if (hydratedRef.current) return;
    const hasLocal = useItemsStore.getState().items.length > 0;
    if (hasLocal) {
      hydratedRef.current = true;
      return;
    }
    if (query.data) {
      hydrate(query.data);
      hydratedRef.current = true;
    }
  }, [query.data, hydrate]);

  return query;
}

export function useItemQuery(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => itemsService.get(id),
    enabled: Boolean(id),
  });
}

export function useSaveMutation() {
  const qc = useQueryClient();
  const add = useItemsStore((s) => s.add);
  const setAi = useUIStore((s) => s.setAiProcessing);

  return useMutation({
    mutationFn: async (payload: SavePayload) => {
      setAi(true);
      try {
        return await itemsService.save(payload);
      } finally {
        setAi(false);
      }
    },
    onSuccess: (result) => {
      add(result.item);
      qc.setQueryData<SavedItem[]>(KEYS.list, (prev) =>
        prev ? [result.item, ...prev] : [result.item]
      );
    },
    onError: (err) => {
      if (__DEV__) console.warn('[save] failed', err);
    },
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  const remove = useItemsStore((s) => s.remove);
  return (id: string) => {
    remove(id);
    qc.setQueryData<SavedItem[]>(KEYS.list, (prev) =>
      prev ? prev.filter((i) => i.id !== id) : prev
    );
    qc.removeQueries({ queryKey: KEYS.detail(id) });
  };
}

export function useUpdateItem() {
  const update = useItemsStore((s) => s.update);
  return (id: string, patch: Partial<SavedItem>) => update(id, patch);
}
