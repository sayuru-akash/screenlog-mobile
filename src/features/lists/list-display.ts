export type ListItemForDisplay = {
  id: string;
  title: string;
  rank?: number | null;
};

export type ListItemRouteInput = ListItemForDisplay & {
  type?: string;
  movieId?: string | null;
  showId?: string | null;
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

export function routeForListItem(item: ListItemRouteInput) {
  if (item.type === "movie") {
    return item.movieId ? (`/movie/${item.movieId}` as const) : null;
  }

  if (item.type === "show") {
    return item.showId ? (`/show/${item.showId}` as const) : null;
  }

  if (item.movieId) return `/movie/${item.movieId}` as const;
  if (item.showId) return `/show/${item.showId}` as const;

  return null;
}
