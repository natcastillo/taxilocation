const express = require("express");
const path = require("path");
require('dotenv').config();


const data = {
  lat: "",
  long: "",
  time: "",
  date: "",
  
}

//Conexión de de la rds 

const mysql  = require('mysql')
var connection = mysql.createConnection({

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




const insertData = async (lat, lng, date, hour) => {
  const dateComplete = date + " " + hour;  
  const query = `INSERT INTO gps2sms_table (lat, lng, date) VALUES (${lat}, ${lng}, "${dateComplete}")`;
  console.log(dateComplete)
  connection.query(query, function(err, result){
    if(err)throw err;
    console.log("insertao")
  })
};


//>>>>>>> main
const app = express();
app.use(express.json())

app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) => {
  //res.send("hello world!");
  console.log(process.env.DB_DATABASE);
  res.sendFile(path.join(__dirname + "/paginaweb.html"));
});

const getLastLocation = async () => {
  const query = `SELECT * FROM gps2sms_table ORDER BY ID DESC LIMIT 1`;
  //const {rows:[{lat,lng,date}]} = 
  const variablefea = await connection.query(query);
  console.log(variablefea)
  const {
    lat, lng, date
  } = variablefea
  console.log(lat, lng,date)
  return {lat,lng,date}
};

app.get("/data", async (req, res) => {
    const info = await getLastLocation()
    res.send(info).status(200); 
});

const dgram = require('dgram');
const { time } = require("console");
const server = dgram.createSocket('udp4');
server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});
server.on('message', async (msg, senderInfo) => {
  console.log('Messages received ' + msg)
  const mensaje = String(msg).split(",")
  data.lat = mensaje[0]
  data.long = mensaje[1]
  data.time = mensaje[2]
  data.date = mensaje[3]
  console.table(data)
  insertData(data.lat,data.long, data.date,data.time);
  server.send(msg, senderInfo.port, senderInfo.address, () => {
    console.log(`Message sent to ${senderInfo.address}:${senderInfo.port}`)
  })
});
server.on('listening', (req, res) => {
  const address = server.address();
  console.log(`UDP server listening on: ${address.address}:${address.port}`);
});


server.bind(3000);
app.listen(5000, () => console.log('Server on port: 5000'));
