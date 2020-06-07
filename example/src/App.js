import React, { Component, useEffect, useState } from 'react'
import { useWeb3Context } from 'web3-react';
import {
  Row, Col
} from "reactstrap";
import styled from 'styled-components';
import MainLayout from "./layouts/main";
import { Header } from "./components/common";

import TokenSwap from "./views/tokenSwap";
import StakeLiquidity from "./views/stakeLiquidity";

const Wrapper = styled.div`
  p {
    font-size: 14px;
    line-height: 20px;
  }
`;

const App = () => {

  const web3context = useWeb3Context();

  useEffect(() => {
    web3context.setFirstValidConnector(['MetaMask'])
  }, [])

  return (
    <MainLayout>
      <Wrapper>
        <Row>
          <Col sm="4">
            <Header>Token Swap</Header>
            <p>Convert token to another throught liquidity providers that can setup an affiliate to take the commission cut. </p>
            <TokenSwap 
              web3context={web3context}
            />
          </Col>
          <Col sm="4">
            <Header>Staking Liquidity</Header>
            <p>Add and remove liquidity on the pool, stakers will get a trading fee from each transaction occur.</p>
            <StakeLiquidity
              web3context={web3context}
            />
          </Col>
          <Col sm="4">
            <Header>Pool Creation</Header>
          </Col>
        </Row>
      </Wrapper>
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