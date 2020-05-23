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
import styled from 'styled-components';

const WIDGETS = {
  TOKEN_SWAP: "TOKEN_SWAP",
  LIQUIDITY: "LIQUIDITY"
}

const App = () => {

  const web3context = useWeb3Context();

  useEffect(() => {
    web3context.setFirstValidConnector(['MetaMask'])
  }, [])

  const [currentWidget, setWidget] = useState(WIDGETS.TOKEN_SWAP);

  return (
    <MainLayout>
 
      <Row>
        <Col sm="12">
          <Menu>
            <Nav>
              <NavItem>
                <NavLink disabled href="#"><b>SELECT WIDGET :</b></NavLink>
              </NavItem>
              <NavItem>
                <StyledNavLink active={currentWidget === WIDGETS.TOKEN_SWAP} href="#" onClick={() => setWidget(WIDGETS.TOKEN_SWAP)}>Token Conversion</StyledNavLink>
              </NavItem>
              <NavItem>
                <StyledNavLink active={currentWidget === WIDGETS.LIQUIDITY} href="#" onClick={() => setWidget(WIDGETS.LIQUIDITY)}>Staking Liquidty/Pool Creation</StyledNavLink>
              </NavItem>
            </Nav>
          </Menu>
        </Col>
        <Col sm="12">

          {currentWidget === WIDGETS.TOKEN_SWAP &&
            <MainPage web3context={web3context} />
          }

          {currentWidget === WIDGETS.LIQUIDITY &&
            <LiquidityPage web3context={web3context} />
          }

        </Col>
      </Row>

    </MainLayout>
  )

}

const Menu = styled.div`
  height: 60px;
  justify-content: center;
`

const StyledNavLink = styled(NavLink)`
  color: inherit;
  ${ props => props.active && `
     font-weight: 700;
  `}

  :hover {
    text-decoration: underline;
    color: inherit;
  }
`

export default App;