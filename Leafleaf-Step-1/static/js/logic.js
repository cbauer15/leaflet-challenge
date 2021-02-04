// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // The data.features object is in the GeoJSON standard
  console.log(data.features);

  function pointToLayerFunc(feature, latlng) {
    var geojsonMarkerOptions = {
      radius: magnitudeRadius(feature.properties.mag),
      fillColor: depthColor(feature.geometry.coordinates[2]),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };
    return L.circleMarker(latlng, geojsonMarkerOptions);
  }


  // This is it! Leaflet knows what to do with 
  // each type of feature (held in the `geometry` key) and draws the correct markers.
  var earthquakes = L.geoJSON(data.features, {
    onEachFeature: onEachFeatureFunc,
    pointToLayer: pointToLayerFunc
  });

  // The rest of this is all the same
  var worldmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "World Map": worldmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("mapid", {
    center: [20, 0],
    zoom: 2,
    layers: [worldmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [10, 30, 50, 70, 90],
      labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + depthColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(myMap);

});

// https://leafletjs.com/examples/geojson/
// L.geoJSON() also gives us handy options, almost like a built in `.forEach()`
// // Define a function we want to run once for each feature in the features array
// // Give each feature a popup describing the place and time of the earthquake
function onEachFeatureFunc(feature, layer) {
  layer.bindPopup("<h3>" + new Date(feature.properties.time) +
    "</h3> <hr><p>" + (feature.properties.place) + "</p><p>" + feature.properties.mag + "</p>" + "<p>" + feature.geometry.coordinates[2] + "</p>");
}


function magnitudeRadius(eq) {
  return eq * 6.5;
}
function depthColor(depth) {
  return depth >= 90 ? '#800026' :
    depth >= 70 ? '#BD0026' :
      depth >= 50 ? '#E31A1C' :
        depth >= 30 ? '#FC4E2A' :
          depth >= 10 ? '#FD8D3C' :
            '#FFEDA0';
};