const COUNTRIES_URL = "https://cdn.jsdelivr.net/npm/world-countries@5.1.0/countries.json";

export async function fetchWorldCountries(signal) {
  const response = await fetch(COUNTRIES_URL, { signal });
  if (!response.ok) throw new Error(`La API de países respondió HTTP ${response.status}.`);
  const data = await response.json();
  if (!Array.isArray(data) || !data.length) throw new Error("La API no devolvió países.");
  return data;
}
