const initialRange = document.getElementById('range');
initialRange.value = 1;
let markers = {};
const markersName = "marcador"

const circle = L.circle([10.976029412029105, -74.80355101913315], {radius: 1000, }).addTo(map);
circle.on({
    mousedown: function () {
      map.on('mousemove', function(e) {
        circle.setLatLng(e.latlng);
        setRange();
      });
    },
    click: function () {
      map.removeEventListener();
    }
  });

const showMarkers = async (coords1,coords2) => {
  const lat1 = coords1.lat;
  const lon1 = coords1.lng;
  const lat2 = coords2.lat;
  const lon2 = coords2.lng;
  for (marker in markers) {
    console.log(marker)
    // map.removeLayer(markers[marker]);
  } 
  fetch(`/recordRange?lat1=${lat1}&lat2=${lat2}&lon1=${lon1}&lon2=${lon2}`, {
    method: 'GET',
    headers: {
        Accept: 'application/json',
    },
  },
  ).then(response => {
      console.log(response)
      if (response.ok) {
          response.json().then(json => {
              const info = json;
              for (let i = 0; i < info.length; i+=30) {
                markers[markersName+i] = L.marker([info[i].lat, info[i].lng]).bindPopup(`Fecha: ${info[i].date.split("T").join(" ").split(".")[0]}`).addTo(map);
              }
          });
      }
  });
}

const setRange = () => {
  const range = document.getElementById('range').value;
  const metersRange = range * 300;
  circle.setRadius(metersRange);
}

const button = () => {
  const coords1 = circle.getBounds()._southWest;
  const coords2 = circle.getBounds()._northEast;
  showMarkers(coords1,coords2);
}