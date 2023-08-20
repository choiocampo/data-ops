function initMap() {
    const defaultCenter = { lat: 42.3454835, lng: -71.04322144 }; // Default center coordinates

    const mapOptions = {
        center: defaultCenter,
        zoom: 20,
    };

    const mainMap = new google.maps.Map(document.getElementById("main-map"), mapOptions);
    mainMap.data.addGeoJson(yourGeoJsonData);

    const streetView = new google.maps.StreetViewPanorama(document.getElementById("street-view"), {
        position: mapOptions.center,
    });
    mainMap.setStreetView(streetView);

    const searchBoxInput = document.getElementById("search-box");
    const toggleViewButton = document.getElementById("toggle-view");
    const infoWindow = new google.maps.InfoWindow();

    searchBoxInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const searchID = searchBoxInput.value;
            findAndHighlightPoint(mainMap, searchID);
        }
    });

    mainMap.data.addListener("click", (event) => {
        const content = `
        <div>Object ID: ${event.feature.getProperty("object")}</div>
        <div>Map: ${event.feature.getProperty("area")}</div>`;
        infoWindow.setContent(content);
        infoWindow.setPosition(event.latLng);
        infoWindow.open(mainMap);
    });

    toggleViewButton.addEventListener("click", () => {
        toggleView(mainMap);
    });

    const markerIcon = {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // URL of the blue pin icon image
        scaledSize: new google.maps.Size(32, 32), // Adjust the size of the icon here
    };

    mainMap.data.setStyle({
        icon: markerIcon,
    });

    // MOSTLY DITO NAGLALAGAY NG ADDITIONAL FEATURES

    function findAndHighlightPoint(map, searchID) {
        // Get the feature with the matching ID
        const feature = map.data.getFeatureById(searchID);
    
        // Check if the feature exists
        if (feature) {
            // Center the map on the point
            const pointCoordinates = feature.getGeometry().get();
            map.setCenter(pointCoordinates);
    
            // Move the pegman to the location of the point
            streetView.setPosition(pointCoordinates);
    
            // Set the street-view point-of-view heading and pitch
            const heading = 0; // Set the desired heading angle
            const pitch = 0; // Set the desired pitch angle
            streetView.setPov({ heading, pitch });
    
            // Show the marker on the street view
            const markerIcon = {
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // URL of the custom marker image
                scaledSize: new google.maps.Size(70, 70), // Adjust the size of the icon here
            };
    
            const labelStyle = {
                color: "white",
                fontWeight: "bold",
                background: "rgba(0, 0, 0, 0.8)",
                padding: "5px",
                borderRadius: "5px",
            };
    
            const marker = new google.maps.Marker({
                position: pointCoordinates,
                map: streetView,
                icon: markerIcon,
                label: {
                    text: feature.getProperty("object"), // Set the marker's label as the ID
                    fontSize: "20px",
                    fontWeight: "bold",
                    fontFamily: "Arial",
                    ...labelStyle,
                },
                labelAnchor: new google.maps.Point(0, -5), // Adjust the label position vertically
            });
        
        }
    }
    
    
    
}

