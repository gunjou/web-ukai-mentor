export function getPageMeta(pathname, pageTitles) {
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }

  const matchedPath = Object.keys(pageTitles)
    .filter((path) => path !== "/" && pathname.startsWith(path))
    .sort((a, b) => b.length - a.length)[0];

  return pageTitles[matchedPath] || pageTitles["/"];
}
