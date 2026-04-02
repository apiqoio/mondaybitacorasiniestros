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

export interface BoardColumn {
  id: string;
  title: string;
  type: string;
}

/**
 * Lee el contexto de Monday y las columnas del tablero actual.
 */
export function useMondayContext() {
  const [context, setContext] = useState<MondayContextData | null>(null);
  const [columns, setColumns] = useState<BoardColumn[]>([]);
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
      loadColumns(parsed.boardId);
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
      loadColumns(parsed.boardId);
    });
  }, []);

  async function loadColumns(boardId: string) {
    const query = `
      query {
        boards(ids: [${boardId}]) {
          columns { id title type }
        }
      }
    `;
    const result = await monday.api(query);
    const cols: BoardColumn[] = result.data?.boards?.[0]?.columns ?? [];
    // Excluir columnas no mapeables
    const excluded = ['subtasks', 'formula', 'board_relation', 'direct_doc', 'name'];
    setColumns(cols.filter((c) => !excluded.includes(c.type)));
    setReady(true);
  }

  return { context, columns, ready };
}

export { monday };
