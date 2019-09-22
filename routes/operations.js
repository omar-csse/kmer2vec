const router = require('express').Router();
const cos = require('../models/cos_similarity');
const op = require('../models/operations');
const validSequences = require('../middleware/validateSequences')
const e = require('./api/errors')

router.get('/operations', (req, res) => res.render('operations.pug'));

router.post('/operations/cosine', validSequences('cosine'), (req, res, next) => {
    cos.similarity(req.body.seqId, req.body.nearest, req.body.kmer)
        .then(d => res.json(d))
        .catch(err => next(e.err("Internal Server Error", 500)))
})

router.post('/operations/isto', validSequences('isto'), (req, res, next) => {
    op.isto(req.body.is1, req.body.to1, req.body.is2, req.body.kmer)
        .then(d => res.json(d))
        .catch(err => next(e.err("Internal Server Error", 500)))
})

router.post('/operations/between', validSequences('between'), (req, res, next) => {
    op.between(req.body.seq1, req.body.seq2, req.body.kmer)
        .then(d => res.json(d))
        .catch(err => next(e.err("Internal Server Error", 500)))
})

module.exports = router;