import React, { Component, useEffect, useState } from 'react'

import { useWeb3Context } from 'web3-react';

import {
  Row,
  Col,
  Nav,
  NavItem,
  NavLink
} from "reactstrap";

import MainLayout from "./layouts/main";
import MainPage from "./views/main";
import LiquidityPage from "./views/liquidityPool";

const EXAMPLES = {
  BASIC: "BASIC",
  BASIC_LIQUIDITY: "BASIC_LIQUIDITY"
}

const App = () => {

  const web3context = useWeb3Context();

  useEffect(() => {
    web3context.setFirstValidConnector(['MetaMask'])
  }, [])

  const [currentExample, setExample] = useState(EXAMPLES.BASIC);

  return (
    <MainLayout>
      {/*
        <Switch>
          <Route exact path="/">
            <MainPage web3context={web3context} />
          </Route>
          <Route exact path="/pools">
            <LiquidityPage web3context={web3context} />
          </Route>
          <Redirect to="/pools" />
        </Switch>
        */}
      <Row>
        <Col sm="2">
          <div>
            <Nav vertical>
              <NavItem>
                <NavLink disabled href="#">Token Swap</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#" onClick={() => setExample(EXAMPLES.BASIC)}>Basic</NavLink>
              </NavItem>
              <NavItem>
                <NavLink disabled href="#">Liquidity Pool</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#" onClick={() => setExample(EXAMPLES.BASIC_LIQUIDITY)}>All Pools</NavLink>
              </NavItem>
            </Nav>
          </div>
        </Col>
        <Col sm="10">

          {currentExample === EXAMPLES.BASIC &&
            <MainPage web3context={web3context} />
          }

          {currentExample === EXAMPLES.BASIC_LIQUIDITY &&
            <LiquidityPage web3context={web3context} />
          }

        </Col>
      </Row>

    </MainLayout>
  )

}

export default App;