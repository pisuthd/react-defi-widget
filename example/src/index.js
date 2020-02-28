import React from 'react'
import ReactDOM from 'react-dom'
import Web3Provider from 'web3-react'
import { connectors } from "./connector";

import './index.css'
import App from './App'

import 'bootstrap/dist/css/bootstrap.min.css';


ReactDOM.render(<Web3Provider connectors={connectors} libraryName={'ethers.js'}><App /></Web3Provider>, document.getElementById('root'))
