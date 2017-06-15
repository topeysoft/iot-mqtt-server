module.exports = function (wallaby) {
  return {
      name: 'IOT MQTT Server',
    files: [
      'src/**/*.ts'
    ],

    tests: [
      'tests/**/*Spec.ts',
      'tests/**/*test.ts'
    ],
    testFramework: 'mocha',
    env: {
      type: 'node'
    },
    debug: true,
    reportConsoleErrorAsError: false
  };
};