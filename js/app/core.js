import { fetchWorldCountries } from "../api/world-countries.js";
import { searchWikimediaImages } from "../api/wikimedia-commons.js";
import { fetchWeatherForecast } from "../api/open-meteo.js";
import { fetchExchangeRate } from "../api/exchange-rates.js";
import { searchOpenStreetMapAccommodations as searchOpenStreetMapApi } from "../api/openstreetmap.js";

"use strict";

  const STORAGE_KEYS = {
    favorites: "aventra.favorites",
    trip: "aventra.trip",
    trips: "aventra.trips.v1",
    packing: "aventra.packing",
    termsAcceptance: "aventra.terms.acceptance.v1"
  };
  const PRIVACY_RETURN_KEY = "aventra.privacy.return.v1";

  let destinations = [
    { id: "argentina", name: "Argentina", city: "Buenos Aires", region: "América", area: "América del Sur", climate: "Variado", experiences: ["Cultura", "Naturaleza", "Gastronomía"], code: "AR", photo: "argentina", page: "detalle-argentina.html" },
    { id: "brasil", name: "Brasil", city: "Brasilia", region: "América", area: "América del Sur", climate: "Tropical", experiences: ["Naturaleza", "Playas", "Cultura"], code: "BR", photo: "brasil", page: "detalle-brasil.html" },
    { id: "canada", name: "Canadá", city: "Ottawa", region: "América", area: "América del Norte", climate: "Frío", experiences: ["Naturaleza", "Ciudades"], code: "CA", photo: "canada", page: "detalle-canada.html" },
    { id: "colombia", name: "Colombia", city: "Bogotá", region: "América", area: "América del Sur", climate: "Tropical", experiences: ["Cultura", "Naturaleza", "Gastronomía"], code: "CO", photo: "colombia", page: "detalle-colombia.html" },
    { id: "espana", name: "España", city: "Madrid", region: "Europa", area: "Europa", climate: "Templado", experiences: ["Cultura", "Gastronomía", "Ciudades"], code: "ES", photo: "espana", page: "detalle-espana.html" },
    { id: "francia", name: "Francia", city: "París", region: "Europa", area: "Europa", climate: "Templado", experiences: ["Cultura", "Gastronomía", "Ciudades"], code: "FR", photo: "francia", page: "detalle-francia.html" },
    { id: "guatemala", name: "Guatemala", city: "Ciudad de Guatemala", region: "América", area: "América Central", climate: "Tropical", experiences: ["Cultura", "Naturaleza"], code: "GT", photo: "guatemala", page: "detalle-guatemala.html" },
    { id: "italia", name: "Italia", city: "Roma", region: "Europa", area: "Europa", climate: "Templado", experiences: ["Cultura", "Gastronomía", "Ciudades"], code: "IT", photo: "italia", page: "detalle-italia.html" },
    { id: "japon", name: "Japón", city: "Tokio", region: "Asia", area: "Asia", climate: "Templado", experiences: ["Cultura", "Gastronomía", "Ciudades"], code: "JP", photo: "japon", page: "detalle-japon.html" },
    { id: "mexico", name: "México", city: "Ciudad de México", region: "América", area: "América del Norte", climate: "Variado", experiences: ["Cultura", "Gastronomía", "Playas"], code: "MX", photo: "mexico", page: "detalle-mexico.html" },
    { id: "peru", name: "Perú", city: "Lima", region: "América", area: "América del Sur", climate: "Variado", experiences: ["Cultura", "Naturaleza", "Gastronomía"], code: "PE", photo: "peru", page: "detalle-peru.html" }
  ];
  const featuredCountryCodes = new Set([
    "AR", "AU", "BR", "CA", "CH", "CN", "CO", "CR", "DE", "EG", "ES", "FR",
    "GB", "GR", "GT", "ID", "IN", "IS", "IT", "JP", "KR", "MA", "MX", "NZ",
    "PE", "PT", "SG", "TH", "TR", "US", "ZA", "AE"
  ]);
  const countryCurrencyCodes = {
    AR: "ARS", AU: "AUD", BR: "BRL", CA: "CAD", CH: "CHF", CN: "CNY",
    CO: "COP", CR: "CRC", DE: "EUR", EG: "EGP", ES: "EUR", FR: "EUR",
    GB: "GBP", GR: "EUR", GT: "GTQ", ID: "IDR", IN: "INR", IS: "ISK",
    IT: "EUR", JP: "JPY", KR: "KRW", MA: "MAD", MX: "MXN", NZ: "NZD",
    PE: "PEN", PT: "EUR", SG: "SGD", TH: "THB", TR: "TRY", US: "USD",
    ZA: "ZAR", AE: "AED"
  };
  const destinationCacheKey = "aventra.destinations.v16";
  const imageCacheKey = "aventra.country-images.v9";
  const countryHighlightsCacheKey = "aventra.country-highlights.v13";
  const currencyRatesCache = new Map();
  const itineraryTemplates = [
    {
      id: "canada-impresionante",
      name: "Canadá Impresionante",
      destinationId: "canada",
      routeCity: "Vancouver",
      category: "Naturaleza",
      image: "../img/paises/canada.png",
      description: "Montañas, lagos y aire puro en una ruta para conectar con la naturaleza.",
      days: [
        { title: "Llegada a Vancouver", activities: ["Pasear por Canada Place", "Ver el atardecer en English Bay"] },
        { title: "Bosques y costa", activities: ["Recorrer Stanley Park", "Visitar Granville Island"] },
        { title: "Montañas de Whistler", activities: ["Subir en góndola", "Caminar por el pueblo alpino"] },
        { title: "Lagos de montaña", activities: ["Explorar Garibaldi Lake", "Disfrutar un picnic al aire libre"] },
        { title: "Regreso a la ciudad", activities: ["Conocer Gastown", "Probar sabores locales"] },
        { title: "Despedida", activities: ["Paseo junto al puerto", "Preparar el regreso"] }
      ],
      includes: ["Rutas por la naturaleza", "Tiempo para explorar a tu ritmo", "Sugerencias de transporte local"],
      featured: true
    },
    {
      id: "italia-clasica",
      name: "Italia Clásica",
      destinationId: "italia",
      category: "Cultura",
      categories: ["Ciudades"],
      image: "../img/paises/italia-opt.jpg",
      description: "Arte, historia y gastronomía por las ciudades que cuentan historias.",
      days: [
        { title: "Día 1 · Roma", activities: ["Conocer el Coliseo y el Foro Romano", "Pasear por el centro histórico"] },
        { title: "Día 2 · Roma", activities: ["Visitar la Ciudad del Vaticano", "Probar una trattoria local"] },
        { title: "Día 3 · Florencia", activities: ["Recorrer la Galería Uffizi", "Ver el atardecer desde Piazzale Michelangelo"] },
        { title: "Día 4 · Florencia", activities: ["Visitar el Duomo", "Explorar el mercado central"] },
        { title: "Día 5 · Venecia", activities: ["Pasear por la Plaza de San Marcos", "Recorrer los canales"] },
        { title: "Día 6 · Venecia", activities: ["Cruzar el Puente de Rialto", "Disfrutar un último café italiano"] }
      ],
      includes: ["Paradas culturales en cada ciudad", "Tiempo libre para descubrir", "Ideas para probar la cocina local"],
      featured: true
    },
    {
      id: "japon-tradicional",
      name: "Japón Tradicional",
      destinationId: "japon",
      category: "Cultura",
      categories: ["Ciudades"],
      image: "../img/paises/japon.jpg",
      description: "Templos, barrios vibrantes y tradiciones que conviven con el futuro.",
      days: [
        { title: "Día 1 · Tokio", activities: ["Explorar Asakusa y el templo Sensō-ji", "Pasear junto al río Sumida"] },
        { title: "Día 2 · Tokio", activities: ["Visitar Meiji Jingu", "Descubrir Shibuya al atardecer"] },
        { title: "Día 3 · Hakone", activities: ["Relajarse en un onsen", "Disfrutar las vistas del monte Fuji"] },
        { title: "Día 4 · Kioto", activities: ["Recorrer Fushimi Inari", "Caminar por Gion"] },
        { title: "Día 5 · Kioto", activities: ["Visitar el bosque de bambú", "Conocer el templo Kinkaku-ji"] },
        { title: "Día 6 · Nara", activities: ["Pasear por el parque de Nara", "Visitar el templo Tōdai-ji"] }
      ],
      includes: ["Barrios históricos y modernos", "Experiencias culturales", "Recomendaciones para moverse en tren"],
      featured: true
    },
    {
      id: "mexico-autentico",
      name: "México Auténtico",
      destinationId: "mexico",
      category: "Aventura",
      categories: ["Ciudades"],
      image: "../img/paises/mexico.png",
      description: "Color, historia y sabores locales para un viaje lleno de contrastes.",
      days: [
        { title: "Día 1 · Ciudad de México", activities: ["Recorrer el Centro Histórico", "Probar antojitos en un mercado"] },
        { title: "Día 2 · Ciudad de México", activities: ["Visitar el Museo Nacional de Antropología", "Pasear por Chapultepec"] },
        { title: "Día 3 · Teotihuacán", activities: ["Explorar la zona arqueológica", "Conocer un taller artesanal"] },
        { title: "Día 4 · Oaxaca", activities: ["Pasear por el centro y el Zócalo", "Probar platillos tradicionales"] },
        { title: "Día 5 · Oaxaca", activities: ["Visitar Monte Albán", "Descubrir mercados de artesanías"] },
        { title: "Día 6 · Despedida", activities: ["Disfrutar un desayuno local", "Comprar recuerdos del viaje"] }
      ],
      includes: ["Paradas culturales", "Experiencias gastronómicas", "Excursiones para personalizar"],
      featured: false
    },
    {
      id: "espana-cultural",
      name: "España Cultural",
      destinationId: "espana",
      category: "Cultura",
      categories: ["Ciudades"],
      image: "../img/paises/espa\u00f1a.png",
      description: "Arquitectura, plazas y vida local entre Madrid, Sevilla y Barcelona.",
      days: [
        { title: "Día 1 · Madrid", activities: ["Pasear por la Puerta del Sol", "Visitar el Museo del Prado"] },
        { title: "Día 2 · Madrid", activities: ["Descubrir el Parque del Retiro", "Probar tapas en La Latina"] },
        { title: "Día 3 · Sevilla", activities: ["Conocer la Plaza de España", "Pasear por el barrio de Santa Cruz"] },
        { title: "Día 4 · Sevilla", activities: ["Visitar el Real Alcázar", "Disfrutar una tarde de flamenco"] },
        { title: "Día 5 · Barcelona", activities: ["Admirar la Sagrada Familia", "Caminar por el Passeig de Gràcia"] },
        { title: "Día 6 · Barcelona", activities: ["Explorar el Park Güell", "Despedirse junto al Mediterráneo"] }
      ],
      includes: ["Paradas en tres ciudades", "Ideas para cada jornada", "Tiempo libre para descubrir"],
      featured: false
    },
    {
      id: "colombia-magica",
      name: "Colombia Mágica",
      destinationId: "colombia",
      category: "Aventura",
      image: "../img/paises/colombia.png",
      description: "Montañas, calles llenas de color y los sabores de Colombia.",
      days: [
        { title: "Día 1 · Bogotá", activities: ["Subir a Monserrate", "Recorrer La Candelaria"] },
        { title: "Día 2 · Bogotá", activities: ["Visitar el Museo del Oro", "Probar café colombiano"] },
        { title: "Día 3 · Eje Cafetero", activities: ["Conocer una finca cafetera", "Pasear por un pueblo tradicional"] },
        { title: "Día 4 · Valle del Cocora", activities: ["Caminar entre palmas de cera", "Disfrutar el paisaje del valle"] },
        { title: "Día 5 · Medellín", activities: ["Recorrer la Comuna 13", "Subir en metrocable"] },
        { title: "Día 6 · Despedida", activities: ["Probar un desayuno típico", "Guardar los mejores recuerdos"] }
      ],
      includes: ["Experiencias de naturaleza y ciudad", "Paradas culturales", "Recomendaciones gastronómicas"],
      featured: false
    },
    {
      id: "brasil-relax",
      name: "Brasil al atardecer",
      destinationId: "brasil",
      routeCity: "Río de Janeiro",
      category: "Relax",
      image: "../img/paises/brasil.png",
      description: "Días tranquilos de playa, paseos frente al mar y puestas de sol inolvidables.",
      days: [
        { title: "Día 1 · Río de Janeiro", activities: ["Llegar y descansar en Copacabana", "Ver el atardecer junto al mar"] },
        { title: "Día 2 · Ipanema", activities: ["Disfrutar una mañana de playa", "Pasear por el barrio al caer la tarde"] },
        { title: "Día 3 · Jardín Botánico", activities: ["Recorrer el Jardín Botánico", "Tomar un café con calma"] },
        { title: "Día 4 · Bahía de Guanabara", activities: ["Hacer un paseo en barco", "Relajarse en la playa"] },
        { title: "Día 5 · Despedida", activities: ["Disfrutar un desayuno frente al mar", "Preparar el regreso"] }
      ],
      includes: ["Jornadas relajadas junto al mar", "Tiempo libre para descansar", "Ideas para explorar la ciudad"],
      featured: false
    }
  ];
  const countryTouristPlaces = {
    AD: [
      ["Lagos de Tristaina", "Tristaina lakes Andorra"],
      ["Valle Madriu-Perafita-Claror", "Madriu Perafita Claror Valley Andorra"],
      ["Sant Joan de Caselles", "Sant Joan de Caselles Andorra"],
      ["Caldea", "Caldea spa Andorra"],
      ["Vallnord", "Vallnord ski resort Andorra"],
      ["Ordino Arcalís", "Ordino Arcalis Andorra mountains"]
    ],
    DZ: [
      ["Gran Mezquita de Argel", "Djamaa El Djazair Great Mosque Algiers Algeria"],
      ["Parque Nacional Tassili n'Ajjer", "Tassili n'Ajjer Algeria landscape"],
      ["Montes Ahaggar", "Ahaggar Mountains Algeria Sahara"],
      ["Ruinas romanas de Timgad", "Timgad Roman ruins Algeria"],
      ["Dunas del Sáhara", "Sahara sand dunes Algeria desert"],
      ["Basílica de Nuestra Señora de África", "Notre Dame d'Afrique Algiers Algeria"]
    ],
    PE: [
      ["Machu Picchu", "Machu Picchu Peru"],
      ["Montaña Arcoíris (Vinicunca)", "Vinicunca Rainbow Mountain Peru"],
      ["Oasis de Huacachina", "Huacachina dunes desert Peru"],
      ["Lago Titicaca al amanecer", "Lake Titicaca sunrise Peru"],
      ["Salineras de Maras", "Maras salt mines Sacred Valley Peru"],
      ["Cañón del Colca", "Colca Canyon Peru landscape"]
    ],
    CO: [
      ["Cartagena de Indias", "Cartagena Colombia old city"],
      ["Valle del Cocora", "Cocora Valley Colombia wax palms"],
      ["Parque Tayrona", "Tayrona National Natural Park Colombia"],
      ["Caño Cristales", "Caño Cristales Colombia river"],
      ["Guatapé y la Piedra del Peñol", "Guatape El Penol Colombia"],
      ["Isla de San Andrés", "San Andres Island Colombia Caribbean"]
    ],
    MX: [
      ["Chichén Itzá", "Chichen Itza Mexico"],
      ["Tulum", "Tulum ruins Mexico Caribbean"],
      ["Guanajuato", "Guanajuato colorful city Mexico"],
      ["Cascadas de Hierve el Agua", "Hierve el Agua Oaxaca Mexico"],
      ["Oaxaca", "Oaxaca historic center Mexico"],
      ["Cenotes de Yucatán", "Yucatan cenote Mexico"]
    ],
    BR: [
      ["Río de Janeiro", "Rio de Janeiro Sugarloaf Brazil"],
      ["Cataratas del Iguazú", "Iguazu Falls Brazil"],
      ["Lençóis Maranhenses", "Lencois Maranhenses Brazil lagoons"],
      ["Fernando de Noronha", "Fernando de Noronha Brazil island"],
      ["Amazonía", "Amazon rainforest Brazil landscape"],
      ["Chapada Diamantina", "Chapada Diamantina Brazil waterfall"]
    ],
    AR: [
      ["Cataratas del Iguazú", "Iguazu Falls Argentina"],
      ["Glaciar Perito Moreno", "Perito Moreno Glacier Argentina"],
      ["Patagonia", "Patagonia Argentina mountain landscape"],
      ["Bariloche", "Bariloche Argentina lake mountains"],
      ["Buenos Aires", "Buenos Aires Argentina colorful architecture"],
      ["Salinas Grandes", "Salinas Grandes Argentina landscape"]
    ],
    FR: [
      ["Torre Eiffel", "Eiffel Tower Paris France"],
      ["Mont-Saint-Michel", "Mont Saint Michel France"],
      ["Campos de lavanda de Provenza", "Provence lavender fields France"],
      ["Costa Azul", "French Riviera France coast"],
      ["Annecy", "Annecy France lake old town"],
      ["Mont Blanc", "Mont Blanc French Alps landscape"]
    ],
    ES: [
      ["Alhambra de Granada", "Alhambra Granada Spain"],
      ["Sagrada Familia", "Sagrada Familia Barcelona Spain"],
      ["Parque Güell", "Park Guell Barcelona Spain"],
      ["Plaza de España de Sevilla", "Plaza de Espana Seville Spain"],
      ["Costa Brava", "Costa Brava Spain coast"],
      ["Toledo", "Toledo Spain historic city"]
    ],
    IT: [
      ["Coliseo de Roma", "Colosseum Rome Italy"],
      ["Gran Canal de Venecia", "Grand Canal Venice Italy"],
      ["Costa Amalfitana", "Amalfi Coast Italy"],
      ["Cinque Terre", "Cinque Terre Italy coast"],
      ["Dolomitas", "Dolomites Italy mountains"],
      ["Catedral de Florencia", "Florence Duomo Italy"]
    ],
    JP: [
      ["Monte Fuji", "Mount Fuji Japan"],
      ["Fushimi Inari", "Fushimi Inari Kyoto Japan"],
      ["Bosque de bambú de Arashiyama", "Arashiyama bamboo grove Kyoto Japan"],
      ["Miyajima", "Miyajima Itsukushima Japan"],
      ["Castillo de Himeji", "Himeji Castle Japan"],
      ["Cerezos en flor", "Japan cherry blossom Mount Fuji"]
    ],
    IN: [
      ["Taj Mahal", "Taj Mahal India"],
      ["Hawa Mahal de Jaipur", "Hawa Mahal Jaipur India"],
      ["Ghats de Varanasi", "Varanasi ghats India Ganges"],
      ["Remansos de Kerala", "Kerala backwaters India"],
      ["Lago Pangong", "Pangong Lake Ladakh India"],
      ["Hampi", "Hampi India temples landscape"]
    ],
    EG: [
      ["Pirámides de Guiza", "Pyramids of Giza Egypt"],
      ["Abu Simbel", "Abu Simbel temples Egypt"],
      ["Templo de Luxor", "Luxor Temple Egypt"],
      ["Desierto Blanco", "White Desert Egypt landscape"],
      ["Río Nilo", "Nile River Egypt landscape"],
      ["Arrecifes del mar Rojo", "Red Sea Egypt coral reef"]
    ],
    US: [
      ["Gran Cañón", "Grand Canyon United States"],
      ["Parque Nacional Yosemite", "Yosemite National Park United States"],
      ["Parque Nacional Yellowstone", "Yellowstone National Park United States"],
      ["Antelope Canyon", "Antelope Canyon Arizona United States"],
      ["Nā Pali Coast", "Na Pali Coast Hawaii United States"],
      ["Estatua de la Libertad", "Statue of Liberty New York United States"]
    ],
    CA: [
      ["Lago Moraine", "Moraine Lake Banff Canada"],
      ["Cataratas del Niágara", "Niagara Falls Canada"],
      ["Parque Nacional Jasper", "Jasper National Park Canada"],
      ["Ciudad de Quebec", "Quebec City old town Canada"],
      ["Icefields Parkway", "Icefields Parkway Canadian Rockies"],
      ["Vancouver", "Vancouver Canada mountains harbor"]
    ],
    GR: [
      ["Santorini", "Santorini Greece blue domes"],
      ["Monasterios de Meteora", "Meteora Greece monasteries"],
      ["Acrópolis de Atenas", "Acropolis Athens Greece"],
      ["Playa Navagio", "Navagio Beach Zakynthos Greece"],
      ["Milos", "Milos Greece coast landscape"],
      ["Delfos", "Delphi Greece archaeological site"]
    ],
    TR: [
      ["Capadocia", "Cappadocia Turkey balloons landscape"],
      ["Pamukkale", "Pamukkale Turkey terraces"],
      ["Santa Sofía", "Hagia Sophia Istanbul Turkey"],
      ["Éfeso", "Ephesus Turkey ancient city"],
      ["Antalya", "Antalya Turkey coast old town"],
      ["Monte Nemrut", "Mount Nemrut Turkey statues sunrise"]
    ],
    ID: [
      ["Terrazas de arroz de Bali", "Bali rice terraces Indonesia"],
      ["Parque Nacional de Komodo", "Komodo National Park Indonesia"],
      ["Borobudur", "Borobudur Indonesia temple"],
      ["Raja Ampat", "Raja Ampat Indonesia islands"],
      ["Monte Bromo", "Mount Bromo Indonesia sunrise"],
      ["Nusa Penida", "Nusa Penida Indonesia cliffs beach"]
    ],
    TH: [
      ["Bahía Maya", "Maya Bay Thailand"],
      ["Templos de Chiang Mai", "Chiang Mai temples Thailand"],
      ["Gran Palacio de Bangkok", "Grand Palace Bangkok Thailand"],
      ["Playa de Railay", "Railay Beach Thailand"],
      ["Islas Similan", "Similan Islands Thailand"],
      ["Ayutthaya", "Ayutthaya Thailand temples"]
    ],
    VN: [
      ["Bahía de Ha Long", "Ha Long Bay Vietnam"],
      ["Hoi An", "Hoi An Vietnam old town lanterns"],
      ["Ninh Binh", "Ninh Binh Vietnam landscape"],
      ["Terrazas de arroz de Sa Pa", "Sapa rice terraces Vietnam"],
      ["Cuevas de Phong Nha", "Phong Nha caves Vietnam"],
      ["Puente Dorado", "Golden Bridge Ba Na Hills Vietnam"]
    ],
    ZA: [
      ["Montaña de la Mesa", "Table Mountain Cape Town South Africa"],
      ["Parque Nacional Kruger", "Kruger National Park South Africa landscape"],
      ["Cañón del río Blyde", "Blyde River Canyon South Africa"],
      ["Cabo de Buena Esperanza", "Cape Point South Africa coast"],
      ["Montañas Drakensberg", "Drakensberg South Africa mountains"],
      ["Ruta Jardín", "Garden Route South Africa coast"]
    ],
    MA: [
      ["Chefchaouen", "Chefchaouen Morocco blue city"],
      ["Dunas del Sáhara en Merzouga", "Merzouga Sahara dunes Morocco"],
      ["Ait Ben Haddou", "Ait Ben Haddou Morocco"],
      ["Marrakech", "Marrakech Morocco old city"],
      ["Fez", "Fez Morocco medina"],
      ["Gargantas del Todra", "Todra Gorge Morocco"]
    ],
    GB: [
      ["Castillo de Edimburgo", "Edinburgh Castle Scotland"],
      ["Lake District", "Lake District England landscape"],
      ["Calzada del Gigante", "Giant's Causeway Northern Ireland"],
      ["Tower Bridge", "Tower Bridge London England"],
      ["Tierras Altas de Escocia", "Scottish Highlands landscape"],
      ["Stonehenge", "Stonehenge England"]
    ],
    CN: [
      ["Gran Muralla China", "Great Wall China landscape"],
      ["Zhangjiajie", "Zhangjiajie National Forest Park China"],
      ["Ciudad Prohibida", "Forbidden City Beijing China"],
      ["Río Li", "Li River Guilin China landscape"],
      ["Montañas Huangshan", "Huangshan mountains China"],
      ["Horizonte de Shanghái", "Shanghai skyline China"]
    ],
    NZ: [
      ["Milford Sound", "Milford Sound New Zealand"],
      ["Aoraki / Monte Cook", "Aoraki Mount Cook New Zealand"],
      ["Hobbiton", "Hobbiton New Zealand"],
      ["Lago Tekapo", "Lake Tekapo New Zealand"],
      ["Tongariro", "Tongariro National Park New Zealand"],
      ["Wai-O-Tapu", "Wai O Tapu New Zealand geothermal"]
    ],
    AU: [
      ["Gran Barrera de Coral", "Great Barrier Reef Australia"],
      ["Uluru", "Uluru Australia"],
      ["Ópera de Sídney", "Sydney Opera House Australia"],
      ["Islas Whitsunday", "Whitsunday Islands Australia"],
      ["Montañas Azules", "Blue Mountains Australia"],
      ["Great Ocean Road", "Great Ocean Road Australia"]
    ],
    IS: [
      ["Cascada Skógafoss", "Skogafoss Iceland waterfall"],
      ["Laguna glaciar Jökulsárlón", "Jokulsarlon Iceland glacier lagoon"],
      ["Playa de Reynisfjara", "Reynisfjara Iceland black sand beach"],
      ["Landmannalaugar", "Landmannalaugar Iceland landscape"],
      ["Aurora boreal", "Northern lights Iceland landscape"],
      ["Blue Lagoon", "Blue Lagoon Iceland"]
    ],
    PT: [
      ["Palacio da Pena", "Pena Palace Sintra Portugal"],
      ["Algarve", "Algarve Portugal coast cliffs"],
      ["Valle del Duero", "Douro Valley Portugal landscape"],
      ["Lisboa", "Lisbon Portugal historic city"],
      ["Madeira", "Madeira Portugal landscape cliffs"],
      ["Azores", "Azores Portugal lakes landscape"]
    ],
    DE: [
      ["Castillo de Neuschwanstein", "Neuschwanstein Castle Germany"],
      ["Selva Negra", "Black Forest Germany landscape"],
      ["Catedral de Colonia", "Cologne Cathedral Germany"],
      ["Puerta de Brandeburgo", "Brandenburg Gate Berlin Germany"],
      ["Suiza Sajona", "Saxon Switzerland National Park Germany"],
      ["Berchtesgaden", "Berchtesgaden Germany Alps lake"]
    ],
    CH: [
      ["Matterhorn", "Matterhorn Switzerland"],
      ["Lauterbrunnen", "Lauterbrunnen Switzerland waterfall valley"],
      ["Lago Lemán", "Lake Geneva Switzerland Alps"],
      ["Alpes suizos", "Swiss Alps Switzerland landscape"],
      ["Zermatt", "Zermatt Switzerland mountain"],
      ["Lago Oeschinen", "Oeschinen Lake Switzerland"]
    ],
    CR: [
      ["Volcán Arenal", "Arenal Volcano Costa Rica"],
      ["Parque Nacional Manuel Antonio", "Manuel Antonio National Park Costa Rica"],
      ["Monteverde", "Monteverde cloud forest Costa Rica"],
      ["Río Celeste", "Rio Celeste Costa Rica waterfall"],
      ["Tortuguero", "Tortuguero Costa Rica canals"],
      ["Playa Tamarindo", "Tamarindo beach Costa Rica"]
    ],
    EC: [
      ["Islas Galápagos", "Galapagos Islands Ecuador landscape"],
      ["Volcán Cotopaxi", "Cotopaxi volcano Ecuador"],
      ["Laguna Quilotoa", "Quilotoa crater lake Ecuador"],
      ["Baños de Agua Santa", "Banos Ecuador waterfall"],
      ["Cuenca", "Cuenca Ecuador historic center"],
      ["Amazonía ecuatoriana", "Ecuador Amazon rainforest"]
    ]
  };
  const detailPagePath = (destination) => `lugares/detalle.html?pais=${encodeURIComponent(destination.id)}`;
  let countryImageCache = {};
  let countryImageObserver;
  let imageRequestsInProgress = 0;
  let privacyReturnAvailable = false;
  const pendingCountryImages = [];
  const countryHighlightRequests = new Map();

  const normalize = (value) => (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
  const destinationById = (id) => destinations.find((destination) => destination.id === id);
  const destinationByName = (name) => destinations.find((destination) => normalize(destination.name) === normalize(name));
  const featuredDestinations = () => destinations.filter((destination) => featuredCountryCodes.has(destination.code));

  function detailDestinationId() {
    const queryId = new URLSearchParams(window.location.search).get("pais");
    if (queryId) return queryId;
    const match = window.location.pathname.match(/detalle-([a-z]+)\.html$/i);
    return match ? match[1].toLocaleLowerCase("es") : null;
  }

  let noticeTimer;
  let weatherRequestId = 0;
  let noticeActionCallback = null;
  const itineraryWeatherCache = new Map();

  function notify(message, type = "status", action = null) {
    let notice = document.querySelector(".app-notice");
    if (!notice) {
      notice = document.createElement("div");
      notice.className = "app-notice";
      notice.setAttribute("role", "status");
      notice.setAttribute("aria-live", "polite");
      notice.addEventListener("click", (event) => {
        if (!event.target.closest("[data-notice-action]")) return;
        const callback = noticeActionCallback;
        noticeActionCallback = null;
        notice.classList.remove("is-visible");
        callback?.();
      });
      document.body.append(notice);
    }
    notice.replaceChildren();
    const text = document.createElement("span");
    text.textContent = message;
    notice.append(text);
    if (action) {
      const actionButton = document.createElement("button");
      actionButton.type = "button";
      actionButton.dataset.noticeAction = "";
      actionButton.className = "app-notice-action";
      actionButton.textContent = action.label;
      notice.append(actionButton);
      noticeActionCallback = action.onClick;
    } else {
      noticeActionCallback = null;
    }
    notice.dataset.type = type;
    notice.classList.add("is-visible");
    window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => {
      notice.classList.remove("is-visible");
      noticeActionCallback = null;
    }, action ? 7000 : 4200);
  }

  function readStorage(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      console.error(`No se pudo leer el almacenamiento local (${key}).`, error);
      notify("No se pudieron leer algunos datos guardados. Comprueba el almacenamiento del navegador.", "error");
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`No se pudo guardar la información (${key}).`, error);
      notify("No se pudieron guardar los cambios. Revisa el espacio disponible y los permisos del navegador.", "error");
      return false;
    }
  }

  function getFavorites() {
    const stored = readStorage(STORAGE_KEYS.favorites, null);
    if (Array.isArray(stored)) return stored.filter((id) => destinationById(id));

    const initialFavorites = Array.from(document.querySelectorAll(".favorite-item h3"))
      .map((heading) => destinationByName(heading.textContent.trim()))
      .filter(Boolean)
      .map((destination) => destination.id);
    if (initialFavorites.length) writeStorage(STORAGE_KEYS.favorites, initialFavorites);
    return initialFavorites;
  }

  function updateFavoriteButtons() {
    const favorites = getFavorites();
    document.querySelectorAll("[data-favorite-toggle]").forEach((button) => {
      setFavoriteButtonState(button, favorites);
    });
  }

  function setFavoriteButtonState(button, favorites = getFavorites()) {
    const destination = destinationById(button.dataset.destinationId);
    if (!destination) return;
    const isFavorite = favorites.includes(destination.id);
    button.setAttribute("aria-pressed", String(isFavorite));
    button.setAttribute("aria-label", isFavorite
      ? `Quitar ${destination.name} de favoritos`
      : `Guardar ${destination.name} en favoritos`);
    button.textContent = isFavorite ? "♥ Guardado" : "♡ Guardar";
  }

  function favoriteButton(destination, compact = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = compact ? "favorite-toggle favorite-toggle-compact" : "favorite-toggle";
    button.dataset.favoriteToggle = "";
    button.dataset.destinationId = destination.id;
    setFavoriteButtonState(button);
    return button;
  }

  function enhanceFavoriteButtons() {
    document.querySelectorAll(".mini-card").forEach((card) => {
      const destination = destinationByName(card.querySelector("h3")?.textContent.trim());
      const content = card.querySelector(".mini-content");
      if (destination && content && !content.querySelector("[data-favorite-toggle]")) {
        content.append(favoriteButton(destination, true));
      }
    });

    document.querySelectorAll(".destination-card").forEach((card) => {
      const destination = destinationByName(card.querySelector("h3")?.textContent.trim());
      const content = card.querySelector(".destination-card-bottom");
      if (destination && content && !content.querySelector("[data-favorite-toggle]")) {
        content.append(favoriteButton(destination, true));
      }
    });

    const detailId = detailDestinationId();
    const detailDestination = destinationById(detailId);
    const oldFavoriteLink = document.querySelector(".detail-copy .button-row a[href*='favoritos.html']");
    if (detailDestination && oldFavoriteLink && !oldFavoriteLink.matches("[data-favorite-toggle]")) {
      const button = favoriteButton(detailDestination);
      button.className = oldFavoriteLink.className;
      button.dataset.favoriteToggle = "";
      button.dataset.destinationId = detailDestination.id;
      button.setAttribute("aria-label", `Guardar ${detailDestination.name} en favoritos`);
      oldFavoriteLink.replaceWith(button);
    }
    const tripLink = document.querySelector(".detail-copy .button-row a[href*='nuevo-viaje.html']");
    if (detailDestination && tripLink) {
      tripLink.href = `../nuevo-viaje.html?destino=${encodeURIComponent(detailDestination.id)}`;
    }
    const climateLink = document.querySelector(".detail-copy a[href*='clima.html']");
    if (detailDestination && climateLink) {
      climateLink.href = `../clima.html?ciudad=${encodeURIComponent(detailDestination.city)}`;
    }
    updateFavoriteButtons();
  }

  function continentName(continent) {
    if (continent === "Americas" || continent === "North America" || continent === "South America") return "América";
    return ({
      Europe: "Europa",
      Asia: "Asia",
      Africa: "África",
      Oceania: "Oceanía",
      Antarctica: "Antártida",
      Antarctic: "Antártida"
    })[continent] || continent || "Sin región";
  }

  function subregionName(subregion) {
    return ({
      "North America": "América del Norte",
      "Central America": "América Central",
      Caribbean: "Caribe",
      "South America": "América del Sur",
      "Northern Europe": "Europa del Norte",
      "Western Europe": "Europa Occidental",
      "Eastern Europe": "Europa Oriental",
      "Southern Europe": "Europa del Sur",
      "Central Europe": "Europa Central",
      "Western Asia": "Asia Occidental",
      "Central Asia": "Asia Central",
      "Eastern Asia": "Asia Oriental",
      "South-Eastern Asia": "Asia Sudoriental",
      "Southern Asia": "Asia Meridional",
      "Northern Africa": "África del Norte",
      "Western Africa": "África Occidental",
      "Eastern Africa": "África Oriental",
      "Middle Africa": "África Central",
      "Southern Africa": "África del Sur",
      Melanesia: "Melanesia",
      Micronesia: "Micronesia",
      Polynesia: "Polinesia"
    })[subregion] || subregion;
  }

  function localizedDisplayName(displayNames, code, fallback) {
    try {
      return displayNames?.of(code) || fallback;
    } catch {
      return fallback;
    }
  }

  function countryFromApi(country, curatedByCode) {
    const code = country.cca2 || country.cca3;
    const curated = curatedByCode.get(code);
    const languageNames = typeof Intl.DisplayNames === "function"
      ? new Intl.DisplayNames(["es"], { type: "language" })
      : null;
    const currencyNames = typeof Intl.DisplayNames === "function"
      ? new Intl.DisplayNames(["es"], { type: "currency" })
      : null;
    const languages = Object.entries(country.languages || {})
      .map(([languageCode, name]) => localizedDisplayName(languageNames, languageCode, name));
    const currencies = Object.entries(country.currencies || {})
      .map(([currencyCode, currency]) => [
        localizedDisplayName(currencyNames, currencyCode, currency.name),
        currency.symbol
      ].filter(Boolean).join(" "))
      .filter(Boolean);
    const currencyCode = Object.keys(country.currencies || {})[0]
      || countryCurrencyCodes[country.cca2]
      || "";
    return {
      ...curated,
      id: curated?.id || String(country.cca3 || code).toLocaleLowerCase("es"),
      name: country.translations?.spa?.common || curated?.name || country.name?.common || "País sin nombre",
      city: curated?.city || country.capital?.[0] || "Sin capital registrada",
      region: continentName(country.region),
      area: subregionName(country.subregion) || continentName(country.region),
      code: country.cca2 || country.cca3 || "??",
      currencyCode,
      currency: currencies.join(", ") || "No registrada",
      languages: languages.join(", ") || "No registrados",
      landArea: Number.isFinite(country.area) ? country.area : null,
      population: Number.isFinite(country.population) ? country.population : null,
      flagEmoji: country.flag || "",
      flagUrl: country.cca2 ? `https://flagcdn.com/w320/${country.cca2.toLowerCase()}.png` : "",
      imageSearchName: country.name?.common || country.name?.official || country.translations?.spa?.common || "",
      imageSearchCity: country.capital?.[0] || curated?.city || "",
      imageUrl: "",
      fallbackImageUrl: curated?.photo ? countryPhotoUrl(curated.photo) : "",
      climate: curated?.climate || "",
      experiences: curated?.experiences || []
    };
  }

  function countryPhotoUrl(photo) {
    const filenames = {
      espana: "espa%C3%B1a.png",
      italia: "italia-opt.jpg",
      japon: "japon.jpg"
    };
    const filename = filenames[photo] || `${photo}.png`;
    const pagePrefix = window.location.pathname.includes("/paginas/lugares/")
      ? "../../"
      : window.location.pathname.includes("/paginas/")
        ? "../"
        : "";
    return new URL(`${pagePrefix}img/paises/${filename}`, window.location.href).href;
  }

  function setCountryPhotoPlaceholder(container, destination) {
    const imageUrl = destination.fallbackImageUrl
      || (destination.photo ? countryPhotoUrl(destination.photo) : destination.flagUrl);
    if (!imageUrl) return;
    container.style.backgroundImage = `url("${imageUrl}")`;
    container.style.backgroundPosition = "center";
    container.style.backgroundSize = "cover";
  }

  function validCountryData(data) {
    return Array.isArray(data) && data.length > 0 && data.every((country) =>
      country && typeof country.id === "string" && typeof country.name === "string"
    );
  }

  async function loadDestinations() {
    const cached = readStorage(destinationCacheKey, null);
    let cachedDestinations = cached && validCountryData(cached.items) ? cached.items : null;
    if (cachedDestinations) {
      const curatedById = new Map(destinations.map((destination) => [destination.id, destination]));
      const refreshedDestinations = cachedDestinations.map((destination) => {
        const curated = curatedById.get(destination.id);
        if (!curated?.photo) return destination;
        const fallbackImageUrl = countryPhotoUrl(curated.photo);
        return destination.fallbackImageUrl === fallbackImageUrl
          ? destination
          : { ...destination, fallbackImageUrl };
      });
      if (refreshedDestinations.some((destination, index) => destination !== cachedDestinations[index])) {
        writeStorage(destinationCacheKey, { ...cached, items: refreshedDestinations });
      }
      cachedDestinations = refreshedDestinations;
    }
    if (cachedDestinations && Date.now() - cached.savedAt < 86400000) {
      destinations = cachedDestinations;
      return { source: "cache", count: destinations.length };
    }

    const curatedByCode = new Map(destinations.map((destination) => [destination.code, destination]));
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const data = await fetchWorldCountries(controller.signal);
      destinations = data
        .map((country) => countryFromApi(country, curatedByCode))
        .filter((destination) => destination.id && destination.name)
        .sort((first, second) => first.name.localeCompare(second.name, "es"));
      if (!destinations.length) throw new Error("No se encontraron datos de países válidos.");
      writeStorage(destinationCacheKey, { savedAt: Date.now(), items: destinations });
      return { source: "api", count: destinations.length };
    } catch (error) {
      console.error("No se pudo cargar la lista de países desde la API.", error);
      if (cachedDestinations) {
        destinations = cachedDestinations;
        return { source: "stale-cache", count: destinations.length };
      }
      return { source: "fallback", count: destinations.length, error };
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function handleCountryImageError(image, destination) {
    if (!image.complete) return;
    if (image.naturalWidth > 0) {
      image.hidden = false;
      return;
    }

    const failedUrl = image.currentSrc || image.src;
    const cachedImage = getCachedCountryImage(destination.id);
    let invalidatedImage = false;
    if (cachedImage?.url === failedUrl) {
      delete countryImageCache[destination.id];
      invalidatedImage = true;
    }
    if (destination.imageUrl === failedUrl) {
      destination.imageUrl = "";
      invalidatedImage = true;
    }
    if (invalidatedImage) {
      writeStorage(imageCacheKey, countryImageCache);
      writeStorage(destinationCacheKey, { savedAt: Date.now(), items: destinations });
    }

    const fallbackUrl = destination.fallbackImageUrl
      || (destination.photo ? countryPhotoUrl(destination.photo) : destination.flagUrl);
    if (image.dataset.fallbackApplied !== "true" && fallbackUrl && image.src !== fallbackUrl) {
      image.dataset.fallbackApplied = "true";
      image.hidden = false;
      image.src = fallbackUrl;
      image.alt = destination.fallbackImageUrl
        ? `Paisaje de ${destination.name}`
        : `Bandera de ${destination.name}`;
      image.closest(".country-card-image, .country-detail-visual, .favorite-card-image, .mini-art")?.classList.remove("has-country-photo");
      image.closest(".country-card-image, .country-detail-visual, .favorite-card-image, .mini-art")?.querySelector(".photo-credit")?.remove();
      return;
    }
    image.hidden = true;
    const container = image.closest(".country-card-image, .country-detail-visual, .favorite-card-image, .mini-art");
    container?.classList.remove("has-country-photo");
    container?.querySelector(".photo-credit")?.remove();
    if (container?.classList.contains("country-detail-visual")) return;
    const fallback = document.createElement("span");
    fallback.className = container?.classList.contains("favorite-card-image")
      ? "country-image-fallback favorite-card-image-fallback"
      : "country-image-fallback";
    fallback.setAttribute("role", "img");
    fallback.setAttribute("aria-label", `Bandera de ${destination.name}`);
    fallback.textContent = destination.flagEmoji || destination.code;
    container?.append(fallback);
  }

  function createCountryCard(destination) {
    const card = document.createElement("article");
    card.className = "mini-card country-card";
    card.dataset.destinationId = destination.id;

    const art = document.createElement("div");
    art.className = "mini-art country-card-image";
    setCountryPhotoPlaceholder(art, destination);
    const image = document.createElement("img");
    image.loading = "lazy";
    const cachedImage = getCachedCountryImage(destination.id);
    image.alt = destination.imageUrl || cachedImage
      ? countryPhotoAlt(destination, cachedImage)
      : `Bandera de ${destination.name}`;
    image.src = destination.imageUrl || cachedImage?.url || destination.fallbackImageUrl || destination.flagUrl || "";
    image.dataset.countryImage = destination.id;
    image.addEventListener("error", () => handleCountryImageError(image, destination));
    art.append(image);
    const imageCredit = createCountryImageCredit(cachedImage, destination);
    if (imageCredit) art.append(imageCredit);

    const content = document.createElement("div");
    content.className = "mini-content";
    const title = document.createElement("h3");
    title.textContent = destination.name;
    const meta = document.createElement("p");
    meta.textContent = `${destination.city} · ${destination.region}`;
    const link = document.createElement("a");
    link.className = "text-link";
    link.href = detailPagePath(destination);
    link.textContent = "Detalles →";
    content.append(title, meta, link, favoriteButton(destination, true));
    card.append(art, content);
    if (!destination.imageUrl) observeCountryImage(image, destination);
    return card;
  }

  function renderFeaturedDestinationSidebar(destinations) {
    const sidebar = document.querySelector("#destinos-destacados");
    if (!sidebar) return;
    const featuredCodes = ["CO", "ES", "JP", "PE", "IT"];
    const selected = featuredCodes
      .map((code) => destinations.find((destination) => destination.code === code))
      .filter(Boolean);
    const fragment = document.createDocumentFragment();

    selected.forEach((destination) => {
      const cachedImage = getCachedCountryImage(destination.id);
      const item = document.createElement("article");
      item.className = "destination-sidebar-item";
      item.dataset.destinationId = destination.id;

      const photo = document.createElement("a");
      photo.className = "destination-sidebar-photo";
      setCountryPhotoPlaceholder(photo, destination);
      photo.href = cachedImage?.source || destination.imageUrl || destination.fallbackImageUrl || destination.flagUrl || "#";
      photo.target = "_blank";
      photo.rel = "noopener noreferrer";
      photo.setAttribute("aria-label", `Ver foto de ${destination.name}`);

      const image = document.createElement("img");
      image.loading = "lazy";
      image.src = destination.imageUrl || cachedImage?.url || destination.fallbackImageUrl || destination.flagUrl || "";
      image.alt = countryPhotoAlt(destination, cachedImage);
      image.addEventListener("error", () => handleCountryImageError(image, destination));
      photo.append(image);

      const copy = document.createElement("div");
      copy.className = "destination-sidebar-copy";
      const name = document.createElement("a");
      name.className = "destination-sidebar-name";
      name.href = detailPagePath(destination);
      name.textContent = destination.name;
      const region = document.createElement("span");
      region.className = "destination-sidebar-region";
      region.textContent = `${destination.city} · ${destination.region}`;
      copy.append(name, region);

      const credit = createCountryImageCredit(cachedImage, destination);
      if (credit) {
        credit.className = "destination-sidebar-credit";
        credit.textContent = `Foto: ${credit.textContent}`;
        copy.append(credit);
      }

      item.append(photo, copy);
      fragment.append(item);
    });

    sidebar.replaceChildren(fragment);
  }

  function cachedCountryImageFor(destination) {
    return Boolean(getCachedCountryImage(destination.id));
  }

  function countryPhotoAlt(destination, imageData = getCachedCountryImage(destination.id)) {
    return imageData?.place
      ? `Lugar turístico en ${destination.name}: ${imageData.place}`
      : `Paisaje de ${destination.name}`;
  }

  function observeCountryImage(image, destination) {
    const cachedImage = getCachedCountryImage(destination.id);
    if (cachedImage) {
      const container = image.closest(".country-card-image, .country-detail-visual, .favorite-card-image");
      if (container) setCountryPhotoPlaceholder(container, destination);
      image.hidden = false;
      image.src = cachedImage.url;
      image.alt = countryPhotoAlt(destination, cachedImage);
      image.closest(".country-card-image, .country-detail-visual")?.classList.add("has-country-photo");
      const art = image.closest(".country-card-image");
      if (art && !art.querySelector(".photo-credit")) {
        const credit = createCountryImageCredit(cachedImage, destination);
        if (credit) art.append(credit);
      }
      return;
    }
    if (countryImageObserver) {
      countryImageObserver.observe(image);
    } else {
      requestCountryImage(image, destination);
    }
  }

  function requestCountryImage(image, destination) {
    pendingCountryImages.push({ image, destination });
    processCountryImageQueue();
  }

  function processCountryImageQueue() {
    while (imageRequestsInProgress < 4 && pendingCountryImages.length) {
      const { image, destination } = pendingCountryImages.shift();
      if (!image.isConnected) continue;
      imageRequestsInProgress += 1;
      fetchCountryImage(destination)
        .then((imageUrl) => {
          if (!imageUrl) return;
          countryImageCache[destination.id] = imageUrl;
          writeStorage(imageCacheKey, countryImageCache);
          if (image.isConnected) {
            const container = image.closest(".country-card-image, .country-detail-visual");
            if (container) setCountryPhotoPlaceholder(container, destination);
            image.hidden = false;
            image.src = imageUrl.url;
            image.alt = countryPhotoAlt(destination, imageUrl);
            container?.classList.add("has-country-photo");
            if (container?.classList.contains("country-card-image") || container?.classList.contains("country-detail-visual")) {
              const credit = createCountryImageCredit(imageUrl, destination);
              if (credit) container.append(credit);
            }
          }
          if (destination.imageUrl !== imageUrl.url) {
            destination.imageUrl = imageUrl.url;
            writeStorage(destinationCacheKey, { savedAt: Date.now(), items: destinations });
          }
        })
        .catch((error) => {
          console.error(`No se pudo cargar la imagen de ${destination.name}.`, error);
        })
        .finally(() => {
          imageRequestsInProgress -= 1;
          processCountryImageQueue();
        });
    }
  }

  async function fetchCountryImage(destination) {
    const countryName = destination.imageSearchName || destination.name;
    const searches = [
      searchWikimediaImages(`${countryName} ${destination.imageSearchCity || destination.city}`),
      searchWikimediaImages(countryName)
    ];
    const resultSets = await Promise.all(searches);
    const pages = [...new Map(resultSets.flat().map((page) => [page.pageid, page])).values()];
    const excludedTerms = /\b(stamp|map|logo|flag|coat of arms|poster|painting|portrait|illustration|drawing|artwork|book|atlas|coin|banknote|postage|plan of the|plan of|diagram|expedition|narrative|report|meeting|conference|politician|official visit|factory|aircraft|air force|insect|butterfly|moth|bird|animal|fish|flower|plant|botanical specimen|specimen|recipe|food packaging|advertisement|document|manuscript|newspaper|magazine|order of merit|medal|award|ribbon|uniform|presidential|presidencial|president|soldier|military|army|ceremony|parade|battle|war memorial|9.?11|terrorist|terrorism|attack|fire|disaster|flood|tsunami|crash|wreck)\b|\b(?:19|20)\d{2}\.\d{3}[a-z]?\b/i;
    const touristTerms = /\b(landmark|tourist|tourism|unesco|world heritage|archaeological|ruins|temple|castle|fortress|fort|cathedral|basilica|monument|palace|national park|waterfall|mountain|beach|coast|skyline|river|forest|island|village|old town|panorama|lake|desert|bay|architecture|bridge|mosque|church|garden|canyon|volcano|historic|heritage|sanctuary|plaza|shrine|pagoda|colosseum|machu|picchu|taj mahal|eiffel|acropolis|christ the redeemer|sugarloaf|chichen|petra|angkor|fuji|great wall|opera house|tower|falls|archipelago|national monument|citadel|lighthouse|glacier|reef|cave|valley|hot spring|geyser|waterfront|harbor|harbour|old city|national museum|temple complex)\b/i;
    const iconicAttractions = /\b(machu picchu|colosseum|eiffel tower|great wall|taj mahal|chichen itza|christ the redeemer|sugarloaf mountain|petra|angkor wat|mount fuji|sydney opera house|niagara falls|grand canyon|pyramids of giza|burj khalifa|statue of liberty|acropolis|stonehenge|mount everest|iguazu falls|galapagos|santorini|kinkaku-ji|forbidden city|ha long bay|uluru|banff|lake louise|plaza de armas|sagrada familia|alhambra|tower of london|notre-dame)\b/i;
    const locationWords = [countryName, destination.name, destination.imageSearchCity, destination.city]
      .filter((name) => typeof name === "string" && name.length > 2)
      .map((name) => normalize(name).toLocaleLowerCase("en"));
    const page = pages
      .filter((item) => item.imageinfo?.[0]?.thumburl && !excludedTerms.test(item.title))
      .map((item) => {
        const title = normalize(item.title).replace(/[_-]+/g, " ").toLocaleLowerCase("en");
        const locationScore = locationWords.reduce((score, name) => score + Number(title.includes(name)) * (name === normalize(destination.imageSearchCity || destination.city).toLocaleLowerCase("en") ? 5 : 4), 0);
        const attractionScore = touristTerms.test(title) ? 12 : 0;
        const iconicScore = iconicAttractions.test(title) ? 12 : 0;
        return { item, score: locationScore + attractionScore + iconicScore };
      })
      .filter((result) => result.score >= 10)
      .sort((first, second) => second.score - first.score)[0]?.item;
    const imageInfo = page?.imageinfo?.[0];
    if (!imageInfo?.thumburl) return null;
    const creator = (imageInfo.extmetadata?.Artist?.value || "")
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&")
      .trim();
    const license = imageInfo.extmetadata?.LicenseShortName?.value || "";
    return {
      url: imageInfo.thumburl,
      place: page.title.replace(/^File:/i, "").replace(/\.[^.]+$/, "").replace(/[_]+/g, " "),
      creator,
      license,
      source: new URL(`/wiki/${page.title.replace(/ /g, "_")}`, "https://commons.wikimedia.org").href
    };
  }

  async function fetchCountryHighlights(destination) {
    const countryName = destination.imageSearchName || destination.name;
    const cityName = destination.imageSearchCity || destination.city;
    const curatedPlaces = countryTouristPlaces[destination.code];
    if (curatedPlaces) {
      const excludedTerms = /\b(stamp|map|logo|flag|coat of arms|poster|painting|portrait|illustration|drawing|artwork|book|atlas|coin|banknote|postage|diagram|meeting|conference|politician|factory|aircraft|insect|butterfly|moth|bird|animal|fish|flower|plant|specimen|recipe|advertisement|document|manuscript|newspaper|magazine|medal|award|uniform|president|soldier|military|army|ceremony|parade|battle|war memorial|terrorism|attack|disaster|flood|tsunami|crash|wreck|sign|illinois|county|habs)\b|\b(?:19|20)\d{2}\.\d{3}[a-z]?\b/i;
      const genericWords = new Set(["national", "park", "island", "islands", "mountain", "mount", "river", "lake", "beach", "waterfall", "temple", "city", "old", "historic", "landscape", "coast", "valley", "falls", "forest"]);
      const candidateGroups = await Promise.all(curatedPlaces.map(async ([label, query]) => {
        const pages = await searchWikimediaImages(query);
        const placeWords = normalize(query)
          .split(/[^a-z0-9]+/)
          .filter((word) => word.length > 2 && !genericWords.has(word) && !normalize(countryName).includes(word));
        return pages
          .filter((page) => page.imageinfo?.[0]?.thumburl && !excludedTerms.test(page.title))
          .map((page) => {
            const title = normalize(page.title).replace(/[_-]+/g, " ").toLocaleLowerCase("en");
            const matchedWords = placeWords.filter((word) => title.includes(word));
            const scenicScore = Number(/\b(sunrise|sunset|panorama|panoramic|view|scenic|beautiful|colorful|colou?rful|turquoise|lagoon|terraces|waterfall|glacier|island|desert|dunes|mountain|lake|beach|falls|national park|old town|historic)\b/i.test(title));
            return { page, label, score: matchedWords.length * 5 + scenicScore, matchedWords: matchedWords.length };
          })
          .filter((result) => result.matchedWords > 0)
          .sort((first, second) => second.score - first.score);
      }));
      const selected = [];
      const usedPageIds = new Set();
      candidateGroups.forEach((group) => {
        const result = group.find((candidate) => !usedPageIds.has(candidate.page.pageid));
        if (!result) return;
        usedPageIds.add(result.page.pageid);
        selected.push({ page: result.page, label: result.label });
      });
      return selected.map(({ page, label }) => countryHighlightFromPage(page, label));
    }
    const resultSets = await Promise.all([
      searchWikimediaImages(`${countryName} ${cityName}`),
      searchWikimediaImages(`${countryName} UNESCO world heritage landmark`),
      searchWikimediaImages(`${countryName} mountain lake waterfall landscape`),
      searchWikimediaImages(`${countryName} island beach coast`),
      searchWikimediaImages(`${countryName} national park scenic landscape`),
      searchWikimediaImages(`${countryName} famous monument panorama`)
    ]);
    const excludedTerms = /\b(stamp|map|logo|flag|coat of arms|poster|painting|portrait|illustration|drawing|artwork|book|atlas|coin|banknote|postage|diagram|expedition|meeting|conference|politician|factory|aircraft|insect|butterfly|moth|bird|animal|fish|flower|plant|specimen|recipe|advertisement|document|manuscript|newspaper|magazine|medal|award|uniform|president|soldier|troop|military|army|ceremony|parade|battle|war memorial|terrorist|terrorism|attack|disaster|flood|tsunami|crash|wreck|sign|illinois|county|habs|united states|landing craft|invasion|combat|wwii)\b|\b(?:19|20)\d{2}\.\d{3}[a-z]?\b/i;
    const touristTerms = /\b(landmark|tourist|tourism|unesco|world heritage|archaeological|ruins|temple|castle|fortress|fort|cathedral|basilica|monument|palace|national park|waterfall|mountain|beach|coast|skyline|river|forest|island|village|old town|panorama|lake|desert|bay|architecture|bridge|mosque|church|garden|canyon|volcano|historic|heritage|sanctuary|plaza|shrine|pagoda|colosseum|machu|picchu|taj mahal|eiffel|acropolis|christ the redeemer|sugarloaf|chichen|petra|angkor|fuji|great wall|opera house|tower|falls|archipelago|citadel|lighthouse|glacier|reef|cave|valley|hot spring|geyser|waterfront|harbor|harbour|old city|temple complex|cityscape|historic centre|historic center|viewpoint|landscape|scenic|park|historic place|parque|playa|cascada|salto|paisaje|mirador|costa|montana|bosque|centro historico)\b/i;
    const locationWords = [countryName, destination.name, cityName]
      .filter((name) => typeof name === "string" && name.length > 2)
      .map((name) => normalize(name).toLocaleLowerCase("en"));
    const candidateGroups = resultSets.map((pages) => pages
      .filter((page) => page.imageinfo?.[0]?.thumburl && !excludedTerms.test(page.title))
      .map((page) => {
        const title = normalize(page.title).replace(/[_-]+/g, " ").toLocaleLowerCase("en");
        const isTouristPlace = touristTerms.test(title);
        const locationScore = locationWords.reduce((score, name) => score + Number(title.includes(name)) * (name === normalize(cityName).toLocaleLowerCase("en") ? 4 : 3), 0);
        return { page, score: (isTouristPlace ? 10 : 0) + locationScore, isTouristPlace, locationScore };
      })
      .filter((result) => result.isTouristPlace && result.score >= 10 && result.locationScore > 0)
      .sort((first, second) => second.score - first.score));
    const selectedPages = [];
    const seenPageIds = new Set();
    const selectedPlaceTitles = [];
    for (let index = 0; selectedPages.length < 6 && index < 6; index += 1) {
      candidateGroups.forEach((group) => {
        const result = group[index];
        if (
          !result ||
          seenPageIds.has(result.page.pageid) ||
          selectedPages.length >= 6 ||
          isDuplicateAttractionTitle(result.page.title, selectedPlaceTitles)
        ) return;
        seenPageIds.add(result.page.pageid);
        selectedPlaceTitles.push(result.page.title);
        selectedPages.push(result.page);
      });
    }
    return selectedPages.map((page) => countryHighlightFromPage(page));
  }

  function isDuplicateAttractionTitle(title, existingTitles) {
    const ignoredWords = new Set(["the", "and", "for", "from", "with", "view", "photo", "image", "landscape", "panoramic", "national", "park", "mountain", "lake", "beach", "river", "falls", "waterfall", "historic", "old", "city", "town"]);
    const words = normalize(title.replace(/^File:/i, "").replace(/\.[^.]+$/, ""))
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !ignoredWords.has(word) && !/^\d+$/.test(word));
    if (!words.length) return false;
    return existingTitles.some((existingTitle) => {
      const existingWords = normalize(existingTitle.replace(/^File:/i, "").replace(/\.[^.]+$/, ""))
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 2 && !ignoredWords.has(word) && !/^\d+$/.test(word));
      const sharedWords = words.filter((word) => existingWords.includes(word)).length;
      return sharedWords / Math.min(words.length, existingWords.length) >= .65;
    });
  }

  function countryHighlightFromPage(page, label) {
    const imageInfo = page.imageinfo[0];
    const creator = (imageInfo.extmetadata?.Artist?.value || "")
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&")
      .trim();
    return {
      url: imageInfo.thumburl,
      place: label || page.title.replace(/^File:/i, "").replace(/\.[^.]+$/, "").replace(/[_]+/g, " "),
      creator,
      license: imageInfo.extmetadata?.LicenseShortName?.value || "",
      source: new URL(`/wiki/${page.title.replace(/ /g, "_")}`, "https://commons.wikimedia.org").href
    };
  }

  async function loadCountryHighlights(destination) {
    if (!document.querySelector("[data-country-highlights]")) return;
    const storedHighlightsValue = readStorage(countryHighlightsCacheKey, {});
    const storedHighlights = storedHighlightsValue && typeof storedHighlightsValue === "object" && !Array.isArray(storedHighlightsValue)
      ? storedHighlightsValue
      : {};
    const cached = storedHighlights?.[destination.id];
    if (Array.isArray(cached?.items) && Date.now() - cached.savedAt < 30 * 24 * 60 * 60 * 1000) {
      const container = document.querySelector("[data-country-highlights]");
      if (container) renderCountryHighlights(container, cached.items, destination);
      return;
    }
    let request = countryHighlightRequests.get(destination.id);
    const shouldRender = !request;
    if (!request) {
      request = fetchCountryHighlights(destination);
      countryHighlightRequests.set(destination.id, request);
    }
    try {
      const highlights = await request;
      if (!shouldRender) return;
      const container = document.querySelector("[data-country-highlights]");
      if (!container) return;
      const currentDestination = destinationById(destination.id) || destination;
      if (!highlights.length) {
        container.innerHTML = '<p class="country-highlights-status" role="status">Todavía no encontramos imágenes verificables de lugares turísticos para este país.</p>';
        return;
      }
      renderCountryHighlights(container, highlights, currentDestination);
      writeStorage(countryHighlightsCacheKey, {
        ...storedHighlights,
        [destination.id]: { savedAt: Date.now(), items: highlights }
      });
    } catch (error) {
      if (!shouldRender) return;
      console.error(`No se pudieron cargar los lugares turísticos de ${destination.name}.`, error);
      const container = document.querySelector("[data-country-highlights]");
      if (!container) return;
      if (Array.isArray(cached?.items) && cached.items.length) {
        renderCountryHighlights(container, cached.items, destination);
      } else {
        container.innerHTML = '<p class="country-highlights-status" role="alert">No se pudieron cargar las imágenes. Comprueba tu conexión e inténtalo de nuevo más tarde.</p>';
      }
    } finally {
      if (countryHighlightRequests.get(destination.id) === request) {
        countryHighlightRequests.delete(destination.id);
      }
    }
  }

  function renderCountryHighlights(container, highlights, destination) {
    container.innerHTML = highlights.map((image, index) => `
      <article class="country-highlight-card">
        <a class="country-highlight-image" href="${escapeHtml(image.source)}" target="_blank" rel="noopener noreferrer" aria-label="Ver ${escapeHtml(image.place)} en Wikimedia Commons">
          <img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.place)} en ${escapeHtml(destination.name)}" loading="lazy">
          <span class="country-highlight-number">${String(index + 1).padStart(2, "0")}</span>
        </a>
        <div class="country-highlight-caption">
          <p class="eyebrow">${escapeHtml(destination.name)} · LUGAR PARA DESCUBRIR</p>
          <h3>${escapeHtml(image.place)}</h3>
          ${image.source ? `<a class="country-highlight-credit" href="${escapeHtml(image.source)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml([image.creator ? `Autor: ${image.creator}` : "", image.license ? `Licencia: ${image.license}` : ""].filter(Boolean).join(" · "))}">${escapeHtml([image.creator ? `© ${image.creator}` : "Ver imagen", image.license].filter(Boolean).join(" · "))} ↗</a>` : ""}
        </div>
      </article>`).join("");
    container.querySelectorAll(".country-highlight-image img").forEach((image) => {
      image.addEventListener("error", () => {
        if (!image.complete) return;
        if (image.naturalWidth > 0) {
          image.hidden = false;
          return;
        }
        image.hidden = true;
        const fallback = document.createElement("span");
        fallback.className = "country-image-fallback";
        fallback.setAttribute("role", "img");
        fallback.setAttribute("aria-label", image.alt);
        fallback.textContent = destination.flagEmoji || destination.code;
        image.closest(".country-highlight-image")?.append(fallback);
      });
    });
  }

  function getCachedCountryImage(id) {
    const image = countryImageCache[id];
    if (typeof image === "string") return { url: image, source: "https://commons.wikimedia.org/" };
    return image && typeof image.url === "string" ? image : null;
  }

  function createCountryImageCredit(imageData, destination) {
    if (!imageData?.source) return null;
    const credit = document.createElement("a");
    credit.className = "photo-credit";
    credit.href = imageData.source;
    credit.target = "_blank";
    credit.rel = "noopener noreferrer";
    credit.textContent = imageData.place || "Foto: Wikimedia Commons";
    credit.title = [
      `Imagen de ${destination.name}`,
      imageData.creator ? `Autor: ${imageData.creator}` : "",
      imageData.license ? `Licencia: ${imageData.license}` : ""
    ].filter(Boolean).join(" · ");
    credit.setAttribute("aria-label", credit.title);
    return credit;
  }

  function setupCountryImageLoading() {
    const storedImages = readStorage(imageCacheKey, {});
    countryImageCache = storedImages && typeof storedImages === "object" && !Array.isArray(storedImages)
      ? storedImages
      : {};
    if (typeof IntersectionObserver !== "function") {
      document.querySelectorAll("[data-country-image]").forEach((image) => {
        const destination = destinationById(image.dataset.countryImage);
        if (destination) requestCountryImage(image, destination);
      });
      return;
    }
    countryImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const destination = destinationById(entry.target.dataset.countryImage);
        if (destination) requestCountryImage(entry.target, destination);
      });
    }, { rootMargin: "240px 0px" });
    document.querySelectorAll("[data-country-image]").forEach((image) => {
      const destination = destinationById(image.dataset.countryImage);
      if (destination) observeCountryImage(image, destination);
    });
  }

  function renderCountryCatalog(source) {
    const list = document.querySelector("#lista-destinos");
    if (!list) return;
    const popularDestinations = featuredDestinations();
    const regions = [...new Set(popularDestinations.map((destination) => destination.region))]
      .filter(Boolean)
      .sort((first, second) => first.localeCompare(second, "es"));
    const regionSelect = document.querySelector('.filter-bar select[name="region"]');
    if (regionSelect) {
      const selected = regionSelect.value;
      regionSelect.replaceChildren(new Option("Todas las regiones", ""));
      regions.forEach((region) => regionSelect.add(new Option(region, region)));
      regionSelect.value = selected;
    }
    renderFeaturedDestinationSidebar(popularDestinations);
    const status = document.querySelector("[data-destination-status]");
    const count = document.querySelector("[data-featured-count]");
    if (count) count.textContent = String(popularDestinations.length);
    if (status && source !== "api" && source !== "cache") {
      status.textContent = source === "stale-cache"
        ? "Sin conexión a la API; se muestran destinos guardados anteriormente."
        : "No se pudo conectar con la API. Se muestran los destinos disponibles sin conexión.";
    } else if (status) {
      status.hidden = true;
    }
  }

  function renderCountryDetail({ loadHighlights = true } = {}) {
    const container = document.querySelector("[data-country-detail]");
    if (!container) return;
    const id = detailDestinationId();
    const destination = destinationById(id);
    if (!destination) {
      container.innerHTML = '<div class="empty-state"><h2>Destino no disponible</h2><p>El país no existe o no se pudo cargar su información.</p><a class="btn btn-outline" href="../destinos.html">Volver a destinos</a></div>';
      return;
    }
    document.title = `${destination.name} | AVENTRA`;
    const facts = [
      ["Capital", destination.city],
      ["Región", destination.region],
      ["Subregión", destination.area],
      ["Moneda", destination.currency],
      ["Idiomas", destination.languages],
      ["Población", Number.isFinite(destination.population) ? `${new Intl.NumberFormat("es").format(destination.population)} habitantes` : "No disponible"],
      ["Superficie", Number.isFinite(destination.landArea) ? `${new Intl.NumberFormat("es").format(destination.landArea)} km²` : "No disponible"]
    ].filter(([, value]) => value !== undefined && value !== null && value !== "");
    const factsMarkup = facts.map(([label, value]) =>
      `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`
    ).join("");
    const cachedImage = getCachedCountryImage(destination.id);
    const fallbackImage = destination.fallbackImageUrl
      || (destination.photo ? countryPhotoUrl(destination.photo) : destination.flagUrl);
    const placeholderImage = destination.imageUrl || cachedImage?.url || fallbackImage;
    const fallbackMarkup = destination.flagEmoji
      ? `<span class="country-detail-emoji" role="img" aria-label="Bandera de ${escapeHtml(destination.name)}">${escapeHtml(destination.flagEmoji)}</span>`
      : `<span class="country-detail-code">${escapeHtml(destination.code)}</span>`;
    container.innerHTML = `
      <section class="section-wrap details-section country-api-details">
        <div class="detail-visual country-detail-visual"><img class="country-detail-photo" data-country-image="${escapeHtml(destination.id)}" src="${escapeHtml(placeholderImage || "")}" alt="Paisaje de ${escapeHtml(destination.name)}" fetchpriority="high" decoding="async">${fallbackMarkup}<span class="visual-overline">DESTINO PARA DESCUBRIR</span><strong>${escapeHtml(destination.name)}</strong><span class="visual-subtitle">${escapeHtml(destination.region)} · ${escapeHtml(destination.city)}</span></div>
        <div class="detail-copy">
          <p class="eyebrow">DATOS DEL PAÍS</p><h2>${escapeHtml(destination.name)}</h2>
          <p class="muted">Información geográfica y cultural proporcionada por la API de países.</p>
          <div class="fact-grid">${factsMarkup}</div>
          <div class="button-row"><button class="btn btn-outline" type="button" data-favorite-toggle data-destination-id="${escapeHtml(destination.id)}" aria-pressed="false">♡ Guardar</button><a class="btn btn-primary" href="../nuevo-viaje.html?destino=${encodeURIComponent(destination.id)}">＋ Itinerario</a></div>
          <a class="text-link" href="../clima.html?ciudad=${encodeURIComponent(destination.city)}">⌖ Ver clima de ${escapeHtml(destination.city)}</a>
        </div>
      </section>
      <section class="country-highlights section-wrap" aria-labelledby="country-highlights-title">
        <div class="country-highlights-heading">
          <div><p class="eyebrow">INSPÍRATE PARA EXPLORAR</p><h2 id="country-highlights-title">Los lugares más bonitos de ${escapeHtml(destination.name)}</h2><p class="muted">Una selección de ciudades, paisajes y sitios turísticos para empezar a imaginar tu viaje.</p></div>
          <span class="country-highlights-decoration" aria-hidden="true">✳</span>
        </div>
        <div class="country-highlight-grid" data-country-highlights role="region" aria-label="Galería horizontal de lugares turísticos de ${escapeHtml(destination.name)}" tabindex="0" aria-live="polite">
          <p class="country-highlights-status" role="status">Buscando lugares para descubrir…</p>
        </div>
        <p class="country-highlights-source">Desliza horizontalmente para explorar todos los lugares. Abre cada crédito para consultar autor y licencia.</p>
      </section>
      <section class="travel-guide section-wrap">
        <div class="section-heading"><div><p class="eyebrow">PREPARA TU VIAJE</p><h2>Antes de viajar a ${escapeHtml(destination.name)}</h2><p class="muted">Usa estos datos como punto de partida y confirma los requisitos antes de viajar.</p></div></div>
        <div class="travel-guide-grid">
          <article class="travel-guide-card"><p class="eyebrow">DOCUMENTACIÓN</p><h3>Requisitos de entrada</h3><p>Consulta con la embajada o autoridad migratoria del país los requisitos de visa, pasaporte y salud aplicables a tu nacionalidad.</p></article>
          <article class="travel-guide-card"><p class="eyebrow">CLIMA</p><h3>Pronóstico local</h3><p>Las condiciones pueden variar por temporada y región. Revisa el pronóstico de ${escapeHtml(destination.city)} antes de organizar tu equipaje.</p></article>
          <article class="travel-guide-card"><p class="eyebrow">FUENTE</p><h3>Datos del país</h3><p>Capital, región, moneda, idiomas, superficie y bandera: catálogo World Countries. Las fotos enlazan a Wikimedia Commons y muestran su autor y licencia cuando están disponibles.</p></article>
        </div>
      </section>`;
    const detailImage = container.querySelector("[data-country-image]");
    if (detailImage) {
      const detailVisual = detailImage.closest(".country-detail-visual");
      setCountryPhotoPlaceholder(detailVisual, destination);
      if (destination.imageUrl || cachedImage || fallbackImage) {
        detailVisual?.classList.add("has-country-photo");
      }
      detailImage.alt = destination.imageUrl || cachedImage || !destination.flagUrl
        ? countryPhotoAlt(destination, cachedImage)
        : `Bandera de ${destination.name}`;
      detailImage.addEventListener("load", () => {
        if (!detailImage.naturalWidth) return;
        detailVisual?.style.removeProperty("background-image");
        detailVisual?.classList.add("has-country-photo");
      });
      detailImage.addEventListener("error", () => handleCountryImageError(detailImage, destination));
      if (!cachedImage && !destination.imageUrl) observeCountryImage(detailImage, destination);
      const credit = createCountryImageCredit(cachedImage, destination);
      if (credit) container.querySelector(".country-detail-visual")?.append(credit);
    }
    if (loadHighlights) loadCountryHighlights(destination);
    enhanceFavoriteButtons();
  }

  function renderFavorites() {
    const list = document.querySelector(".favorite-list");
    if (!list) return;
    const favorites = getFavorites();
    const items = favorites.map(destinationById).filter(Boolean);
    list.replaceChildren();
    list.hidden = items.length === 0;

    items.forEach((destination) => {
      const item = document.createElement("article");
      item.className = "favorite-item";
      item.dataset.destinationId = destination.id;

      const art = document.createElement("div");
      art.className = "favorite-card-image";
      const cachedImage = getCachedCountryImage(destination.id);
      setCountryPhotoPlaceholder(art, destination);
      if (destination.imageUrl || cachedImage || destination.flagUrl) {
        const flag = document.createElement("img");
        flag.src = destination.imageUrl || cachedImage?.url || destination.fallbackImageUrl || destination.flagUrl;
        flag.alt = destination.imageUrl || cachedImage
          ? countryPhotoAlt(destination, cachedImage)
          : `Bandera de ${destination.name}`;
        flag.loading = "lazy";
        flag.dataset.countryImage = destination.id;
        flag.addEventListener("error", () => handleCountryImageError(flag, destination));
        art.append(flag);
        const credit = createCountryImageCredit(cachedImage, destination);
        if (credit) art.append(credit);
        if (!destination.imageUrl) observeCountryImage(flag, destination);
      } else if (destination.flagEmoji) {
        art.setAttribute("role", "img");
        art.setAttribute("aria-label", `Bandera de ${destination.name}`);
        art.classList.add("favorite-card-image-fallback");
        art.textContent = destination.flagEmoji;
      } else {
        art.setAttribute("role", "img");
        art.setAttribute("aria-label", `Bandera de ${destination.name}`);
        art.classList.add("favorite-card-image-fallback");
        art.textContent = destination.code;
      }

      const details = document.createElement("div");
      details.className = "favorite-card-content";
      const title = document.createElement("h3");
      title.textContent = destination.name;
      const meta = document.createElement("p");
      meta.textContent = `${destination.city} · ${destination.area}`;
      details.append(title, meta);

      const link = document.createElement("a");
      link.className = "text-link";
      link.href = detailPagePath(destination);
      link.textContent = "Detalles →";

      const remove = document.createElement("button");
      remove.className = "favorite-remove";
      remove.type = "button";
      remove.dataset.removeFavorite = destination.id;
      remove.textContent = "Quitar de favoritos";
      remove.setAttribute("aria-label", `Quitar ${destination.name} de favoritos`);

      const actions = document.createElement("div");
      actions.className = "favorite-card-actions";
      actions.append(link, remove);
      details.append(title, meta, actions);
      item.append(art, details);
      list.append(item);
    });

    const count = document.querySelector(".favorites-section .count-pill");
    if (count) count.textContent = `${items.length} ${items.length === 1 ? "guardado" : "guardados"}`;

    let empty = document.querySelector(".favorites-empty");
    if (!items.length) {
      if (!empty) {
        empty = document.createElement("div");
        empty.className = "empty-state favorites-empty";
        empty.innerHTML = '<span class="empty-icon" aria-hidden="true">♡</span><h3>Aún no tienes favoritos</h3><p>Guarda aquí los destinos que quieres visitar.</p>';
        list.after(empty);
      }
    } else if (empty) {
      empty.remove();
    }
    updateFavoritesScrollControls();
  }

  function updateFavoritesScrollControls() {
    const list = document.querySelector(".favorite-list");
    const controls = document.querySelector(".favorites-scroll-controls");
    if (!list || !controls) return;
    controls.hidden = list.scrollWidth <= list.clientWidth + 1;
  }

  function setupFavoritesScrollControls() {
    const controls = document.querySelector(".favorites-scroll-controls");
    const list = document.querySelector(".favorite-list");
    if (!controls || !list) return;

    controls.addEventListener("click", (event) => {
      const button = event.target.closest("[data-favorites-scroll]");
      if (!button) return;
      const direction = Number(button.dataset.favoritesScroll);
      list.scrollBy({
        left: direction * list.clientWidth * 0.8,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    });

    window.addEventListener("resize", updateFavoritesScrollControls);
    if ("ResizeObserver" in window) {
      new ResizeObserver(updateFavoritesScrollControls).observe(list);
    }
  }

  function toggleFavorite(id) {
    const destination = destinationById(id);
    if (!destination) return;
    const favorites = getFavorites();
    const next = favorites.includes(id)
      ? favorites.filter((favoriteId) => favoriteId !== id)
      : [...favorites, id];
    if (!writeStorage(STORAGE_KEYS.favorites, next)) return;
    renderFavorites();
    renderItineraryFavoriteDestinations();
    document.querySelector("[data-itinerary-search]")?.dispatchEvent(new Event("input"));
    updateFavoriteButtons();
    notify(next.includes(id) ? `${destination.name} se guardó en tus favoritos.` : `${destination.name} se quitó de tus favoritos.`);
  }

  const experienceSearchTerms = [
    { category: "Naturaleza", terms: ["naturaleza", "montana", "montanas", "bosque", "senderismo", "aventura", "aire libre"] },
    { category: "Cultura", terms: ["cultura", "historia", "museo", "museos", "arte", "tradicion"] },
    { category: "Playas", terms: ["playa", "playas", "mar", "relax", "descanso"] },
    { category: "Ciudades", terms: ["ciudad", "ciudades", "urbano", "arquitectura"] },
    { category: "Gastronomía", terms: ["gastronomia", "comida", "sabores"] }
  ];
  const activityExperienceMap = {
    naturaleza: ["Naturaleza"],
    cultura: ["Cultura"],
    playas: ["Playas", "Relax"],
    ciudades: ["Ciudades"],
    gastronomia: ["Gastronomía"]
  };

  function destinationHasExperience(destination, category) {
    const experiences = Array.isArray(destination.experiences) ? destination.experiences : [];
    const normalizedCategory = normalize(category);
    return experiences.some((experience) => {
      const normalizedExperience = normalize(experience);
      if (normalizedCategory === "playas") {
        return normalizedExperience.includes("playa") || normalizedExperience.includes("relax");
      }
      return normalizedExperience === normalizedCategory;
    });
  }

  function destinationMatchesText(destination, query) {
    if (!query) return true;
    const searchableText = [
      destination.name,
      destination.city,
      destination.region,
      destination.area,
      destination.climate,
      ...(Array.isArray(destination.experiences) ? destination.experiences : [])
    ].join(" ");
    const matchesTouristPlace = (countryTouristPlaces[destination.code] || [])
      .some(([place]) => normalize(place).includes(query));
    const relatedCategory = experienceCategoryForQuery(query);
    return normalize(searchableText).includes(query)
      || matchesTouristPlace
      || Boolean(relatedCategory && destinationHasExperience(destination, relatedCategory));
  }

  function matchingTouristPlace(destination, query) {
    return (countryTouristPlaces[destination.code] || [])
      .find(([place]) => normalize(place).includes(query) || query.includes(normalize(place)))?.[0] || "";
  }

  function experienceCategoryForQuery(query) {
    return experienceSearchTerms.find(({ terms }) =>
      terms.some((term) => normalize(term).includes(query) || query.includes(normalize(term)))
    )?.category || "";
  }

  function setupHomeDestinationSearch() {
    const form = document.querySelector(".home-search-form");
    const search = document.querySelector("#home-destination-search");
    const suggestions = document.querySelector("#home-search-suggestions");
    if (!form || !search || !suggestions) return;

    const closeSuggestions = () => {
      suggestions.hidden = true;
      search.setAttribute("aria-expanded", "false");
    };

    const renderSuggestions = () => {
      const query = normalize(search.value.trim());
      suggestions.replaceChildren();
      if (query.length < 2) {
        closeSuggestions();
        return;
      }

      const category = experienceCategoryForQuery(query);
      const matches = featuredDestinations()
        .map((destination) => ({
          destination,
          place: matchingTouristPlace(destination, query)
        }))
        .filter(({ destination, place }) => destinationMatchesText(destination, query)
          || Boolean(place)
          || (category && destinationHasExperience(destination, category)))
        .slice(0, 6);

      if (!matches.length) {
        const empty = document.createElement("li");
        empty.className = "home-search-suggestion-empty";
        empty.textContent = "Sin coincidencias. Prueba con otro destino o experiencia.";
        suggestions.append(empty);
      } else {
        const heading = document.createElement("li");
        heading.className = "home-search-suggestion-heading";
        heading.textContent = category ? "Ideas relacionadas" : "Destinos y lugares";
        suggestions.append(heading);
        matches.forEach(({ destination, place }) => {
          const item = document.createElement("li");
          item.setAttribute("role", "option");
          item.setAttribute("aria-selected", "false");
          const link = document.createElement("a");
          link.href = `paginas/${detailPagePath(destination)}`;
          const name = document.createElement("strong");
          name.textContent = place || destination.name;
          const description = document.createElement("span");
          description.textContent = place
            ? `${destination.name} · ${destination.region}`
            : `${destination.city} · ${destination.region}`;
          link.append(name, description);
          item.append(link);
          suggestions.append(item);
        });
      }

      suggestions.hidden = false;
      search.setAttribute("aria-expanded", "true");
    };

    search.addEventListener("input", renderSuggestions);
    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSuggestions();
      } else if (event.key === "ArrowDown" && !suggestions.hidden) {
        const firstLink = suggestions.querySelector("a");
        if (firstLink) {
          event.preventDefault();
          firstLink.focus();
        }
      }
    });
    document.addEventListener("click", (event) => {
      if (!form.contains(event.target)) closeSuggestions();
    });
  }

  function setupFeaturedDestinationsCarousel() {
    const carousel = document.querySelector("#destinos");
    const track = carousel?.querySelector(".hero-destinations-track");
    const slides = track ? [...track.querySelectorAll(".hero-destination-slide")] : [];
    if (!carousel || !track || slides.length < 2) return;

    let activeSlide = 0;
    let timer = null;
    let pointerInside = false;
    let focusInside = false;

    const stopTimer = () => {
      window.clearInterval(timer);
      timer = null;
    };

    const showSlide = (index) => {
      activeSlide = index;
      track.style.transform = `translateX(-${activeSlide * 50}%)`;
      slides.forEach((slide, slideIndex) => {
        const isVisible = slideIndex === activeSlide;
        slide.setAttribute("aria-hidden", String(!isVisible));
        slide.querySelectorAll("a").forEach((link) => {
          if (isVisible) link.removeAttribute("tabindex");
          else link.setAttribute("tabindex", "-1");
        });
      });
    };

    const startTimer = () => {
      if (timer || document.hidden || pointerInside || focusInside) return;
      timer = window.setInterval(() => {
        showSlide((activeSlide + 1) % slides.length);
      }, 3000);
    };

    showSlide(0);
    startTimer();

    carousel.addEventListener("mouseenter", () => {
      pointerInside = true;
      stopTimer();
    });
    carousel.addEventListener("mouseleave", () => {
      pointerInside = false;
      startTimer();
    });
    carousel.addEventListener("focusin", () => {
      focusInside = true;
      stopTimer();
    });
    carousel.addEventListener("focusout", (event) => {
      if (event.relatedTarget && carousel.contains(event.relatedTarget)) return;
      focusInside = false;
      startTimer();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopTimer();
      else startTimer();
    });
  }

  function setupDestinationFilters() {
    const form = document.querySelector(".filter-bar");
    const list = document.querySelector("#lista-destinos");
    if (!form || !list) return;
    const search = form.querySelector('input[type="search"]');
    const region = form.querySelector('select[name="region"]');
    const experience = form.querySelector('select[name="experience"]');
    const activity = form.querySelector('select[name="activity"]');
    const climate = form.querySelector('select[name="climate"]');
    const empty = document.querySelector(".search-section .empty-state");
    const loadMore = document.querySelector("#cargar-mas-destinos");
    const resultsCount = document.querySelector("[data-destination-results]");
    const batchSize = 6;
    let visibleCount = batchSize;
    let filteredDestinations = featuredDestinations();

    const renderVisibleDestinations = (reset = false) => {
      const previousCount = reset ? 0 : Math.min(visibleCount - batchSize, filteredDestinations.length);
      const visibleDestinations = filteredDestinations.slice(previousCount, visibleCount);
      const fragment = document.createDocumentFragment();
      visibleDestinations.forEach((destination) => fragment.append(createCountryCard(destination)));
      if (reset) list.replaceChildren(fragment);
      else list.append(fragment);

      const shownCount = Math.min(visibleCount, filteredDestinations.length);
      if (resultsCount) {
        resultsCount.textContent = filteredDestinations.length
          ? `Mostrando ${shownCount} de ${filteredDestinations.length} países`
          : "";
      }
      if (loadMore) loadMore.hidden = shownCount >= filteredDestinations.length;
      if (empty) empty.hidden = filteredDestinations.length > 0;
    };

    const applyFilters = () => {
      const query = normalize(search?.value.trim());
      const selectedRegion = normalize(region?.value);
      const selectedExperience = experience?.value || "";
      const selectedActivity = activity?.value || "";
      const selectedClimate = normalize(climate?.value);
      const matchesFilters = (destination) => {
        const matchesRegion = !selectedRegion || normalize(destination.region) === selectedRegion;
        const matchesExperience = !selectedExperience || destinationHasExperience(destination, selectedExperience);
        const requiredActivities = activityExperienceMap[selectedActivity] || [];
        const matchesActivity = !requiredActivities.length || requiredActivities.some((category) =>
          destinationHasExperience(destination, category)
        );
        const matchesClimate = !selectedClimate || normalize(destination.climate) === selectedClimate;
        return matchesRegion && matchesExperience && matchesActivity && matchesClimate;
      };
      filteredDestinations = featuredDestinations().filter((destination) => {
        return destinationMatchesText(destination, query) && matchesFilters(destination);
      });
      document.querySelectorAll(".destination-sidebar-item").forEach((item) => {
        const destination = destinationById(item.dataset.destinationId);
        item.hidden = !(destination && destinationMatchesText(destination, query) && matchesFilters(destination));
      });
      visibleCount = batchSize;
      renderVisibleDestinations(true);
    };

    loadMore?.addEventListener("click", () => {
      visibleCount += batchSize;
      renderVisibleDestinations();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      applyFilters();
    });
    search?.addEventListener("input", applyFilters);
    [region, experience, activity, climate].forEach((select) => select?.addEventListener("change", applyFilters));

    const params = new URLSearchParams(window.location.search);
    [["q", search], ["region", region], ["experience", experience], ["activity", activity], ["climate", climate]]
      .forEach(([name, control]) => {
        const value = params.get(name);
        if (value && control) control.value = value;
      });
    applyFilters();
  }

  function setupBackToTopButton() {
    const button = document.querySelector(".back-to-top");
    if (!button) return;
    const updateVisibility = () => {
      button.hidden = window.scrollY < 400;
    };
    window.addEventListener("scroll", updateVisibility, { passive: true });
    button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
      });
    });
    updateVisibility();
  }

  function setupTermsAcceptance() {
    const endMarker = document.querySelector("[data-terms-acceptance-end]");
    const button = document.querySelector("[data-terms-accept-button]");
    const status = document.querySelector("[data-terms-acceptance-status]");
    if (!endMarker || !button || !status) return;

    const acceptance = readStorage(STORAGE_KEYS.termsAcceptance, null);
    const hasAccepted = typeof acceptance?.acceptedAt === "string";
    if (hasAccepted) {
      button.hidden = true;
      status.textContent = "Ya aceptaste los términos de uso en este navegador.";
      status.hidden = false;
      return;
    }

    const revealButton = () => {
      button.hidden = false;
    };

    if (typeof IntersectionObserver === "function") {
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        revealButton();
        observer.disconnect();
      });
      observer.observe(endMarker);
    } else {
      const revealAtEnd = () => {
        const bounds = endMarker.getBoundingClientRect();
        if (bounds.top > window.innerHeight || bounds.bottom < 0) return;
        revealButton();
        window.removeEventListener("scroll", revealAtEnd);
      };
      window.addEventListener("scroll", revealAtEnd, { passive: true });
      revealAtEnd();
    }

    button.addEventListener("click", () => {
      if (!writeStorage(STORAGE_KEYS.termsAcceptance, { acceptedAt: new Date().toISOString() })) return;
      if (privacyReturnAvailable && window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "../index.html";
      }
    });
  }

  function setupPrivacyReturnNavigation() {
    if (document.querySelector("[data-terms-acceptance-end]")) {
      try {
        privacyReturnAvailable = window.sessionStorage.getItem(PRIVACY_RETURN_KEY) === "1";
        window.sessionStorage.removeItem(PRIVACY_RETURN_KEY);
      } catch (error) {
        console.error("No se pudo recuperar la página anterior a Privacidad y datos.", error);
      }
    }

    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href*="privacidad.html"]');
      if (!link) return;
      const target = new URL(link.href, window.location.href);
      if (target.pathname === window.location.pathname && target.search === window.location.search) return;
      try {
        window.sessionStorage.setItem(PRIVACY_RETURN_KEY, "1");
      } catch (error) {
        console.error("No se pudo guardar la página anterior a Privacidad y datos.", error);
        notify("No se pudo guardar la página de regreso; al aceptar volverás al inicio.", "warning");
      }
    }, true);
  }

  function isoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addDays(dateValue, days) {
    const date = new Date(`${dateValue}T12:00:00`);
    date.setDate(date.getDate() + days);
    return isoDate(date);
  }

  function daysBetween(start, end) {
    const startDate = new Date(`${start}T12:00:00`);
    const endDate = new Date(`${end}T12:00:00`);
    return Math.round((endDate - startDate) / 86400000) + 1;
  }

  function formatDate(dateValue) {
    return new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric" })
      .format(new Date(`${dateValue}T12:00:00`));
  }

  function destinationCurrencyCode(destination) {
    const currencyCode = destination?.currencyCode;
    if (typeof currencyCode === "string" && /^[A-Z]{3}$/.test(currencyCode)) return currencyCode;
    return countryCurrencyCodes[destination?.code] || "COP";
  }

  function tripCurrencyCode(trip) {
    const currencyCode = trip?.currencyCode;
    return trip?.currencyConversionVersion === 1
      && typeof currencyCode === "string"
      && /^[A-Z]{3}$/.test(currencyCode)
      ? currencyCode
      : "COP";
  }

  function currencyLabel(currencyCode) {
    const currencyName = typeof Intl.DisplayNames === "function"
      ? localizedDisplayName(new Intl.DisplayNames(["es"], { type: "currency" }), currencyCode, currencyCode)
      : currencyCode;
    return `${currencyName} (${currencyCode})`;
  }

  function currencyStep(currencyCode) {
    const fractionDigits = currencyFractionDigits(currencyCode);
    return fractionDigits ? `0.${"0".repeat(fractionDigits - 1)}1` : "1";
  }

  function currencyFractionDigits(currencyCode) {
    return new Intl.NumberFormat("es", {
      style: "currency",
      currency: currencyCode
    }).resolvedOptions().maximumFractionDigits;
  }

  function roundCurrencyAmount(amount, currencyCode) {
    const fractionDigits = currencyFractionDigits(currencyCode);
    const factor = 10 ** fractionDigits;
    return Math.round((amount + Number.EPSILON) * factor) / factor;
  }

  async function currencyExchangeRate(baseCurrency, targetCurrency) {
    if (baseCurrency === targetCurrency) return { rate: 1, updatedAt: null };
    if (currencyRatesCache.has(baseCurrency)) {
      const cached = currencyRatesCache.get(baseCurrency);
      if (cached.rates[targetCurrency]) {
        return { rate: cached.rates[targetCurrency], updatedAt: cached.updatedAt };
      }
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    let response;
    try {
      response = await fetchExchangeRate(baseCurrency, targetCurrency);
    } finally {
      window.clearTimeout(timeout);
    }
    const data = response;
    currencyRatesCache.set(baseCurrency, {
      rates: data.rates,
      updatedAt: data.time_last_update_utc || ""
    });
    const rate = data.rate;
    return { rate, updatedAt: data.time_last_update_utc || null };
  }

  async function convertCurrencyAmount(amount, baseCurrency, targetCurrency) {
    const conversion = await currencyExchangeRate(baseCurrency, targetCurrency);
    return {
      amount: roundCurrencyAmount(amount * conversion.rate, targetCurrency),
      ...conversion
    };
  }

  async function convertTripMonetaryValues(trip, sourceCurrency, targetCurrency) {
    const convertAmount = async (value) => {
      const amount = Number(value);
      return Number.isFinite(amount) && amount !== 0
        ? (await convertCurrencyAmount(amount, sourceCurrency, targetCurrency)).amount
        : value;
    };
    const days = await Promise.all(trip.days.map(async (day) => ({
      ...day,
      activities: await Promise.all((Array.isArray(day.activities) ? day.activities : []).map(async (activity) => {
        if (!activity || typeof activity !== "object" || !("cost" in activity)) return activity;
        return { ...activity, cost: await convertAmount(activity.cost) };
      }))
    })));
    let expenses = trip.expenses;
    if (expenses && typeof expenses === "object") {
      expenses = Object.fromEntries(await Promise.all(Object.entries(expenses).map(async ([category, values]) => {
        if (!values || typeof values !== "object") return [category, values];
        return [category, {
          ...values,
          estimated: await convertAmount(values.estimated),
          spent: await convertAmount(values.spent)
        }];
      })));
    }
    return {
      budget: await convertAmount(trip.budget),
      days,
      expenses
    };
  }

  async function migrateLegacyTripCurrencies() {
    const collection = getTripCollection();
    let changed = false;
    let conversionFailed = false;
    for (const trip of collection.items) {
      if (trip.currencyConversionVersion === 1
        && typeof trip.currencyCode === "string"
        && /^[A-Z]{3}$/.test(trip.currencyCode)) continue;
      const destination = destinationById(trip.destinationId);
      if (!destination) continue;
      const targetCurrency = destinationCurrencyCode(destination);
      const sourceCurrency = tripCurrencyCode(trip);
      try {
        const converted = await convertTripMonetaryValues(trip, sourceCurrency, targetCurrency);
        trip.budget = converted.budget;
        trip.days = converted.days;
        trip.expenses = converted.expenses;
      } catch (error) {
        conversionFailed = true;
        console.error(`No se pudo convertir el presupuesto del viaje "${trip.name}".`, error);
        continue;
      }
      trip.currencyCode = targetCurrency;
      trip.currencyConversionVersion = 1;
      changed = true;
    }
    if (changed && !saveTripCollection(collection)) {
      notify("No se pudieron guardar las monedas actualizadas de tus itinerarios.", "error");
      return;
    }
    if (conversionFailed) {
      notify("Algunos itinerarios siguen en pesos colombianos porque no se pudo consultar la tasa de cambio.", "warning");
    }
  }

  function formatMoney(amount, currencyCode = "COP") {
    return new Intl.NumberFormat("es", {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "code"
    }).format(amount || 0);
  }

  function getActivityRecord(activity, index = 0) {
    if (typeof activity === "string") {
      return { text: activity, time: "", duration: "", notes: "", cost: "", category: "activities", completed: false, order: index };
    }
    return {
      text: typeof activity?.text === "string" ? activity.text : "",
      time: typeof activity?.time === "string" ? activity.time : "",
      duration: Number.isFinite(Number(activity?.duration)) && Number(activity.duration) > 0 ? Number(activity.duration) : "",
      notes: typeof activity?.notes === "string" ? activity.notes : "",
      cost: Number.isFinite(Number(activity?.cost)) && Number(activity.cost) > 0 ? Number(activity.cost) : "",
      category: ["transport", "lodging", "food", "activities", "other"].includes(activity?.category) ? activity.category : "activities",
      completed: activity?.completed === true,
      order: Number.isFinite(Number(activity?.order)) ? Number(activity.order) : index
    };
  }

  function orderedActivities(activities) {
    return activities
      .map((activity, index) => ({ activity: getActivityRecord(activity, index), index }))
      .sort((left, right) => {
        if (left.activity.time && right.activity.time) {
          return left.activity.time.localeCompare(right.activity.time)
            || left.activity.order - right.activity.order
            || left.index - right.index;
        }
        if (left.activity.time) return -1;
        if (right.activity.time) return 1;
        return left.activity.order - right.activity.order || left.index - right.index;
      });
  }

  function scheduleOverlapMessage(day) {
    const scheduled = orderedActivities(day.activities || [])
      .filter(({ activity }) => activity.time)
      .map(({ activity }) => {
        const [hours, minutes] = activity.time.split(":").map(Number);
        const start = hours * 60 + minutes;
        return {
          name: activity.text,
          start,
          end: start + (activity.duration || 60)
        };
      });
    let active = scheduled[0];
    for (let index = 1; index < scheduled.length; index += 1) {
      if (scheduled[index].start < active.end) {
        return `Aviso: "${scheduled[index].name}" se cruza con "${active.name}". Revisa los horarios.`;
      }
      if (scheduled[index].end > active.end) active = scheduled[index];
    }
    return "";
  }

  function saveActivityDay(trip, day, successMessage) {
    const warnings = [];
    const overlapMessage = scheduleOverlapMessage(day);
    const expenses = tripExpenseTotals(trip);
    if (overlapMessage) warnings.push(overlapMessage);
    if (trip.budget > 0 && expenses.estimated > trip.budget) {
      warnings.push("El costo estimado del viaje supera el presupuesto definido.");
    }
    if (!saveCurrentTrip(trip)) return false;
    renderItinerary();
    notify(warnings.join(" ") || successMessage, warnings.length ? "warning" : "status");
    return true;
  }

  function isValidTrip(trip) {
    return Boolean(
      trip &&
      typeof trip === "object" &&
      !Array.isArray(trip) &&
      destinationById(trip.destinationId) &&
      typeof trip.name === "string" &&
      typeof trip.start === "string" &&
      typeof trip.end === "string" &&
      Array.isArray(trip.days)
    );
  }

  function createTripId() {
    return window.crypto?.randomUUID?.()
      || `viaje-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function getTripCollection() {
    const stored = readStorage(STORAGE_KEYS.trips, null);
    if (stored && Array.isArray(stored.items)) {
      const items = stored.items.filter(isValidTrip).map((trip) => ({
        ...trip,
        id: typeof trip.id === "string" && trip.id ? trip.id : createTripId()
      }));
      const activeId = items.some((trip) => trip.id === stored.activeId)
        ? stored.activeId
        : items[0]?.id || null;
      const legacyTrip = readStorage(STORAGE_KEYS.trip, null);
      if (isValidTrip(legacyTrip)) {
        const alreadyMigrated = stored.legacyTripMigrated === true || items.some((trip) =>
          (legacyTrip.id && trip.id === legacyTrip.id)
          || (trip.name === legacyTrip.name
            && trip.destinationId === legacyTrip.destinationId
            && trip.start === legacyTrip.start)
        );
        if (!alreadyMigrated) {
          items.push({
            ...legacyTrip,
            id: typeof legacyTrip.id === "string" && legacyTrip.id ? legacyTrip.id : createTripId()
          });
          const collection = { items, activeId, legacyTripMigrated: true };
          saveTripCollection(collection);
          return collection;
        }
        if (stored.legacyTripMigrated !== true) {
          const collection = { items, activeId, legacyTripMigrated: true };
          saveTripCollection(collection);
          return collection;
        }
      }
      return { items, activeId, legacyTripMigrated: stored.legacyTripMigrated === true };
    }

    const legacyTrip = readStorage(STORAGE_KEYS.trip, null);
    if (isValidTrip(legacyTrip)) {
      const migratedTrip = {
        ...legacyTrip,
        id: typeof legacyTrip.id === "string" && legacyTrip.id ? legacyTrip.id : createTripId()
      };
      const collection = { items: [migratedTrip], activeId: migratedTrip.id, legacyTripMigrated: true };
      writeStorage(STORAGE_KEYS.trips, collection);
      return collection;
    }

    return { items: [], activeId: null };
  }

  function saveTripCollection(collection) {
    const stored = readStorage(STORAGE_KEYS.trips, null);
    const savedCollection = stored?.legacyTripMigrated && !collection.legacyTripMigrated
      ? { ...collection, legacyTripMigrated: true }
      : collection;
    return writeStorage(STORAGE_KEYS.trips, savedCollection);
  }

  function saveCurrentTrip(trip) {
    const collection = getTripCollection();
    const tripIndex = collection.items.findIndex((item) => item.id === trip.id);
    if (tripIndex < 0) {
      notify("No se encontró el itinerario que intentas actualizar.", "error");
      return false;
    }
    trip.updatedAt = new Date().toISOString();
    collection.items[tripIndex] = trip;
    return saveTripCollection(collection);
  }

  function saveTrip(trip, replaceId = null) {
    const collection = getTripCollection();
    const savedTrip = { ...trip, id: replaceId || createTripId(), updatedAt: new Date().toISOString() };
    if (replaceId) {
      const tripIndex = collection.items.findIndex((item) => item.id === replaceId);
      if (tripIndex >= 0) collection.items[tripIndex] = savedTrip;
      else collection.items.push(savedTrip);
    } else {
      collection.items.push(savedTrip);
    }
    collection.activeId = savedTrip.id;
    return saveTripCollection(collection);
  }

  function itineraryImage(destination) {
    const cachedImage = getCachedCountryImage(destination.id);
    return destination.imageUrl
      || cachedImage?.url
      || destination.fallbackImageUrl
      || destination.flagUrl
      || "../img/paises/colombia.png";
  }

  function settleImagePlaceholders(root = document) {
    root.querySelectorAll(".trip-image-shell img").forEach((image) => {
      if (!image.complete) return;
      const shell = image.closest(".trip-image-shell");
      if (image.naturalWidth > 0) {
        shell?.classList.remove("is-loading");
        return;
      }
      const fallback = image.dataset.fallbackSrc;
      if (fallback && image.dataset.fallbackApplied !== "true" && image.src !== new URL(fallback, window.location.href).href) {
        image.dataset.fallbackApplied = "true";
        image.src = fallback;
        return;
      }
      shell?.classList.remove("is-loading");
      shell?.classList.add("has-image-error");
      if (image.dataset.loadErrorLogged !== "true") {
        image.dataset.loadErrorLogged = "true";
        console.error("No se pudo cargar la imagen del itinerario.", image.src);
      }
    });
  }

  function dayIsCompleted(day) {
    const activities = Array.isArray(day.activities) ? day.activities : [];
    return day.completed === true || (activities.length > 0 && activities.every((item, index) =>
      getActivityRecord(item, index).completed
    ));
  }

  function tripExpenseTotals(trip) {
    const categories = ["transport", "lodging", "food", "activities", "other"];
    const totals = Object.fromEntries(categories.map((category) => [category, { estimated: 0, spent: 0 }]));
    for (const [category, expense] of Object.entries(trip.expenses || {})) {
      if (!totals[category] || !expense || typeof expense !== "object") continue;
      totals[category].estimated += Math.max(0, Number(expense.estimated) || 0);
      totals[category].spent += Math.max(0, Number(expense.spent) || 0);
    }
    trip.days.forEach((day) => {
      if (day.cancelled === true) return;
      (day.activities || []).forEach((item, index) => {
        const activity = getActivityRecord(item, index);
        const category = totals[activity.category] ? activity.category : "activities";
        totals[category].estimated += Number(activity.cost) || 0;
        if (activity.completed || day.completed === true) totals[category].spent += Number(activity.cost) || 0;
      });
    });
    return {
      categories: totals,
      estimated: Object.values(totals).reduce((sum, item) => sum + item.estimated, 0),
      spent: Object.values(totals).reduce((sum, item) => sum + item.spent, 0)
    };
  }

  function itineraryDayRouteUrl(day, destination) {
    const activities = orderedActivities(day.activities || []).map(({ activity }) => activity.text);
    if (!activities.length) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${destination.city}, ${destination.name}`)}`;
    }
    const locations = activities.map((activity) => `${activity}, ${destination.city}`);
    const params = new URLSearchParams({
      api: "1",
      origin: locations[0],
      destination: locations[locations.length - 1],
      travelmode: "walking"
    });
    if (locations.length > 2) params.set("waypoints", locations.slice(1, -1).join("|"));
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  async function loadItineraryWeather(cityName) {
    if (itineraryWeatherCache.has(cityName)) return itineraryWeatherCache.get(cityName);
    const request = fetchWeatherForecast(cityName, {
        daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
        forecast_days: "16",
        timezone: "auto"
      }).then(({ data }) => data);
    itineraryWeatherCache.set(cityName, request);
    try {
      return await request;
    } catch (error) {
      itineraryWeatherCache.delete(cityName);
      throw error;
    }
  }

  async function renderDayWeather(dayIndex, trip, destination, panel, button) {
    const date = addDays(trip.start, dayIndex);
    panel.hidden = false;
    panel.classList.add("is-loading");
    panel.textContent = `Consultando el clima para ${formatDate(date)}…`;
    button.disabled = true;
    try {
      const forecast = await loadItineraryWeather(destination.city);
      const dayPosition = forecast.daily.time.indexOf(date);
      panel.classList.remove("is-loading");
      if (dayPosition < 0) {
        panel.textContent = "Pronóstico no disponible para esta fecha. El clima suele publicarse con hasta 16 días de anticipación.";
        return;
      }
      const code = forecast.daily.weather_code[dayPosition];
      const [description, icon] = weatherLabels[code] || ["Condiciones variables", "☁"];
      panel.textContent = `${icon} ${description} · Máx. ${Math.round(forecast.daily.temperature_2m_max[dayPosition])} °C · Mín. ${Math.round(forecast.daily.temperature_2m_min[dayPosition])} °C · Lluvia ${forecast.daily.precipitation_probability_max[dayPosition] ?? "—"} %`;
      panel.dataset.loaded = "true";
    } catch (error) {
      panel.classList.remove("is-loading");
      panel.textContent = "No fue posible consultar el clima. Comprueba tu conexión e inténtalo de nuevo.";
      console.error("No se pudo consultar el clima del día del itinerario.", error);
    } finally {
      button.disabled = false;
    }
  }

  function loadTrip() {
    const collection = getTripCollection();
    return collection.items.find((trip) => trip.id === collection.activeId) || null;
  }

  function setupTripForm() {
    const form = document.querySelector(".planner-form");
    if (!form || !form.querySelector('input[type="date"]')) return;
    const [startInput, endInput] = form.querySelectorAll('input[type="date"]');
    const nameInput = form.querySelector('input[name="tripName"]');
    const destinationSelect = form.querySelector('select[name="destination"]');
    const commentsInput = form.querySelector('textarea[name="comments"]');
    const travelersInput = form.querySelector('input[name="travelers"]');
    const budgetInput = form.querySelector('input[name="budget"]');
    const budgetCurrencyLabel = form.querySelector("[data-budget-currency]");
    const budgetSummary = document.querySelector("[data-budget-summary]");
    const budgetRateStatus = form.querySelector("[data-budget-rate-status]");
    const previewImage = document.querySelector("[data-trip-preview-image]");
    const previewFlag = document.querySelector("[data-trip-preview-flag]");
    const previewName = document.querySelector("[data-trip-preview-name]");
    const previewDestination = document.querySelector("[data-trip-preview-destination]");
    const previewDays = document.querySelector("[data-trip-preview-days]");
    const stepSections = [...form.querySelectorAll("[data-planner-step-content]")];
    const stepButtons = [...form.querySelectorAll("[data-planner-step]")];
    const progressFill = form.querySelector("[data-planner-progress]");
    const progressLabel = form.querySelector("[data-planner-progress-label]");
    const stepStatus = form.querySelector("[data-planner-step-status]");
    const backButton = form.querySelector("[data-planner-back]");
    const nextButton = form.querySelector("[data-planner-next]");
    const submitButton = form.querySelector("[data-planner-submit]");
    const successMessage = document.querySelector("[data-trip-success]");
    const successTitle = document.querySelector("[data-trip-success-title]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const editMode = new URLSearchParams(window.location.search).get("edit") === "1";
    const savedTrip = editMode ? loadTrip() : null;
    const formParams = new URLSearchParams(window.location.search);
    const requestedTemplate = itineraryTemplates.find((template) => template.id === formParams.get("plantilla"));
    const requestedDestination = destinationById(formParams.get("destino"))
      || (requestedTemplate && destinationById(requestedTemplate.destinationId));
    const today = isoDate(new Date());
    let currentBudgetCurrency = savedTrip
      ? tripCurrencyCode(savedTrip)
      : "COP";
    let previousDestinationId = "";
    let currencyChangeSequence = 0;
    let currencyConversionPending = false;
    let formDirty = false;
    let formSaved = false;
    let activeStepIndex = 0;
    let highestStepReached = 0;
    const validationFields = [
      nameInput,
      destinationSelect,
      startInput,
      endInput,
      travelersInput,
      budgetInput
    ].filter(Boolean);
    const fieldErrors = new Map();
    validationFields.forEach((input) => {
      const error = document.createElement("p");
      error.className = "planner-field-error";
      error.id = `${input.id}-error`;
      error.hidden = true;
      error.setAttribute("role", "alert");
      input.insertAdjacentElement("afterend", error);
      fieldErrors.set(input, error);
    });
    form.noValidate = true;

    const fieldErrorMessage = (input) => {
      if (input === nameInput && !input.value.trim()) return "Escribe un nombre para tu viaje.";
      if (input === destinationSelect && !input.value) return "Selecciona un destino.";
      if (input === startInput) {
        if (!input.value) return "Selecciona la fecha de inicio.";
        if (input.value < today) return "La fecha de inicio debe ser hoy o posterior.";
      }
      if (input === endInput) {
        if (!input.value) return "Selecciona la fecha de finalización.";
        if (startInput.value && input.value <= startInput.value) return "La fecha final debe ser posterior al inicio.";
        if (startInput.value && daysBetween(startInput.value, input.value) > 60) return "El viaje no puede superar los 60 días.";
      }
      if (input === travelersInput) {
        if (input.validity.valueMissing) return "Indica cuántas personas viajarán.";
        if (input.validity.rangeUnderflow) return "Debe viajar al menos una persona.";
        if (input.validity.rangeOverflow) return "El máximo es de 30 viajeros.";
        if (input.validity.badInput) return "Escribe un número válido de viajeros.";
      }
      if (input === budgetInput) {
        if (input.validity.valueMissing) return "Indica el presupuesto estimado.";
        if (input.validity.rangeUnderflow) return "El presupuesto no puede ser negativo.";
        if (input.validity.badInput) return "Escribe un importe válido.";
        if (input.validity.stepMismatch) return "Ajusta el importe a la moneda seleccionada.";
      }
      if (!input.validity.valid) {
        return input.validity.valueMissing
          ? "Completa este campo."
          : input.validationMessage || "Revisa este valor.";
      }
      return "";
    };
    const validateField = (input) => {
      const message = fieldErrorMessage(input);
      const error = fieldErrors.get(input);
      if (!error) return message;
      error.textContent = message;
      error.hidden = !message;
      if (message) {
        input.setAttribute("aria-invalid", "true");
        const describedBy = new Set((input.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
        describedBy.add(error.id);
        input.setAttribute("aria-describedby", [...describedBy].join(" "));
      } else {
        input.removeAttribute("aria-invalid");
        const describedBy = (input.getAttribute("aria-describedby") || "")
          .split(/\s+/)
          .filter((id) => id && id !== error.id);
        if (describedBy.length) input.setAttribute("aria-describedby", describedBy.join(" "));
        else input.removeAttribute("aria-describedby");
      }
      return message;
    };
    const validateFields = () => {
      let firstInvalidField = null;
      validationFields.forEach((input) => {
        if (validateField(input) && !firstInvalidField) firstInvalidField = input;
      });
      return firstInvalidField;
    };
    const validateStep = (stepIndex) => {
      let firstInvalidField = null;
      validationFields
        .filter((input) => stepSections[stepIndex]?.contains(input))
        .forEach((input) => {
          if (validateField(input) && !firstInvalidField) firstInvalidField = input;
        });
      if (firstInvalidField) firstInvalidField.focus();
      return !firstInvalidField;
    };
    const setActiveStep = (stepIndex, shouldFocus = false) => {
      activeStepIndex = stepIndex;
      const stepLabel = stepButtons[stepIndex]?.querySelector(".planner-step-label")?.textContent.trim() || "";
      const statusText = `Paso ${stepIndex + 1} de ${stepSections.length}: ${stepLabel}`;
      stepSections.forEach((section, index) => {
        section.hidden = index !== stepIndex;
      });
      stepButtons.forEach((button, index) => {
        button.disabled = index > highestStepReached;
        button.classList.toggle("is-active", index === stepIndex);
        button.classList.toggle("is-complete", index < stepIndex);
        if (index === stepIndex) button.setAttribute("aria-current", "step");
        else button.removeAttribute("aria-current");
      });
      if (progressFill) {
        const progress = stepSections.length > 1
          ? stepIndex / (stepSections.length - 1) * 100
          : 100;
        progressFill.style.width = `${progress}%`;
      }
      if (progressLabel) {
        progressLabel.setAttribute("aria-valuenow", String(stepIndex + 1));
        progressLabel.setAttribute("aria-valuetext", statusText);
        progressLabel.textContent = statusText;
      }
      if (stepStatus) stepStatus.textContent = statusText;
      if (backButton) {
        backButton.disabled = stepIndex === 0;
        backButton.hidden = stepIndex === 0;
      }
      if (nextButton) nextButton.hidden = stepIndex === stepSections.length - 1;
      if (submitButton) submitButton.hidden = stepIndex !== stepSections.length - 1;
      form.querySelectorAll("[data-planner-step-only]").forEach((element) => {
        element.hidden = Number(element.dataset.plannerStepOnly) !== stepIndex;
      });
      form.dataset.activeStep = String(stepIndex);
      if (shouldFocus) {
        const heading = stepSections[stepIndex]?.querySelector("h4");
        if (heading) {
          const isMobile = window.matchMedia("(max-width: 700px)").matches;
          heading.tabIndex = -1;
          heading.focus({ preventScroll: true });
          (isMobile ? form : heading).scrollIntoView({
            behavior: prefersReducedMotion || isMobile ? "auto" : "smooth",
            block: "start"
          });
        }
      }
    };

    if (destinationSelect) {
      const previousValue = destinationSelect.value;
      const selectableDestinations = featuredDestinations();
      const savedDestination = savedTrip ? destinationById(savedTrip.destinationId) : null;
      if (savedDestination && !selectableDestinations.some((destination) => destination.id === savedDestination.id)) {
        selectableDestinations.push(savedDestination);
      }
      destinationSelect.replaceChildren(new Option("Selecciona un país", ""));
      selectableDestinations.forEach((destination) => {
        destinationSelect.add(new Option(destination.name, destination.id));
      });
      destinationSelect.value = selectableDestinations.some((destination) => destination.id === previousValue)
        ? previousValue
        : "";
      previousDestinationId = destinationSelect.value;
    }

    startInput.min = today;
    endInput.min = today;

    if (savedTrip) {
      if (nameInput) nameInput.value = savedTrip.name;
      if (destinationSelect) destinationSelect.value = savedTrip.destinationId;
      if (commentsInput) commentsInput.value = savedTrip.comments || "";
      startInput.value = savedTrip.start;
      endInput.value = savedTrip.end;
      if (travelersInput) travelersInput.value = savedTrip.travelers;
      if (budgetInput) budgetInput.value = savedTrip.budget;
    } else {
      if (requestedDestination && destinationSelect) destinationSelect.value = requestedDestination.id;
      if (requestedTemplate) {
        if (nameInput) nameInput.value = requestedTemplate.name;
        const title = form.querySelector(".form-title h3");
        if (title) title.textContent = `Personaliza ${requestedTemplate.name}`;
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) submitButton.innerHTML = 'Guardar mi itinerario <span aria-hidden="true">→</span>';
      }
      if (!startInput.value || startInput.value < today) startInput.value = today;
      if (requestedTemplate) {
        endInput.value = addDays(startInput.value, requestedTemplate.days.length - 1);
      } else if (!endInput.value || endInput.value <= startInput.value) {
        endInput.value = addDays(startInput.value, 4);
      }
    }
    endInput.min = startInput.value || today;

    const updateBudget = () => {
      if (!budgetSummary || !budgetInput) return;
      const currencyCode = currentBudgetCurrency;
      const budget = Number(budgetInput.value) || 0;
      const travelers = Math.max(1, Number(travelersInput?.value) || 1);
      if (budgetCurrencyLabel) budgetCurrencyLabel.textContent = currencyLabel(currencyCode);
      budgetInput.step = currencyStep(currencyCode);
      budgetSummary.textContent = `${formatMoney(budget, currencyCode)} en total · ${formatMoney(budget / travelers, currencyCode)} por viajero`;
    };
    const convertBudgetForDestination = async () => {
      const destination = destinationById(destinationSelect?.value);
      if (!destination) {
        currencyChangeSequence += 1;
        currencyConversionPending = false;
        if (budgetInput) budgetInput.disabled = false;
        previousDestinationId = "";
        updateBudget();
        if (budgetRateStatus) budgetRateStatus.textContent = "";
        updateTripPreview();
        return;
      }

      const targetCurrency = destinationCurrencyCode(destination);
      const sourceCurrency = currentBudgetCurrency;
      const sequence = ++currencyChangeSequence;
      currencyConversionPending = false;
      if (budgetInput) budgetInput.disabled = false;
      updateTripPreview();
      if (sourceCurrency === targetCurrency) {
        previousDestinationId = destination.id;
        updateBudget();
        if (budgetRateStatus) budgetRateStatus.textContent = "";
        return;
      }

      const amount = Number(budgetInput?.value) || 0;
      if (amount <= 0) {
        currentBudgetCurrency = targetCurrency;
        previousDestinationId = destination.id;
        updateBudget();
        if (budgetRateStatus) budgetRateStatus.textContent = "";
        return;
      }

      currencyConversionPending = true;
      if (budgetRateStatus) budgetRateStatus.textContent = `Convirtiendo de ${sourceCurrency} a ${targetCurrency}…`;
      if (budgetSummary) budgetSummary.textContent = "Consultando la tasa de cambio actual…";
      if (budgetInput) budgetInput.disabled = true;
      try {
        const conversion = await convertCurrencyAmount(amount, sourceCurrency, targetCurrency);
        if (sequence !== currencyChangeSequence) return;
        if (budgetInput) budgetInput.value = String(conversion.amount);
        currentBudgetCurrency = targetCurrency;
        previousDestinationId = destination.id;
        updateBudget();
        const rateText = new Intl.NumberFormat("es", { maximumSignificantDigits: 6 }).format(conversion.rate);
        const dateText = conversion.updatedAt
          ? ` · Tasa actualizada ${new Intl.DateTimeFormat("es", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(conversion.updatedAt))}`
          : "";
        if (budgetRateStatus) budgetRateStatus.textContent = `Convertido: 1 ${sourceCurrency} = ${rateText} ${targetCurrency}${dateText}.`;
      } catch (error) {
        if (sequence !== currencyChangeSequence) return;
        destinationSelect.value = previousDestinationId;
        updateBudget();
        updateTripPreview();
        if (budgetRateStatus) budgetRateStatus.textContent = "No se pudo consultar la tasa. Se mantuvo la moneda y el importe anteriores.";
        console.error("No se pudo convertir el presupuesto a la moneda del destino.", error);
        notify("No se pudo obtener la tasa de cambio. Revisa tu conexión e inténtalo de nuevo.", "error");
      } finally {
        if (sequence === currencyChangeSequence) {
          currencyConversionPending = false;
          if (budgetInput) budgetInput.disabled = false;
        }
      }
    };
    const updateTripPreview = () => {
      const destination = destinationById(destinationSelect?.value);
      const tripName = nameInput?.value.trim();
      if (previewName) previewName.textContent = tripName || "Mi próxima aventura";
      if (previewDays) {
        const duration = startInput.value && endInput.value > startInput.value
          ? daysBetween(startInput.value, endInput.value)
          : 0;
        previewDays.textContent = duration
          ? `${duration} ${duration === 1 ? "día" : "días"}`
          : "Fechas por elegir";
      }
      if (previewFlag) previewFlag.textContent = destination?.flagEmoji || destination?.code || "✈";
      if (previewDestination) {
        previewDestination.textContent = destination
          ? `${destination.city} · ${destination.region}`
          : "Elige un destino para comenzar";
      }
      if (previewImage) {
        const cachedImage = destination ? getCachedCountryImage(destination.id) : null;
        const imageUrl = destination
          ? destination.imageUrl || cachedImage?.url || destination.fallbackImageUrl || destination.flagUrl
          : "";
        if (!imageUrl) {
          previewImage.hidden = true;
          previewImage.removeAttribute("src");
          return;
        }
        previewImage.hidden = false;
        previewImage.alt = destination ? `Paisaje de ${destination.name}` : "";
        previewImage.onerror = () => {
          if (destination?.flagUrl && previewImage.src !== destination.flagUrl) {
            previewImage.src = destination.flagUrl;
            return;
          }
          previewImage.hidden = true;
        };
        previewImage.src = imageUrl;
      }
    };
    budgetInput?.addEventListener("input", updateBudget);
    travelersInput?.addEventListener("input", updateBudget);
    nameInput?.addEventListener("input", updateTripPreview);
    destinationSelect?.addEventListener("change", convertBudgetForDestination);
    startInput.addEventListener("change", () => {
      endInput.min = startInput.value;
      if (endInput.value <= startInput.value) endInput.value = addDays(startInput.value, 1);
      updateTripPreview();
    });
    endInput.addEventListener("change", updateTripPreview);
    stepButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetStep = Number(button.dataset.plannerStep);
        if (targetStep > activeStepIndex) {
          for (let index = activeStepIndex; index < targetStep; index += 1) {
            if (!validateStep(index)) return;
          }
          highestStepReached = Math.max(highestStepReached, targetStep);
        }
        setActiveStep(targetStep, true);
      });
    });
    backButton?.addEventListener("click", () => {
      if (activeStepIndex > 0) setActiveStep(activeStepIndex - 1, true);
    });
    nextButton?.addEventListener("click", () => {
      if (!validateStep(activeStepIndex)) return;
      highestStepReached = Math.max(highestStepReached, activeStepIndex + 1);
      setActiveStep(activeStepIndex + 1, true);
    });
    validationFields.forEach((input) => {
      input.addEventListener("input", () => {
        formDirty = true;
        if (!fieldErrors.get(input)?.hidden) validateField(input);
      });
      input.addEventListener("change", () => {
        formDirty = true;
        if (!fieldErrors.get(input)?.hidden) validateField(input);
      });
      input.addEventListener("blur", () => validateField(input));
    });
    window.addEventListener("beforeunload", (event) => {
      if (!formDirty || formSaved) return;
      event.preventDefault();
      event.returnValue = "";
    });
    updateBudget();
    updateTripPreview();
    setActiveStep(0);
    if (destinationSelect?.value) void convertBudgetForDestination();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const firstInvalidField = validateFields();
      if (firstInvalidField) {
        const invalidStep = stepSections.findIndex((section) => section.contains(firstInvalidField));
        if (invalidStep >= 0 && invalidStep !== activeStepIndex) {
          highestStepReached = Math.max(highestStepReached, invalidStep);
          setActiveStep(invalidStep);
        }
        firstInvalidField.focus();
        return;
      }
      if (currencyConversionPending) {
        notify("Espera a que termine la conversión de moneda antes de guardar.", "warning");
        return;
      }
      if (!form.reportValidity()) return;
      if (!nameInput?.value.trim()) {
        notify("Escribe un nombre para el viaje.", "error");
        nameInput?.focus();
        return;
      }
      if (startInput.value < today || endInput.value <= startInput.value) {
        notify("Revisa las fechas: el viaje debe comenzar hoy o más adelante y finalizar después del inicio.", "error");
        (startInput.value < today ? startInput : endInput).focus();
        return;
      }
      const duration = daysBetween(startInput.value, endInput.value);
      if (duration > 60) {
        notify("El itinerario puede tener como máximo 60 días.", "error");
        endInput.focus();
        return;
      }

      const destination = destinationById(destinationSelect?.value);
      if (!destination) {
        notify("Selecciona un destino válido para continuar.", "error");
        destinationSelect?.focus();
        return;
      }
      const existing = savedTrip && Array.isArray(savedTrip.days) ? savedTrip.days : [];
      const logistics = savedTrip?.logistics && typeof savedTrip.logistics === "object"
        ? { ...savedTrip.logistics }
        : null;
      if (logistics && savedTrip.destinationId !== destination.id) {
        delete logistics.hotelSearchCity;
      }
      const currencyCode = destinationCurrencyCode(destination);
      const sourceCurrency = savedTrip
        ? tripCurrencyCode(savedTrip)
        : currencyCode;
      let updatedMonetaryValues = { expenses: savedTrip?.expenses, days: existing };
      if (savedTrip && sourceCurrency !== currencyCode) {
        if (budgetRateStatus) budgetRateStatus.textContent = `Convirtiendo gastos de ${sourceCurrency} a ${currencyCode}…`;
        try {
          updatedMonetaryValues = await convertTripMonetaryValues(savedTrip, sourceCurrency, currencyCode);
        } catch (error) {
          if (budgetRateStatus) budgetRateStatus.textContent = "No se pudo convertir el presupuesto y los gastos existentes.";
          console.error("No se pudieron convertir los gastos del itinerario a la nueva moneda.", error);
          notify("No se pudieron convertir todos los gastos. No se guardaron los cambios.", "error");
          return;
        }
      }
      const trip = {
        ...(savedTrip || {}),
        ...(logistics ? { logistics } : {}),
        name: nameInput?.value.trim() || `Viaje a ${destination.name}`,
        comments: commentsInput?.value.trim() || "",
        destinationId: destination.id,
        currencyCode,
        currencyConversionVersion: 1,
        start: startInput.value,
        end: endInput.value,
        travelers: Math.max(1, Number(travelersInput?.value) || 1),
        budget: Math.max(0, Number(budgetInput?.value) || 0),
        expenses: updatedMonetaryValues.expenses,
        days: Array.from({ length: duration }, (_, index) =>
          updatedMonetaryValues.days[index]
          || { activities: requestedTemplate?.days[index]?.activities.slice() || [] }
        )
      };
      if (!saveTrip(trip, savedTrip?.id || null)) return;
      formSaved = true;
      if (successMessage) successMessage.hidden = false;
      successTitle?.focus();
      form.setAttribute("aria-hidden", "true");
      window.setTimeout(() => {
        window.location.href = "itinerario.html";
      }, 2000);
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function itineraryTemplateCard(template, featured = false) {
    const destination = destinationById(template.destinationId);
    if (!destination) return "";
    const imageFallback = destination.fallbackImageUrl || destination.flagUrl || "../img/paises/colombia.png";
    const categories = [...new Set([template.category, ...(template.categories || [])])];
    return `<article class="itinerary-template-card${featured ? " is-featured" : ""}" data-template-category="${escapeHtml(categories.join(","))}" data-template-search="${escapeHtml(`${template.name} ${destination.name} ${destination.city} ${categories.join(" ")}`.toLocaleLowerCase("es"))}"><a class="itinerary-template-image trip-image-shell is-loading" href="itinerario.html?plantilla=${encodeURIComponent(template.id)}" aria-label="Ver itinerario ${escapeHtml(template.name)}"><img src="${escapeHtml(template.image)}" data-fallback-src="${escapeHtml(imageFallback)}" alt="Paisaje para descubrir en ${escapeHtml(destination.name)}" loading="lazy"><span>${escapeHtml(template.category)}</span></a><div class="itinerary-template-content"><h3>${escapeHtml(template.name)}</h3><p>${escapeHtml(template.description)}</p><div class="itinerary-template-meta"><span>▦ ${template.days.length} días · ${Math.max(0, template.days.length - 1)} noches</span><span>⌖ ${escapeHtml(destination.name)}</span></div><a class="text-link" href="itinerario.html?plantilla=${encodeURIComponent(template.id)}">Ver itinerario <span aria-hidden="true">→</span></a></div></article>`;
  }

  function itineraryFavoriteCard(destination) {
    const image = itineraryImage(destination);
    const imageFallback = destination.fallbackImageUrl || destination.flagUrl || "../img/paises/colombia.png";
    const experiences = Array.isArray(destination.experiences) ? destination.experiences : [];
    const categories = new Set(experiences);
    if (categories.has("Naturaleza") || categories.has("Playas")) categories.add("Aventura");
    if (categories.has("Playas") || categories.has("Gastronomía")) categories.add("Relax");
    const categoryList = [...categories].filter((category) =>
      ["Aventura", "Cultura", "Relax", "Naturaleza", "Ciudades"].includes(category)
    );
    const category = categoryList[0] || "Favorito";
    return `<article class="itinerary-template-card itinerary-favorite-card" data-template-category="${escapeHtml(categoryList.join(","))}" data-template-search="${escapeHtml(`${destination.name} ${destination.city} ${destination.region} ${experiences.join(" ")}`.toLocaleLowerCase("es"))}"><a class="itinerary-template-image trip-image-shell is-loading" href="${escapeHtml(detailPagePath(destination))}" aria-label="Conocer ${escapeHtml(destination.name)}"><img src="${escapeHtml(image)}" data-fallback-src="${escapeHtml(imageFallback)}" alt="Paisaje de ${escapeHtml(destination.name)}" loading="lazy"><span>${escapeHtml(category)}</span></a><div class="itinerary-template-content"><h3>${escapeHtml(destination.name)}</h3><p>${escapeHtml(destination.city)} · ${escapeHtml(destination.region)}${experiences.length ? ` · ${escapeHtml(experiences.join(", "))}` : ""}</p><div class="itinerary-template-meta"><span>♡ En tus favoritos</span><span>⌖ ${escapeHtml(destination.area || destination.region)}</span></div><div class="itinerary-favorite-actions"><a class="text-link" href="nuevo-viaje.html?destino=${encodeURIComponent(destination.id)}">Crear itinerario <span aria-hidden="true">→</span></a><button type="button" class="itinerary-favorite-remove" data-favorite-toggle data-destination-id="${escapeHtml(destination.id)}" aria-label="Quitar ${escapeHtml(destination.name)} de favoritos" aria-pressed="true">♥ Guardado</button></div></div></article>`;
  }

  function renderItineraryFavoriteDestinations() {
    const container = document.querySelector("[data-itinerary-favorites]");
    if (!container) return;
    const count = document.querySelector("[data-itinerary-favorites-count]");
    const empty = document.querySelector("[data-itinerary-favorites-empty]");
    const favorites = getFavorites().map(destinationById).filter(Boolean);
    container.innerHTML = favorites.map(itineraryFavoriteCard).join("");
    settleImagePlaceholders(container);
    if (count) count.textContent = String(favorites.length);
    if (empty) empty.hidden = favorites.length > 0;
    updateFavoriteButtons();
  }

  function renderItineraryDiscovery() {
    const featured = document.querySelector("[data-itinerary-featured]");
    const catalog = document.querySelector("[data-itinerary-catalog]");
    if (!featured || !catalog) return;
    featured.innerHTML = itineraryTemplates.filter((template) => template.featured)
      .map((template) => itineraryTemplateCard(template, true)).join("");
    catalog.innerHTML = itineraryTemplates
      .map((template) => itineraryTemplateCard(template)).join("");
    settleImagePlaceholders(featured);
    settleImagePlaceholders(catalog);
    renderItineraryFavoriteDestinations();
  }

  function setupItineraryTabs() {
    const tabs = [...document.querySelectorAll("[data-itinerary-tab]")];
    const panels = [...document.querySelectorAll("[data-itinerary-panel]")];
    if (!tabs.length || !panels.length) return;
    const tabList = tabs[0].closest(".itinerary-tabs");
    const tabHint = document.querySelector("[data-itinerary-tab-hint]");
    const updateTabHint = () => {
      if (!tabList || !tabHint) return;
      const canScroll = tabList.scrollWidth > tabList.clientWidth + 2;
      const atEnd = tabList.scrollLeft + tabList.clientWidth >= tabList.scrollWidth - 2;
      const hasScrolled = tabList.scrollLeft > 2;
      tabHint.hidden = !canScroll || atEnd;
      tabHint.classList.toggle("is-scrolled", hasScrolled);
      tabHint.innerHTML = hasScrolled
        ? "<span>←</span> Desliza para volver a las secciones anteriores"
        : "Desliza para ver todas las secciones <span>→</span>";
    };
    tabList?.addEventListener("scroll", updateTabHint, { passive: true });
    window.addEventListener("resize", updateTabHint);

    const hashToTab = {
      "#itinerarios-recomendados": "catalog",
      "#mis-itinerarios": "saved"
    };
    const updateLocation = (tabName) => {
      const targetHash = tabName === "catalog"
        ? "#itinerarios-recomendados"
        : tabName === "saved"
          ? "#mis-itinerarios"
          : "";
      const nextUrl = `${window.location.pathname}${window.location.search}${targetHash}`;
      window.history.replaceState(null, "", nextUrl);
    };
    const activateTab = (tabName, updateUrl = false) => {
      const selectedTab = tabs.find((tab) => tab.dataset.itineraryTab === tabName) || tabs[0];
      tabs.forEach((tab) => {
        const selected = tab === selectedTab;
        tab.classList.toggle("is-active", selected);
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.itineraryPanel !== selectedTab.dataset.itineraryTab;
      });
      if (tabList && tabList.scrollWidth > tabList.clientWidth + 2) {
        tabList.scrollTo({ left: selectedTab.offsetLeft - tabList.offsetLeft, behavior: "auto" });
      }
      updateTabHint();
      if (updateUrl) updateLocation(selectedTab.dataset.itineraryTab);
    };

    const initialHashTab = hashToTab[window.location.hash];
    if (initialHashTab) activateTab(initialHashTab);
    else activateTab(tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.itineraryTab);
    requestAnimationFrame(updateTabHint);

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activateTab(tab.dataset.itineraryTab, true));
      tab.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return;
        event.preventDefault();
        const nextIndex = event.key === "Home"
          ? 0
          : event.key === "End"
            ? tabs.length - 1
            : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        tabs[nextIndex].focus();
        activateTab(tabs[nextIndex].dataset.itineraryTab, true);
      });
    });

    window.addEventListener("hashchange", () => {
      const tabName = hashToTab[window.location.hash];
      if (tabName) activateTab(tabName);
    });

    document.querySelectorAll("[data-open-itinerary-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        const tabName = button.dataset.openItineraryTab;
        activateTab(tabName, true);
        tabs.find((tab) => tab.dataset.itineraryTab === tabName)?.focus();
      });
    });
  }

  function setupItineraryDiscovery() {
    const catalog = document.querySelector("[data-itinerary-catalog]");
    const search = document.querySelector("[data-itinerary-search]");
    const empty = document.querySelector("[data-itinerary-empty]");
    const filters = [...document.querySelectorAll("[data-itinerary-filter]")];
    if (!catalog || !search || !empty) return;

    const requestedCategory = new URLSearchParams(window.location.search).get("categoria");
    let activeCategory = filters.some((filter) => filter.dataset.itineraryFilter === requestedCategory)
      ? requestedCategory
      : "Todos";
    filters.forEach((filter) => {
      const isActive = filter.dataset.itineraryFilter === activeCategory;
      filter.classList.toggle("is-active", isActive);
      filter.setAttribute("aria-pressed", String(isActive));
    });
    const applyFilters = () => {
      const query = normalize(search.value.trim());
      let visibleCount = 0;
      catalog.querySelectorAll(".itinerary-template-card").forEach((card) => {
        const categories = card.dataset.templateCategory.split(",");
        const matchesCategory = activeCategory === "Todos" || categories.includes(activeCategory);
        const matchesSearch = normalize(card.dataset.templateSearch).includes(query);
        card.hidden = !(matchesCategory && matchesSearch);
        if (!card.hidden) visibleCount += 1;
      });
      document.querySelectorAll("[data-itinerary-favorites] .itinerary-template-card").forEach((card) => {
        const categories = card.dataset.templateCategory.split(",");
        const matchesCategory = activeCategory === "Todos" || categories.includes(activeCategory);
        const matchesSearch = normalize(card.dataset.templateSearch).includes(query);
        card.hidden = !(matchesCategory && matchesSearch);
        if (!card.hidden) visibleCount += 1;
      });
      empty.hidden = visibleCount > 0;
    };

    filters.forEach((filter) => {
      filter.addEventListener("click", () => {
        activeCategory = filter.dataset.itineraryFilter;
        const url = new URL(window.location.href);
        if (activeCategory === "Todos") url.searchParams.delete("categoria");
        else url.searchParams.set("categoria", activeCategory);
        window.history.replaceState(null, "", url);
        filters.forEach((item) => {
          const isActive = item === filter;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-pressed", String(isActive));
        });
        applyFilters();
      });
    });
    search.addEventListener("input", applyFilters);
    applyFilters();
  }

  function renderItineraryTemplateDetail() {
    const detail = document.querySelector("[data-itinerary-detail]");
    const home = document.querySelector("[data-itinerary-home]");
    if (!detail || !home) return;
    const templateId = new URLSearchParams(window.location.search).get("plantilla");
    const template = itineraryTemplates.find((item) => item.id === templateId);
    if (!template) {
      detail.hidden = true;
      home.hidden = false;
      return;
    }

    const destination = destinationById(template.destinationId);
    if (!destination) return;
    const routeCity = template.routeCity || destination.city;
    home.hidden = true;
    detail.hidden = false;
    document.title = `${template.name} | Itinerario AVENTRA`;
    const daysMarkup = template.days.map((day, index) => {
      const activities = day.activities.map((activity) => `<li>${escapeHtml(activity)}</li>`).join("");
      const dayTitle = day.title.replace(/^Día \d+ · /, "");
      return `<article class="template-day"><span class="template-day-number">${index + 1}</span><div><p>DÍA ${index + 1} · ${escapeHtml(dayTitle)}</p><ul>${activities}</ul></div><img src="${escapeHtml(template.image)}" alt="" loading="lazy"></article>`;
    }).join("");
    const includesMarkup = template.includes.map((item) => `<li><span aria-hidden="true">✓</span>${escapeHtml(item)}</li>`).join("");
    const templateFallbackImage = destination.fallbackImageUrl || destination.flagUrl || "../img/paises/colombia.png";
    detail.innerHTML = `<a class="text-link itinerary-back-link" href="itinerario.html#itinerarios-recomendados">← Volver a itinerarios</a><div class="template-detail-layout"><div class="template-detail-main"><div class="template-detail-hero trip-image-shell is-loading"><img src="${escapeHtml(template.image)}" data-fallback-src="${escapeHtml(templateFallbackImage)}" alt="Paisaje de ${escapeHtml(destination.name)}" fetchpriority="high"><div><p class="eyebrow">${escapeHtml(template.category)} · ${escapeHtml(destination.name)}</p><h1>${escapeHtml(template.name)}</h1><p>${escapeHtml(template.description)}</p></div></div><div class="template-detail-heading"><div><p class="eyebrow">TU VIAJE, DÍA A DÍA</p><h2>Una ruta para descubrir</h2></div><span class="count-pill">${template.days.length} días · ${template.days.length - 1} noches</span></div><div class="template-day-list">${daysMarkup}</div></div><aside class="template-detail-sidebar"><p class="eyebrow">EL PLAN</p><h2>Tu próxima aventura</h2><p class="muted">Usa esta ruta como inspiración y personalízala con tus fechas, presupuesto y viajeros.</p><ul class="template-includes">${includesMarkup}</ul><a class="btn btn-primary btn-wide" href="nuevo-viaje.html?plantilla=${encodeURIComponent(template.id)}&amp;destino=${encodeURIComponent(destination.id)}">Personalizar itinerario <span aria-hidden="true">→</span></a><a class="btn btn-outline btn-wide" href="clima.html?ciudad=${encodeURIComponent(routeCity)}">Consultar clima</a><a class="text-link" href="${escapeHtml(detailPagePath(destination))}">Conocer ${escapeHtml(destination.name)} <span aria-hidden="true">→</span></a></aside></div>`;
  }

  let lastNominatimRequestAt = 0;

  async function fetchHotelService(url, options = {}, timeout = 30000) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeout);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async function searchOpenStreetMapAccommodations(location) {
    const result = await searchOpenStreetMapApi(location, lastNominatimRequestAt);
    lastNominatimRequestAt = result.requestedAt || Date.now();
    return result;
  }

  function accommodationCoordinates(element) {
    const location = element.center || element;
    const latitude = Number(location.lat);
    const longitude = Number(location.lon);
    return Number.isFinite(latitude) && Number.isFinite(longitude)
      ? { latitude, longitude }
      : null;
  }

  function distanceInKilometers(first, second) {
    const radians = (value) => value * Math.PI / 180;
    const latitudeDifference = radians(second.latitude - first.latitude);
    const longitudeDifference = radians(second.longitude - first.longitude);
    const arc = Math.sin(latitudeDifference / 2) ** 2
      + Math.cos(radians(first.latitude)) * Math.cos(radians(second.latitude))
      * Math.sin(longitudeDifference / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
  }

  function safeExternalUrl(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const input = value.trim();
      const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(input) ? input : `https://${input}`);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function accommodationCardMarkup(element, city, center) {
    const tags = element.extratags && typeof element.extratags === "object" ? element.extratags : {};
    const name = typeof element.name === "string" ? element.name.trim() : "";
    if (!name) return "";
    const typeLabels = {
      hotel: "Hotel",
      motel: "Motel",
      guest_house: "Casa de huéspedes",
      hostel: "Hostal",
      apartment: "Apartamento turístico",
      resort: "Resort"
    };
    const type = typeLabels[element.type] || "Alojamiento";
    const starsMatch = typeof tags.stars === "string" ? tags.stars.match(/^\s*([1-5])(?:\s*stars?)?\s*$/i) : null;
    const addressTags = element.address && typeof element.address === "object" ? element.address : {};
    const street = [addressTags.road, addressTags.house_number].filter(Boolean).join(" ");
    const address = [
      street,
      addressTags.suburb || addressTags.neighbourhood || addressTags.city_district,
      addressTags.city || addressTags.town || addressTags.village,
      addressTags.postcode
    ].filter(Boolean).join(", ");
    const coordinates = accommodationCoordinates(element);
    const distance = coordinates ? distanceInKilometers(center, coordinates) : null;
    const distanceLabel = distance === null
      ? ""
      : distance < 1
        ? `${Math.round(distance * 1000)} m`
        : `${distance.toFixed(1)} km`;
    const objectTypes = {
      N: "node",
      W: "way",
      R: "relation",
      node: "node",
      way: "way",
      relation: "relation"
    };
    const objectType = objectTypes[String(element.osm_type || "").toLowerCase()]
      || objectTypes[String(element.osm_type || "").toUpperCase()]
      || "";
    const objectId = Number.isSafeInteger(Number(element.osm_id)) ? Number(element.osm_id) : 0;
    const openStreetMapUrl = objectType && objectId
      ? `https://www.openstreetmap.org/${objectType}/${objectId}`
      : "";
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${city}`)}`;
    const website = safeExternalUrl(tags.website || tags["contact:website"]);
    const phone = tags.phone || tags["contact:phone"];

    return `<article class="hotel-result-card">
      <div class="hotel-result-heading"><span class="hotel-type">${escapeHtml(type)}</span>${distanceLabel ? `<span class="hotel-distance">${escapeHtml(distanceLabel)}</span>` : ""}</div>
      <h5>${escapeHtml(name)}</h5>
      <p class="hotel-result-address">${escapeHtml(address || "Dirección no registrada en OpenStreetMap")}</p>
      <p class="hotel-result-category">${starsMatch ? `Categoría registrada: ${starsMatch[1]} ${starsMatch[1] === "1" ? "estrella" : "estrellas"}` : "Categoría de estrellas no registrada"}</p>
      ${phone ? `<p class="hotel-result-contact">${escapeHtml(phone)}</p>` : ""}
      <div class="hotel-result-links">${website ? `<a href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer">Sitio web</a>` : ""}${openStreetMapUrl ? `<a href="${openStreetMapUrl}" target="_blank" rel="noopener noreferrer">Ver ficha OSM</a>` : ""}<a class="hotel-google-link" href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer">Ver reseñas en Google Maps <span aria-hidden="true">↗</span></a></div>
    </article>`;
  }

  function renderItinerary() {
    const container = document.querySelector("[data-itinerary]");
    if (!container) return;
    const collection = getTripCollection();
    const detailTrip = collection.items.find((item) => item.id === container.dataset.detailTripId) || null;
    const trip = detailTrip || collection.items.find((item) => item.id === collection.activeId) || collection.items[0] || null;
    const destination = trip && destinationById(trip.destinationId);
    const currencyCode = tripCurrencyCode(trip);
    const openDays = new Set(
      [...container.querySelectorAll(".itinerary-day[open]")].map((day) => Number(day.dataset.dayIndex))
    );
    if (!trip || !destination) {
      container.innerHTML = '<div class="empty-state itinerary-empty"><span class="empty-icon" aria-hidden="true">✈</span><h3>Aún no has guardado viajes</h3><p>Cuando crees un itinerario, aparecerá aquí para que puedas retomarlo o editarlo.</p><ol class="itinerary-empty-steps" aria-label="Pasos para planear tu viaje"><li><strong>1. Elige un destino</strong><span>Selecciona el lugar que quieres descubrir.</span></li><li><strong>2. Define tus fechas</strong><span>Indica cuándo empieza y termina el viaje.</span></li><li><strong>3. Añade actividades</strong><span>Organiza tus planes día a día.</span></li></ol><a class="btn btn-primary" href="nuevo-viaje.html">Crear mi primer viaje <span>→</span></a><button type="button" class="btn btn-outline" data-import-trips>Importar copia</button><input type="file" accept="application/json,.json" data-trip-import-file hidden></div>';
      return;
    }

    if (!detailTrip) {
      const sortedTrips = [...collection.items].sort((left, right) => {
        const order = container.dataset.tripSort || "newest";
        if (order === "name") return left.name.localeCompare(right.name, "es");
        return order === "oldest"
          ? left.start.localeCompare(right.start)
          : right.start.localeCompare(left.start);
      });
      const tripsMarkup = sortedTrips.map((item) => {
        const itemDestination = destinationById(item.destinationId);
        const image = item.imageUrl || (itemDestination ? itineraryImage(itemDestination) : "../img/paises/colombia.png");
        const imageFallback = itemDestination?.fallbackImageUrl || itemDestination?.flagUrl || "../img/paises/colombia.png";
        const cancelledCount = item.days.filter((day) => day.cancelled === true).length;
        const completedCount = item.days.filter((day) => day.cancelled !== true && dayIsCompleted(day)).length;
        const activitiesCount = item.days.reduce((total, day) =>
          total + (day.cancelled === true || !Array.isArray(day.activities) ? 0 : day.activities.length), 0);
        const matches = normalize(`${item.name} ${itemDestination?.name || ""} ${itemDestination?.city || ""}`)
          .includes(normalize(container.dataset.tripSearch || ""));
        return `<button class="trip-selector${item.id === collection.activeId ? " is-current" : ""}" type="button" data-select-trip="${escapeHtml(item.id)}" data-trip-search-match="${matches}"><span class="trip-selector-image trip-image-shell is-loading"><img src="${escapeHtml(image)}" data-fallback-src="${escapeHtml(imageFallback)}" alt="" loading="lazy"></span><span class="trip-selector-content"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(itemDestination?.name || "")} · ${escapeHtml(itemDestination?.city || "")}</span><span>${formatDate(item.start)} – ${formatDate(item.end)}</span><span class="trip-selector-meta">${item.days.length} días · ${activitiesCount} actividades</span>${completedCount ? `<span class="trip-card-completed">${completedCount} ${completedCount === 1 ? "día completado" : "días completados"}</span>` : ""}${cancelledCount ? `<span class="trip-card-cancelled">${cancelledCount} ${cancelledCount === 1 ? "día cancelado" : "días cancelados"}</span>` : ""}<span class="trip-selector-open">Ver itinerario <span aria-hidden="true">→</span></span></span></button>`;
      }).join("");
      const hasSearchMatches = sortedTrips.some((item) =>
        normalize(`${item.name} ${destinationById(item.destinationId)?.name || ""} ${destinationById(item.destinationId)?.city || ""}`)
          .includes(normalize(container.dataset.tripSearch || ""))
      );
      container.innerHTML = `<section class="saved-trips" aria-labelledby="saved-trips-title"><div class="saved-trips-heading"><div><p class="eyebrow">TUS AVENTURAS</p><h3 id="saved-trips-title">Mis itinerarios guardados</h3><p class="muted">Busca, ordena y selecciona un viaje para ver sus detalles.</p></div><div class="saved-trips-backup"><button class="btn btn-outline" type="button" data-export-trips>Descargar copia</button><button class="btn btn-outline" type="button" data-import-trips>Importar copia</button><input type="file" accept="application/json,.json" data-trip-import-file hidden></div></div><div class="saved-trips-tools"><label class="itinerary-search"><span aria-hidden="true">⌕</span><span class="sr-only">Buscar viajes guardados</span><input type="search" data-trip-search placeholder="Buscar por viaje o destino" value="${escapeHtml(container.dataset.tripSearch || "")}"></label><label class="trip-sort-label">Ordenar<select data-trip-sort><option value="newest" ${(container.dataset.tripSort || "newest") === "newest" ? "selected" : ""}>Más recientes</option><option value="oldest" ${container.dataset.tripSort === "oldest" ? "selected" : ""}>Más antiguos</option><option value="name" ${container.dataset.tripSort === "name" ? "selected" : ""}>Nombre</option></select></label></div><div class="trip-selector-list" aria-label="Itinerarios guardados">${tripsMarkup}</div><p class="trip-search-empty" ${hasSearchMatches ? "hidden" : ""}>No hay viajes que coincidan con la búsqueda.</p></section>`;
      return;
    }

    const dayStatusInfo = (day) => day.cancelled === true ? "cancelled" : dayIsCompleted(day) ? "completed" : "active";
    const dayStatusLabel = (status) => ({
      active: "Pendiente",
      completed: "Completado",
      cancelled: "Cancelado"
    })[status];
    const categoryNames = {
      transport: "Transporte",
      lodging: "Alojamiento",
      food: "Comida",
      activities: "Actividades",
      other: "Otros"
    };
    const daysMarkup = trip.days.map((day, index) => {
      const activities = Array.isArray(day.activities) ? day.activities : [];
      const status = dayStatusInfo(day);
      const isCancelled = status === "cancelled";
      const isCompleted = status === "completed";
      const sortedActivities = orderedActivities(activities);
      const activityMarkup = sortedActivities.map(({ activity, index: activityIndex }, displayIndex) => {
        const activityMap = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activity.text} ${destination.city}`)}`;
        const completedClass = activity.completed ? " is-completed" : "";
        const completedLabel = activity.completed ? "Marcar pendiente" : "Marcar completada";
        const canMoveUp = displayIndex > 0;
        const canMoveDown = displayIndex < sortedActivities.length - 1;
        const metadata = [
          activity.duration ? `${activity.duration} min` : "",
          activity.cost ? formatMoney(activity.cost, currencyCode) : "",
          categoryNames[activity.category]
        ].filter(Boolean).join(" · ");
        const categoryOptions = Object.entries(categoryNames).map(([value, label]) =>
          `<option value="${value}" ${activity.category === value ? "selected" : ""}>${label}</option>`
        ).join("");
        return `<li class="activity-item${completedClass}"><button type="button" class="activity-complete" data-toggle-activity="${index}" data-activity-index="${activityIndex}" aria-pressed="${activity.completed}" aria-label="${completedLabel}">${activity.completed ? "✓" : ""}</button><div class="activity-item-details"><span>${escapeHtml(activity.text)}</span>${activity.time ? `<time class="activity-time" datetime="${escapeHtml(activity.time)}">${escapeHtml(activity.time)}</time>` : ""}${metadata ? `<small class="activity-meta">${escapeHtml(metadata)}</small>` : ""}${activity.notes ? `<small class="activity-notes">${escapeHtml(activity.notes)}</small>` : ""}</div><details class="activity-editor"><summary>Editar</summary><form class="activity-edit-form" data-day-index="${index}" data-activity-index="${activityIndex}"><label>Hora<input name="time" type="time" value="${escapeHtml(activity.time)}"></label><label>Duración (min)<input name="duration" type="number" min="1" max="1440" step="1" value="${activity.duration || 60}" placeholder="60"></label><label>Categoría<select name="category">${categoryOptions}</select></label><label>Costo (${currencyCode})<input name="cost" type="number" min="0" step="${currencyStep(currencyCode)}" value="${activity.cost}" placeholder="0"></label><label>Notas<textarea name="notes" rows="2" maxlength="300" placeholder="Detalles, dirección o recomendaciones">${escapeHtml(activity.notes)}</textarea></label><button type="submit" class="btn btn-outline">Guardar cambios</button></form></details><a class="activity-map-link" href="${activityMap}" target="_blank" rel="noopener noreferrer" aria-label="Ver ${escapeHtml(activity.text)} en el mapa">Mapa</a><div class="activity-reorder"><button type="button" data-move-activity="${index}" data-activity-index="${activityIndex}" data-direction="-1" aria-label="Mover ${escapeHtml(activity.text)} antes" ${canMoveUp ? "" : "disabled"}>↑</button><button type="button" data-move-activity="${index}" data-activity-index="${activityIndex}" data-direction="1" aria-label="Mover ${escapeHtml(activity.text)} después" ${canMoveDown ? "" : "disabled"}>↓</button></div><button type="button" class="activity-remove" data-remove-activity="${index}" data-activity-index="${activityIndex}" aria-label="Quitar actividad">×</button></li>`;
      }).join("");
      const suggestions = [
        "Visitar un museo",
        "Probar comida local",
        "Recorrer el centro histórico",
        "Explorar la naturaleza",
        "Hacer un tour guiado",
        "Disfrutar un día de playa"
      ].map((suggestion) =>
        `<button class="activity-suggestion" type="button" data-add-suggested-activity="${index}" data-activity-value="${escapeHtml(suggestion)}">${escapeHtml(suggestion)}</button>`
      ).join("");
      const dayStatus = `<span class="day-status-badge is-${status}" data-day-status-label>${dayStatusLabel(status)}</span>`;
      const dayAction = isCancelled
        ? `<button type="button" class="day-resume-button" data-resume-day="${index}">Reanudar día</button>`
        : `<button type="button" class="day-complete-button" data-complete-day="${index}" aria-pressed="${isCompleted}">${isCompleted ? "Reabrir día" : "Marcar día completado"}</button><button type="button" class="day-cancel-button" data-cancel-day="${index}">Cancelar plan del día</button>`;
      const placeholder = isCancelled
        ? '<li class="activity-placeholder">Día cancelado. Tus actividades se conservarán al reanudarlo.</li>'
        : '<li class="activity-placeholder">Todavía no hay actividades.</li>';
      const activitiesContent = isCancelled ? placeholder : activityMarkup || placeholder;
      const planningControls = isCancelled
        ? ""
        : `<form class="activity-form" data-day-index="${index}"><label class="sr-only" for="activity-${index}">Actividad del día ${index + 1}</label><input id="activity-${index}" name="activity" maxlength="100" placeholder="Agregar actividad..." required><label class="sr-only" for="activity-new-time-${index}">Hora de la actividad</label><input id="activity-new-time-${index}" name="time" type="time" aria-label="Hora opcional de la actividad"><label class="sr-only" for="activity-new-duration-${index}">Duración en minutos</label><input id="activity-new-duration-${index}" name="duration" type="number" min="1" max="1440" step="1" value="60" placeholder="Minutos" aria-label="Duración en minutos"><label class="sr-only" for="activity-new-category-${index}">Categoría del gasto</label><select id="activity-new-category-${index}" name="category" aria-label="Categoría de la actividad">${Object.entries(categoryNames).map(([value, label]) => `<option value="${value}" ${value === "activities" ? "selected" : ""}>${label}</option>`).join("")}</select><label class="sr-only" for="activity-new-cost-${index}">Costo en ${currencyCode}</label><input id="activity-new-cost-${index}" name="cost" type="number" min="0" step="${currencyStep(currencyCode)}" placeholder="Costo (${currencyCode})" aria-label="Costo en ${currencyCode}"><label class="sr-only" for="activity-new-notes-${index}">Notas de la actividad</label><input id="activity-new-notes-${index}" name="notes" maxlength="300" placeholder="Notas opcionales"><button class="btn btn-outline" type="submit">Añadir</button></form><div class="activity-suggestions"><span>Ideas para este día</span>${suggestions}</div>`;
      const dayIsOpen = openDays.size ? openDays.has(index) : index === 0;
      const weatherId = `trip-weather-${index + 1}`;
      const routeUrl = itineraryDayRouteUrl(day, destination);
      const mapLabel = activities.length ? "Ver ruta en el mapa" : "Ver destino en el mapa";
      return `<details class="itinerary-day${isCancelled ? " is-cancelled" : ""}${isCompleted ? " is-completed" : ""}" id="trip-day-${index + 1}" data-day-index="${index}" data-day-status="${status}" ${dayIsOpen ? "open" : ""}><summary class="itinerary-day-heading"><span class="day-heading-details"><span class="day-number">DÍA ${index + 1}</span><span class="day-date">${formatDate(addDays(trip.start, index))}</span>${dayStatus}</span><span class="day-summary-hint">${activities.length} ${activities.length === 1 ? "actividad" : "actividades"} <span class="day-chevron" aria-hidden="true">⌄</span></span></summary><div class="itinerary-day-content"><div class="day-actions">${dayAction}<button type="button" class="day-weather-button" data-day-weather="${index}" aria-controls="${weatherId}">Clima del día</button><a class="day-route-link" href="${routeUrl}" target="_blank" rel="noopener noreferrer">${mapLabel}</a></div><p class="day-weather-result" id="${weatherId}" data-weather-day-panel role="status" aria-live="polite" hidden></p><ul class="activity-list">${activitiesContent}</ul>${planningControls}</div></details>`;
    }).join("");

    const dashboardImage = trip.imageUrl || itineraryImage(destination);
    const dashboardFallbackImage = destination.fallbackImageUrl || destination.flagUrl || "../img/paises/colombia.png";
    const destinationMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${destination.city}, ${destination.name}`)}`;
    const daysNavigation = trip.days.map((day, index) => {
      const status = dayStatusInfo(day);
      return `<a href="#trip-day-${index + 1}" data-nav-day-index="${index}" data-day-status="${status}" class="${index === 0 ? "is-active" : ""}"><span>Día ${index + 1}</span><small>${formatDate(addDays(trip.start, index))}</small><small class="dashboard-day-status is-${status}">${dayStatusLabel(status)}</small></a>`;
    }).join("");
    const logistics = trip.logistics || {};
    const hotelSearchCity = typeof logistics.hotelSearchCity === "string" && logistics.hotelSearchCity.trim()
      ? logistics.hotelSearchCity.trim()
      : `${destination.city}, ${destination.name}`;
    const expenses = tripExpenseTotals(trip);
    const budget = Math.max(0, Number(trip.budget) || 0);
    const budgetPercent = budget ? Math.min(100, Math.round(expenses.spent / budget * 100)) : 0;
    const completedDays = trip.days.filter((day) => day.cancelled !== true && dayIsCompleted(day)).length;
    const activeDayCount = trip.days.filter((day) => day.cancelled !== true).length;
    const remainingDays = trip.days.filter((day) => day.cancelled !== true && !dayIsCompleted(day)).length;
    const cancelledDays = trip.days.filter((day) => day.cancelled === true).length;
    const activityTotals = trip.days.reduce((totals, day) => {
      if (day.cancelled === true) return totals;
      (Array.isArray(day.activities) ? day.activities : []).forEach((item, index) => {
        totals.total += 1;
        const activity = getActivityRecord(item, index);
        if (activity.completed || day.completed === true) totals.completed += 1;
      });
      return totals;
    }, { total: 0, completed: 0 });
    const pendingActivities = activityTotals.total - activityTotals.completed;
    const activityProgressPercent = activityTotals.total
      ? Math.round(activityTotals.completed / activityTotals.total * 100)
      : 0;
    const activityProgressText = activityTotals.total
      ? `${activityTotals.completed} de ${activityTotals.total} ${activityTotals.total === 1 ? "actividad completada" : "actividades completadas"} · ${pendingActivities} ${pendingActivities === 1 ? "pendiente" : "pendientes"}`
      : "Aún no has añadido actividades";
    const budgetRemainingText = budget
      ? expenses.spent > budget
        ? `Superaste el presupuesto por ${formatMoney(expenses.spent - budget, currencyCode)}`
        : `Disponible ${formatMoney(Math.max(0, budget - expenses.spent), currencyCode)}`
      : "Define un presupuesto para ver cuánto te queda.";
    const expenseLabels = { transport: "Transporte", lodging: "Alojamiento", food: "Comida", activities: "Actividades", other: "Otros" };
    const expenseRows = Object.entries(expenses.categories).map(([category, values]) => {
      const editable = category !== "activities";
      return `<div class="trip-budget-row" data-budget-category="${category}"><strong>${expenseLabels[category]}</strong>${editable ? `<label>Estimado<input type="number" min="0" step="${currencyStep(currencyCode)}" name="${category}-estimated" value="${values.estimated}" aria-label="${expenseLabels[category]} estimado en ${currencyCode}"></label><label>Gastado<input type="number" min="0" step="${currencyStep(currencyCode)}" name="${category}-spent" value="${values.spent}" aria-label="${expenseLabels[category]} gastado en ${currencyCode}"></label>` : `<span>${formatMoney(values.estimated, currencyCode)}</span><span>${formatMoney(values.spent, currencyCode)}</span>`}</div>`;
    }).join("");
    const saveStatus = trip.updatedAt && !Number.isNaN(Date.parse(trip.updatedAt))
      ? `Guardado ${new Intl.DateTimeFormat("es", { hour: "2-digit", minute: "2-digit" }).format(new Date(trip.updatedAt))}`
      : "Guardado en este dispositivo";
    const activeTripView = ["overview", "budget", "logistics", "agenda"].includes(container.dataset.activeTripView)
      ? container.dataset.activeTripView
      : "overview";
    container.innerHTML = `
      <div class="saved-trips-detail-heading">
        <button class="text-link" type="button" data-back-to-trips>← Mis itinerarios</button>
        <span>Estás viendo: <strong>${escapeHtml(trip.name)}</strong></span>
      </div>
      <div class="trip-dashboard">
        <aside class="trip-dashboard-sidebar">
          <nav class="trip-section-nav" role="tablist" aria-label="Secciones del viaje" aria-orientation="vertical">
            <button class="dashboard-nav-link${activeTripView === "overview" ? " is-active" : ""}" id="trip-tab-overview" type="button" role="tab" aria-selected="${activeTripView === "overview"}" aria-controls="trip-overview" tabindex="${activeTripView === "overview" ? "0" : "-1"}" data-trip-view="overview"><span aria-hidden="true">▦</span> Resumen</button>
            <button class="dashboard-nav-link${activeTripView === "budget" ? " is-active" : ""}" id="trip-tab-budget" type="button" role="tab" aria-selected="${activeTripView === "budget"}" aria-controls="trip-budget-panel" tabindex="${activeTripView === "budget" ? "0" : "-1"}" data-trip-view="budget"><span aria-hidden="true">$</span> Presupuesto</button>
            <button class="dashboard-nav-link${activeTripView === "logistics" ? " is-active" : ""}" id="trip-tab-logistics" type="button" role="tab" aria-selected="${activeTripView === "logistics"}" aria-controls="trip-logistics-panel" tabindex="${activeTripView === "logistics" ? "0" : "-1"}" data-trip-view="logistics"><span aria-hidden="true">✈</span> Transporte y alojamiento</button>
            <button class="dashboard-nav-link${activeTripView === "agenda" ? " is-active" : ""}" id="trip-tab-agenda" type="button" role="tab" aria-selected="${activeTripView === "agenda"}" aria-controls="trip-agenda-panel" tabindex="${activeTripView === "agenda" ? "0" : "-1"}" data-trip-view="agenda"><span aria-hidden="true">▤</span> Planes día a día</button>
          </nav>
          <div class="dashboard-day-nav"><p>MI VIAJE</p>${daysNavigation}</div>
          <a class="dashboard-nav-link" href="clima.html?ciudad=${encodeURIComponent(destination.city)}"><span aria-hidden="true">⌖</span> Clima en ${escapeHtml(destination.city)}</a>
          <a class="dashboard-nav-link" href="${destinationMapUrl}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">↗</span> Mapa del destino</a>
        </aside>
        <div class="trip-dashboard-content">
          <div class="trip-dashboard-cover trip-image-shell is-loading"><img src="${escapeHtml(dashboardImage)}" data-fallback-src="${escapeHtml(dashboardFallbackImage)}" alt="Paisaje para tu viaje a ${escapeHtml(destination.name)}"><div><span class="eyebrow">${escapeHtml(destination.name)} · ${trip.days.length} días</span><h2>${escapeHtml(trip.name)}</h2><p>${escapeHtml(destination.city)} · ${formatDate(trip.start)} – ${formatDate(trip.end)}</p></div></div>
          <section class="trip-view-panel trip-overview" id="trip-overview" role="tabpanel" aria-labelledby="trip-tab-overview" tabindex="0" data-trip-panel="overview"${activeTripView === "overview" ? "" : " hidden"}>
            <div class="trip-overview-heading"><div><p class="eyebrow">RESUMEN DEL VIAJE</p><h3>Todo listo para descubrir</h3></div><span class="trip-travelers">♙ ${trip.travelers} ${trip.travelers === 1 ? "viajero" : "viajeros"}</span></div>
            <div class="trip-summary"><span>◷ ${trip.days.length} ${trip.days.length === 1 ? "día" : "días"}</span><span>▣ ${trip.days.length - 1} ${trip.days.length === 2 ? "noche" : "noches"}</span><span>⌖ ${escapeHtml(destination.name)}</span><span>Días completados <strong data-completed-day-count>${completedDays} / ${activeDayCount}</strong></span><span>Saldo gastado <strong>${formatMoney(expenses.spent, currencyCode)}</strong></span></div>
            ${trip.comments ? `<p class="trip-planner-notes"><strong>Notas del viaje</strong><span>${escapeHtml(trip.comments)}</span></p>` : ""}
            <div class="trip-progress" role="progressbar" aria-label="Progreso de los días no cancelados" aria-valuemin="0" aria-valuemax="${activeDayCount || 1}" aria-valuenow="${Math.min(completedDays, activeDayCount)}"><span style="width:${activeDayCount ? Math.round(completedDays / activeDayCount * 100) : 0}%"></span></div>
            <div class="trip-progress-copy"><span>${completedDays} ${completedDays === 1 ? "día completado" : "días completados"}</span><span>${remainingDays} ${remainingDays === 1 ? "día pendiente" : "días pendientes"} · ${cancelledDays} ${cancelledDays === 1 ? "día cancelado" : "días cancelados"}</span></div>
            <div class="trip-progress-copy"><span>Actividades</span><span>${activityProgressText}</span></div>
            <div class="trip-progress" role="progressbar" aria-label="Progreso de las actividades" aria-valuemin="0" aria-valuemax="${activityTotals.total || 1}" aria-valuenow="${activityTotals.completed}"><span style="width:${activityProgressPercent}%"></span></div>
            <div class="trip-budget-overview">
              <div class="trip-progress-copy"><span>Presupuesto gastado</span><span>${budget ? `${formatMoney(expenses.spent, currencyCode)} de ${formatMoney(budget, currencyCode)}` : `${formatMoney(expenses.spent, currencyCode)} gastados`}</span></div>
              <div class="trip-budget-bar${budget && expenses.spent > budget ? " is-over-budget" : ""}" role="progressbar" aria-label="Avance del presupuesto" aria-valuemin="0" aria-valuemax="${budget || 1}" aria-valuenow="${budget ? Math.min(expenses.spent, budget) : 0}"><span style="width:${budgetPercent}%"></span></div>
              <p>${budgetRemainingText}</p>
            </div>
            <span class="trip-save-status" role="status" data-save-status>✓ ${saveStatus}</span>
            <div class="trip-dashboard-actions">
              <a class="btn btn-outline" href="nuevo-viaje.html?edit=1">Editar viaje</a>
              <a class="btn btn-primary" href="empacar.html">Preparar equipaje <span aria-hidden="true">→</span></a>
              <button class="btn btn-outline" type="button" data-print-trip>Imprimir</button>
              <button class="btn btn-outline" type="button" data-export-trips>Respaldar viajes</button>
              <button class="btn btn-danger" type="button" data-delete-trip>Eliminar viaje</button>
            </div>
            <div class="trip-exit-actions"><button class="btn btn-primary" type="button" data-exit-trip>Salir</button><p>Tu itinerario se guarda automáticamente. Al salir, volverás a tus viajes guardados.</p></div>
          </section>
          <section class="trip-view-panel trip-budget-panel" id="trip-budget-panel" role="tabpanel" aria-labelledby="trip-tab-budget" tabindex="0" data-trip-panel="budget"${activeTripView === "budget" ? "" : " hidden"}>
            <section class="trip-budget" aria-labelledby="trip-budget-title">
              <div class="trip-budget-heading"><div><p class="eyebrow">CONTROL DE GASTOS · ${escapeHtml(currencyLabel(currencyCode))}</p><h3 id="trip-budget-title">Presupuesto del viaje</h3></div><span>Tope: ${formatMoney(budget, currencyCode)}</span></div>
              <div class="trip-budget-bar${budget && expenses.spent > budget ? " is-over-budget" : ""}" role="progressbar" aria-label="Presupuesto gastado" aria-valuemin="0" aria-valuemax="${budget || 1}" aria-valuenow="${budget ? Math.min(expenses.spent, budget) : 0}"><span style="width:${budgetPercent}%"></span></div>
              <div class="trip-budget-totals"><span>Estimado <strong>${formatMoney(expenses.estimated, currencyCode)}</strong></span><span>Gastado <strong>${formatMoney(expenses.spent, currencyCode)}</strong></span><span>${budget ? (expenses.spent > budget ? `Superaste el presupuesto por ${formatMoney(expenses.spent - budget, currencyCode)}` : `Disponible ${formatMoney(Math.max(0, budget - expenses.spent), currencyCode)}`) : "Edita el viaje para definir un presupuesto."}</span></div>
              <form class="trip-budget-form" aria-label="Desglose de gastos">
                <div class="trip-budget-table-heading"><strong>Categoría</strong><strong>Estimado</strong><strong>Gastado</strong></div>
                ${expenseRows}
                <p class="trip-budget-hint">Los costos de actividades se calculan desde el plan diario y pasan a gastados al marcarlas como completadas.</p>
                <button class="btn btn-outline" type="submit">Guardar gastos</button>
              </form>
            </section>
          </section>
          <section class="trip-view-panel trip-logistics" id="trip-logistics-panel" role="tabpanel" aria-labelledby="trip-tab-logistics" tabindex="0" data-trip-panel="logistics"${activeTripView === "logistics" ? "" : " hidden"}>
            <div><p class="eyebrow">PREPARATIVOS</p><h3 id="trip-logistics-title">Transporte y alojamiento</h3><p>Guarda la información importante del viaje en este dispositivo.</p></div>
            <form class="trip-logistics-form">
              <label>Transporte<textarea name="transport" rows="2" maxlength="500" placeholder="Vuelos, trenes, traslados...">${escapeHtml(logistics.transport || "")}</textarea></label>
              <label>Alojamiento<textarea name="lodging" rows="2" maxlength="500" placeholder="Hotel, dirección, reserva...">${escapeHtml(logistics.lodging || "")}</textarea></label>
              <button type="submit" class="btn btn-outline">Guardar preparativos</button>
            </form>
            <section class="hotel-finder" aria-labelledby="hotel-finder-title">
              <div class="hotel-finder-heading"><div><p class="eyebrow">ALOJAMIENTOS CERCA DE TI</p><h4 id="hotel-finder-title">Encuentra dónde quedarte</h4><p>Busca hoteles y otros alojamientos registrados cerca de tu ciudad o zona.</p></div><span class="hotel-finder-icon" aria-hidden="true">⌖</span></div>
              <form class="hotel-search-form" data-hotel-search-form>
                <label for="hotel-search-city">Ciudad o zona de estancia<input id="hotel-search-city" name="city" type="search" maxlength="120" value="${escapeHtml(hotelSearchCity)}" placeholder="Ej. Medellín, Colombia" autocomplete="off" required></label>
                <button class="btn btn-primary" type="submit">Buscar alojamientos <span aria-hidden="true">→</span></button>
              </form>
              <p class="hotel-search-status" data-hotel-search-status role="status" aria-live="polite">La ciudad se consulta en Photon y Nominatim (OpenStreetMap), sin clave de Google. Su cobertura y disponibilidad pueden variar; las reseñas se abren en Google Maps.</p>
              <div class="hotel-results" data-hotel-results aria-live="polite"></div>
              <nav class="hotel-pagination" data-hotel-pagination aria-label="Páginas de alojamientos" hidden></nav>
              <p class="hotel-attribution">Datos de <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>. La cobertura puede variar; las estrellas, si aparecen, son la categoría registrada del alojamiento, no una valoración de huéspedes.</p>
            </section>
          </section>
          <section class="trip-view-panel trip-day-planner" id="trip-agenda-panel" role="tabpanel" aria-labelledby="trip-tab-agenda" tabindex="0" data-trip-panel="agenda"${activeTripView === "agenda" ? "" : " hidden"}>
            <div class="trip-day-planner-heading"><div><p class="eyebrow">AGENDA</p><h3 id="trip-days-title">Planes día a día</h3><p>${completedDays} completados · ${remainingDays} pendientes</p></div><label>Mostrar<select data-day-filter aria-label="Filtrar días del itinerario"><option value="all">Todos los días</option><option value="active">Pendientes</option><option value="completed">Completados</option><option value="cancelled">Cancelados</option></select></label></div>
            <p class="trip-day-filter-empty" data-day-filter-empty hidden>No hay días en este estado.</p>
            <div class="day-list">${daysMarkup}</div>
          </section>
        </div>
      </div>`;
    settleImagePlaceholders(container);
  }

  function setupTravelAssistant() {
    if (document.querySelector("[data-travel-assistant]")) return;
    const rootPrefix = window.location.pathname.includes("/paginas/lugares/")
      ? "../../"
      : window.location.pathname.includes("/paginas/")
        ? "../"
        : "";
    const widget = document.createElement("section");
    widget.className = "travel-assistant";
    widget.dataset.travelAssistant = "";
    widget.innerHTML = `
      <button class="travel-assistant-toggle" type="button" aria-expanded="false" aria-controls="travel-assistant-panel" aria-label="Abrir asistente de viajes">
        <span aria-hidden="true">✦</span><span class="travel-assistant-toggle-label">Ayuda</span>
      </button>
      <div class="travel-assistant-panel" id="travel-assistant-panel" aria-labelledby="travel-assistant-title" hidden>
        <header class="travel-assistant-header">
          <div><span class="travel-assistant-mark" aria-hidden="true">✦</span><div><h2 id="travel-assistant-title">Asistente AVENTRA</h2><p>Consejos de viaje personalizados</p></div></div>
          <button type="button" class="travel-assistant-close" data-assistant-close aria-label="Cerrar asistente">×</button>
        </header>
        <div class="travel-assistant-messages" data-assistant-messages role="log" aria-live="polite" aria-relevant="additions"></div>
        <div class="travel-assistant-suggestions" data-assistant-suggestions></div>
        <form class="travel-assistant-form" data-assistant-form>
          <label class="sr-only" for="travel-assistant-input">Escribe tu pregunta</label>
          <input id="travel-assistant-input" name="message" maxlength="400" autocomplete="off" placeholder="¿A dónde te gustaría viajar?" required>
          <button type="submit" aria-label="Enviar mensaje">Enviar</button>
        </form>
        <p class="travel-assistant-privacy">Tus mensajes se procesan en este dispositivo; no se envían a terceros.</p>
      </div>`;
    document.body.append(widget);

    const toggle = widget.querySelector(".travel-assistant-toggle");
    const panel = widget.querySelector(".travel-assistant-panel");
    const close = widget.querySelector("[data-assistant-close]");
    const messages = widget.querySelector("[data-assistant-messages]");
    const suggestions = widget.querySelector("[data-assistant-suggestions]");
    const form = widget.querySelector("[data-assistant-form]");
    const input = widget.querySelector("#travel-assistant-input");
    const suggestionOptions = [
      { label: "Recomiéndame un destino", message: "Recomiéndame un destino" },
      { label: "Ver mi itinerario", message: "¿Qué hay en mi itinerario?" },
      { label: "¿Cómo guardo favoritos?", message: "¿Cómo guardo un destino en favoritos?" }
    ];

    const addMessage = (text, type = "assistant", actions = []) => {
      const message = document.createElement("article");
      message.className = `travel-assistant-message is-${type}`;
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      message.append(paragraph);
      if (actions.length) {
        const actionList = document.createElement("div");
        actionList.className = "travel-assistant-actions";
        actions.forEach((action) => {
          const link = document.createElement("a");
          link.className = "travel-assistant-action";
          link.href = action.href;
          link.textContent = action.label;
          actionList.append(link);
        });
        message.append(actionList);
      }
      messages.append(message);
      messages.scrollTop = messages.scrollHeight;
    };

    const setSuggestions = (options = suggestionOptions) => {
      suggestions.replaceChildren();
      options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "travel-assistant-suggestion";
        button.textContent = option.label;
        button.addEventListener("click", () => handleQuestion(option.message));
        suggestions.append(button);
      });
    };

    const answerQuestion = (question) => {
      const query = normalize(question);
      const collection = getTripCollection();
      const trips = collection.items;
      const activeTrip = trips.find((trip) => trip.id === collection.activeId) || trips[0] || null;
      const tripDestination = activeTrip ? destinationById(activeTrip.destinationId) : null;
      const favorites = getFavorites();
      const foundDestination = destinations.find((destination) =>
        query.includes(normalize(destination.name)) || query.includes(normalize(destination.city))
      );
      const actions = (destination) => [
        { label: `Conocer ${destination.name}`, href: `${rootPrefix}paginas/lugares/detalle.html?pais=${encodeURIComponent(destination.id)}` },
        { label: "Crear itinerario", href: `${rootPrefix}paginas/nuevo-viaje.html?destino=${encodeURIComponent(destination.id)}` }
      ];
      const favoriteNames = favorites
        .map((id) => destinationById(id)?.name)
        .filter(Boolean);
      const asksFavoriteCount = /(cuant|numero|total)/.test(query);

      if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey)\b/.test(query)) {
        return {
          text: "¡Hola! Puedo recomendarte destinos, ayudarte con tus favoritos o revisar el itinerario guardado en este dispositivo. ¿Qué tienes en mente?"
        };
      }
      if (/(favorit|guardad)/.test(query) && /(como|agreg|guard|ver|cuant|cual)/.test(query)) {
        if (asksFavoriteCount) {
          const count = favoriteNames.length;
          const response = count
            ? `Tienes ${count} ${count === 1 ? "destino guardado" : "destinos guardados"} en favoritos. Tienes guardados: ${favoriteNames.join(", ")}.`
            : "Tienes 0 destinos guardados en favoritos. Si quieres, podemos explorar opciones que podrían gustarte: visita Destinos o consulta Mis favoritos.";
          return {
            text: response,
            actions: count
              ? [{ label: "Ver mis favoritos", href: `${rootPrefix}paginas/favoritos.html` }]
              : [
                  { label: "Explorar destinos", href: `${rootPrefix}paginas/destinos.html` },
                  { label: "Ver mis favoritos", href: `${rootPrefix}paginas/favoritos.html` }
                ]
          };
        }
        if (/(ver|cuant|cual|mis)/.test(query) && favoriteNames.length) {
          return {
            text: `Tienes ${favoriteNames.length} ${favoriteNames.length === 1 ? "destino favorito" : "destinos favoritos"}: ${favoriteNames.join(", ")}.`,
            actions: [{ label: "Ver mis favoritos", href: `${rootPrefix}paginas/favoritos.html` }]
          };
        }
        return {
          text: "En las tarjetas de destinos pulsa «Guardar» (♡). Para consultarlos o quitarlos, entra en Favoritos.",
          actions: [{ label: "Explorar destinos", href: `${rootPrefix}paginas/destinos.html` }, { label: "Abrir favoritos", href: `${rootPrefix}paginas/favoritos.html` }]
        };
      }
      if (/(itinerario|mi viaje|mis viajes|presupuesto|actividad|actividades|plan diario)/.test(query)) {
        if (!activeTrip) {
          return {
            text: "Aún no tienes un viaje guardado en este dispositivo. Puedes crear uno con destino, fechas, presupuesto y actividades.",
            actions: [{ label: "Crear mi itinerario", href: `${rootPrefix}paginas/nuevo-viaje.html` }]
          };
        }
        const activityCount = activeTrip.days.reduce((total, day) =>
          total + (day.cancelled || !Array.isArray(day.activities) ? 0 : day.activities.length), 0);
        const spent = tripExpenseTotals(activeTrip).spent;
        const budget = Math.max(0, Number(activeTrip.budget) || 0);
        const budgetSummary = budget
          ? ` Has gastado ${formatMoney(spent, tripCurrencyCode(activeTrip))} de ${formatMoney(budget, tripCurrencyCode(activeTrip))}.`
          : ` Llevas ${formatMoney(spent, tripCurrencyCode(activeTrip))} registrados como gasto.`;
        return {
          text: `Tu viaje «${activeTrip.name}»${tripDestination ? ` es a ${tripDestination.name}` : ""}, del ${formatDate(activeTrip.start)} al ${formatDate(activeTrip.end)}. Tiene ${activeTrip.days.length} días y ${activityCount} ${activityCount === 1 ? "actividad" : "actividades"}.${budgetSummary}`,
          actions: [{ label: "Abrir mis itinerarios", href: `${rootPrefix}paginas/itinerario.html#mis-itinerarios` }]
        };
      }
      if (/(clima|tiempo|pronostico|pronostico)/.test(query)) {
        const city = tripDestination?.city || foundDestination?.city || "";
        return {
          text: city
            ? `Puedes consultar el clima de ${city}. El pronóstico necesita conexión a internet.`
            : "Dime qué ciudad o destino te interesa y te ayudo a abrir su pronóstico.",
          actions: city ? [{ label: `Consultar clima en ${city}`, href: `${rootPrefix}paginas/clima.html?ciudad=${encodeURIComponent(city)}` }] : []
        };
      }
      if (/(equipaje|empacar|maleta|que llevo)/.test(query)) {
        return {
          text: "AVENTRA tiene una lista de equipaje que puedes completar y guardar en este dispositivo.",
          actions: [{ label: "Abrir lista de equipaje", href: `${rootPrefix}paginas/empacar.html` }]
        };
      }
      if (/(crear|planear|organizar|nuevo viaje|empezar|comenzar)/.test(query)) {
        return {
          text: "Para crear un viaje, elige el destino, define las fechas, ajusta tu presupuesto y añade notas. Luego podrás organizar las actividades día a día.",
          actions: [{ label: "Crear mi itinerario", href: `${rootPrefix}paginas/nuevo-viaje.html` }]
        };
      }
      if (foundDestination) {
        const experiences = Array.isArray(foundDestination.experiences) && foundDestination.experiences.length
          ? foundDestination.experiences.slice(0, 3).join(", ").toLocaleLowerCase("es")
          : "experiencias locales";
        return {
          text: `${foundDestination.name} tiene como capital ${foundDestination.city} y está en ${foundDestination.area || foundDestination.region}. Es buena opción para disfrutar ${experiences}.`,
          actions: actions(foundDestination)
        };
      }

      const categoryKeywords = [
        { category: "Playas", keywords: ["playa", "playas", "mar", "costa", "relax", "descansar"] },
        { category: "Naturaleza", keywords: ["naturaleza", "montana", "montanas", "bosque", "bosques", "senderismo", "paisaje"] },
        { category: "Cultura", keywords: ["cultura", "historia", "museo", "arte", "tradicion"] },
        { category: "Gastronomía", keywords: ["gastronomia", "comida", "comer", "cocina", "sabores"] },
        { category: "Ciudades", keywords: ["ciudad", "ciudades", "urbano", "arquitectura"] },
        { category: "Aventura", keywords: ["aventura", "aventuras", "actividad", "actividades", "explorar"] }
      ];
      const selectedCategory = categoryKeywords.find((item) =>
        item.keywords.some((keyword) => query.includes(keyword))
      )?.category;
      const recommendations = destinations.filter((destination) => {
        if (!selectedCategory) return true;
        const hasMatchingExperience = (destination.experiences || []).some((experience) =>
          normalize(experience).includes(normalize(selectedCategory))
          || (selectedCategory === "Playas" && normalize(experience).includes("playa"))
        );
        const hasMatchingRoute = itineraryTemplates.some((template) =>
          template.destinationId === destination.id
          && [template.category, ...(template.categories || [])]
            .some((category) => normalize(category).includes(normalize(selectedCategory)))
        );
        return hasMatchingExperience || hasMatchingRoute;
      }).slice(0, 3);
      if (/(recomiend|sugier|destino|viajar|viaje|donde)/.test(query) || selectedCategory) {
        if (!recommendations.length) {
          return { text: "No encontré destinos para ese tipo de experiencia. Prueba con cultura, naturaleza, playas o ciudades." };
        }
        const categoryText = selectedCategory ? ` para disfrutar ${selectedCategory.toLocaleLowerCase("es")}` : "";
        return {
          text: `Por lo que buscas${categoryText}, podrías explorar ${recommendations.map((destination) => `${destination.name} (${destination.city})`).join(", ")}. ¿Quieres conocer alguno?`,
          actions: recommendations.map((destination) => ({
            label: destination.name,
            href: `${rootPrefix}paginas/lugares/detalle.html?pais=${encodeURIComponent(destination.id)}`
          }))
        };
      }
      return {
        text: "Puedo ayudarte a elegir un destino por experiencia, consultar tus favoritos o itinerario, ver el clima y abrir la lista de equipaje. Por ejemplo: «Recomiéndame naturaleza» o «¿Qué hay en mi itinerario?»."
      };
    };

    function handleQuestion(question) {
      const text = question.trim();
      if (!text) return;
      addMessage(text, "user");
      input.value = "";
      setSuggestions([]);
      window.setTimeout(() => {
        const answer = answerQuestion(text);
        addMessage(answer.text, "assistant", answer.actions || []);
        setSuggestions();
      }, 160);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      handleQuestion(input.value);
    });
    toggle.addEventListener("click", () => {
      const isOpen = !panel.hidden;
      panel.hidden = isOpen;
      toggle.setAttribute("aria-expanded", String(!isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Abrir asistente de viajes" : "Cerrar asistente de viajes");
      if (!isOpen) input.focus();
    });
    close.addEventListener("click", () => {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir asistente de viajes");
      toggle.focus();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || panel.hidden) return;
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir asistente de viajes");
      toggle.focus();
    });
    addMessage("¡Hola! Soy el asistente de AVENTRA. Puedo recomendarte destinos y ayudarte a encontrar tus datos de viaje guardados aquí.", "assistant");
    setSuggestions();
  }


  function setupPackingList() {
    const list = document.querySelector("[data-packing-list]");
    const form = document.querySelector("[data-packing-form]");
    if (!list || !form) return;
    const trip = loadTrip();
    const destination = trip && destinationById(trip.destinationId);
    const heading = document.querySelector("[data-packing-trip]");
    if (heading) heading.textContent = trip ? `Lista para ${trip.name}` : "Lista de equipaje";

    const initialItems = [
      { text: "Documentos de identidad", checked: false },
      { text: "Reservas y tiquetes", checked: false },
      { text: "Ropa adecuada al destino", checked: false },
      { text: "Artículos de higiene personal", checked: false },
      { text: "Cargador y adaptador", checked: false },
      { text: "Medicamentos personales", checked: false },
      { text: "Calzado cómodo", checked: false },
      { text: "Protector solar", checked: false },
      { text: "Botella reutilizable", checked: false },
      { text: "Gafas de sol", checked: false },
      { text: "Chaqueta impermeable", checked: false },
      { text: "Cargador portátil", checked: false }
    ];
    let items = readStorage(STORAGE_KEYS.packing, initialItems);
    if (!Array.isArray(items)) items = initialItems;

    const render = () => {
      list.replaceChildren();
      if (!items.length) {
        const empty = document.createElement("li");
        empty.className = "packing-empty";
        empty.textContent = "Tu lista está vacía. Añade lo que necesitas llevar.";
        list.append(empty);
      }
      items.forEach((item, index) => {
        const row = document.createElement("li");
        row.className = item.checked ? "packing-item is-checked" : "packing-item";
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = Boolean(item.checked);
        checkbox.dataset.packingCheck = String(index);
        const text = document.createElement("span");
        text.textContent = item.text;
        label.append(checkbox, text);
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "favorite-remove";
        remove.dataset.removePacking = String(index);
        remove.textContent = "Quitar";
        row.append(label, remove);
        list.append(row);
      });
      const progress = document.querySelector("[data-packing-progress]");
      if (progress) {
        const packed = items.filter((item) => item.checked).length;
        progress.textContent = `${packed} de ${items.length} artículos listos`;
      }
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="packingItem"]');
      const text = input?.value.trim();
      if (!text) return;
      items.push({ text, checked: false });
      if (writeStorage(STORAGE_KEYS.packing, items)) {
        form.reset();
        render();
      }
    });
    list.addEventListener("change", (event) => {
      const checkbox = event.target.closest("[data-packing-check]");
      if (!checkbox) return;
      items[Number(checkbox.dataset.packingCheck)].checked = checkbox.checked;
      if (writeStorage(STORAGE_KEYS.packing, items)) render();
    });
    list.addEventListener("click", (event) => {
      const remove = event.target.closest("[data-remove-packing]");
      if (!remove) return;
      items.splice(Number(remove.dataset.removePacking), 1);
      if (writeStorage(STORAGE_KEYS.packing, items)) render();
    });
    if (destination) document.querySelector("[data-packing-destination]")?.replaceChildren(document.createTextNode(`Destino: ${destination.name} · ${destination.city}`));
    const nextStep = document.querySelector("[data-packing-next]");
    if (nextStep && destination) {
      const nextUrl = new URL(nextStep.href, window.location.href);
      nextUrl.searchParams.set("ciudad", destination.city);
      nextStep.href = nextUrl.href;
    }
    render();
  }

  const weatherLabels = {
    0: ["Despejado", "☀"],
    1: ["Mayormente despejado", "🌤"],
    2: ["Parcialmente nublado", "⛅"],
    3: ["Nublado", "☁"],
    45: ["Niebla", "🌫"],
    48: ["Niebla", "🌫"],
    51: ["Llovizna ligera", "🌦"],
    53: ["Llovizna", "🌦"],
    55: ["Llovizna intensa", "🌧"],
    61: ["Lluvia ligera", "🌧"],
    63: ["Lluvia", "🌧"],
    65: ["Lluvia intensa", "🌧"],
    71: ["Nevada ligera", "🌨"],
    73: ["Nevada", "🌨"],
    75: ["Nevada intensa", "❄"],
    80: ["Chubascos ligeros", "🌦"],
    81: ["Chubascos", "🌧"],
    82: ["Chubascos intensos", "🌧"],
    95: ["Tormenta", "⛈"]
  };

  async function fetchWeather(cityName) {
    const card = document.querySelector(".weather-card");
    if (!card) return;
    const requestId = ++weatherRequestId;
    card.innerHTML = '<p class="weather-status" role="status">Consultando el pronóstico…</p>';
    try {
      const { place, data } = await fetchWeatherForecast(cityName, {
        current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
        daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
        forecast_days: "3",
        timezone: "auto"
      });
      if (requestId !== weatherRequestId) return;
      renderWeather(card, place, data);
    } catch (error) {
      if (requestId !== weatherRequestId) return;
      console.error("No se pudo consultar el pronóstico.", error);
      card.innerHTML = '<p class="weather-status" role="alert">No fue posible consultar el clima. Comprueba tu conexión e inténtalo de nuevo.</p>';
    }
  }

  function renderWeather(card, place, data) {
    const current = data.current;
    const daily = data.daily;
    const currentWeather = weatherLabels[current.weather_code] || ["Condiciones variables", "☁"];
    const dayNames = daily.time.map((date) => new Intl.DateTimeFormat("es", { weekday: "long" }).format(new Date(`${date}T12:00:00`)));
    const forecastMarkup = daily.time.map((date, index) => {
      const [description, icon] = weatherLabels[daily.weather_code[index]] || ["Variable", "☁"];
      return `<div><span>${dayNames[index]}</span><b aria-label="${description}">${icon}</b><strong>${Math.round(daily.temperature_2m_max[index])}° / ${Math.round(daily.temperature_2m_min[index])}°</strong></div>`;
    }).join("");
    const location = [place.name, place.country].filter(Boolean).join(", ");
    card.innerHTML = `<div class="weather-top"><div><p class="muted">${escapeHtml(location)}</p><div class="temperature">${Math.round(current.temperature_2m)}<span>°C</span></div><strong>${currentWeather[1]} ${currentWeather[0]}</strong><p class="muted">Sensación: ${Math.round(current.apparent_temperature)} °C · Viento: ${Math.round(current.wind_speed_10m)} km/h</p><p class="muted">Humedad: ${Math.round(current.relative_humidity_2m)} %</p></div><div class="weather-sun" aria-hidden="true">${currentWeather[1]}</div></div><div class="forecast-title">Pronóstico de 3 días</div><div class="forecast">${forecastMarkup}</div><p class="rain-note">Probabilidad máxima de lluvia: <strong>${Math.max(...daily.precipitation_probability_max)} %</strong></p><small class="weather-attribution">Datos meteorológicos: Open-Meteo</small>`;
  }

  function setupWeather() {
    const card = document.querySelector(".weather-card");
    if (!card) return;
    const trip = loadTrip();
    const savedNotice = document.querySelector("[data-weather-trip-saved]");
    const itineraryLink = document.querySelector("[data-weather-itinerary]");
    if (trip && savedNotice && itineraryLink) {
      savedNotice.textContent = `Tu itinerario "${trip.name}" está guardado en este navegador.`;
      savedNotice.hidden = false;
      itineraryLink.hidden = false;
    }
    const root = document.querySelector(".weather-layout > div:first-child");
    const form = document.createElement("form");
    form.className = "weather-search";
    form.innerHTML = '<label for="weather-city">Ciudad</label><div><input id="weather-city" name="city" type="search" placeholder="Ej. Madrid" required><button class="btn btn-primary" type="submit">Consultar</button></div>';
    root.insertBefore(form, root.querySelector(".btn"));
    const cityInput = form.querySelector("input");
    const requestedCity = new URLSearchParams(window.location.search).get("ciudad") || "Madrid";
    cityInput.value = requestedCity;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const city = cityInput.value.trim();
      if (!city) return;
      const url = new URL(window.location.href);
      url.searchParams.set("ciudad", city);
      window.history.replaceState(null, "", url);
      fetchWeather(city);
    });
    fetchWeather(requestedCity);
  }

  function downloadItineraryBackup() {
    const backup = {
      format: "aventra-itinerary-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      trips: getTripCollection(),
      favorites: getFavorites(),
      packing: readStorage(STORAGE_KEYS.packing, [])
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aventra-respaldo-${isoDate(new Date())}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Se descargó la copia de seguridad de tus viajes.");
  }

  async function importItineraryBackup(file, container) {
    try {
      const backup = JSON.parse(await file.text());
      const trips = backup?.trips;
      const favorites = backup?.favorites;
      const packing = backup?.packing;
      if (
        backup?.format !== "aventra-itinerary-backup" ||
        backup.version !== 1 ||
        !trips ||
        !Array.isArray(trips.items) ||
        !trips.items.every(isValidTrip) ||
        !Array.isArray(favorites) ||
        !favorites.every((id) => typeof id === "string" && destinationById(id)) ||
        !Array.isArray(packing)
      ) {
        notify("El archivo no es una copia de seguridad válida de AVENTRA.", "error");
        return;
      }
      if (!window.confirm("Importar esta copia reemplazará los viajes, favoritos y lista de equipaje guardados en este dispositivo. ¿Deseas continuar?")) return;
      const keys = [STORAGE_KEYS.trips, STORAGE_KEYS.favorites, STORAGE_KEYS.packing];
      const previous = keys.map((key) => window.localStorage.getItem(key));
      const importedTrips = trips.items.map((trip) => ({
          ...trip,
          id: trip.id || createTripId()
        }));
      const tripCollection = {
        items: importedTrips,
        activeId: importedTrips.some((trip) => trip.id === trips.activeId)
          ? trips.activeId
          : importedTrips[0]?.id || null,
        legacyTripMigrated: true
      };
      const saved = writeStorage(STORAGE_KEYS.trips, tripCollection)
        && writeStorage(STORAGE_KEYS.favorites, favorites)
        && writeStorage(STORAGE_KEYS.packing, packing);
      if (!saved) {
        try {
          keys.forEach((key, index) => {
            if (previous[index] === null) window.localStorage.removeItem(key);
            else window.localStorage.setItem(key, previous[index]);
          });
        } catch (error) {
          console.error("No se pudo restaurar el almacenamiento previo tras fallar la importación.", error);
          notify("La importación falló y no fue posible restaurar todos los datos anteriores.", "error");
        }
        return;
      }
      delete container.dataset.detailTripId;
      container.dataset.tripSearch = "";
      renderItinerary();
      renderFavorites();
      renderItineraryFavoriteDestinations();
      updateFavoriteButtons();
      notify("La copia de seguridad se importó correctamente.");
    } catch (error) {
      console.error("No se pudo leer la copia de seguridad de AVENTRA.", error);
      notify("No se pudo leer el archivo. Verifica que sea un JSON de respaldo válido.", "error");
    } finally {
      const fileInput = container.querySelector("[data-trip-import-file]");
      if (fileInput) fileInput.value = "";
    }
  }

  function setupItineraryInteractions() {
    const container = document.querySelector("[data-itinerary]");
    if (!container) return;
    let hotelSearchSequence = 0;
    let hotelResultCards = [];
    let currentHotelPage = 1;
    const hotelPageSize = 3;
    const setTripView = (view) => {
      container.dataset.activeTripView = view;
      container.querySelectorAll("[data-trip-view]").forEach((tab) => {
        const isActive = tab.dataset.tripView === view;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });
      container.querySelectorAll("[data-trip-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.tripPanel !== view;
      });
    };
    const renderHotelPage = (requestedPage, focusCurrentPage = false) => {
      const results = container.querySelector("[data-hotel-results]");
      const pagination = container.querySelector("[data-hotel-pagination]");
      if (!results || !pagination) return;

      const pageCount = Math.ceil(hotelResultCards.length / hotelPageSize);
      if (!pageCount) {
        currentHotelPage = 1;
        results.innerHTML = "";
        pagination.innerHTML = "";
        pagination.hidden = true;
        return;
      }

      currentHotelPage = Math.max(1, Math.min(pageCount, requestedPage));
      const firstCardIndex = (currentHotelPage - 1) * hotelPageSize;
      results.innerHTML = hotelResultCards.slice(firstCardIndex, firstCardIndex + hotelPageSize).join("");

      let pageItems;
      if (window.matchMedia("(max-width: 390px)").matches) {
        pageItems = [...new Set([1, currentHotelPage, pageCount])];
      } else if (pageCount <= 4) {
        pageItems = Array.from({ length: pageCount }, (_, index) => index + 1);
      } else if (currentHotelPage <= 2) {
        pageItems = [1, 2, 3, "ellipsis", pageCount];
      } else if (currentHotelPage >= pageCount - 1) {
        pageItems = [1, "ellipsis", pageCount - 2, pageCount - 1, pageCount];
      } else {
        pageItems = [1, "ellipsis", currentHotelPage - 1, currentHotelPage, currentHotelPage + 1, "ellipsis", pageCount];
      }
      const pageButtons = pageItems.map((page) => page === "ellipsis"
        ? '<span class="hotel-pagination-ellipsis" aria-hidden="true">…</span>'
        : `<button class="hotel-pagination-number${page === currentHotelPage ? " is-active" : ""}" type="button" data-hotel-page="${page}" aria-label="Página ${page}"${page === currentHotelPage ? ' aria-current="page"' : ""}>${page}</button>`
      ).join("");

      pagination.innerHTML = `
        <button class="hotel-pagination-arrow" type="button" data-hotel-page="${currentHotelPage - 1}" aria-label="Página anterior"${currentHotelPage === 1 ? " disabled" : ""}><span aria-hidden="true">‹</span></button>
        <div class="hotel-pagination-pages">${pageButtons}</div>
        <button class="hotel-pagination-arrow" type="button" data-hotel-page="${currentHotelPage + 1}" aria-label="Página siguiente"${currentHotelPage === pageCount ? " disabled" : ""}><span aria-hidden="true">›</span></button>`;
      pagination.hidden = pageCount <= 1;

      if (focusCurrentPage) {
        pagination.querySelector('[aria-current="page"]')?.focus({ preventScroll: true });
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!prefersReducedMotion && typeof results.animate === "function") {
          results.animate(
            [
              { opacity: 0, transform: "translateY(10px)" },
              { opacity: 1, transform: "translateY(0)" }
            ],
            { duration: 280, easing: "ease-out" }
          );
        }
        const behavior = prefersReducedMotion ? "auto" : "smooth";
        results.scrollIntoView({ behavior, block: "start" });
      }
    };
    document.addEventListener("load", (event) => {
      if (!event.target.matches(".trip-image-shell img")) return;
      event.target.closest(".trip-image-shell")?.classList.remove("is-loading");
    }, true);
    document.addEventListener("error", (event) => {
      if (!event.target.matches(".trip-image-shell img")) return;
      const image = event.target;
      const fallback = image.dataset.fallbackSrc;
      if (fallback && image.dataset.fallbackApplied !== "true" && image.src !== new URL(fallback, window.location.href).href) {
        image.dataset.fallbackApplied = "true";
        image.src = fallback;
      } else {
        image.closest(".trip-image-shell")?.classList.remove("is-loading");
        image.closest(".trip-image-shell")?.classList.add("has-image-error");
        if (image.dataset.loadErrorLogged !== "true") {
          image.dataset.loadErrorLogged = "true";
          console.error("No se pudo cargar la imagen del itinerario.", image.src);
        }
      }
    }, true);
    container.addEventListener("input", (event) => {
      if (!event.target.matches("[data-trip-search]")) return;
      container.dataset.tripSearch = event.target.value;
      const trips = getTripCollection().items;
      container.querySelectorAll("[data-select-trip]").forEach((button) => {
        const trip = trips.find((item) => item.id === button.dataset.selectTrip);
        const destination = trip && destinationById(trip.destinationId);
        button.hidden = !normalize(`${trip?.name || ""} ${destination?.name || ""} ${destination?.city || ""}`).includes(normalize(event.target.value));
      });
      const empty = container.querySelector(".trip-search-empty");
      if (empty) empty.hidden = [...container.querySelectorAll("[data-select-trip]")].some((button) => !button.hidden);
    });
    container.addEventListener("change", (event) => {
      if (event.target.matches("[data-trip-sort]")) {
        container.dataset.tripSort = event.target.value;
        renderItinerary();
        return;
      }
      if (event.target.matches("[data-trip-import-file]") && event.target.files?.[0]) {
        importItineraryBackup(event.target.files[0], container);
      }
      if (event.target.matches("[data-day-filter]")) {
        const selectedStatus = event.target.value;
        container.querySelectorAll(".itinerary-day").forEach((day) => {
          day.hidden = selectedStatus !== "all" && day.dataset.dayStatus !== selectedStatus;
        });
        container.querySelectorAll("[data-nav-day-index]").forEach((link) => {
          link.hidden = selectedStatus !== "all" && link.dataset.dayStatus !== selectedStatus;
        });
        const visibleDays = [...container.querySelectorAll(".itinerary-day")].filter((day) => !day.hidden);
        const empty = container.querySelector("[data-day-filter-empty]");
        if (empty) empty.hidden = visibleDays.length > 0;
        if (visibleDays.length && selectedStatus !== "all" && !visibleDays.some((day) => day.open)) {
          visibleDays[0].open = true;
        }
      }
    });
    container.addEventListener("submit", async (event) => {
      const hotelSearchForm = event.target.closest("[data-hotel-search-form]");
      if (hotelSearchForm) {
        event.preventDefault();
        const cityInput = hotelSearchForm.elements.city;
        const city = cityInput.value.trim();
        const status = container.querySelector("[data-hotel-search-status]");
        const results = container.querySelector("[data-hotel-results]");
        const pagination = container.querySelector("[data-hotel-pagination]");
        const submitButton = hotelSearchForm.querySelector('button[type="submit"]');
        if (!city) {
          if (status) status.textContent = "Escribe una ciudad o zona para buscar alojamientos.";
          cityInput.focus();
          return;
        }
        const trip = loadTrip();
        if (!trip) {
          if (status) status.textContent = "No se encontró el itinerario activo. Vuelve a Mis itinerarios e inténtalo de nuevo.";
          return;
        }
        trip.logistics = trip.logistics && typeof trip.logistics === "object"
          ? trip.logistics
          : {};
        trip.logistics.hotelSearchCity = city;
        if (!saveCurrentTrip(trip)) {
          if (status) status.textContent = "No se pudo guardar la ciudad de búsqueda. Inténtalo de nuevo.";
          return;
        }
        const searchSequence = ++hotelSearchSequence;
        if (status) status.textContent = `Buscando alojamientos cerca de ${city}…`;
        if (results) results.innerHTML = "";
        hotelResultCards = [];
        currentHotelPage = 1;
        if (pagination) {
          pagination.innerHTML = "";
          pagination.hidden = true;
        }
        if (submitButton) submitButton.disabled = true;
        try {
          const searchResult = await searchOpenStreetMapAccommodations(city);
          if (searchSequence !== hotelSearchSequence) return;
          if (!searchResult.center) {
            if (status) status.textContent = "No encontramos esa ciudad. Añade el país para precisar la búsqueda e inténtalo de nuevo.";
            return;
          }
          const nearbyPlaces = searchResult.elements
            .map((element) => {
              const coordinates = accommodationCoordinates(element);
              return coordinates
                ? { element, distance: distanceInKilometers(searchResult.center, coordinates) }
                : null;
            })
            .filter((place) => place && place.distance <= 8)
            .sort((left, right) => left.distance - right.distance);
          hotelResultCards = nearbyPlaces
            .map(({ element }) => accommodationCardMarkup(element, city, searchResult.center))
            .filter(Boolean);
          renderHotelPage(1);
          if (status) {
            status.textContent = hotelResultCards.length
            ? `Encontramos ${hotelResultCards.length} alojamientos registrados entre los más cercanos a ${city} (hasta 8 km).`
              : `No encontramos alojamientos registrados cerca de ${city}. Prueba con otra zona o ciudad.`;
          }
        } catch (error) {
          if (searchSequence !== hotelSearchSequence) return;
          if (status) status.textContent = "No fue posible consultar los alojamientos. Comprueba tu conexión e inténtalo de nuevo en unos minutos.";
          console.error("No se pudieron consultar alojamientos de OpenStreetMap.", error);
        } finally {
          if (searchSequence === hotelSearchSequence && submitButton) submitButton.disabled = false;
        }
        return;
      }
      const activityEditForm = event.target.closest(".activity-edit-form");
      if (activityEditForm) {
        event.preventDefault();
        const trip = loadTrip();
        const day = trip?.days[Number(activityEditForm.dataset.dayIndex)];
        const activityIndex = Number(activityEditForm.dataset.activityIndex);
        if (!trip || !day || day.cancelled === true || day.activities[activityIndex] === undefined) return;
        const activity = getActivityRecord(day.activities[activityIndex], activityIndex);
        activity.time = activityEditForm.elements.time.value;
        activity.duration = Number(activityEditForm.elements.duration.value) || "";
        activity.category = activityEditForm.elements.category.value;
        activity.cost = Number(activityEditForm.elements.cost.value) || "";
        activity.notes = activityEditForm.elements.notes.value.trim();
        day.activities[activityIndex] = activity;
        saveActivityDay(trip, day, "Se guardaron los detalles de la actividad.");
        return;
      }
      const logisticsForm = event.target.closest(".trip-logistics-form");
      if (logisticsForm) {
        event.preventDefault();
        const trip = loadTrip();
        if (!trip) return;
        trip.logistics = {
          ...(trip.logistics && typeof trip.logistics === "object" ? trip.logistics : {}),
          transport: logisticsForm.elements.transport.value.trim(),
          lodging: logisticsForm.elements.lodging.value.trim()
        };
        if (saveCurrentTrip(trip)) {
          renderItinerary();
          notify("Los preparativos se guardaron.");
        }
        return;
      }
      const budgetForm = event.target.closest(".trip-budget-form");
      if (budgetForm) {
        event.preventDefault();
        const trip = loadTrip();
        if (!trip) return;
        trip.expenses = trip.expenses && typeof trip.expenses === "object" ? trip.expenses : {};
        budgetForm.querySelectorAll(".trip-budget-row:not([data-budget-category='activities'])").forEach((row) => {
          const category = row.dataset.budgetCategory;
          trip.expenses[category] = {
            estimated: Math.max(0, Number(budgetForm.elements[`${category}-estimated`].value) || 0),
            spent: Math.max(0, Number(budgetForm.elements[`${category}-spent`].value) || 0)
          };
        });
        if (saveCurrentTrip(trip)) {
          renderItinerary();
          const totals = tripExpenseTotals(trip);
          const exceeded = trip.budget > 0 && totals.estimated > trip.budget;
          notify(exceeded
            ? "Se guardaron los gastos, pero el estimado supera el presupuesto del viaje."
            : "El presupuesto se guardó correctamente.",
          exceeded ? "warning" : "status");
        }
        return;
      }
      const form = event.target.closest(".activity-form");
      if (!form) return;
      event.preventDefault();
      const activity = form.elements.activity.value.trim();
      if (!activity) return;
      const trip = loadTrip();
      if (!trip) return;
      const day = trip.days[Number(form.dataset.dayIndex)];
      if (!day || day.cancelled === true) return;
      if (!Array.isArray(day.activities)) day.activities = [];
      const nextOrder = day.activities.reduce((max, item, index) =>
        Math.max(max, getActivityRecord(item, index).order), -1) + 1;
      day.activities.push({
        text: activity,
        time: form.elements.time.value,
        duration: Number(form.elements.duration.value) || "",
        category: form.elements.category.value,
        cost: Number(form.elements.cost.value) || "",
        notes: form.elements.notes.value.trim(),
        completed: false,
        order: nextOrder
      });
      day.completed = false;
      saveActivityDay(trip, day, "La actividad se agregó al día.");
    });
    container.addEventListener("click", (event) => {
      const hotelPageButton = event.target.closest("[data-hotel-page]");
      if (hotelPageButton && !hotelPageButton.disabled) {
        renderHotelPage(Number(hotelPageButton.dataset.hotelPage), true);
        return;
      }
      const selectedDayLink = event.target.closest(".dashboard-day-nav a");
      if (selectedDayLink) {
        setTripView("agenda");
        const day = container.querySelector(selectedDayLink.getAttribute("href"));
        if (day instanceof HTMLDetailsElement) day.open = true;
        container.querySelectorAll(".dashboard-day-nav a").forEach((link) => {
          link.classList.toggle("is-active", link === selectedDayLink);
        });
      }
      const tripViewTab = event.target.closest("[data-trip-view]");
      if (tripViewTab) {
        setTripView(tripViewTab.dataset.tripView);
        return;
      }
      const weatherButton = event.target.closest("[data-day-weather]");
      if (weatherButton) {
        const panel = container.querySelector(`#${CSS.escape(weatherButton.getAttribute("aria-controls"))}`);
        const trip = loadTrip();
        const destination = trip && destinationById(trip.destinationId);
        if (!panel || !trip || !destination) return;
        if (panel.dataset.loaded === "true") {
          panel.hidden = !panel.hidden;
        } else {
          renderDayWeather(Number(weatherButton.dataset.dayWeather), trip, destination, panel, weatherButton);
        }
        return;
      }
      if (event.target.closest("[data-export-trips]")) {
        downloadItineraryBackup();
        return;
      }
      if (event.target.closest("[data-import-trips]")) {
        container.querySelector("[data-trip-import-file]")?.click();
        return;
      }
      if (event.target.closest("[data-print-trip]")) {
        const dayDetails = [...container.querySelectorAll(".itinerary-day")];
        const previousOpenState = dayDetails.map((day) => day.open);
        dayDetails.forEach((day) => { day.open = true; });
        window.addEventListener("afterprint", () => {
          dayDetails.forEach((day, index) => { day.open = previousOpenState[index]; });
        }, { once: true });
        window.print();
        return;
      }
      const toggleActivity = event.target.closest("[data-toggle-activity]");
      if (toggleActivity) {
        const trip = loadTrip();
        const day = trip?.days[Number(toggleActivity.dataset.toggleActivity)];
        const activityIndex = Number(toggleActivity.dataset.activityIndex);
        if (!trip || !day || day.cancelled === true || !day.activities[activityIndex]) return;
        const activity = getActivityRecord(day.activities[activityIndex], activityIndex);
        activity.completed = !activity.completed;
        day.activities[activityIndex] = activity;
        day.completed = false;
        if (saveCurrentTrip(trip)) {
          renderItinerary();
          notify(activity.completed ? "Actividad marcada como completada." : "Actividad marcada como pendiente.");
        }
        return;
      }
      const completeDay = event.target.closest("[data-complete-day]");
      if (completeDay) {
        const trip = loadTrip();
        const dayIndex = Number(completeDay.dataset.completeDay);
        const day = trip?.days[dayIndex];
        if (!trip || !day || day.cancelled === true) return;
        const completed = !dayIsCompleted(day);
        day.completed = completed;
        day.activities = (day.activities || []).map((item, index) => ({
          ...getActivityRecord(item, index),
          completed
        }));
        if (saveCurrentTrip(trip)) {
          renderItinerary();
          notify(completed ? `El día ${dayIndex + 1} se marcó como completado.` : `El día ${dayIndex + 1} volvió a pendiente.`);
        }
        return;
      }
      const moveActivity = event.target.closest("[data-move-activity]");
      if (moveActivity) {
        const trip = loadTrip();
        const dayIndex = Number(moveActivity.dataset.moveActivity);
        const activityIndex = Number(moveActivity.dataset.activityIndex);
        const day = trip?.days[dayIndex];
        const direction = Number(moveActivity.dataset.direction);
        if (!trip || !day || day.cancelled === true) return;
        const sorted = orderedActivities(day.activities || []);
        const currentPosition = sorted.findIndex((entry) => entry.index === activityIndex);
        const target = sorted[currentPosition + direction];
        if (!target) return;
        const currentActivity = getActivityRecord(day.activities[activityIndex], activityIndex);
        const targetActivity = getActivityRecord(day.activities[target.index], target.index);
        if (currentActivity.time !== targetActivity.time) {
          [currentActivity.time, targetActivity.time] = [targetActivity.time, currentActivity.time];
        } else {
          [currentActivity.order, targetActivity.order] = [targetActivity.order, currentActivity.order];
        }
        day.activities[activityIndex] = currentActivity;
        day.activities[target.index] = targetActivity;
        if (saveCurrentTrip(trip)) {
          renderItinerary();
          notify("Actividad reordenada. Las horas se ajustaron para mantener la agenda en orden.");
        }
        return;
      }
      if (event.target.closest("[data-exit-trip]")) {
        const trip = loadTrip();
        if (!trip || !saveCurrentTrip(trip)) return;
        delete container.dataset.detailTripId;
        renderItinerary();
        notify("¡Guardado con éxito! Te llevamos a Mis itinerarios.");
        document.querySelector('[data-itinerary-tab="saved"]')?.click();
        document.querySelector("#mis-itinerarios .itinerary-section-heading")?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
          block: "start"
        });
        return;
      }
      if (event.target.closest("[data-back-to-trips]")) {
        delete container.dataset.detailTripId;
        renderItinerary();
        return;
      }
      const tripSelector = event.target.closest("[data-select-trip]");
      if (tripSelector) {
        const collection = getTripCollection();
        const selectedTrip = collection.items.find((trip) => trip.id === tripSelector.dataset.selectTrip);
        if (!selectedTrip) return;
        const selectedCardImage = tripSelector.querySelector(".trip-selector-image img")?.getAttribute("src");
        if (selectedCardImage) selectedTrip.imageUrl = selectedCardImage;
        collection.activeId = selectedTrip.id;
        if (saveTripCollection(collection)) {
          container.dataset.detailTripId = selectedTrip.id;
          container.dataset.activeTripView = "overview";
          renderItinerary();
        }
        return;
      }
      const suggestedActivity = event.target.closest("[data-add-suggested-activity]");
      if (suggestedActivity) {
        const trip = loadTrip();
        if (!trip) return;
        const day = trip.days[Number(suggestedActivity.dataset.addSuggestedActivity)];
        if (!day || day.cancelled === true) return;
        if (!Array.isArray(day.activities)) day.activities = [];
        day.activities.push({
          text: suggestedActivity.dataset.activityValue,
          time: "",
          duration: "",
          cost: "",
          notes: "",
          completed: false,
          order: day.activities.length
        });
        day.completed = false;
        if (saveCurrentTrip(trip)) renderItinerary();
        return;
      }
      const removeActivity = event.target.closest("[data-remove-activity]");
      if (removeActivity) {
        const trip = loadTrip();
        if (!trip) return;
        const day = trip.days[Number(removeActivity.dataset.removeActivity)];
        if (!day || day.cancelled === true) return;
        day.activities.splice(Number(removeActivity.dataset.activityIndex), 1);
        day.completed = false;
        if (saveCurrentTrip(trip)) renderItinerary();
        return;
      }
      const cancelDay = event.target.closest("[data-cancel-day]");
      if (cancelDay) {
        const trip = loadTrip();
        const dayIndex = Number(cancelDay.dataset.cancelDay);
        const day = trip?.days[dayIndex];
        if (!day || day.cancelled === true) return;
        if (!window.confirm(`¿Quieres cancelar el plan del día ${dayIndex + 1}? Sus actividades se conservarán y podrás reanudarlo después.`)) return;
        const previousCompleted = day.completed === true;
        day.cancelled = true;
        day.completed = false;
        if (saveCurrentTrip(trip)) {
          renderItinerary();
          notify(`El día ${dayIndex + 1} se canceló. Sus actividades se conservaron.`, "status", {
            label: "Deshacer",
            onClick: () => {
              const currentTrip = getTripCollection().items.find((item) => item.id === trip.id);
              const currentDay = currentTrip?.days[dayIndex];
              if (!currentTrip || !currentDay) return;
              currentDay.cancelled = false;
              currentDay.completed = previousCompleted;
              if (saveCurrentTrip(currentTrip)) {
                renderItinerary();
                notify(`Se deshizo la cancelación del día ${dayIndex + 1}.`);
              }
            }
          });
        }
        return;
      }
      const resumeDay = event.target.closest("[data-resume-day]");
      if (resumeDay) {
        const trip = loadTrip();
        const dayIndex = Number(resumeDay.dataset.resumeDay);
        const day = trip?.days[dayIndex];
        if (!day || day.cancelled !== true) return;
        day.cancelled = false;
        day.completed = false;
        if (saveCurrentTrip(trip)) {
          renderItinerary();
          notify(`Se reanudó el día ${dayIndex + 1} con sus actividades.`);
        }
        return;
      }
      if (event.target.closest("[data-delete-trip]")) {
        if (!window.confirm("¿Quieres eliminar este itinerario y sus actividades?")) return;
        const collection = getTripCollection();
        const deletedIndex = collection.items.findIndex((trip) => trip.id === collection.activeId);
        const deletedTrip = collection.items[deletedIndex];
        const previousActiveId = collection.activeId;
        if (!deletedTrip) return;
        collection.items = collection.items.filter((trip) => trip.id !== collection.activeId);
        collection.activeId = collection.items[0]?.id || null;
        if (saveTripCollection(collection)) {
          delete container.dataset.detailTripId;
          renderItinerary();
          notify("El itinerario se eliminó.", "status", {
            label: "Deshacer",
            onClick: () => {
              const currentCollection = getTripCollection();
              if (!currentCollection.items.some((trip) => trip.id === deletedTrip.id)) {
                currentCollection.items.splice(Math.min(deletedIndex, currentCollection.items.length), 0, deletedTrip);
              }
              currentCollection.activeId = previousActiveId;
              if (saveTripCollection(currentCollection)) {
                container.dataset.detailTripId = deletedTrip.id;
                renderItinerary();
                notify("Se restauró el itinerario eliminado.");
              }
            }
          });
        }
      }
    });
    container.addEventListener("keydown", (event) => {
      const tab = event.target.closest("[data-trip-view]");
      if (!tab) return;
      const tabs = [...container.querySelectorAll("[data-trip-view]")];
      const currentIndex = tabs.indexOf(tab);
      const nextIndex = event.key === "ArrowDown" || event.key === "ArrowRight"
        ? (currentIndex + 1) % tabs.length
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? (currentIndex - 1 + tabs.length) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : -1;
      if (nextIndex < 0) return;
      event.preventDefault();
      tabs[nextIndex].focus();
      setTripView(tabs[nextIndex].dataset.tripView);
    });
    settleImagePlaceholders(document);
  }


  function setupAuthForms() {
    document.querySelectorAll("[data-auth-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        notify("Este prototipo no envía ni almacena contraseñas. Para activar cuentas se necesita un servidor de autenticación.", "error");
      });
    });
  }

  function setupNavigationTransition() {
    const overlay = document.createElement("div");
    overlay.className = "travel-transition";
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = '<div class="travel-transition-content"><span class="travel-transition-brand">AVENTRA <span aria-hidden="true">·</span> EXPLORA EL MUNDO</span><p class="travel-transition-message" role="status" aria-live="polite">Preparando tu próxima aventura</p><div class="travel-transition-route" aria-hidden="true"><svg class="travel-transition-plane" viewBox="0 0 48 48" focusable="false"><path d="M21 8c0-1.66 1.34-3 3-3s3 1.34 3 3v11l17 10v5l-17-5v11l5 3.5V47l-8-2-8 2v-3.5l5-3.5V29L4 34v-5l17-10V8z"/></svg></div><span class="travel-transition-destination">Un momento, estamos preparando el viaje...</span></div>';
    document.body.append(overlay);

    let navigating = false;
    document.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest(".main-nav a, .site-header .account-link");
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;

      const target = new URL(link.href, window.location.href);
      if (target.origin !== window.location.origin) return;
      if (
        target.pathname === window.location.pathname &&
        target.search === window.location.search &&
        (!target.hash || target.hash === window.location.hash)
      ) return;
      if (navigating) {
        event.preventDefault();
        return;
      }

      navigating = true;
      event.preventDefault();
      const label = link.textContent.replace(/[→←↑↓↗◉]/g, "").trim().replace(/\s+/g, " ");
      overlay.querySelector(".travel-transition-message").textContent = label
        ? `Preparando tu viaje: ${label}`
        : "Preparando tu próxima aventura";
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden", "false");
      const plane = overlay.querySelector(".travel-transition-plane");
      plane.classList.remove("is-flying");
      void plane.getBoundingClientRect();
      plane.classList.add("is-flying");
      window.setTimeout(() => {
        window.location.assign(target.href);
      }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 180 : 1200);
    });
  }

  document.addEventListener("click", (event) => {
    const helpCenter = document.querySelector("[data-itinerary-help-center]");
    if (event.target.closest("[data-close-itinerary-help]")) {
      helpCenter?.removeAttribute("open");
      helpCenter?.querySelector("summary")?.focus();
      return;
    }
    if (helpCenter?.open && !helpCenter.contains(event.target)) helpCenter.removeAttribute("open");
    const toggle = event.target.closest("[data-favorite-toggle]");
    if (toggle) {
      toggleFavorite(toggle.dataset.destinationId);
      return;
    }
    const removeFavorite = event.target.closest("[data-remove-favorite]");
    if (removeFavorite) {
      toggleFavorite(removeFavorite.dataset.removeFavorite);
    }
  });

  document.addEventListener("toggle", (event) => {
    const editor = event.target;
    if (!(editor instanceof HTMLDetailsElement) || !editor.matches(".activity-editor") || !editor.open) return;
    const form = editor.querySelector(".activity-edit-form");
    if (!form) return;
    window.requestAnimationFrame(() => {
      form.scrollIntoView({
        block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    });
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const helpCenter = document.querySelector("[data-itinerary-help-center]");
    if (!helpCenter?.open) return;
    helpCenter.removeAttribute("open");
    helpCenter.querySelector("summary")?.focus();
  });

export {
  detailDestinationId,
  destinationById,
  enhanceFavoriteButtons,
  loadDestinations,
  migrateLegacyTripCurrencies,
  renderCountryCatalog,
  renderCountryDetail,
  renderFavorites,
  renderItinerary,
  renderItineraryDiscovery,
  renderItineraryTemplateDetail,
  setupAuthForms,
  setupBackToTopButton,
  setupCountryImageLoading,
  setupDestinationFilters,
  setupFeaturedDestinationsCarousel,
  setupFavoritesScrollControls,
  setupHomeDestinationSearch,
  setupItineraryDiscovery,
  setupItineraryInteractions,
  setupItineraryTabs,
  setupNavigationTransition,
  setupPackingList,
  setupPrivacyReturnNavigation,
  setupTermsAcceptance,
  setupTravelAssistant,
  setupTripForm,
  setupWeather
};
