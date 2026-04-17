import mondaySdk from 'monday-sdk-js';
import { useEffect, useState } from 'react';

const monday = mondaySdk();
monday.setApiVersion('2024-01');

export interface MondayContextData {
  boardId: string;
  itemId: string;
  userId: number;
  isAdmin: boolean;
  accountId: number;
}

/**
 * Lee el contexto de Monday (board/item/user).
 */
export function useMondayContext() {
  const [context, setContext] = useState<MondayContextData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    monday.listen('context', (res: { data: Record<string, unknown> }) => {
      const ctx = res.data;
      const parsed: MondayContextData = {
        boardId: String(ctx.boardId),
        itemId: String(ctx.itemId),
        userId: ctx.user ? (ctx.user as { id: number }).id : 0,
        isAdmin: ctx.user ? Boolean((ctx.user as { isAdmin: boolean }).isAdmin) : false,
        accountId: ctx.account ? (ctx.account as { id: number }).id : 0,
      };
      setContext(parsed);
      setReady(true);
      monday.execute('valueCreatedForUser');
    });

    monday.get('context').then((res: { data: Record<string, unknown> }) => {
      const ctx = res.data;
      const parsed: MondayContextData = {
        boardId: String(ctx.boardId),
        itemId: String(ctx.itemId),
        userId: ctx.user ? (ctx.user as { id: number }).id : 0,
        isAdmin: ctx.user ? Boolean((ctx.user as { isAdmin: boolean }).isAdmin) : false,
        accountId: ctx.account ? (ctx.account as { id: number }).id : 0,
      };
      setContext(parsed);
      setReady(true);
    }).catch((err: unknown) => {
      console.error('No se pudo obtener el contexto de Monday:', err);
      setReady(true);
    });
  }, []);

  return { context, ready };
}

export { monday };
