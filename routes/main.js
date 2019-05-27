const router = require('express').Router();

router.get('/', (req, res) => res.render('main.pug'));

module.exports = router;