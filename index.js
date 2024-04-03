require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());

const mysql = require("mysql2");

const PORT = process.env.PORT || 4000;
app.set("view engine", "ejs");

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 10,
  port: process.env.DB_PORT,
  multipleStatements: true,
});

connection.getConnection((err) => {
  if (err) return console.log(err.message);
  console.log("connected to local mysql db using .env properties");
});

app.get("/burgers", (req, res) => {
  let allburgers = `SELECT *
                       FROM rest_menu`;
  connection.query(allburgers, (err, data) => {
    if (err) throw err;
    res.json({ data });
  });
});

app.get("/burgers/:rowid", (req, res) => {
  let r_id = req.params.rowid;
  let getburger = `SELECT *
                       FROM rest_menu WHERE id=${r_id}`;
  connection.query(getburger, (err, data) => {
    if (err) throw err;
    res.json({ data });
  });
});

app.use(express.urlencoded({ extended: true }));

app.post("/burgers/add", (req, res) => {
  //this line is for API security
  let api_key = req.header("x-api-key");

  // every post from a client needs 554400 sent via its header, also for API security down to the else statement
  if (api_key !== "554400") {
    respObj = {
      id: null,
      title: `Not Authorised`,
      message: `Client requires a API key`,
    };
    res.json({ respObj });
  } else {
    let name = req.body.burgerField;
    let cost = req.body.priceField;
    let type = req.body.type_id;

    let addBurger = `INSERT INTO rest_menu (title, price, type_id) 
                            VALUES ('${name}', ${cost}, ${type});`;

    connection.query(addBurger, (err, result) => {
      if (err) {
        res.json({ err }); // Send error response
      } else {
        let respObj = {
          id: result.insertId, // Use result.insertId instead of data.insertId
          title: name,
          message: `${name} added to the menu`,
        };
        res.json({ respObj }); // Send success response
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
