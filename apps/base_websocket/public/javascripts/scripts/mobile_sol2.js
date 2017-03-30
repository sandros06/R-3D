 var hub = io.connect(window.location.origin);
    hub.emit("solution", {
    number : 2
    });

var joystick = nipplejs.create({
            zone: document.getElementById('nipple'),
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'red',
            size: 200
        });

var s = function(sel) {
  return document.querySelector(sel);
};
var sId = function(sel) {
  return document.getElementById(sel);
};
var removeClass = function(el, clss) {
  el.className = el.className.replace(new RegExp('\\b' + clss + ' ?\\b', 'g'), '');
}

var elDebug = sId('debug');
var elDump = elDebug.querySelector('.dump');
var els = {
  position: {
    x: elDebug.querySelector('.position .x .data'),
    y: elDebug.querySelector('.position .y .data')
  },
  force: elDebug.querySelector('.force .data'),
  pressure: elDebug.querySelector('.pressure .data'),
  distance: elDebug.querySelector('.distance .data'),
  angle: {
    radian: elDebug.querySelector('.angle .radian .data'),
    degree: elDebug.querySelector('.angle .degree .data')
  },
  direction: {
    x: elDebug.querySelector('.direction .x .data'),
    y: elDebug.querySelector('.direction .y .data'),
    angle: elDebug.querySelector('.direction .angle .data')
  }
};

// Print data into elements


joystick.on('move', function (evt, nipple) {
	debug(nipple);
}).on('end', function (evt, nipple) {
	console.log("noo");
});


function debug(obj) {
  function parseObj(sub, el) {
    for (var i in sub) {
      if (typeof sub[i] === 'object' && el) {
        parseObj(sub[i], el[i]);
      } else if (el && el[i]) {
        el[i].innerHTML = sub[i];
      }
    }
  }
  setTimeout(function() {
    parseObj(obj, els);
  }, 0);
}
