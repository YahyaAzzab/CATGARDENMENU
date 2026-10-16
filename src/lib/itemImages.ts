const modules = import.meta.glob('../assets/items/*.jpg', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const byId: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop();
  if (!file) continue;
  byId[file.replace(/\.jpg$/, '')] = url;
}

export function getItemImage(id: string): string | undefined {
  return byId[id];
}
