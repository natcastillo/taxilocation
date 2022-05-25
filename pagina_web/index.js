// ======================== ++ EXPORTS ++ ===========================

const express = require("express");
const path = require("path");
require('dotenv').config();

// ======================== ++ CREAR APP ++ ===========================

const app = express();
app.set('port', process.env.PORT || 5000);
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
// fetch(www.facebook.com/login?placa=KJL236
// ======================== ++ API TIEMPO REAL ++ ===========================
app.get('/data', async (req, res) => {
  const vehiculo = req.query.placa;
  if (vehiculo === 'Todos') {
    query = `SELECT * FROM gps2sms_table ORDER BY ID DESC LIMIT 1`;
  } else {
    query = `SELECT * FROM gps2sms_table WHERE driver = "${vehiculo}" ORDER BY ID DESC LIMIT 1`;
  }
  connection.query(query, (err, result) => {
    if (!err) {
      return res.send(result).status(200);
    } else {
      console.log(`Ha ocurrido el siguiente ${err}`);
      return res.status(500);
    }
  });
});

// ======================== ++ API HISTORICOS ++ ===========================
app.get("/record", async (req, res) => {
  const idate = req.query.idate;
  const fdate = req.query.fdate;

  console.log(idate);

  const query = `SELECT * FROM gps2sms_table WHERE date BETWEEN '${idate}' AND '${fdate}'`;
  console.log(query);
  connection.query(query,(err, result) => {
    if (!err) {
      console.log(result);
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
  const date = info[2];
  const hour = info[3];
  const rpm = info[4];
  const driv = info[5];
  const dateComplete = date + " " + hour;  
  const query = `INSERT INTO gps2sms_table (lat, lng, date,rpm,driver) VALUES (${lat}, ${lng}, "${dateComplete}",${rpm},"${driv}")`;
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

app.listen(app.get('port'), () => console.log(`Server on port: ${app.get('port')}`));