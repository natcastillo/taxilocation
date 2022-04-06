// Obtener los elementos donde se va a colocar la informacion
const latID = document.getElementById('latID');
const longID = document.getElementById('longID');
const dateID = document.getElementById('dateID');
const timeID = document.getElementById('timeID');

// Crear vector para guardar coordenadas de la polilinea.
const polylineCoords =  [];

// Inicializar marcador y polilinea en la coordenada [0,0], esta coordenada se va 
// actualizando en tiempo real con la informacion de la base de datos.

const polyline = L.polyline([[0,0]],{color:'red',opacity:1}).addTo(map);
const marcador = L.marker([0, 0]).addTo(map);

// funcion para mostrar la informacion de la base de datos
const showData = async () => {
    fetch('/data', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    },
    ).then(response => {
        if (response.ok) {
            response.json().then(json => {
                // Obtenemos informacion de la base de datos
                const lastInfo = json[0];
                // Se coloca la informacion en los elementos seleccionados al comienzo del codigo.
                latID.textContent = lastInfo.lat;
                longID.textContent = lastInfo.lng;
                dateID.textContent = lastInfo.date.split('T')[0];
                timeID.textContent = lastInfo.date.split('T')[1].split('.')[0];
                // Se modifica la coordenada del marcador
                map.flyTo([lastInfo.lat,lastInfo.lng],13);
                marcador.setLatLng([lastInfo.lat,lastInfo.lng])
                // Se va agregando el par de coordenadas al vector de la polilinea
                polylineCoords.push([lastInfo.lat,lastInfo.lng])
                // Se actualizan las coordenadas de la polilinea
                polyline.setLatLngs(polylineCoords);
            });
        }
    });
};
// Se ejecuta la funcion por primera vez para mostrar la informacion
showData();

// Se configura la ejecucion de la funcion cada cinco segundos
const timer = setInterval(() => {
    showData();
}, 5000);
