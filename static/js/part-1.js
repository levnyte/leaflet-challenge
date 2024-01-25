// Tile layers for the backgrounds of the map
var defaultMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Grayscale Layer
var grayscaleMap = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});

// Watercolor layer
var watercolorMap = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}', {
	minZoom: 1,
	maxZoom: 16,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'jpg'
});

// Topographic Layer
let topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Basemaps Object
let basemaps = {
    Grayscale: grayscaleMap,
    Watercolor: watercolorMap,
	Topography: topoMap,
	Default: defaultMap
};

// Map Object
var myMap = L.map("map", {
    center: [36.7783, -119.4179],
    zoom: 3,
    layers: [defaultMap, grayscaleMap, watercolorMap, topoMap]
});

// Default Map
defaultMap.addTo(myMap);

// Variable to hold the earthquake data layer
let earthquakes = L.layerGroup();

// Get the data for the earthquakes and populate the layer group
// Call the USGS geoJSON API
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(
	function(earthquakeData)
	{
		// console log to make sure the data loads
		console.log(earthquakeData);
		// make a function that chooses the color of the data point
		function dataColor(depth)
		{
			if (depth >90)
				return "#d73027";
			else if(depth > 70)
				return "#fc8d59";
			else if(depth > 50)
				return "#fee08b";
			else if(depth > 30)
				return "#d9ef8b";
			else if (depth > 10)
				return "#91cf60";
			else
				return "#1a9850";
		}
		// make a function that determines the size of the radius
		function radiusSize(mag)
		{
			if (mag == 0)
				return 1; // a zero mag earthquake will show up
			else
				return mag * 5; // makes sure that the circle is pronounced
		}

		// add on to the style for each data point
		function dataStyle(feature)
		{
			return {
				opacity: 0.5,
				fillOpacity: 0.5,
				fillColor: dataColor(feature.geometry.coordinates[2]), // index 2 for depth
				color: "black",
				radius: radiusSize(feature.properties.mag), // magnitude
				weight: 0.5,
				stroke: true
			}
		}

		// add the geoJSON data
		L.geoJson(earthquakeData, 
		{
			// make each feature a marker on the map
			pointToLayer: function(feature, latlon)
			{
				return L.circleMarker(latlon);
			},
			// set the style for each marker
			style: dataStyle, // calls the data style function and passes in the earthquake data
			// add popups
			onEachFeature: function(feature, layer){
				layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
								Depth: <b>${feature.geometry.coordinates[2]}</b><br>
								Location: <b>${feature.properties.place}</b>`);
			}
		}).addTo(earthquakes);
	}
);

// Add the earthquake layer to the map
earthquakes.addTo(myMap);

// Add the overlay for the tectonic plates and earthquakes
let overlays = {"Earthquake Data": earthquakes};

// Layer control
L.control
	.layers(basemaps, overlays)
	.addTo(myMap);

// Position the legend
let legend = L.control({position: "bottomright"});

// Add the properties for the legend
legend.onAdd = function() {
	// div for the legend to appear in the page
	let div = L.DomUtil.create("div", "info legend");

	// set up the intervals
	let intervals = [-10, 10, 30, 50, 70, 90];
	// set the colors for the intervals
	let colors = [
		"#1a9850",
		"#91cf60",
		"#d9ef8b",
		"#fee08b",
		"#fc8d59",
		"#d73027"
	];

	// loop through the intervals and the colors and generate a label with a colored square for each interval
	for (var i = 0; i < intervals.length; i++) {
		// inner html that sets the square for each interval and label
		div.innerHTML +=
		  "<i style=\"background: "
		  + colors[i]
		  + "\"></i> "
		  + intervals[i]
		  + (intervals[i + 1] ? "km - " + intervals[i + 1] + "km<br>" : "+");
	 
	}

	return div;
};

// Add the legend to the map
legend.addTo(myMap);