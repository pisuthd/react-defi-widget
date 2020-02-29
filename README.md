# React DeFi Widget

> Ethereum Defi widget for React apps

[![NPM](https://img.shields.io/npm/v/react-defi-widget.svg)](https://www.npmjs.com/package/react-defi-widget) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

![Screenshot](https://raw.githubusercontent.com/pisuthd/react-defi-widget/master/demo.gif)

## Introduction

`react-defi-widget` is a React widget for integrating with Ethereum DeFi projects such as Bancor, Kyber allows your webapp visitors instantly stake tokens to reserve pools & swap to any token on-chain.

Before embedded into your webapp, please ensure that you've installed `web3-react` on your project and passing its context into the widget as following.

(This project is under heavy development, please not use it on Ethereum mainnet at the moment)

## Submission for Sustain Web3 Hackathon

[Live Demo](http://13.233.107.61:3000/)

### Features

* List liquidity pools on Bancor
* Provide fixed amount of tokens to Bancor's liquidity pools
* Exchange a token on Bancor (Not functional well on Ropsten)

## Install

```bash
npm install --save react-defi-widget
```

## Usage

```jsx
import React, { Component } from 'react'
import { useWeb3Context } from 'web3-react';
import { Widget } from 'react-defi-widget'

const MainPage = (props) => {

  const context = useWeb3Context();

  useEffect(() => {
        context.setFirstValidConnector(['MetaMask']) // Or on your choice
  }, [])

  return (
    <Fragment>
        <Widget
          web3ReactContext={context}
        />
    </Fragment>
  )
}
```

## Local Development

To run the examples locally, run the library first

```
npm install
npm start
```

Then open another window and run the webapp

```
cd example/
npm install
npm start
```

## Local Development

### Properties

* web3ReactContext: (PropTypes.object | PropTypes.func).isRequired,
* currentPage: PropTypes.string

## Available DeFi Protocols

* Bancor - Stake ERC20 tokens on its liquidity pools & on-chain token conversion (with affiliate program)

## Roadmap

* Support other liqudity protocol such as Kyber or Uniswap 
* A backend host cached data instead of list everything on-chain

## License

MIT © [pisuthd](https://github.com/pisuthd)
