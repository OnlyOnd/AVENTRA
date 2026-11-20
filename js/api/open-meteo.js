const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

async function geocodeCity(cityName) {
  const url = new URL(GEOCODING_URL);
  url.search = new URLSearchParams({ name: cityName, count: "1", language: "es", format: "json" }).toString();
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Geocodificación: HTTP ${response.status}`);
  const place = (await response.json()).results?.[0];
  if (!place) throw new Error("No se encontró la ciudad solicitada.");
  return place;
}

export async function fetchWeatherForecast(cityName, options = {}) {
  const place = await geocodeCity(cityName);
  const url = new URL(FORECAST_URL);
  url.search = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    ...options
  }).toString();
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Pronóstico: HTTP ${response.status}`);
  return { place, data: await response.json() };
}
