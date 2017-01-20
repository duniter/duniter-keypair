"use strict";

const co = require('co');
const stack = require('duniter').statics.autoStack();

const modules = [
  require('./index')
];

for (const module of modules) {
  stack.registerDependency(module);
}

co(function*() {
  try {
    yield stack.executeStack(process.argv);
  } catch(e) {
    console.error(e);
  }
  process.exit();
});
