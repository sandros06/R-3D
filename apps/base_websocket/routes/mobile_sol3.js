var express = require('express');
var router = express.Router();

/* GET mobile page. */
router.get('/', function(req, res, next) {
  res.render('mobile_sol3', { title: 'Mobile Solution 3' });
});

module.exports = router;