const router = require('express').Router();
const cos = require('../models/cos_similarity');
const op = require('../models/operations');
const validSequences = require('../middleware/validateSequences')

router.get('/operations', (req, res) => res.render('operations.pug'));

router.post('/operations/cosine', validSequences('cosine'), (req, res) => {
    cos.similarity(req.body.seqId, req.body.nearest, req.body.kmer)
        .then(d => res.json(d))
        .catch(err => res.json("Internal Server Error").end(500))
})

router.post('/operations/isto', validSequences('isto'), (req, res) => {
    op.isto(req.body.is1, req.body.to1, req.body.is2, req.body.kmer)
        .then(d => res.json(d))
        .catch(err => res.json("Internal Server Error").end(500))
})

router.post('/operations/between', validSequences('between'), (req, res) => {
    op.between(req.body.seq1, req.body.seq2, req.body.kmer)
        .then(d => res.json(d))
        .catch(err => res.json("Internal Server Error").end(500))
})

module.exports = router;