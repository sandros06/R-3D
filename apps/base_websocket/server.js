
var port = 4040;

var express = require('express');
var bodyParser = require('body-parser')
var hbs = require('hbs');


//express config
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
     // to support URL-encoded bodies
    extended: true
}));
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.set('views', __dirname + '/views'); // you can change '/views' to '/public',


//routes
app.get('/', function (req, res) {
    res.render('index', {})
});

app.get('/mobile', function (req, res) {
    res.render('mobile', {})
});

app.get('/scene', function (req, res) {
    res.render('scene', {})
});


var http = require('http').Server(app);

//https://openclassrooms.com/courses/des-applications-ultra-rapides-avec-node-js/socket-io-passez-au-temps-reel
var hub = require('socket.io')(http);
hub.on('connection', function (socket) {
    socket.on('deviceOrientation', function ( event ) {
        socket.broadcast.emit('deviceOrientation', event );
    });
    
    socket.on('deviceMotion', function (event) {
        socket.broadcast.emit('deviceMotion', event);
    });
});


http.listen(port, function () {
    console.log('listening on *:' + port);
});