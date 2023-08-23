let mainMap;
let markerA;
let markerB;
let line;
let infoWindow;
let streetViewService;
let streetView;

function initMap() {
  const defaultCenter = { lat: 42.3454835, lng: -71.04322144 };

  const mapOptions = {
    center: defaultCenter,
    zoom: 20,
  };

  mainMap = new google.maps.Map(document.getElementById("main-map"), mapOptions);
  mainMap.data.addGeoJson(yourGeoJsonData);

  streetView = new google.maps.StreetViewPanorama(document.getElementById("street-view"), {
    position: mapOptions.center,
  });
  mainMap.setStreetView(streetView);

  const searchBoxInput = document.getElementById("search-box");
  infoWindow = new google.maps.InfoWindow();

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

  const markerIcon = {
    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    scaledSize: new google.maps.Size(32, 32),
  };

  mainMap.data.setStyle({
    icon: markerIcon,
  });

  function findAndHighlightPoint(map, searchID) {
    const feature = map.data.getFeatureById(searchID);

    if (feature) {
      const pointCoordinates = feature.getGeometry().get();
      map.setCenter(pointCoordinates);

      streetView.setPosition(pointCoordinates);

      const heading = 0;
      const pitch = 0;
      streetView.setPov({ heading, pitch });

      const markerIcon = {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        scaledSize: new google.maps.Size(70, 70),
      };

      const labelStyle = {
        color: "white",
        fontWeight: "bold",
        background: "rgba(0, 0, 0, 0.8)",
        padding: "5px",
        borderRadius: "5px",
      };

      new google.maps.Marker({
        position: pointCoordinates,
        map: streetView,
        icon: markerIcon,
        label: {
          text: feature.getProperty("object"),
          fontSize: "20px",
          fontWeight: "bold",
          fontFamily: "Arial",
          ...labelStyle,
        },
        labelAnchor: new google.maps.Point(0, -5),
      });
    }
  }

  markerA = new google.maps.Marker({
    position: mainMap.getCenter(),
    map: mainMap,
    draggable: true,
  });
  markerB = new google.maps.Marker({
    position: mainMap.getCenter(),
    map: mainMap,
    draggable: true,
  });

  markerA.addListener("dragend", updateDistance);
  markerB.addListener("dragend", updateDistance);

  line = new google.maps.Polyline({
    path: [markerA.getPosition(), markerB.getPosition()],
    geodesic: true,
    strokeColor: "#0000FF",
    strokeOpacity: 1.0,
    strokeWeight: 2,
    map: mainMap,
  });

  function updateDistance() {
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      markerA.getPosition(),
      markerB.getPosition()
    );

    infoWindow.setContent(`
      <div>Distance   :   <b>${distance.toFixed(2)} meters</b></div><br>
      <div>Coordinates:   <b>${markerA.getPosition().toUrlValue(7)}</b></div><br>
      <div>Distance/6 :   <b>${(distance.toFixed(2)/6).toFixed(2)} Cars (parallel)</b></div><br>
      <div>Distance/3 :   <b>${(distance.toFixed(2)/3).toFixed(2)} Cars (perpendicular)</b></div><br>
     
      </div>
   `);
    infoWindow.open(mainMap, markerA);
  }

  function toggleMarkers() {
    if (markerA.getMap() && markerB.getMap()) {
      markerA.setMap(null);
      markerB.setMap(null);
    } else {
      markerA.setMap(mainMap);
      markerB.setMap(mainMap);
    }
  }

  const button1 = document.getElementById("button1");
  const button2 = document.getElementById("button2");

  button1.addEventListener("click", () => {
    markerA.setPosition(mainMap.getCenter());
    markerB.setPosition(mainMap.getCenter());
    updateDistance();
  });

  button2.addEventListener("click", () => {
    toggleMarkers();
  });

  updateDistance();
}
