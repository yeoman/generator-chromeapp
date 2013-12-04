/*jshint camelcase: false*/
// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
'use strict';

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        yeoman: {
            app: 'app'
        },
        watch: {
            options: {
                spawn: false
            },
            livereload: {
                options: {
                    livereload: '<%%= connect.livereload.options.livereload %>'
                },
                files: [
                    '<%%= yeoman.app %>/**/*.*'
                ]
            }
        },
        connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    livereload: 35729,
                    base: [
                        '<%%= yeoman.app %>'
                    ]
                }
            }
        }
    });

    grunt.registerTask('run', function (opt) {
        grunt.task.run([
            'connect:livereload',
            'watch'
        ]);
    });
};
