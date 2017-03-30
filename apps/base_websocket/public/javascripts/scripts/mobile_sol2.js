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