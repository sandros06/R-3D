/*
 *
 *      HUB
 *
 */

// Get the DOM element to attach to
var hub = io.connect(window.location.origin);
var solutionNumber = 0;
var previousData = {};
previousData.orientation = {
  counter: 0,
  betaDeg: 0,
  gammaDeg: 0,
  alphaDeg: 0
};

previousData.motion = {
  counter: 0,
  acceleration: {
    x: 0,
    y: 0,
    z: 0
  },
  rotationRate: {
    betaDeg: 0,
    gammaDeg: 0,
    alphaDeg: 0
  },
  interval: 0
};

previousData.nipple = {
  counter: 0,
  force: 0,
  angleRad: 0
};

// Motion, orientation and nipple variables
var orientation = {
  counter: 0,
  betaDeg: 0,
  gammaDeg: 0,
  alphaDeg: 0
};

var motion = {
  counter: 0,
  acceleration: {
    x: 0,
    y: 0,
    z: 0
  },
  rotationRate: {
    betaDeg: 0,
    gammaDeg: 0,
    alphaDeg: 0
  },
  interval: 0
};

var nipple = {
  counter: 0,
  force: 0,
  angleRad: 0
};

/*
 *
 *   Handle Event
 *
 */

// Get solution number at connection
hub.on("solution", function (event)  {
    $(document).trigger("add-alerts", {
      message: "La solution "+event.number + " a été activé",
      priority: "info"
    });
    solutionNumber = event.number;
});

// Pour eviter la désync
function callMobile() {
    hub.emit("callMobile", {
      needSolution : true
    });

    console.log("No device detected");

    if(solutionNumber == 0) {
        setTimeout(callMobile, 6000);  
    }
}

// init solution
if(solutionNumber == 0) {  
  callMobile();
}

// Ping at connection from mobile to scene
hub.on("pingScene", function (event)  {
  if(event.return) {
    $(document).trigger("add-alerts", {
      message: "Connexion établi avec le mobile",
      priority: "info"
    });

    hub.emit("pingMobile", {
      msg : "ok"
    });
  }
});

// Handle sensor error
hub.on("noSupported", function (event)  {
  $(document).trigger("add-alerts", {
    message: "Le navigateur ne supporte pas le capteur suivant "+event.type,
    priority: "error"
  });
});

// Handle Device Motion event
hub.on("deviceMotion", function (event) {
    motion.counter               += 1;
    motion.acceleration.x        += event.acceleration.x;
    motion.acceleration.y        += event.acceleration.y;
    motion.acceleration.z        += event.acceleration.z;
    motion.rotationRate.betaDeg  += event.rotationRate.beta;
    motion.rotationRate.gammaDeg += event.rotationRate.gamma;
    motion.rotationRate.alphaDeg += event.rotationRate.alpha;
    
    motion.interval              += event.interval;

    previousData.motion.counter               = 1;
    previousData.motion.acceleration.x        = event.acceleration.x;
    previousData.motion.acceleration.y        = event.acceleration.y;
    previousData.motion.acceleration.z        = event.acceleration.z;
    previousData.motion.rotationRate.betaDeg  = event.rotationRate.beta;
    previousData.motion.rotationRate.gammaDeg = event.rotationRate.gamma;
    previousData.motion.rotationRate.alphaDeg = event.rotationRate.alpha;

    previousData.motion.interval              = event.interval;
});

// Handle Device Orientation event
hub.on("deviceOrientation", function (event) {
  orientation.counter  += 1;
  orientation.betaDeg  += event.beta;
  orientation.gammaDeg += event.gamma;
  orientation.alphaDeg += event.alpha;

  previousData.orientation.counter  = 1;
  previousData.orientation.betaDeg  = event.beta;
  previousData.orientation.gammaDeg = event.gamma;
  previousData.orientation.alphaDeg = event.alpha;
});

// Handle Device Nipple event
hub.on("deviceNipple", function (event) {
  nipple.counter  += 1;
  nipple.force    += event.force;
  nipple.angleRad += event.angleRad;

  previousData.nipple.counter  = 1;
  previousData.nipple.force    = event.force;
  previousData.nipple.angleRad = event.angleRad;
});