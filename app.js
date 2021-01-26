const express = require('express')
const stripe = require('stripe')(process.env.KEY)
const cors = require('cors')
const axios = require('axios')
const connection = require('./helpers/setupConnection')
const bodyParser = require('body-parser')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.post('/checkout', (req, res) => {
  console.log('Request:', req.body)
  const { amount, currency, token } = req.body

  let error
  let status

  stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) =>
      stripe.charges.create({
        amount,
        currency,
        customer: customer.id,
        receipt_email: token.email,
        description: 'Paying Koko through his payMe app',
        metadata: {
          ...token.card,
        },
      })
    )
    .then((charge) => {
      console.log('Charge:', { charge })
      status = 'success'
    })
    .catch((err) => {
      console.error('Error:', err)
      error = err
      status = 'failure'
    })
    .finally(() => {
      res.json({ error, status })
    })
})

app.post('/fetchWeather', (req, res) => {
  console.log('Request:', req.body)
  const { lat, lng, date } = req.body
  axios(`https://dark-sky.p.rapidapi.com/${lat},${lng},${date}`, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'dark-sky.p.rapidapi.com',
      'x-rapidapi-key': process.env.DARK_SKY_API_KEY,
      'Access-Control-Allow-Origin': '*',
    },
  })
    .then((e) => {
      console.log(e)
      res.json(e)
    })
    .catch((e) => res.json(e))
})


// below are handled by node server on cpanel

app.post('api/generalServer/endpoint', (req, res) => {
  const { query } = req.body

  try {
    connection.query(
      query,
      (err, results, fields) => {
        if (err) {
          res.json(err)
        } else {
          res.json({
            results,
            fields,
          })
        }
      }
    )
  } catch (error) {
    res.json({ error: error.message })
  }
})

app.listen(process.env.PORT || 3000)

module.exports = app
