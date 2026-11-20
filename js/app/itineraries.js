export function initializeItineraries(app) {
  app.renderItineraryDiscovery();
  app.setupItineraryTabs();
  app.setupItineraryDiscovery();
  app.setupTripForm();
  app.renderItinerary();
  if (document.querySelector("[data-itinerary]")) {
    void app.migrateLegacyTripCurrencies().then(app.renderItinerary);
  }
  app.renderItineraryTemplateDetail();
  app.setupItineraryInteractions();
}
