require('dotenv').config()
const axios = require('axios')
const express = require('express')

const app = express()
app.use(express.json())

const { PORT } = process.env

// Base consolidada para armazenar lembretes e observações
const baseConsolidada = {}

// Funções para processar eventos e atualizar a base consolidada
const funcoes = {
  LembreteCriado: (lembrete) => {
    baseConsolidada[lembrete.id] = lembrete
  },
  ObservacaoCriada: (observacao) => {
    const observacoes = baseConsolidada[observacao.lembreteId].observacoes || []
    observacoes.push(observacao)
    baseConsolidada[observacao.lembreteId].observacoes = observacoes
  },
  ObservacaoAtualizada: (observacao) => {
    const observacoes = baseConsolidada[observacao.lembreteId].observacoes
    const indice = observacoes.findIndex(o => o.id === observacao.id)
    observacoes[indice] = observacao
  },
  LembreteClassificado: (lembrete) => {
    if (baseConsolidada[lembrete.id]) {
      baseConsolidada[lembrete.id].classificacao = lembrete.classificacao
    }
  }
}

// Endpoint para fornecer a base consolidada de lembretes e observações
app.get('/lembretes', (req, res) => {
  res.json(baseConsolidada)
})

// Endpoint para receber eventos e atualizar a base consolidada
app.post('/eventos', (req, res) => {
  try {
    const evento = req.body
    if (funcoes[evento.type]) {
      funcoes[evento.type](evento.payload)
    }
  } catch (e) {
    console.error('Erro ao processar evento:', e.message)
  }
  res.status(200).json(baseConsolidada)
})

// Inicia o servidor e processa eventos pendentes
app.listen(PORT, async () => {
  console.log(`Consulta: ${PORT}`)
  const eventos = await axios.get('http://localhost:10000/eventos')
  eventos.data.forEach((valor) => {
    if (funcoes[valor.type]) {
      funcoes[valor.type](valor.payload)
    }
  })
})
