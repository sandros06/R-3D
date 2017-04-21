//https://www.alsacreations.com/tuto/lire/1501-api-device-orientation-motion-acceleration.html

var hub = io.connect(window.location.origin);

hub.emit("pingScene", {
    return: true
});


function sendNotSupported(type) {
    $(document).trigger("add-alerts", {
        message: "Le navigateur ne supporte pas le capteur suivant " + type,
        priority: "error"
    });

    hub.emit("noSupported", {
        type: type
    });
}

if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function (event) {
        /* TODO check frequence of sent data */

        if (event.alpha != null && event.beta != null && event.gamma != null) {
            hub.emit("deviceOrientation", {
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma
            });
        }
    }, false);
} else {
    sendNotSupported("deviceOrientation");
}

if (window.DeviceMotionEvent) {
    window.addEventListener("devicemotion", function (event) {
        if (event.acceleration.x != null && event.acceleration.y != null && event.acceleration.z != null) {
            hub.emit("deviceMotion", {
                accelerationIncludingGravity: {
                    x: event.accelerationIncludingGravity.x,
                    y: event.accelerationIncludingGravity.y,
                    z: event.accelerationIncludingGravity.z
                },
                acceleration: {
                    x: event.acceleration.x,
                    y: event.acceleration.y,
                    z: event.acceleration.z
                }
            });
        }
    }, false);
} else {

    sendNotSupported("deviceMotion");
}

/*
 *
 *      HUB
 *
 */

hub.on("pingMobile", function (event) {
    $(document).trigger("add-alerts", {
        message: "Connexion établi avec la scène",
        priority: "info"
    });
});
