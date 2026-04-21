const DEEZER_API_BASE_URL = "https://api.deezer.com";

export type TopAlbum = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  url: string;
};

function getCountryCodeFromAcceptLanguage(acceptLanguage: string | null): string | null {
  if (!acceptLanguage) return null;
  const parts = acceptLanguage
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  for (const part of parts) {
    const [langToken] = part.split(";");
    if (!langToken) continue;
    const [language, region] = langToken.split("-");
    if (region && region.length === 2) return region.toUpperCase();
    if (language && language.length === 2) return language.toUpperCase();
  }
  return null;
}

export function detectCountryCode(headers: Headers): string {
  const vercelCountry = headers.get("x-vercel-ip-country");
  if (vercelCountry && vercelCountry.length === 2) {
    return vercelCountry.toUpperCase();
  }
  return getCountryCodeFromAcceptLanguage(headers.get("accept-language")) ?? "FR";
}

export async function getTopAlbumsByCountry(countryCode: string, limit = 20): Promise<TopAlbum[]> {
  const safeCountry = countryCode.toUpperCase();
  const safeLimit = Math.max(5, Math.min(limit, 50));
  const fetchCharts = async (scope: string) => {
    const endpoint = `${DEEZER_API_BASE_URL}/chart/${scope}/albums?limit=${safeLimit}`;
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      next: { revalidate: 1800 },
    });
    if (!response.ok) return null;
    return (await response.json()) as {
      data?: Array<{
        id?: number;
        title?: string;
        link?: string;
        cover_medium?: string | null;
        cover_big?: string | null;
        cover_xl?: string | null;
        artist?: { name?: string };
      }>;
    };
  };

  const countryCharts = await fetchCharts(safeCountry);
  const fallbackCharts = countryCharts?.data?.length ? null : await fetchCharts("0");
  const albums = countryCharts?.data?.length ? countryCharts.data : (fallbackCharts?.data ?? []);

  return albums
    .filter((album) => album.id && album.title && album.link && (album.cover_xl || album.cover_big || album.cover_medium))
    .map((album) => ({
      id: String(album.id),
      title: album.title as string,
      artist: album.artist?.name ?? "",
      coverUrl: (album.cover_xl ?? album.cover_big ?? album.cover_medium) as string,
      url: album.link as string,
    }));
}
