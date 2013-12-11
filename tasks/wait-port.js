var exec = require('child_process').exec;
var net = require('net');
var format = require('util').format;

module.exports = function (grunt) {
  "use strict";
  
  grunt.registerMultiTask('waitport', "Run a server, waits for its port to open, then run another task.", function() {
    var done = this.async();
    var options = this.options({
      stdioServer: 'ignore',
      stdioOther: 'inherit'
    });
    
    var isInt = function (n) {
       return typeof n === 'number' && parseFloat(n) == parseInt(n, 10) && !isNaN(n);
    };

    if (!isInt(options.port)) {
      grunt.log.warn(
        'Please add a integer port number in options.'
      );
      done(false);
    }

    var serverChild = grunt.util.spawn({
      grunt: true,
      args: options.server,
      opts: { stdio: options.stdioServer }
    }, function (err, result, code) {
      var success = code === 0;
      done(success);
    });

    grunt.log.warn('Trying to connect with the server...');
    var detectServer = function () {
      var client = net.connect({port: options.port}, function() {
        grunt.log.ok('Connected with server. Will run other task.');

        var otherChild = grunt.util.spawn({
          grunt: true,
          args: options.other,
          opts: { stdio: options.stdioOther }
        }, function (err, result, code) {
          var success = code === 0;
          done(success);
          grunt.log.ok('Other task is done, will stop server.');
          killServer();
        });
      });

      client.on('end', function() {
        grunt.log.warn('Server disconnected.');
      });

      client.on('error', function() {
        // try again:
        setTimeout(detectServer, 1500);
      });
    };

    var killServer = function () {
      // try to kill server with fuser:
      exec(format('fuser -k %d/tcp', options.port), function (error) {
        if (error !== null) {
          // since fuser failed, try with lsof + kill:
          exec(format('kill $(lsof -t -i tcp:%d)', options.port));
        }
      });
    };

    detectServer();

    process.on('exit', function() {
      killServer();
    });
  });

};
