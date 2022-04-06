//Crear fecha con el dia de hoy
const today = new Date();
let dd = today.getDate();
let mm = today.getMonth() + 1; //enero es 0!
let yyyy = today.getFullYear();
let hora1 = today.getHours();
let minutes = today.getMinutes();

dd < 10 ? dd = "0" + dd : dd = dd;
mm < 10 ? mm = "0" + mm : mm = mm;
hora1 < 10 ? hora1 = "0" + hora1 : hora1 = hora1;
minutes < 10 ? minutes = "0" + minutes : minutes = minutes;

const hora = hora1 + ":" + minutes;

const currentDate = yyyy + "-" + mm + "-" + dd + "T" + hora;

//Obtener los inputs donde se van a colocar la fechas
const startDate = document.getElementById("idate");
const endDate = document.getElementById("fdate");

//Definir que la fecha maxima por defecto sea la del dia de hoy
startDate.max = currentDate;
endDate.max = currentDate;


// Seleccionar maximo y minimo para los calendarios segun las fechas seleccionadas
// Al hacer click en el calendario de fecha inicial, se obtiene el valor del calendario de fecha final
// y se coloca que sea el maximo posible, para que la fecha inicial no sea nunca posterior a la final
startDate.addEventListener("click", async () => {
    endDate.value == '' ? startDate.max = currentDate:startDate.max = endDate.value;
})
// Al hacer click en el calendario de fecha final, se obtiene el valor del calendario de fecha inicial
// y se coloca que sea el minimo posible, para que la fecha final no sea nunca anterior a la inicial
endDate.addEventListener("click", async () => {
    endDate.min = startDate.value;
})

// Se inicializa la polilinea
const polyline = L.polyline([[0,0]],{color:'rgb(28, 40, 92)',opacity:1}).addTo(map);

// se crea funcion para trazar la polilinea
const showRecordInfo = async () => {
    // Se obtienen los valores de fecha en los calendarios y se formatean para poder hacer la consulta.
    // Se tienen que formatear porque por defecto traen la siguiente estructura, YYYY/MM/DDThh:mm:ss,
    // Entonces se elimina la T que separa la fecha y la hora, y se coloca un espacio, obteniendo 
    // la siguiente estructura YYYY/MM/DD hh:mm:ss
    const idate = document.getElementById('idate').value.split('T').join(' ');
    const fdate = document.getElementById('fdate').value.split('T').join(' ');
    
    // Se hace el fetch a la api con las fechas para obtener la informacion de la base de datos
    fetch(`/record?idate=${idate}&fdate=${fdate}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    },
    ).then(response => {
        if (response.ok) {
            response.json().then(json => {
                const info = json;
                // Se crea un vector que va a contener las coordenadas de la polilinea
                const polylineCoords =  [];
                // Se rellena el vector con la informacion obtenida de la base de datos                
                for (let i = 0; i < info.length; i++) {
                    polylineCoords[i] = [info[i].lat,info[i].lng]
                }
                console.log(polylineCoords);
                // Se traza la polilinea
                polyline.setLatLngs(polylineCoords)
            });
        }
    });
};