const latID = document.getElementById('latID');
const longID = document.getElementById('longID');
const dateID = document.getElementById('dateID');
const timeID = document.getElementById('timeID');

const marcador = L.marker([0, 0]).addTo(map);

const showData = async () => {
    fetch('http://localhost:5000/data', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    },
    ).then(response => {
        if (response.ok) {
            response.json().then(json => {
                latID.textContent = json.lat;
                longID.textContent = json.lng;
                dateID.textContent = json.date;
                timeID.textContent = json.hour;
                marcador.setLatLng([json.lat,json.lng])
            });
        }
    });
};
showData();
const timer = setInterval(() => {
    showData();
}, 5000);