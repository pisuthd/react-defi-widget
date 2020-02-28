import React, { useEffect, useCallback, useState } from "react";
import styled from "styled-components";
import { useDefi } from "../../contexts/defi";
import bancorLogo from "../../../assets/bnt.png";

const StakePage = (props) => {

    const { width, height, web3context } = props;
    const { listBancorPools, loading, loadReserve, getTokenName, listReverses, loadRatio, fund } = useDefi(web3context);
    const [internalLoading, setInternalLoading] = useState(false);

    const [contracts, setContracts] = useState([]);

    useEffect(() => {
        if (!loading) {
            setInternalLoading(true);
            listBancorPools().then(
                poolAddresses => {
                    setContracts(poolAddresses)
                    setInternalLoading(false);

                }
            )
        }

    }, [loading])




    return (
        <div>
            {loading
                ?
                <p>
                    Verifying DeFi smart contracts...
                </p>
                :
                <Wrapper width={width}>
                    <Header>
                        <div className="text-center">
                            <h6>Find Your Staking Pools</h6>
                        </div>
                        <Row>

                            <ProtocolCard>
                                <img width="34px" height="32px" src={bancorLogo} alt="logo" />
                                {` `}<span>Bancor</span>
                            </ProtocolCard>
                        </Row>

                    </Header>
                    <Body>
                        {internalLoading
                            ? <p>Loading reserves...</p>
                            :
                            <table>
                                <thead>
                                    <tr>
                                        <th width="20%">Pool Name</th>
                                        <th width="35%">Reserves </th>
                                        <th width="20%">Ratios </th>
                                        <th ></th>
                                        <th width="20%">Fund</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {contracts.map((contract, index) => {


                                        return (
                                            <PoolItem
                                                key={index}
                                                contract={contract}
                                                getTokenName={getTokenName}
                                                listReverses={listReverses}
                                                loadReserve={loadReserve}
                                                loadRatio={loadRatio}
                                                fund={fund}
                                            />

                                        )
                                    })}



                                </tbody>
                            </table>
                        }

                    </Body>
                </Wrapper>
            }
        </div>
    )
}

const PoolItem = (props) => {

    const { contract, getTokenName, listReverses, loadReserve, loadRatio, fund } = props;

    const [poolName, setPoolName] = useState("Loading...");
    const [totalReserves, setTotalReserves] = useState(0);
    const [ratio, setRatio] = useState("");
    const [token1, setToken1] = useState({
        name: "",
        balance: "",
        address: ""
    });
    const [token2, setToken2] = useState({
        name: "",
        balance: "",
        address: ""
    });


    useEffect(() => {


        if (contract && contract.smartTokenAddress) {
            getTokenName(contract.smartTokenAddress).then(
                name => {
                    setPoolName(name)
                }
            )
        }


        if (contract && contract.converterAddress) {
            listReverses(contract.converterAddress).then(
                result => {
                    const totalReserves = Number(result)
                    if (totalReserves) {
                        setTotalReserves(totalReserves);

                    }

                }
            ).catch(error => {
                console.log("error : ", error)
            })
        }



    }, [contract])

    useEffect(() => {
        if (contract && totalReserves !== 0) {
            console.log("load reserves ...")
            let ids = [];
            for (let count = 0; count < totalReserves; count++) {
                ids.push(loadReserve(contract.converterAddress, count))
            }
            Promise.all(ids).then(results => {

                if (results.length > 0) {
                    // Get symbol name of revese tokens
                    Promise.all(results.map(item => {
                        return getTokenName(item.address)
                    })).then(
                        names => {
                            console.log("reseveAddresses : ", names, results)
                            if (names[0]) {
                                setToken1({
                                    name: names[0],
                                    balance: results[0].balance,
                                    address: results[0].address
                                })
                            }
                            if (names[1]) {
                                setToken2({
                                    name: names[1],
                                    balance: results[1].balance,
                                    address: results[1].address
                                })
                            }
                        }
                    )



                }


            })
        }
    }, [contract, totalReserves])

    const fundToken1 = useCallback((e) => {
        if (token1.address) {
            fund(contract.converterAddress, token1.address).then(
                result => {
                    console.log("Done.")
                }
            )
        }
    }, [token1, contract])

    const fundToken2 = useCallback((e) => {

        if (token2.address) {
            fund(contract.converterAddress, token2.address).then(
                result => {
                    console.log("Done.")
                }
            )
        }
    }, [token2, contract])

    useEffect(() => {
        if (totalReserves !== 0 && token1.address && token2.address) {

            Promise.all([loadRatio(contract.converterAddress, token1.address), loadRatio(contract.converterAddress, token2.address)]).then(
                ratios => {
                    console.log("ratios : ", ratios)
                    setRatio(`${Math.round(ratios[0] / 10000)}% / ${Math.round(ratios[1] / 10000)}%`);
                }
            )
        }
    }, [totalReserves, contract, token1, token2])

    return (
        <tr>
            <td>
                {poolName}
                <span style={{ fontSize: "12px" }}>{totalReserves === 0 && " (Inactive)"}</span>
            </td>

            <td>
                {token1.balance !== "" &&
                    <div>
                        {Number(token1.balance).toFixed(8)}{` `}{token1.name}
                        {` `}/{` `}
                        {Number(token2.balance).toFixed(8)}{` `}{token2.name}
                    </div>

                }
            </td>
            <td>
                {ratio}

            </td>
            <td>

            </td>
            <td>
                {token1.name &&
                    (
                        <div>
                            {` `}<a style={{ cursor: "pointer" }} onClick={fundToken1}>0.1 {token1.name}</a>{` `}|{` `}<a style={{ cursor: "pointer" }} onClick={fundToken2}>0.1 {token2.name}</a>
                        </div>
                    )

                }

            </td>
        </tr>
    )
}

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: ${props => props.width - 100}px;


`;



const Header = styled.div`
    height : 100px;

    padding: 10px 20px 10px 20px;

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

`;

const Row = styled.div`
    display: flex;
`;

const ProtocolCard = styled.div`

    font-size: 14px;
    font-weight: 600;

    span {
        
        cursor: pointer;
        text-decoration: underline;
        :hover {
            text-decoration: none;
        }
    }
    
`;

export default StakePage;