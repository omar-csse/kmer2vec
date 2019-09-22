const api = require('./models')
const is_sequence = require('../../middleware/issequence')
const valid_page = require('../../middleware/validPage')
const router = require('express').Router()
const e = require('./errors')

router.get('/api/kmer2vec/promoters', valid_page, (req, res, next) => {
    api.responseSeq(req, true)
        .then(data => res.json(data))
        .catch(err => next(e.err("Internal Server Error", 500)))
})

router.get('/api/seq2vec/promoters', valid_page, (req, res) => {
    api.responseSeq(req, false)
        .then(data => res.json(data))
        .catch(err => next(e.err("Internal Server Error", 500)))
})

router.get('/api/kmer2vec/promoters/:id', is_sequence, (req, res) => {
    api.responseSeqId(req, true)
        .then(data =>res.json(data))
        .catch(err => next(e.err("Internal Server Error", 500)))
})

router.get('/api/seq2vec/promoters/:id', is_sequence, (req, res) => {
    api.responseSeqId(req, false)
        .then(data =>res.json(data))
        .catch(err => next(e.err("Internal Server Error", 500)))
})

module.exports = router