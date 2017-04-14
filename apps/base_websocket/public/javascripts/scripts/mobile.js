//https://www.alsacreations.com/tuto/lire/1501-api-device-orientation-motion-acceleration.html

var hub = io.connect(window.location.origin);

hub.emit("pingScene", {
    return : true
});



function sendNoSupported(type) {

     $(document).trigger("add-alerts", {
      message: "Le navigateur ne supporte pas le capteur suivant "+type,
      priority: "error"
    });
    hub.emit("noSupported", {
            type : type
        });
}




if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function (event) {
        /* TODO check frequence of send data */ 

        if(event.alpha != null && event.beta != null && event.gamma != null){
           hub.emit("deviceOrientation", {
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma,
                interval : event.interval
            }); 
       }else{

            sendNoSupported("deviceOrientation");
       }
        

    }, false);
} else {
    sendNoSupported("deviceOrientation");
}

if (window.DeviceMotionEvent) {
    window.addEventListener("devicemotion", function (event) {
        if(event.acceleration.x != null && event.acceleration.y != null && event.acceleration.z != null){
              hub.emit("deviceMotion", {
                acceleration: {
                    x: event.acceleration.x,
                    y: event.acceleration.y,
                    z: event.acceleration.z
                },
                interval : event.interval,
                rotationRate : {
                    alpha: event.rotationRate.alpha,
                    beta : event.rotationRate.beta,
                    gamma: event.rotationRate.gamma
                }
            });  
          }else{

            sendNoSupported("deviceMotion");
          }
        
    }, false);
} else {
   
    sendNoSupported("deviceMotion");
}

/*
 *
 *      HUB
 *
 */


hub.on("pingMobile", function (event)  {
    $(document).trigger("add-alerts", {
      message: "Connexion établi avec la scène",
      priority: "info"
    });
});