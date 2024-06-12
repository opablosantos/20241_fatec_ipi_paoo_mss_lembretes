require('dotenv').config()
const express = require('express')
const axios = require('axios')
const app = express()

app.use(express.json())

const eventos = []

app.post('/eventos', async (req, res) => {
  const evento = req.body
  eventos.push(evento)
  console.log(evento)

  try {
    if (evento.type === 'ObservacaoCriada') {
      await axios.post('http://localhost:7000/eventos', evento) // Classificação
    }

    if (evento.type === 'ObservacaoClassificada') {
      await axios.post('http://localhost:5000/eventos', evento) // Observações
    }

    if (evento.type !== 'ObservacaoClassificada') {
      await axios.post('http://localhost:6000/eventos', evento) // Consulta
    }
  } catch (e) {
    console.error('Erro ao enviar evento:', e.message)
  }

  res.status(200).end()
})

app.get('/eventos', (req, res) => {
  res.status(200).json(eventos)
})

app.listen(process.env.PORT, () => {
  console.log(`Barramento: ${process.env.PORT}`)
})
