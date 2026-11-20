const EXCHANGE_API_URL = "https://open.er-api.com/v6/latest";

export async function fetchExchangeRate(baseCurrency, targetCurrency) {
  const response = await fetch(`${EXCHANGE_API_URL}/${encodeURIComponent(baseCurrency)}`);
  if (!response.ok) throw new Error(`El servicio de cambio respondió HTTP ${response.status}.`);
  const data = await response.json();
  if (data.result !== "success" || data.base_code !== baseCurrency || !data.rates || typeof data.rates !== "object") {
    throw new Error("El servicio de cambio devolvió una tasa inválida.");
  }
  const rate = Number(data.rates[targetCurrency]);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(`No hay una tasa de cambio disponible de ${baseCurrency} a ${targetCurrency}.`);
  }
  return { rate, updatedAt: data.time_last_update_utc || null, rates: data.rates };
}
