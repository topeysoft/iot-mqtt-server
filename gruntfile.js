module.exports = function (grunt) {
  "use strict";

  grunt.initConfig({
    copy: {
      build: {
        files: [{
            expand: true,
            cwd: "./public",
            src: ["**"],
            dest: "./build/public"
          },
          {
            expand: true,
            cwd: "./views",
            src: ["**"],
            dest: "./build/views"
          }
        ]
      },
      deploy: {
        files: [{
            expand: true,
            cwd: "./public",
            src: ["**"],
            dest: "./deploy/build/public"
          },
          {
            expand: true,
            cwd: "./views",
            src: ["**"],
            dest: "./deploy/build/views"
          },
          {
            expand: true,
            cwd: "./",
            src: ["package.json"],
            dest: "./deploy"
          },
          {
            expand: true,
            cwd: "./bin",
            src: ["**"],
            dest: "./deploy/bin"
          }
        ]
      }
    },

    ts: {
      app: {
        files: [{
          fast: false,
          src: ["./src/\*\*/\*.ts", "!src/.baseDir.ts"],
          dest: "./build"
        }],
        options: {
          "module": "commonjs",
          "target": "es6",
          "noImplicitAny": false,
          "sourceMap": true,
          "experimentalDecorators": true,
          "emitDecoratorMetadata": true,
          "sourceRoot": "./src/",
          "exclude": [
            "tests/**/*",
            "ota-portal/**/*",
            "src/frontend/**/*",
            "node_modules",
            "**/*.spec.ts",
            "**/*test.ts",
            "**/*.js"
          ]
        }
      },
      deploy: {
        files: [{
          src: ["./src/\*\*/\*.ts", "!src/.baseDir.ts"],
          dest: "./deploy/build"
        }],
        options: {
          "module": "commonjs",
          "target": "es6",
          "noImplicitAny": false,
          "sourceMap": true,
          "experimentalDecorators": true,
          "emitDecoratorMetadata": true
        }
      }
    },
    watch: {
      ts: {
        files: ["src/\*\*/\*.ts"],
        tasks: ["ts"]
      },
      views: {
        files: ["views/**/*.pug"],
        tasks: ["copy"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-ts");

  grunt.registerTask("deploy", [
    "ts:deploy",
    "copy:deploy"
  ]);
  grunt.registerTask("default", [
    "ts:app",
    "copy:build",
    "watch"
  ]);
  grunt.registerTask("build", [
    "ts:app",
    "copy:build"
  ]);
  grunt.registerTask("debug:build", [
    "ts:app",
    "copy:build",
    "watch"
  ]);
  grunt.registerTask("ts-w", [
    "ts",
    "copy",
    "watch"
  ]);

};