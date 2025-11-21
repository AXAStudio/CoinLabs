// Safe API url joiner
export function joinApi(base: string, path: string) {
  if (!base) return path;
  const b = base.replace(/\/+$/g, '');
  const p = path.replace(/^\/+/g, '');
  return `${b}/${p}`;
}

export default joinApi;
