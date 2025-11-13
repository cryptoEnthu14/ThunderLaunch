/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/plp.json`.
 */
export type Plp = {
  "address": "6avMmcRVikm9UKbVjWKFvS7tYaaVRWRTPPNXvtPffhwD",
  "metadata": {
    "name": "plp",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Protocol Liquidity Program"
  },
  "instructions": [
    {
      "name": "buy",
      "discriminator": [
        102,
        6,
        61,
        18,
        1,
        218,
        235,
        234
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "pool.mint",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "tokens",
          "type": "u64"
        },
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "graduate",
      "discriminator": [
        45,
        235,
        225,
        181,
        17,
        218,
        64,
        130
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "pool.mint",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "pool"
          ]
        }
      ],
      "args": [
        {
          "name": "dex",
          "type": {
            "defined": {
              "name": "graduationDex"
            }
          }
        }
      ]
    },
    {
      "name": "initPool",
      "discriminator": [
        116,
        233,
        199,
        204,
        115,
        159,
        171,
        36
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "arg",
                "path": "args.mint"
              }
            ]
          }
        },
        {
          "name": "authority"
        },
        {
          "name": "vaultSol"
        },
        {
          "name": "vaultToken"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "initPoolArgs"
            }
          }
        }
      ]
    },
    {
      "name": "lockLiquidity",
      "discriminator": [
        179,
        201,
        236,
        158,
        212,
        98,
        70,
        182
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "pool.mint",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "pool"
          ]
        }
      ],
      "args": [
        {
          "name": "locked",
          "type": "bool"
        }
      ]
    },
    {
      "name": "sell",
      "discriminator": [
        51,
        230,
        133,
        164,
        1,
        127,
        131,
        173
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "pool.mint",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "tokens",
          "type": "u64"
        },
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "pool",
      "discriminator": [
        241,
        154,
        109,
        4,
        17,
        177,
        109,
        188
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "liquidityLocked",
      "msg": "Liquidity is locked"
    },
    {
      "code": 6001,
      "name": "poolGraduated",
      "msg": "Pool already graduated"
    },
    {
      "code": 6002,
      "name": "overflow",
      "msg": "Math overflow"
    },
    {
      "code": 6003,
      "name": "insufficientSol",
      "msg": "Insufficient SOL"
    },
    {
      "code": 6004,
      "name": "insufficientTokens",
      "msg": "Insufficient tokens"
    }
  ],
  "types": [
    {
      "name": "graduationDex",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "raydium"
          },
          {
            "name": "orca"
          },
          {
            "name": "jupiter"
          }
        ]
      }
    },
    {
      "name": "initPoolArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "curveType",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "vaultSol",
            "type": "pubkey"
          },
          {
            "name": "vaultToken",
            "type": "pubkey"
          },
          {
            "name": "curveType",
            "type": "u8"
          },
          {
            "name": "locked",
            "type": "bool"
          },
          {
            "name": "graduated",
            "type": "bool"
          },
          {
            "name": "graduationDex",
            "type": "u8"
          },
          {
            "name": "totalSol",
            "type": "u64"
          },
          {
            "name": "totalTokens",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
