# grunt-wait-port

Grunt task to run a server, wait for its port to open, then run another task.  
Works only on Unix-based systems.

## Installation

Add the following to your `package.json`:

```javascript
  "grunt-wait-port": "git+https://github.com/vintasoftware/grunt-wait-port.git",
```

Add the folloing to your `grunt.js`. Here, we assume you have two tasks defined, `run_server` and `run_tests`:

```javascript
grunt.loadNpmTasks('grunt-wait-port');

grunt.initConfig({

  //...

  waitport: {
    test: {
      options: {
        server: ['run_server'],
        port: 3000,
        other: ['run_tests']
      }
    }
  }

  //...

});
```


## Shortcuts

Create shortcut tasks by giving common tasks easy names.

```javascript
grunt.registerTask("test", 'build waitport:test');
```

## Output

By default, waitport will ignore the output of `server` and will show the output of `other` task.  
You can override this by using the `stdioServer` and `stdioOther` options, which accept values according [node.js `child_process.spawn` stdio param](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)
