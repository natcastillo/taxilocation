const latID = document.getElementById('latID');
const longID = document.getElementById('longID');
const dateID = document.getElementById('dateID');
const timeID = document.getElementById('timeID');

const marcador = L.marker([0, 0]).addTo(map);

const showData = async () => {
    const url = window.location;
    const link = url + "/data";
    fetch(link, {
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
