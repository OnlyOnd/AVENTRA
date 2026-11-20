const PHOTON_URL = "https://photon.komoot.io/api/";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

async function requestJson(url, timeout) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`El servicio de lugares respondió con ${response.status}.`);
    return response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function searchOpenStreetMapAccommodations(location, lastRequestAt = 0) {
  const geocoderUrl = new URL(PHOTON_URL);
  geocoderUrl.searchParams.set("q", location);
  geocoderUrl.searchParams.set("limit", "1");
  const geocoderData = await requestJson(geocoderUrl, 12000);
  const coordinates = geocoderData.features?.[0]?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return { center: null, elements: [] };
  const longitude = Number(coordinates[0]);
  const latitude = Number(coordinates[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return { center: null, elements: [] };

  const latitudeDelta = 8 / 111.32;
  const longitudeDelta = 8 / (111.32 * Math.max(Math.cos(latitude * Math.PI / 180), 0.01));
  const searchUrl = new URL(NOMINATIM_URL);
  searchUrl.search = new URLSearchParams({
    q: "hotel", format: "jsonv2", limit: "30", addressdetails: "1", extratags: "1", "accept-language": "es",
    viewbox: [longitude - longitudeDelta, latitude + latitudeDelta, longitude + longitudeDelta, latitude - latitudeDelta].join(","),
    bounded: "1"
  }).toString();
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < 1000) await new Promise((resolve) => window.setTimeout(resolve, 1000 - elapsed));
  const data = await requestJson(searchUrl, 20000);
  return { center: { latitude, longitude }, elements: Array.isArray(data) ? data : [], requestedAt: Date.now() };
}
