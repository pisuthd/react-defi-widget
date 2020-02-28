import React, { useCallback } from "react";
import styled from "styled-components";
import { getNetworkNameFromId, truncateString } from "../../utils/conversion";
import { useDefi } from "../../contexts/defi";
import ethereumLogo from "../../../assets/eth.png";
import bancorLogo from "../../../assets/bnt.png"
import usdLogo from "../../../assets/usd.png"


const AccountPage = (props) => {

    const { width, height, web3context } = props;
    const { loading, totalBancorEther, totalBancorToken, totalBancorUsd } = useDefi(web3context);

    const getLink = (networkId, address) => {
        if (networkId === 3) {
            return `https://ropsten.etherscan.io/address/${address}`
        } else {
            return `https://etherscan.io/address/${address}`
        }

    }




    return (
        <div>
            {loading
                ? <p>Verifying DeFi smart contracts...</p>
                :
                <Wrapper width={width}>
                    <Header>
                        <div className="text-center">
                            <h6>Your Account</h6>
                        </div>
                        <Row>
                            <AccountCard>
                                <h6>Connector</h6>
                                {web3context.connectorName || ""}
                            </AccountCard>
                            <AccountCard>
                                <h6>Network</h6>
                                {getNetworkNameFromId(web3context.networkId)}
                            </AccountCard>
                            <AccountCard>
                                <h6>Address</h6>
                                <a href={getLink(web3context.networkId, web3context.account)} target="_blank">
                                    {truncateString(web3context.account, 5)}
                                </a>
                            </AccountCard>
                        </Row>

                    </Header>
                    <Body>
                        <div>
                            <table>
                                <thead>
                                    <tr>
                                        <th width="5%">Assets</th>
                                        <th width="10%"></th>

                                        <th></th>
                                        <th width="20%"></th>
                                       
                                        <th width="10%"></th>

                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <TokenLogo src={ethereumLogo} alt="bancorLogo" />
                                        </td>
                                        <td>
                                            <TokenSymbol>
                                                ETH
                                            </TokenSymbol>
                                        </td>
                                        <td>
                                            <TokenDescription>
                                                Bancor's ERC20-compliant wrapped ETH allowing funding of liquidity pools
                                            </TokenDescription>
                                        </td>
                                        <td>{totalBancorEther.toFixed(4)}{` `}ETH</td>
                                    
                                        <td>
                                            {/*
                                            <a href="">Wrap</a>{` `}<a href="">Unwrap</a>
                                            */}
                                            
                                        </td>

                                    </tr>
                                    <tr>
                                        <td>
                                            <TokenLogo src={bancorLogo} alt="bancorLogo" />
                                        </td>
                                        <td>
                                            <TokenSymbol>
                                                BNT
                                            </TokenSymbol>
                                        </td>
                                        <td>
                                            <TokenDescription>
                                                A token underpinning the Bancor decentralized exchange system.
                                            </TokenDescription>
                                        </td>
                                        <td>{totalBancorToken.toFixed(4)}{` `}BNT</td>
                                        
                                        <td>

                                        </td>
                                    </tr>
                                    {/*
                                    <tr>
                                        <td>
                                            <TokenLogo src={usdLogo} alt="useLogo" />
                                        </td>
                                        <td>
                                            <TokenSymbol>
                                                BUSD
                                            </TokenSymbol>
                                        </td>
                                        <td>
                                            <TokenDescription>
                                                A USD stable token backed by BNT
                                            </TokenDescription>
                                        </td>
                                        <td>{totalBancorUsd.toFixed(3)}{` `}BUSD</td>
                                        
                                        <td>
                                            <a href="https://usdb.peg.network/" target="_blank">Acquire</a>
                                        </td>
                                        
                                    </tr>
                                    */}

                                </tbody>
                            </table>
                        </div>

                    </Body>

                </Wrapper>

            }
        </div>
    )
}

/*
const AccountPage = (props) => {

    const { width, height, web3context } = props;

    console.log("width / height / web3context : ", width, height, web3context)

    const { loading } = useDefi(web3context);

    const getLink = (networkId, address) => {
        if (networkId === 3) {
            return `https://ropsten.etherscan.io/address/${address}`
        } else {
            return `https://etherscan.io/address/${address}`
        }

    }

    return (
        <div >
            {loading
                ? <p>Verifying DeFi smart contracts...</p>
                : <Wrapper width={width}>
                    <DepositColumn>
                        left panel
                    </DepositColumn>
                    <UserColumn>
                        <UserCard>
                            <div>
                                <h6>Total Deposited</h6>
                                $ 1.01
                            </div>
                            <div>
                                <h6>Total WETH</h6>
                                $ 1.01
                            </div>
                        </UserCard>
                        <UserCard>

                            <div>
                                <h6>Network</h6>
                                {getNetworkNameFromId(web3context.networkId)}
                            </div>
                            <div>
                                <h6>Connector</h6>
                                {web3context.connectorName || ""}
                            </div>
                        </UserCard>



                        <UserCard columnWidth={"100%"}>
                            <div>
                                <h6>Address</h6>
                                <a href={getLink(web3context.networkId, web3context.account)} target="_blank">
                                    {web3context.account}
                                </a>

                            </div>
                        </UserCard>

                    </UserColumn>
                </Wrapper>
            }

        </div>
    )
}
*/


const Row = styled.div`
    display: flex;
`;


const Header = styled.div`
    height : 100px;

    padding: 10px 20px 10px 20px;

    h6 {
        font-weight: 600;
        font-size: 14px;
    }

`;

/*
const Wrapper = styled.div`
    display: grid;
    grid-gap: 10px;
    grid-template-columns: ${props => `${props.width - 450}px`} 350px;
    

`;
*/
const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: ${props => props.width - 100}px;
`;

const DepositColumn = styled.div`
    background-color: red;
    color: #fff;
   
    height: 50vh;
    max-height: 400px;
    overflow-y: scroll;
    padding: 20px;
    -webkit-overflow-scrolling: touch;

`;

const UserColumn = styled.div`
    
    diplay: flex;
    flex-direction: row;

`;

const TokenLogo = styled.img`
    margin-right: 10px;
    width : 34px;
    height : 32px; 
`

const TokenSymbol = styled.span`
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
`;

const TokenDescription = styled.span`
    font-size: 12px;
`

const UserCard = styled.div`
    border: 1px solid transparent;
    margin-bottom: -1px;
    padding: 10px;
    background-color: white;
    display: flex;

    

    div {
        width: ${props => props.columnWidth ? props.columnWidth : "50%"};
        font-size: 14px;
        word-wrap: break-word;
        font-weight: 500;

        a {
            color: inherit;
        }

        h6 {
            font-weight: 600;
            font-size: 14px;
        }

    }

`;

const AccountCard = styled.div`
    font-size: 14px;
    word-wrap: break-word;
    font-weight: 500;
    padding: 10px;

    a {
        color: inherit;
    }

    h6 {
        font-weight: 600;
        font-size: 14px;
    }
`;


const Body = styled.div`

    height: 50vh;
    max-height: 300px;
    overflow-y: scroll;
    padding: 10px 20px 10px 20px;
    -webkit-overflow-scrolling: touch;

    table {
        width: 100%;
    }

    th, td {
        padding-top: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ddd;
    }

    a {
        font-size: 12px;
        font-weight: 600;
        :hover {
            text-decoration: underline;
        }
    }

`;

export default AccountPage;