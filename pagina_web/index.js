// ======================== ++ EXPORTS ++ ===========================

const express = require("express");
const path = require("path");
require('dotenv').config();

// ======================== ++ CREAR APP ++ ===========================

const app = express();
app.use(express.json())
app.use(express.static(__dirname + '/public'));

// ======================== ++ COONECTAR A BASE DE DATOS ++ =========================== 

const mysql  = require('mysql2');
const connection = mysql.createConnection({
  user: process.env.U,
  host: process.env.H,
  database: process.env.D,
  password: process.env.P,
  port: "3306"
})  
connection.connect(function (err){
  if(err)throw err;
  console.log("conectao")
})

// ======================== ++ RUTAS WEB ++ ===========================

app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname + "/paginaweb.html"));
});

app.get("/historicosFecha", (req, res) => {
  return res.sendFile(path.join(__dirname + "/record.html"));
});

app.get("/historicosRango", (req, res) => {
  return res.sendFile(path.join(__dirname + "/recordRange.html"));
});

// ======================== ++ APIS ++ ===========================

// ======================== ++ API TIEMPO REAL ++ ===========================
app.get("/data", async (req, res) => {
  connection.query(`SELECT * FROM taxis`, function(error, data){
    if(error) {
      console.log(error);
      res.status(500).send();
    }else{
      const placas = data;
      var finalArray = new Array();
      var cont = 0;
      for(var i=0; i<data.length; i++){
				getOneCar(placas[i].Id).then(function(response){
					finalArray.push(response);
					if(cont == data.length - 1){
            console.log(finalArray);
						res.send(finalArray);
					}else{
						cont++;
					}
				},
        function(rejected){
          console.log(rejected);
          res.status(500).send();
        });
			}
    }
  });
});

// ======================== ++ API HISTORICOS ++ ===========================
app.get("/record", async (req, res) => {
  const idate = req.query.idate;
  const fdate = req.query.fdate;

  const query = `SELECT * FROM gps2sms_table WHERE date BETWEEN STR_TO_DATE( "${idate}" ,"%Y-%m-%d %H:%i:%s") AND STR_TO_DATE( "${fdate}" ,"%Y-%m-%d %H:%i:%s")`;
  connection.query(query,(err, result) => {
    if (!err) {
      return res.send(result).status(200);
    } else {
      console.log(`Ha ocurrido el siguiente ${err}`);
      return res.status(500);
    }
  })
});

// ======================== ++ API RANGOS ++ ===========================
app.get("/recordRange", async (req, res) => {
  const lat1 = req.query.lat1;
  const lat2 = req.query.lat2;
  const lon1 = req.query.lon1;
  const lon2 = req.query.lon2;

  const query = `SELECT * FROM gps2sms_table WHERE (lat BETWEEN "${lat1}" AND "${lat2}") AND (lng BETWEEN "${lon1}" AND "${lon2}")`;
  connection.query(query,(err, result) => {
    if (!err) {
      return res.send(result).status(200);
    } else {
      console.log(`Ha ocurrido el siguiente ${err}`);
      return res.status(500);
    }
  })
});


// ======================== ++ GUARDAR INFO RECIBIDA ++ ===========================

const insertData = async (info) => {
  const lat = info[0];
  const lng = info[1];
  const date = info[3];
  const hour = info[2];
  const rpm = info[4];
  const dateComplete = date + " " + hour;  
  const query = `INSERT INTO gps2sms_table (lat, lng, date,rpm) VALUES (${lat}, ${lng}, "${dateComplete}",${rpm})`;
  connection.query(query, function(err, result){
    if(err)throw err;
    console.log("Registro guardado exitosamente.")
  })
};

// ======================== ++ CREAR SOCKET ++ ===========================

const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
socket.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  socket.close();
});
socket.on('message', async (msg, senderInfo) => {
  console.log('Messages received ' + msg)
  const infoMensaje = String(msg).split(",")
  insertData(infoMensaje);
  socket.send(msg, senderInfo.port, senderInfo.address, () => {
    console.log(`Message sent to ${senderInfo.address}:${senderInfo.port}`)
  })
});
socket.on('listening', (req, res) => {
  const address =   socket.address();
  console.log(`UDP server listening on: ${address.address}:${address.port}`);
});

// ======================== ++ INICIAR SOCKET ++ ===========================

socket.bind(3000);

// ======================== ++ INICIAR SERVIDOR ++ ===========================

app.listen(5000, () => console.log('Server on port: 5000'));

// ======================== ++ PROMISES ++ ===========================

function getOneCar(auto){
	return new Promise(function(resolve, reject){
		connection.query(`SELECT * FROM gps2sms_table WHERE driver = '${auto}' ORDER BY Id DESC LIMIT 1`, function(error, data){
			if(error){
				console.log("Error in query: ", error);
        reject(error);
			}else{
				resolve(data[0]);
			}
		});
	});
}