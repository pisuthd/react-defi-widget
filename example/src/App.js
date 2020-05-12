import React, { Component, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from "react-router-dom";

import { useWeb3Context } from 'web3-react';

import MainLayout from "./layouts/main";
import MainPage from "./views/main";
import LiquidityPage from "./views/liquidityPool";

const App = () => {

  const web3context = useWeb3Context();

  useEffect(() => {
    web3context.setFirstValidConnector(['MetaMask'])
  }, [])

  return (
    <Router>
      <MainLayout>
        <Switch>
          <Route exact path="/">
            <MainPage web3context={web3context} />
          </Route>
          <Route exact path="/pools">
            <LiquidityPage web3context={web3context} />
          </Route>
          <Redirect to="/pools" />
        </Switch>

      </MainLayout>
    </Router>
  )

}

export default App;