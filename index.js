"use strict";

const co = require('co');
const scrypt = require('./lib/scrypt');

module.exports = {

  duniter: {

    cliOptions: [
      { value: '--salt <salt>', desc: 'Salt to generate the keypair' },
      { value: '--passwd <password>', desc: 'Password to generate the keypair' },
      { value: '--keyN <N>', desc: 'Scrypt `N` parameter. Defaults to 4096.', parser: parseInt },
      { value: '--keyr <r>', desc: 'Scrypt `N` parameter. Defaults to 16.', parser: parseInt },
      { value: '--keyp <p>', desc: 'Scrypt `N` parameter. Defaults to 1.', parser: parseInt }
    ],

    config: {

      /*****
       * Tries to load a specific parameter `conf.pair`
       */
      onLoading: (conf, program) => co(function*(){

        if ((program.keyN || program.keyr || program.keyp) && !program.salt && !program.passwd) {
          throw Error('Missing --salt and --passwd options along with --keyN|keyr|keyp option');
        }

        // If we have salt and password, convert it to keypair
        if (program.salt || program.passwd) {
          const salt = program.salt || '';
          const key  = program.passwd || '';
          conf.pair = yield scrypt(salt, key);
        }

        // If no keypair has been loaded or derived from salt/key, generate a random one
        if (!conf.pair) {
          const salt = ~~(Math.random() * 2147483647) + "";
          const key  = ~~(Math.random() * 2147483647) + "";
          conf.pair = yield scrypt(salt, key);
        }


      }),

      beforeSave: (conf, program) => co(function*(){
        // We never want to store salt or password
        delete conf.salt;
        delete conf.passwd;
      })
    }
  }
};
