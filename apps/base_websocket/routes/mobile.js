var express = require('express');
var router = express.Router();

/* GET mobile page. */
router.get('/', function(req, res, next) {
  res.render('mobile', { title: 'Express Mobile' });
});

module.exports = router;
