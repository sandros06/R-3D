var express = require('express');
var router = express.Router();

/* GET mobile page. */
router.get('/', function(req, res, next) {
  res.render('mobile_sol2', { title: 'Mobile Solution 2' });
});

module.exports = router;
