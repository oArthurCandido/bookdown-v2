import { useQuery } from "@tanstack/react-query";

export function useMarkdown(url: string | null) {
  return useQuery({
    queryKey: ["markdown", url],
    queryFn: async () => {
      if (!url) throw new Error("URL is required");
      const res = await fetch(url, { headers: { Accept: "text/plain" } });
      if (!res.ok) throw new Error("Failed to load content");
      return res.text();
    },
    enabled: !!url,
  });
}
