duniter-keypair
===============

A module providing the cryptographic keypair required by the Duniter_ node.

Features
--------

Provide a cryptographic keypair (Ed25519) using scrypt_ derivation mechanism from a salt and a passphrase.

Usage
-----

.. code:: bash

  duniter config --salt abc --passwd def
    
This will *store* in Dunite configuration file a keypair derived from ``abc`` and ``def`` strings:

.. code:: json

  {
    "pair": {
      "pub": "G2CBgZBPLe6FSFUgpx2Jf1Aqsgta6iib3vmDRA1yLiqU",
      "sec": "58LDg8QLmF5pv6Dn9h7X4yFKfMTdP8fdAiWVcyDoTRJu454fwRihCLULH4MW37zncsg4ruoTGJPZneWk22QmG1w4"
    }
  }

CLI options
-----------

This module provide the following options:

``--salt``

A string to use along with ```--passwd``` option to derive from with scrypt.

``--passwd``

Astring to use along with ```--salt``` option to derive from with scrypt.

.. _Duniter: https://github.com/duniter/duniter
.. _scrypt: https://en.wikipedia.org/wiki/Scrypt