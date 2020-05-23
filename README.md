# React DeFi Widget

> Ethereum Defi widget for React apps

[![NPM](https://img.shields.io/npm/v/react-defi-widget.svg)](https://www.npmjs.com/package/react-defi-widget) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


## Introduction

`react-defi-widget` is a React widget that allows your website visitors to quickly and easily access automated liquidity pools (Bancor, ...) in Ethereum blockchain where they can convert tokens to another seamlessly and completely permissionless as well as stake liquidity to the pool. You can embed the widget and set a fee that allows take commissions up to 3% from each transaction all you need is `web3-react` been imported on your app and passing its context through props to the widget component.

## Preview

![Screenshot](https://raw.githubusercontent.com/pisuthd/react-defi-widget/master/preview-1.gif)

### Live example

[https://modest-bardeen-fe9d2c.netlify.com/](https://modest-bardeen-fe9d2c.netlify.com/)

## Features

* Enabling on-chain token swap on any React-based applications through Bancor
* Earn commission in BNT token up to 3%
* Customizable widget attributes
* Support of Mainnet and Ropsten
* Adding liquidity to a pool within Bancor and earning fee (normally ~0.1-0.3% on each trade)
* Creating a new liquidity pool within Bancor (aka. List your token on decentralized exchanges for free)

## Install

```bash
npm install --save react-defi-widget
```

## Usage

### Token Conversion Widget

Basic Usage :

```jsx
import React, { Component, Fragment } from 'react'
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

Advance Usage :

```jsx
import React, { Component, Fragment } from 'react'
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
          title={"YOUR TITLE"}
          subtitle={"YOUR SUBTITLE"}
          description={"CAN BE SOMETHING TO TELL YOUR USERS"}
          color={"#777"}
          baseCurrency={"BNT"}
          pairCurrency={"ETH"}
          affiliateAccount={"0x8fD00f170FDf3772C5ebdCD90bF257316c69BA45"}
          affiliateFee={3}
          whitelisted={["ETH", "BNT", "KNC", "ENJ"]} // You might need to check all available tokens first
        />
    </Fragment>
  )
}
```

### Liquidity Pool Explorer / Pool Creation Widget

The widget offers a vast opportunity for your website visitors to stake liquidity and create the new pool in the permissionless manner.

Shows all available liquidity pools :

```jsx
import React, { Component, Fragment } from 'react'
import { useWeb3Context } from 'web3-react';
import { LiquidityPoolsWidget } from 'react-defi-widget'

const MainPage = (props) => {

  const context = useWeb3Context();

  useEffect(() => {
        context.setFirstValidConnector(['MetaMask']) // Or on your choice
  }, [])

  return (
    <Fragment>
        <LiquidityPoolsWidget
          web3ReactContext={web3context}
          color={color}
        />
    </Fragment>
  )
}
```

Filter specific pools :

```jsx
import React, { Component, Fragment } from 'react'
import { useWeb3Context } from 'web3-react';
import { LiquidityPoolsWidget } from 'react-defi-widget'

const MainPage = (props) => {

  const context = useWeb3Context();

  useEffect(() => {
        context.setFirstValidConnector(['MetaMask']) // Or on your choice
  }, [])

  return (
    <Fragment>
        <LiquidityPoolsWidget
          web3ReactContext={web3context}
          color={color}
          defaultPool={"ENJBNT"}
          whitelisted={["ETHBNT", "ENJBNT", "DAIBNT"]}
          disablePoolCreation={true}
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

### Token Conversion Widget

|   |type|required|default value|description|
|---|--- |---     |---          |---        |
|**web3ReactContext**|PropTypes.object|YES| |The web3-react context object that the widget will goes to connect|
|**title**|PropTypes.string|NO||Title of the widget|
|**subtitle**|PropTypes.string|NO||Subtitle of the widget|
|**description**|PropTypes.string|NO||Long description at the bottom of the widget|
|**color**|PropTypes.string|NO|#0275d8|Color of the widget|
|**baseCurrency**|PropTypes.string|NO|ETH|Default base currency in a symbol format|
|**pairCurrency**|PropTypes.string|NO|BNT|Default pair currency in a symbol format|
|**affiliateAccount**|PropTypes.string|NO|None|The recipient account that collects the fee from the transaction|
|**affiliateFee**|PropTypes.number|NO|0|The fee rate, for example 2.5 if the fee is set to 2.5%|
|**whitelisted**|PropTypes.array|NO||Provides whitelisted tokens to be traded |

### Liquidity Pool Widget

|   |type|required|default value|description|
|---|--- |---     |---          |---        |
|**web3ReactContext**|PropTypes.object|YES| |The web3-react context object that the widget will goes to connect|
|**title**|PropTypes.string|NO||Title of the widget|
|**subtitle**|PropTypes.string|NO||Subtitle of the widget|
|**description**|PropTypes.string|NO||Long description at the bottom of the widget|
|**color**|PropTypes.string|NO|#0275d8|Color of the widget|
|**whitelisted**|PropTypes.array|NO||Provides whitelisted liquidity pools|
|**defaultPool**|PropTypes.string|NO||Default pool |
|**disablePoolCreation**|PropTypes.bool|NO|false|Remove pool creation menu from the widget |

## License

MIT © [pisuthd](https://github.com/pisuthd)
