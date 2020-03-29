# React DeFi Widget

> Ethereum Defi widget for React apps

[![NPM](https://img.shields.io/npm/v/react-defi-widget.svg)](https://www.npmjs.com/package/react-defi-widget) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


## Introduction

`react-defi-widget` is a React widget that allow your website visitors to quickly and easily convert tokens within the widget and able to collect fees up to 3% on each transaction (paid in BNT token). You would need `web3-react` imported on your app and passing its context through props to the widget component.

## Features

* Enabling on-chain token swap on React-based applications through Bancor network
* Earn commission in BNT token up to 3%
* Customizable widget attributes
* Support of Mainnet and Ropsten
* Adding liquidity to a pool within Bancor network and earning fee (Under development)
* Creating a new liquidity pool within Bancor network (Under development)

## Install

```bash
npm install --save react-defi-widget
```

## Usage

Basic Usage

```jsx
import React, { Component } from 'react'
import { useWeb3Context } from 'web3-react';
import { TokenConversionWidget } from 'react-defi-widget'

const MainPage = (props) => {

  const context = useWeb3Context();

  useEffect(() => {
        context.setFirstValidConnector(['MetaMask']) // Or on your choice
  }, [])

  return (
    <Fragment>
        <TokenConversionWidget
          web3ReactContext={context}
        />
    </Fragment>
  )
}
```

Advance Usage

```jsx
import React, { Component } from 'react'
import { useWeb3Context } from 'web3-react';
import { TokenConversionWidget } from 'react-defi-widget'

const MainPage = (props) => {

  const context = useWeb3Context();

  useEffect(() => {
        context.setFirstValidConnector(['MetaMask']) // Or on your choice
  }, [])

  return (
    <Fragment>
        <TokenConversionWidget
          web3ReactContext={context}
          title={"YOUR WIDGET TITLE"}
          subtitle={"YOUR WIDGET SUBTITLE"}
          description={"CAN BE SOMETHING TO TELL YOUR USERS"}
          color={"#777"}
          baseCurrency={"BNT"}
          pairCurrency={"ETH"}
          affiliateAccount={"0x8fD00f170FDf3772C5ebdCD90bF257316c69BA45"}
          affiliateFee={3}
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

## Properties

|   |type|required|default value|description|
|---|--- |---     |---          |---        |
|**web3ReactContext**|PropTypes.object|YES| |The web3-react context object that the widget will goes to connect|
|**title**|PropTypes.string|NO||Title of the widget|
|**subtitle**|PropTypes.string|NO||Subtitle of the widget|
|**description**|PropTypes.string|NO||Long description at the bottom of the widget|
|**color**|PropTypes.string|NO|#0275d8|Color of the widget|
|**baseCurrency**|PropTypes.string|NO|ETH|Default base currency in a symbol format*|
|**pairCurrency**|PropTypes.string|NO|BNT|Default pair currency in a symbol format*|
|**affiliateAccount**|PropTypes.string|NO|None|The recipient account that collects the fee from the transaction|
|**affiliateFee**|PropTypes.number|NO|0|The fee rate, for example 2.5 if the fee is set to 2.5%|

*Only these following token symbols can be provided as a default value BNT, ETH, DAI, ENJ, BAT, KNC, MANA, POWR, MKR, ANT, GNO, OMG, SNT, RDN, SAN, USDB, USDC

## License

MIT © [pisuthd](https://github.com/pisuthd)
