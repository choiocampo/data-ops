function initMap() {

    const mapOptions = {
        center: { lat: 42.33083643055002, lng: -83.03585974300418 }, // Detroit
        zoom: 19,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: true, // Enable mouse scroll wheel

    }
    const mainMap = new google.maps.Map(document.getElementById("main-map"), mapOptions);
    mainMap.data.addGeoJson(yourGeoJsonData);

    const streetView = new google.maps.StreetViewPanorama(document.getElementById("street-view"), {
        position: mapOptions.center,
    });
    mainMap.setStreetView(streetView);

    // MOSTLY DITO NAGLALAGAY NG ADDITIONAL FEATURES


    // Set the style for the GeoJSON geometry
    mainMap.data.setStyle({
        fillColor: 'blue',
        strokeColor: 'blue',
        strokeWeight: 2
    });

    // Create an info window
    const infoWindow = new google.maps.InfoWindow();

    // Add a click event listener to the mainMap.data object
    mainMap.data.addListener("click", (event) => {
        // Compute the length of the line
        const coordinates = event.feature.getGeometry().getArray();
        let lineLength = 0;
        for (let i = 0; i < coordinates.length - 1; i++) {
            lineLength += google.maps.geometry.spherical.computeDistanceBetween(coordinates[i], coordinates[i + 1]);
        }
        // lineLength is now in meters

        // Create content for the info window with the line length
        const content = `
            <div>Line ID: ${event.feature.getProperty("id")}</div>
            <div>Spaces: ${event.feature.getProperty("spaces")}</div>
            <div>Is Right Side?: ${event.feature.getProperty("is_right_side")}</div>
            <div>Length: ${lineLength.toFixed(2)} m</div>
        `;

        // Set the content and position of the info window
        infoWindow.setContent(content);
        infoWindow.setPosition(event.latLng);

        // Open the info window on the map
        infoWindow.open(mainMap);
    });

    // Add search box
    const searchBox = new google.maps.places.SearchBox(document.getElementById("search-box"));
    mainMap.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(document.getElementById("search-box"));


    // Bias the search results towards the current map's viewport
    mainMap.addListener("bounds_changed", () => {
        searchBox.setBounds(mainMap.getBounds());
    });


    // Listen for the event fired when the user selects a prediction and retrieve more details for that place
    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // For each place, get the icon, name, and location
        const bounds = new google.maps.LatLngBounds();
        places.forEach((place) => {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            if (place.geometry.viewport) {
                // Only geocodes have viewport
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });

        mainMap.fitBounds(bounds);

        // Update the position of the Street View Panorama
        streetView.setPosition(places[0].geometry.location);
    });

    const toggleViewButton = document.getElementById("toggle-view");
    toggleViewButton.addEventListener("click", () => {
        toggleView(mainMap);
    });

    function includeHTML(file, elementId) {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    document.getElementById(elementId).innerHTML = this.responseText;
                }
                if (this.status == 404) {
                    document.getElementById(elementId).innerHTML = "Page not found.";
                }
            }
        };
        xhttp.open("GET", file, true);
        xhttp.send();
    }

    window.addEventListener("load", () => {
        initMap();
        includeHTML("window.html", "empty-window");
    });

}

google.maps.event.addDomListener(window, "load", initMap);
window.addEventListener("load", initMap);