var colors = require('colors');

var dev_config = {
  dbUrl: "mongodb://onion:!<684ygrJ51Vx)3@192.241.191.6:27017/onion",
  mqServerUrl: "amqp://onionCore:p@192.241.191.6",
  port: 81
};

var pro_config = {
  dbUrl: "mongodb://onion:!<684ygrJ51Vx)3@db.onion.io:27017/onion",
  mqServerUrl: "amqp://onionCore:p@test.onion.io",
  port: 80
};

var init = function() {
  if (process.env.MANAGER_EVN == 'development') {
    return dev_config;
  } else if (process.env.MANAGER_EVN == 'production') {
    return pro_config
  } else {
    console.log('please specify the mode using:'.red);
    console.log('MANAGER_EVN="development" node main.js'.red);
    console.log('MANAGER_EVN="production" node main.js'.red);
    process.exit();
  }
}

module.exports = {
  init: init
};
