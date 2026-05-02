export function toRawUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    if (u.hostname === "raw.githubusercontent.com") return u.toString();
    if (u.hostname === "github.com") {
      // /user/repo/blob/branch/path/to/file.md
      const parts = u.pathname.split("/").filter(Boolean);
      const user = parts[0];
      const repo = parts[1];
      const idxBlob = parts.indexOf("blob");
      if (idxBlob !== -1) {
        const branch = parts[idxBlob + 1];
        const rest = parts.slice(idxBlob + 2).join("/");
        return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${rest}`;
      }
    }
    return url;
  } catch {
    return url;
  }
}

export function baseOfRaw(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    const segs = u.pathname.split("/");
    segs.pop();
    u.pathname = segs.join("/") + "/";
    return u.toString();
  } catch {
    return rawUrl;
  }
}

export function resolveRelative(base: string, href: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}
