var express = require('express');
var router = express.Router();

/* GET scene page. */
router.get('/', function(req, res, next) {
  res.render('scene2', { title: 'Express Scene2' });
});

module.exports = router;
