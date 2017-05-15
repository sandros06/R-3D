 var hub = io.connect(window.location.origin);

function sendSolutionNumber(){
  hub.emit("solution", {
    number : 2
    }); 
}
sendSolutionNumber();
   
// Pour eviter la désync 
hub.on("callMobile",function(event) {
    if(event.needSolution){
      sendSolutionNumber();
    }

});

var joystick = nipplejs.create({
            zone: document.getElementById('nipple'),
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'white',
            size: 200
        });


joystick.on('move', function (evt, nipple) {
	hub.emit("deviceNipple", {
	    force : nipple.force,
	    angleRad : nipple.angle.radian
    });
});

joystick.on('end', function (evt, nipple) {
  hub.emit("deviceNipple", {
      force : 0,
      angleRad : 0
    });
});


