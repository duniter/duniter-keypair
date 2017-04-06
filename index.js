"use strict";

const co = require('co');
const inquirer = require('inquirer');
const fs = require('fs');
const yaml = require('js-yaml');
const scrypt = require('./lib/scrypt');

module.exports = {

  duniter: {

    methods: {
      scrypt
    },

    cliOptions: [
      { value: '--salt <salt>', desc: 'Salt to generate the keypair' },
      { value: '--passwd <password>', desc: 'Password to generate the keypair' },
      { value: '--keyN <N>', desc: 'Scrypt `N` parameter. Defaults to 4096.', parser: parseInt },
      { value: '--keyr <r>', desc: 'Scrypt `N` parameter. Defaults to 16.', parser: parseInt },
      { value: '--keyp <p>', desc: 'Scrypt `N` parameter. Defaults to 1.', parser: parseInt },
      { value: '--keyprompt', desc: 'Force to use the keypair given by user prompt.' },
      { value: '--keyfile <filepath>', desc: 'Force to use the keypair of the given YAML file. File must contain `pub:` and `sec:` fields.' }
    ],

    wizard: {

      'key': promptKey

    },

    config: {

      /*****
       * Tries to load a specific parameter `conf.pair`
       */
      onLoading: (conf, program, logger, confDAL) => co(function*(){

        if ((program.keyN || program.keyr || program.keyp) && !program.salt && !program.passwd) {
          throw Error('Missing --salt and --passwd options along with --keyN|keyr|keyp option');
        }

        // If we have salt and password, convert it to keypair
        if (program.salt || program.passwd) {
          const salt = program.salt || '';
          const key  = program.passwd || '';
          conf.pair = yield scrypt(salt, key);
        }

        // If no keypair has been loaded, try the default .yml file
        if (!conf.pair || !conf.pair.pub || !conf.pair.sec) {
          const ymlContent = yield confDAL.coreFS.read('keyring.yml')
          conf.pair = yaml.safeLoad(ymlContent);
        }

        // If no keypair has been loaded or derived from salt/key, generate a random one
        if (!conf.pair || !conf.pair.pub || !conf.pair.sec) {
          const salt = ~~(Math.random() * 2147483647) + "";
          const key  = ~~(Math.random() * 2147483647) + "";
          conf.pair = yield scrypt(salt, key);
        }

        // With the --keyprompt option, temporarily use a keypair given from CLI prompt (it won't be stored)
        if (program.keyprompt) {
          // Backup of the current pair
          conf.oldPair = {
            pub: conf.pair.pub,
            sec: conf.pair.sec
          };
          // Ask the for the session key
          yield promptKey(conf, program);
        }

        // With the --keyfile option, temporarily use a keypair given from file system (content won't be stored)
        if (program.keyfile) {
          // Backup of the current pair
          conf.oldPair = {
            pub: conf.pair.pub,
            sec: conf.pair.sec
          };
          // Load file content
          const doc = yaml.safeLoad(fs.readFileSync(program.keyfile, 'utf8'));
          if (!doc || !doc.pub || !doc.sec) {
            throw 'Could not load full keyring from file';
          }
          conf.pair = {
            pub: doc.pub,
            sec: doc.sec
          }
        }

      }),

      beforeSave: (conf, program, logger, confDAL) => co(function*(){

        if (program.keyprompt || program.keyfile) {
          // Don't store the given key, but only the default/saved one
          conf.pair = {
            pub: conf.oldPair.pub,
            sec: conf.oldPair.sec
          };
        }
        delete conf.oldPair;

        // We save the key in a separate file
        const keyring = 'pub: "' + conf.pair.pub + '"\n' +
          'sec: "' + conf.pair.sec + '"'
        yield confDAL.coreFS.write('keyring.yml', keyring)

        // We never want to store salt, password or keypair in the conf.json file
        delete conf.salt;
        delete conf.passwd;
        delete conf.pair;
      })
    }
  }
};

function promptKey (conf, program) {
  return co(function*() {

    const changeKeypair = !conf.pair || !conf.pair.pub || !conf.pair.sec;

    const answersWantToChange = yield inquirer.prompt([{
      type: "confirm",
      name: "change",
      message: "Modify you keypair?",
      default: changeKeypair
    }]);

    if (answersWantToChange.change) {
      const obfuscatedSalt = (program.salt || "").replace(/./g, '*');
      const answersSalt = yield inquirer.prompt([{
        type: "password",
        name: "salt",
        message: "Key's salt",
        default: obfuscatedSalt || undefined
      }]);
      const obfuscatedPasswd = (program.passwd || "").replace(/./g, '*');
      const answersPasswd = yield inquirer.prompt([{
        type: "password",
        name: "passwd",
        message: "Key\'s password",
        default: obfuscatedPasswd || undefined
      }]);

      const keepOldSalt = obfuscatedSalt.length > 0 && obfuscatedSalt == answersSalt.salt;
      const keepOldPasswd = obfuscatedPasswd.length > 0 && obfuscatedPasswd == answersPasswd.passwd;
      const salt   = keepOldSalt ? program.salt : answersSalt.salt;
      const passwd = keepOldPasswd ? program.passwd : answersPasswd.passwd;
      conf.pair = yield scrypt(salt, passwd);
    }
  });
}
