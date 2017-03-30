var express = require('express');
var router = express.Router();

/* GET mobile page. */
router.get('/', function(req, res, next) {
  res.render('mobile_sol1', { title: 'Mobile Solution 1' });
});

module.exports = router;
