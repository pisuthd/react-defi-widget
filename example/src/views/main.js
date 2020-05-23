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

const MainPage = (props) => {

    // Looks at https://github.com/NoahZinsmeister/web3-react
    const { web3context } = props;


    // Custom header, headline and description of the widget
    const widgetTitle = "Simple & Easy Token Swap";
    const widgetSubtitle = "You can swap your Ethereum ERC-20 tokens for other tokens within this widget";
    const widgetDescription = "DISCLAIMER : This feature give access to third-party liquidity pools. We make no warranties of any kind of financial loss including but not limited to accuracy, security and updatedness. Please consult your financial advisor before taking any financial decision."

    // Widget's button color
    const widgetColor = "#0275d8";

    // Widget's default base and pair token
    const widgetBaseCurrency = "ETH";
    const widgetPairCurrency = "BNT";


    // Receives commission in BNT from each token conversion
    // const affiliateAccount = "0x8fD00f170FDf3772C5ebdCD90bF257316c69BA45";
    // const affiliateFee = 1.5; // 2.5% Maximum is 3%

    // Provides whitelisted tokens to be traded in the widget
    // const whitelisted = ["ETH", "BNT", "KNC", "ENJ"]

    return (
        <Fragment>
            <Row>
                <Col sm="12">
                    <StyledJumbotron>
                        <TokenConversionWidget
                            web3ReactContext={web3context}
                            title={widgetTitle}
                            subtitle={widgetSubtitle}
                            description={widgetDescription}
                            color={widgetColor}
                            baseCurrency={widgetBaseCurrency}
                            pairCurrency={widgetPairCurrency}
                            // affiliateAccount={affiliateAccount}
                            // affiliateFee={affiliateFee}
                            // whitelisted={whitelisted}
                        />

                    </StyledJumbotron>
                </Col>
            </Row>
            


        </Fragment>

    )
}
/*
const StyledJumbotron = styled(Jumbotron)`
    background-image: linear-gradient(to bottom, #5bc0de, #0275d8);  
    border-radius: 10px;
    color: white;
    height: 550px;
`;
*/

const StyledJumbotron = styled(Jumbotron)`
    background-image: linear-gradient(to bottom, #5bc0de, #0275d8);  
    border-radius: 10px;
    color: white;
    height: 600px;
    
    padding: 40px 20px 40px 20px;
`;


export default MainPage;