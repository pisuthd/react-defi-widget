import { Connectors } from 'web3-react'
const { InjectedConnector } = Connectors
 
const MetaMask = new InjectedConnector({ supportedNetworks: [1,2,3, 4, 42] })
 
export const connectors = { MetaMask }