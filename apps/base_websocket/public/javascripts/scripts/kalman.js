
//Kalman Class
class Kalman {

  constructor() {
    this.newRate = 0;   // the rate should be in degrees per second
    this.deltat = 0.1;  // the delta time in seconds

    this.Q_angle = 0.001;   // Process noise variance for the accelerometer
    this.Q_bias = 0.003;    // Process noise variance for the gyro bias
    this.R_measure = 0.03;  // Measurement noise variance - this is actually the variance of the measurement noise

    this.angle = 0.0;   // The angle calculated by the Kalman filter - part of the 2x1 state vector // Reset the angle
    this.bias = 0.0;    // The gyro bias calculated by the Kalman filter - part of the 2x1 state vector // Reset bias
    this.rate = 0.0;    // Unbiased rate calculated from the rate and the calculated bias - you have to call getAngle to update the rate
    this.P = [          // Error covariance matrix - This is a 2x2 matrix
      [0.0,0.0]
      [0.0,0.0]
    ];                  
  }
      
  // The newAngle should be in degrees 
  getAngle(newAngle) {
    // KasBot V2  -  Kalman filter module - http://www.x-firm.com/?page_id=145
    // See my blog post for more information: http://blog.tkjelectronics.dk/2012/09/a-practical-approach-to-kalman-filter-and-how-to-implement-it

    // Discrete Kalman filter time update equations - Time Update ("Predict")
    // Update xhat - Project the state ahead
    /* Step 1 */
    rate = newRate - bias;
    angle += deltat * rate;

    // Update estimation error covariance - Project the error covariance ahead
    /* Step 2 */
    P[0][0] += deltat * (deltat*P[1][1] - P[0][1] - P[1][0] + Q_angle);
    P[0][1] -= deltat * P[1][1];
    P[1][0] -= deltat * P[1][1];
    P[1][1] += Q_bias * deltat;

    // Discrete Kalman filter measurement update equations - Measurement Update ("Correct")
    // Calculate Kalman gain - Compute the Kalman gain
    /* Step 4 */
    var S = P[0][0] + R_measure; // Estimate error
    /* Step 5 */
    var K = [
        P[0][0] / S,
        P[1][0] / S
    ]; // Kalman gain - This is a 2x1 vector


    // Calculate angle and bias - Update estimate with measurement zk (newAngle)
    /* Step 3 */
    var y = newAngle - angle; // Angle difference
    /* Step 6 */
    angle += K[0] * y;
    bias += K[1] * y;

    // Calculate estimation error covariance - Update the error covariance
    /* Step 7 */
    var P00_temp = P[0][0];
    var P01_temp = P[0][1];

    P[0][0] -= K[0] * P00_temp;
    P[0][1] -= K[0] * P01_temp;
    P[1][0] -= K[1] * P00_temp;
    P[1][1] -= K[1] * P01_temp;

    return angle;
  }

  // Used to set angle, this should be set as the starting angle
  setAngle(angle) {
    this.angle  = angle
  }
}