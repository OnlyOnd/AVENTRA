export async function initializeDestinations(app) {
  app.setupCountryImageLoading();
  app.setupFeaturedDestinationsCarousel();

  const requestedCountryId = app.detailDestinationId();
  const hasCuratedDetail = Boolean(requestedCountryId && app.destinationById(requestedCountryId));
  if (hasCuratedDetail) app.renderCountryDetail();

  const countryData = await app.loadDestinations();
  app.renderCountryCatalog(countryData.source);
  app.renderCountryDetail();
  app.enhanceFavoriteButtons();
  app.renderFavorites();
  app.setupFavoritesScrollControls();
  app.setupHomeDestinationSearch();
  app.setupDestinationFilters();
}
