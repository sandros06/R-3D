var express = require('express');
var router = express.Router();

/* GET scene page. */
router.get('/', function(req, res, next) {
  res.render('scene', { title: 'Express Scene' });
});

module.exports = router;
