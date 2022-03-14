const express = require("express");
const path = require("path");
const { Client } = require("pg");

const data = {
  lat: "",
  long: "",
  time: "",
  date: ""
}
const connectionString =
  "postgres://gps2sms_user:AwjZG2W7HorhezoDQGUAXM7IGjq1KJ2W@oregon-postgres.render.com/gps2sms?ssl=true";

const client = new Client({ connectionString });
client.connect();

const createTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS gps2sms_table (
        id SERIAL PRIMARY KEY,
        lat REAL,
        lng REAL,
        date TIMESTAMP,
        hour TIME)`;
  await client.query(query);
};

const insertData = async (lat, lng, date, hour) => {
  const query = `INSERT INTO gps2sms_table (lat, lng, date, hour) VALUES ($1, $2, $3, $4)`;
  await client.query(query, [lat, lng, date, hour]);
};
//createTable();
const listTables = async () => {
  const query = `SELECT 
   table_name, 
   column_name, 
   data_type 
FROM 
   information_schema.columns
WHERE 
   table_name = 'gps2sms_table';
`;
  const res = await client.query(query);
  console.log(res.rows);
};
//listTables();

const dropTable = async () => {
  const query = `DROP TABLE gps2sms_table`;
  await client.query(query);
};
//dropTable();
//insertData(latitud, longitud, fecha);

const app = express();
app.use(express.json())

app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) => {
  //res.send("hello world!");
  res.sendFile(path.join(__dirname + "/paginaweb.html"));
});
const getLastLocation = async () => {
  const query = `SELECT * FROM gps2sms_table ORDER BY ID DESC LIMIT 1`;
  const {rows:[{lat,lng,date,hour}]} = await client.query(query);
  return {lat,lng,date,hour}
};
app.get("/data", async (req, res) => {
    const info = await getLastLocation()
    res.send(info).status(200);
  
});

const dgram = require('dgram');
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
  insertData(data.lat,data.long,new Date(data.date),data.time);
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