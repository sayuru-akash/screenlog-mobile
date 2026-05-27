export type ListItemForDisplay = {
  id: string;
  title: string;
  rank?: number | null;
};

export type DisplayListItem<TItem extends ListItemForDisplay> = TItem & {
  displayPosition: number;
};

export function toDisplayListItems<TItem extends ListItemForDisplay>(
  items: readonly TItem[],
): DisplayListItem<TItem>[] {
  return items.map((item, index) => ({
    ...item,
    displayPosition: index + 1,
  }));
}
