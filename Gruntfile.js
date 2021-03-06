module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-jscs");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-mocha-istanbul");
    grunt.loadNpmTasks("grunt-express-server");

    var testOutputLocation = process.env.CIRCLE_TEST_REPORTS || "test_output";
    var artifactsLocation = "build_artifacts";
    grunt.initConfig({
        uglify: {
            my_target: {
                files: {
                    "public/main.js": [
                        "public/app/app.js",
                        "public/app/todo-factory.js",
                        "public/app/directives/*.js",
                        "public/app/services/*.js",
                        "public/app/controllers/*.js"
                    ]
                }
            }
        },
        watch: {
            express: {
                files: ["server.js", "server/server.js" , "public/*.css"],
                tasks: ["express:dev"],
                options: {
                    livereload: true,
                    spawn: false
                }
            }
        },
        express: {
            options: {
                port: 8080
            },
            dev: {
                options: {
                    script: "server.js"
                }
            }
        },
        jshint: {
            all: ["Gruntfile.js", "server.js", "server/**/*.js", "test/**/*.js", "public/app/*.js"],
            options: {
                jshintrc: true
            }
        },
        jscs: {
            all: ["Gruntfile.js", "server.js", "server/**/*.js", "test/**/*.js", "public/app/*.js"]
        },
        mochaTest: {
            test: {
                src: ["test/**/*.js"]
            },
            ci: {
                src: ["test/**/*.js"],
                options: {
                    reporter: "xunit",
                    captureFile: testOutputLocation + "/mocha/results.xml",
                    quiet: false
                }
            }
        },
        "mocha_istanbul": {
            test: {
                src: ["test/**/*.js"]
            },
            ci: {
                src: ["test/**/*.js"],
                options: {
                    quiet: false
                }
            },
            options: {
                coverageFolder: artifactsLocation,
                reportFormats: ["none"],
                print: "detail"
            }
        },
        "istanbul_report": {
            test: {

            },
            options: {
                coverageFolder: artifactsLocation
            }
        },
        "istanbul_check_coverage": {
            test: {

            },
            options: {
                coverageFolder: artifactsLocation,
                check: {
                    lines: 100,
                    statements: 100,
                    branches: 100,
                    functions: 100
                }
            }
        }
    });

    grunt.registerMultiTask("istanbul_report", "Solo task for generating a report over multiple files.", function () {
        var done = this.async();
        var cmd = process.execPath;
        var istanbulPath = require.resolve("istanbul/lib/cli");
        var options = this.options({
            coverageFolder: "coverage"
        });
        grunt.util.spawn({
            cmd: cmd,
            args: [istanbulPath, "report", "--dir=" + options.coverageFolder]
        }, function(err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    grunt.registerTask("check", ["jshint", "jscs"]);
    grunt.registerTask("test", ["check", "uglify", "mochaTest:test", "mocha_istanbul:test", "istanbul_report",
        "istanbul_check_coverage"]);
    grunt.registerTask("ci-test", ["check", "uglify", "mochaTest:ci", "mocha_istanbul:ci", "istanbul_report",
        "istanbul_check_coverage"]);
    grunt.registerTask("serve", ["uglify", "express:dev", "watch"]);
    grunt.registerTask("default", ["uglify", "test", "serve"]);
};
