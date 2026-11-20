const COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php";

export async function searchWikimediaImages(searchTerm) {
  const query = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `filetype:bitmap ${searchTerm}`,
    gsrnamespace: "6",
    gsrlimit: "20",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "960",
    format: "json",
    origin: "*"
  });
  const response = await fetch(`${COMMONS_API_URL}?${query}`);
  if (!response.ok) throw new Error(`Wikimedia Commons respondió HTTP ${response.status}.`);
  const data = await response.json();
  return Object.values(data.query?.pages || {});
}
