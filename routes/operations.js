const router = require('express').Router();

router.get('/operations/', (req, res) => res.render('operations.pug'));

module.exports = router;