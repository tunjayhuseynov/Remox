
module.exports = {
  compiler: {
    version: '0.6.12+commit.27d51765',
  },
  language: 'Solidity',
  output: {
    abi: [
      {
        inputs: [
          {
            internalType: 'address',
            name: '_factory',
            type: 'address',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'tokenA',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'tokenB',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amountADesired',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amountBDesired',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amountAMin',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amountBMin',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256',
          },
        ],
        name: 'addLiquidity',
        outputs: [
          {
            internalType: 'uint256',
            name: 'amountA',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amountB',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'liquidity',
            type: 'uint256',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [],
        name: 'factory',
        outputs: [
          {
            internalType: 'address',
            name: '',
            type: 'address',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'amountOut',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'reserveIn',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'reserveOut',
            type: 'uint256',
          },
        ],
        name: 'getAmountIn',
        outputs: [
          {
            internalType: 'uint256',
            name: 'amountIn',
            type: 'uint256',
          },
        ],
        stateMutability: 'pure',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'amountIn',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'reserveIn',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'reserveOut',
            type: 'uint256',
          },
        ],
        name: 'getAmountOut',
        outputs: [
          {
            internalType: 'uint256',
            name: 'amountOut',
            type: 'uint256',
          },
        ],
        stateMutability: 'pure',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'amountOut',
            type: 'uint256',
          },
          {
            internalType: 'address[]',
            name: 'path',
            type: 'address[]',
          },
        ],
        name: 'getAmountsIn',
        outputs: [
          {
            internalType: 'uint256[]',
            name: 'amounts',
            type: 'uint256[]',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'amountIn',
            type: 'uint256',
          },
          {
            internalType: 'address[]',
            name: 'path',
            type: 'address[]',
          },
        ],
        name: 'getAmountsOut',
        outputs: [
          {
            internalType: 'uint256[]',
            name: 'amounts',
            type: 'uint256[]',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'tokenA',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'tokenB',
            type: 'address',
          },
        ],
        name: 'pairFor',
        outputs: [
          {
            internalType: 'address',
            name: '',
            type: 'address',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'amountA',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'reserveA',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'reserveB',
            type: 'uint256',
          },
        ],
        name: 'quote',
        outputs: [
          {
            internalType: 'uint256',
            name: 'amountB',
            type: 'uint256',
          },
        ],
        stateMutability: 'pure',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'tokenA',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'tokenB',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'liquidity',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amountAMin',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amountBMin',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256',
          },
        ],
        name: 'removeLiquidity',
        outputs: [
          {
            internalType: 'uint256',
            name: 'amountA',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amountB',
            type: 'uint256',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'tokenA',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'tokenB',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'liquidity',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amountAMin',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amountBMin',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'approveMax',
            type: 'bool',
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32',
          },
        ],
        name: 'removeLiquidityWithPermit',
        outputs: [
          {
            internalType: 'uint256',
            name: 'amountA',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amountB',
            type: 'uint256',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'amountIn',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amountOutMin',
            type: 'uint256',
          },
          {
            internalType: 'address[]',
            name: 'path',
            type: 'address[]',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256',
          },
        ],
        name: 'swapExactTokensForTokens',
        outputs: [
          {
            internalType: 'uint256[]',
            name: 'amounts',
            type: 'uint256[]',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'amountIn',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amountOutMin',
            type: 'uint256',
          },
          {
            internalType: 'address[]',
            name: 'path',
            type: 'address[]',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256',
          },
        ],
        name: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'amountOut',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amountInMax',
            type: 'uint256',
          },
          {
            internalType: 'address[]',
            name: 'path',
            type: 'address[]',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256',
          },
        ],
        name: 'swapTokensForExactTokens',
        outputs: [
          {
            internalType: 'uint256[]',
            name: 'amounts',
            type: 'uint256[]',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    devdoc: {
      kind: 'dev',
      methods: {},
      version: 1,
    },
    userdoc: {
      kind: 'user',
      methods: {},
      version: 1,
    },
  },
  settings: {
    compilationTarget: {
      'contracts/UniswapV2Router02.sol': 'UniswapV2Router02',
    },
    evmVersion: 'istanbul',
    libraries: {},
    metadata: {
      bytecodeHash: 'ipfs',
    },
    optimizer: {
      enabled: true,
      runs: 5000,
    },
    remappings: [],
  },
  sources: {
    'contracts/UniswapV2Router02.sol': {
      keccak256:
        '0x0d6c8372fc76ec8e6f594df240db130c427d88631110f94e2caeaf273b960827',
      license: 'MIT',
      urls: [
        'bzz-raw://26370058060dd70d00c2839f8655e77acd2d9fcffebe508687ad745ff0015a7d',
        'dweb:/ipfs/QmeWrr7kPPHdnyHeTwAyffVCY49QqircB5Luiooiux3w6g',
      ],
    },
    'contracts/interfaces/IERC20.sol': {
      keccak256:
        '0xd162c1e677bf3cef1f6545424f534ed03b3c18a344a84e8018a7dde6845e2228',
      license: 'MIT',
      urls: [
        'bzz-raw://e044aa63353fc8343d5439e89fae115e57f44046c0af6bb5d5ec52b954f6f153',
        'dweb:/ipfs/QmXMd5Cyuae4VDeWcPU8HkD6rSXs5nhzuETBwC7A6X4SR1',
      ],
    },
    'contracts/interfaces/IUniswapV2Factory.sol': {
      keccak256:
        '0xa82d644ca51383c737963d7f11ca0ee1a0e8e77a14306ef3fe215e125dc3b880',
      license: 'MIT',
      urls: [
        'bzz-raw://03cb50d88863a3257faa893ea466e32673c8cd398c8552fcacb73d00d5c0fb2e',
        'dweb:/ipfs/QmQhKo2Y933TQq9fQfRqtWrxY4AV47Prmhb6igGAzuEDBv',
      ],
    },
    'contracts/interfaces/IUniswapV2Pair.sol': {
      keccak256:
        '0x2a71b64c506b17b0696bb78c8c2e57ad6e854d9042c935f38b12fade27fbcb01',
      license: 'MIT',
      urls: [
        'bzz-raw://b5497daf050e50868ad60705d291c0f27c7793ab9db141eed013dec64a217d58',
        'dweb:/ipfs/QmPYY98uNU9VqqMXYR8HzjviZuPrekCZ7VEPXhD2Yn38Fr',
      ],
    },
    'contracts/interfaces/IUniswapV2Router01.sol': {
      keccak256:
        '0xcdbe0b0544060de86fe0d7e1e843ba460b0f11ea8022f149cdff3e12abfa9f1e',
      license: 'MIT',
      urls: [
        'bzz-raw://b293e15a3b55254005e576af6f4a8a519fe6eff4d7c502219061db8d4152c84b',
        'dweb:/ipfs/QmbC5ZkQktHaUagbJiiDrvRUoPGRAM1CfFAoy6UUpdLWaf',
      ],
    },
    'contracts/interfaces/IUniswapV2Router02.sol': {
      keccak256:
        '0x33c2698658b814fb31a0c1a01b953719d27a6b5056c940ac28a3f7bcf0e463c2',
      license: 'MIT',
      urls: [
        'bzz-raw://625d35a2c0a63f20b07e8017dcd58ca29fea82f20e2f47c92f245c5ce8b43c3d',
        'dweb:/ipfs/QmPNKY28xq68zErTogan3MiexwD4tg31Rnx5iftKZJq8av',
      ],
    },
    'contracts/libraries/SafeMath.sol': {
      keccak256:
        '0x657933e8d759d3a7757bb26b58dade55570128dedc420c80c69366abaf84443c',
      license: 'MIT',
      urls: [
        'bzz-raw://cdde22514a2d5de16eb8c866439d4c568c1e2419b66ce0288ba278916f3d4077',
        'dweb:/ipfs/QmbCbvjTUXnm2PKPUSxMJQubHFzaEVSRQS4sCEAPLrtCTq',
      ],
    },
    'contracts/libraries/TransferHelper.sol': {
      keccak256:
        '0xf1d71350584d577cff628f0aac7a7ce4eaf0b7f25759448099288575183da807',
      license: 'GPL-3.0-or-later',
      urls: [
        'bzz-raw://df99373e094561adc81e27aa305abcde1305454810f69587518bd738cc014572',
        'dweb:/ipfs/QmQ7sFubdStHJEVDtESXyt2xU6btvemKRTXJ74EJgZS2rr',
      ],
    },
    'contracts/libraries/UniswapV2Library.sol': {
      keccak256:
        '0xfbbe3f5f67a25445c80c6b18af031173e709d862c04456c9fc644f76402a2828',
      license: 'MIT',
      urls: [
        'bzz-raw://8ec7c26c94161250273bc5f8620853e76483b366d26cd1d646577adbd03b8852',
        'dweb:/ipfs/QmPFgx5k3aZmkRMzQHzTynthM1pzbF7oH4qHmNKjBmUJaU',
      ],
    },
  },
  version: 1,
}
