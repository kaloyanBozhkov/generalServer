const mysql = require('mysql')

const connection = mysql.createPool({
  host: process.env.REACT_APP_HOST,
  port: 3307,
  user: process.env.REACT_APP_USERNAME,
  password: process.env.REACT_APP_PASSWORD,
  database: process.env.REACT_APP_DATABASE,
  multipleStatements: true
})

module.exports = connection