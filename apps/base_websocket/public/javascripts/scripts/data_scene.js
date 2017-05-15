/*
 *
 *      DATA SCENE
 *
 */

// Fait la moyenne des data sommé par le hub 
// TODO verif les divisions par 0 et enlevé en haut les if ici
function getSensorData()
{
    var result = {};

    if (motion.counter != 0)
    {
        result.motion = {
            acceleration : {
                x        : motion.acceleration.x / motion.counter,
                y        : motion.acceleration.y / motion.counter,
                z        : motion.acceleration.z / motion.counter      
            },
            rotationRate: {
                betaDeg  : motion.rotationRate.betaDeg / motion.counter,
                gammaDeg : motion.rotationRate.gammaDeg / motion.counter,
                alphaDeg : motion.rotationRate.alphaDeg / motion.counter
            },
            interval : motion.interval
        };
    }
    else 
    {
        result.motion = previousData.motion;
    }

    if (orientation.counter != 0)
    {
        result.orientation = {
            betaDeg  : orientation.betaDeg / orientation.counter,
            gammaDeg : orientation.gammaDeg/ orientation.counter,
            alphaDeg : orientation.alphaDeg/ orientation.counter
        };
    }
    else 
    {
        result.orientation = previousData.orientation;
    }

    if (nipple.counter != 0)
    {
        result.nipple = {
            force    : nipple.force    / nipple.counter,
            angleRad : nipple.angleRad / nipple.counter
        };
    }
    else 
    {
        result.nipple = previousData.nipple;
    }

    if(result.motion.interval >= 1000/60)
    {
        result.motion.interval = 1000/60;
    }

    // Kalman rate init and interval ! 
    kalmanAlpha.setRate(result.motion.rotationRate.alphaDeg);
    kalmanBeta.setRate(result.motion.rotationRate.betaDeg);
    kalmanGamma.setRate(result.motion.rotationRate.gammaDeg);

    kalmanBeta.setDeltat(result.motion.interval/1000);
    kalmanGamma.setDeltat(result.motion.interval/1000);
    kalmanAlpha.setDeltat(result.motion.interval/1000);

    //previousData = result;
    return result;          
}

function resetSensorData()
{
  motion.counter               = 0;
  motion.acceleration.x        = 0;
  motion.acceleration.y        = 0;
  motion.acceleration.z        = 0;
  motion.rotationRate.betaDeg  = 0;
  motion.rotationRate.gammaDeg = 0;
  motion.rotationRate.alphaDeg = 0;
  motion.interval              = 0;

  orientation.counter  = 0;
  orientation.betaDeg  = 0;
  orientation.gammaDeg = 0;
  orientation.alphaDeg = 0;

  nipple.counter  = 0;
  nipple.force    = 0;
  nipple.angleRad = 0;
}
