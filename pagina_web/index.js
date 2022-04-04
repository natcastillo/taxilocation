const express = require("express");
const path = require("path");
const moment = require('moment')
require('dotenv').config();



const data = {
  lat: "",
  long: "",
  time: "",
  date: "",
  
}

//Conexión de de la rds 

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


const getRecordInfo = async (date1,date2) => {
  const query = `SELECT * FROM gps2sms_table WHERE date BETWEEN ${date1} AND ${date2}`;
  const {rows:[{lat,lng,date}]} = await connection.query(query);
  return {lat,lng,date}
};
app.get("/data", async (req, res) => {
  const query = `SELECT * FROM gps2sms_table ORDER BY ID DESC LIMIT 1`;
  connection.query(query,(err,result) => {
    if (!err) {
      return res.send(result).status(200);     
    } else {
        console.log(`Ha ocurrido el siguiente ${err}`);
        return res.status(500);
    };
  });
});
app.get("/record", async (req, res) => {
  const info = await getLastLocation()
  res.send(info).status(200); 
});
 app.post('/historicos'), async(req,res)=>{
  let idate = req.body.finicial, fdate = req.body.ffinal
  idate = new Date(idate), fdate = new Date(fdate)
  idate = moment(idate).format('YYYY:MM:DD HH:mm:ss')
  fdate = moment(fdate).format('YYYY:MM:DD HH:mm:ss')
  query = `SELECT * FROM gps2sms_table WHERE date BETWEEN ${idate} AND ${fdate}`
  response = await new Promise((resolve,reject)=>{
      connection.query(query,(e,d)=>{
          if(e)throw e
          else{console.log(query,d)
              resolve(d)
          }
      })
  })
  res.status(200).json({
      response
  })
 }

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
