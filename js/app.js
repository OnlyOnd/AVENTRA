import * as core from "./app/core.js";
import { initializeSystem } from "./app/system.js";
import { initializeDestinations } from "./app/destinations.js";
import { initializeItineraries } from "./app/itineraries.js";
import { initializeTravelTools } from "./app/travel-tools.js";

async function startAventra() {
  initializeSystem(core);
  await initializeDestinations(core);
  initializeItineraries(core);
  initializeTravelTools(core);
}

document.addEventListener("DOMContentLoaded", () => {
  void startAventra();
});
