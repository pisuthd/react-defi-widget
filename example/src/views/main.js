import React, { useEffect, Fragment, useState } from 'react'
import {
    Row,
    Col,
    Jumbotron,
    Button,
    Card,
    CardImg,
    Media,
    CardText,
    CardFooter,
    Badge,
    CardHeader,
    CardBody,
    CardTitle,
    CardSubtitle
} from "reactstrap";

import { TokenConversionWidget } from 'react-defi-widget'
import styled from "styled-components"
import BancorImg from "../assets/bancor.png"

import WidgetVersionSection from "../components/shared/widgetVersion";

const MainPage = (props) => {

    const { web3context } = props;


    return (
        <Fragment>
            <Row>
                <Col sm="12">
                    <StyledJumbotron>
                        <TokenConversionWidget
                            web3ReactContext={web3context}
                        />

                        {/*
                        <Headline>
                            <div className="version">
                                <span>React DeFi Widget v.0.1.3</span>{` `}
                                |{` `}
                                <a target="_blank" href="https://github.com/pisuthd/react-defi-widget">Github</a>{` `}
                                
                                    |{` `}
                                    <a onClick={() => navigateTo(AvailablePages.ACCOUNT)}>Account</a>{` `}
                                    |{` `}
                                    <a onClick={() => navigateTo(AvailablePages.STAKE)}>Stake</a>{` `}
                                    |{` `}
                                    <a onClick={() => navigateTo(AvailablePages.SWAP)}>Token Conversion</a>{` `}
                            </div>
                        </Headline>
                        */}
                    </StyledJumbotron>
                </Col>
            </Row>
            
            {/* Available Protocols */}
            {/*
            <Row>
                <Col sm="12">
                    <WidgetVersionSection/>
                </Col>
            </Row>
            <Row>
                <Col sm="12">
                    <h3>Available Protocols</h3>
                </Col>
            </Row>
            <br />
            <Row>
                <Col sm="4">
                    <Card>

                        <img width="100%" src={BancorImg} alt="Bancor" />
                        <CardBody>
                            <CardTitle><b>Bancor Protocol</b></CardTitle>
                            <CardText>Bancor Protocol offers of of conversions in a peer-to-smart contract model against liquidity pools.
                                <br/><ul><li>Affiliate fees up to 3%</li></ul></CardText>
                            <div>
                                <Badge color="warning">Liquidity</Badge>{` `}
                                <Badge color="primary">Token Swap</Badge>
                            </div>
                        </CardBody>
                       \
                       
                    </Card>
                </Col>
            </Row>
            <br />
            */}


        </Fragment>

    )
}

const StyledJumbotron = styled(Jumbotron)`
    background-image: linear-gradient(to bottom, #5bc0de, #0275d8);  
    border-radius: 10px;
    color: white;
    height: 550px;
`;

/*
const Headline = styled.div`
    text-align: center;
    margin-top: 20px;
    
    .version {
        font-size: 12px;
    }

    p {
        font-size: 16px;
    }

    a {
        color: inherit;
        text-decoration: underline;
        cursor: pointer;
    }
    
`;
*/

export default MainPage;