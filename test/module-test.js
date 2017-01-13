"use strict";
const should = require('should');
const co  = require('co');
const keypair = require('../index');
const duniter = require('duniter');

describe('Module usage', () => {

  it('wrong options should throw', () => co(function*() {
    let errMessage;
    try {
      const stack = duniter.statics.simpleStack();
      stack.registerDependency(keypair);
      yield stack.executeStack(['node', 'index.js', 'config', '--keyN', '2048']);
    } catch (e) {
      errMessage = e.message;
    }
    should.exist(errMessage);
    should.equal(errMessage, 'Missing --salt and --passwd options along with --keyN|keyr|keyp option');
  }));
});
