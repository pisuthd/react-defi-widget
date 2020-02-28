import React, { Component, useEffect } from 'react'
// import Web3Provider, { useWeb3Context } from 'web3-react'
// import { Widget } from 'react-defi-widget'
import MainLayout from "./layouts/main";
import MainPage from "./views/main";

const App = () => {
  /*
  const context = useWeb3Context()

  useEffect(() => {
    context.setFirstValidConnector(['MetaMask'])
  }, [])
  */

  return (
    <MainLayout>
      <MainPage/>
    </MainLayout>
  )
  /*
  return (
      <Widget 
        web3ReactContext={context}
      />
  )
  */
}

export default App;