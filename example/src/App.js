import React, { Component, useEffect, useState } from 'react'

import { useWeb3Context } from 'web3-react';
import classnames from 'classnames';
import {
  Row,
  Col,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from "reactstrap";

import MainLayout from "./layouts/main";
import MainPage from "./views/main";
import LiquidityPage from "./views/liquidityPool";
import styled from 'styled-components';


const App = () => {

  const web3context = useWeb3Context();

  useEffect(() => {
    web3context.setFirstValidConnector(['MetaMask'])
  }, [])

  const [activeTab, setActiveTab] = useState('1');

  const toggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  return (
    <MainLayout>

      <Row>
        <Col sm="12">
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '1' })}
                onClick={() => { toggle('1'); }}
                style={{ cursor: "pointer" }}
              >
                Token Conversion Widget
            </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '2' })}
                onClick={() => { toggle('2'); }}
                style={{ cursor: "pointer" }}
              >
                Staking Liquidty/Pool Creation Widget
          </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab} style={{ paddingTop: "20px" }}>
            <TabPane tabId="1">
              <Row>
                <Col sm="12">
                  <MainPage web3context={web3context} />
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="2">
              <Row>
                <Col sm="12">
                  <LiquidityPage web3context={web3context} />
                </Col>
              </Row>
            </TabPane>
          </TabContent>
        </Col>
        
      </Row>

    </MainLayout>
  )

}

const Menu = styled.div`
  height: 60px;
  justify-content: center;
`

const StyledNavLink = styled.a`
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