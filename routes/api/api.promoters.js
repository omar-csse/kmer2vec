const api = require('./models')
const router = require('express').Router()


router.get('/api/kmer2vec/promoters', async (req, res) => {
    try {
        res.json(await api.responseSeq(req, true))
    } catch (error) {
        res.json(error).end(404)
    }
})

router.get('/api/doc2vec/promoters', async (req, res) => {
    try {
        res.json(await api.responseSeq(req, false))
    } catch (error) {
        res.json(error).end(404)
    }
})

router.get('/api/kmer2vec/promoters/:id', async (req, res) => {
    try {
        res.json(await api.responseSeqId(req, true))
    } catch (error) {
        res.json(error).end(404)
    }
})

router.get('/api/doc2vec/promoters/:id', async (req, res) => {
    try {
        res.json(await api.responseSeqId(req, false))
    } catch (error) {
        res.json(error).end(404)
    }
})

module.exports = router