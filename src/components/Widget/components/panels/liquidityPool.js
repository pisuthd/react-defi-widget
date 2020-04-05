import React, { useCallback, useState, useEffect, Fragment } from 'react';
import { useBancor } from "../../../../contexts/bancor";
import { getIcon } from "../../../../utils/token";
import styled from "styled-components";

import loadingIcon from "../../../../../assets/loading.gif"

const LiquidityPoolPanel = (props) => {

    const {
        web3ReactContext
    } = props;

    const networkId = web3ReactContext.networkId;
    const [pools, setPools] = useState([]);
    const [loadingPools, setLoadingPools] = useState(false);

    const {
        loading,
        listLiquidityPools,
        getTokenName,
        getLiquidityPool
    } = useBancor(web3ReactContext);

    useEffect(() => {


        (async () => {
            if (!loading) {

                // List liquidity pools
                setLoadingPools(true);
                const poolList = await listLiquidityPools();

                // Load reserves balance
                console.log("Find a liquidity depth on all tokens");


                let tokenNamePromise = [];
                for (let pool of poolList) {
                    tokenNamePromise.push(getTokenName(pool.smartTokenAddress))
                }

                Promise.all(tokenNamePromise).then(
                    tokenNameResult => {
                        // console.log("tokenNameResult : ", tokenNameResult);

                        let poolPromises = [];
                        for (let pool of poolList) {
                            poolPromises.push(getLiquidityPool(pool.converterAddress));
                        }

                        Promise.all(poolPromises).then(
                            poolResult => {

                                // console.log("poolResult : ", poolResult);
                                let promisesPool = [];

                                const getPoolInfo = async (pool, count) => {
                                    const name = tokenNameResult.find((item) => item[1].toLowerCase() === pool.smartTokenAddress.toLowerCase());
                                    const reserves = poolResult[count];

                                    const firstTokenSymbol = await getTokenName(reserves[0][1]);
                                    const secondTokenSymbol = await getTokenName(reserves[1][1]);

                                    return {
                                        name: name[0] || "",
                                        address: pool.smartTokenAddress,
                                        reserves: reserves,
                                        firstTokenSymbol: firstTokenSymbol[0] || "",
                                        secondTokenSymbol: secondTokenSymbol[0] || ""
                                    }
                                }

                                let count = 0;
                                for (let p of poolList) {
                                    promisesPool.push(getPoolInfo(p, count));
                                    count += 1;
                                }

                                Promise.all(promisesPool).then(
                                    finalResult => {

                                        console.log("finalResult : ", finalResult);
                                        finalResult = finalResult.filter(item => item.firstTokenSymbol !== "NAME_ERROR").filter(item => item.secondTokenSymbol !== "NAME_ERROR"); 

                                        // TODO : SUPPORT NON 50/50 RATIO POOLS
                                        setPools(finalResult.filter(item => item.reserves.length === 2));
                                        setLoadingPools(false);
                                    }
                                )



                            }
                        )

                    }
                )




            }
        })();

    }, [loading, networkId])

    const isLoading = loading || loadingPools;

    return (
        <Fragment>

            <Row>

                <table>
                    <thead>
                        <tr>
                            <th width="20%"></th>
                            <th width="20%">Name</th>
                            <th width="20%">Healthy</th>
                            <th width="20%">Liquidity</th>
                            <th width="20%">Equity</th>

                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr>
                                <td>
                                    <img src={loadingIcon} width="12px" height="12px" />
                                </td>
                                <td>

                                </td>
                                <td></td>
                                <td></td>
                                <td></td>

                            </tr>
                        )}
                        {/*
                         TODO : Searchbar
                        */}



                        {pools.map((item, index) => {

                            return (
                                <tr key={index}>
                                    <td>
                                        <AuxRow>
                                            <TokenLogo src={getIcon(item.firstTokenSymbol)} alt={item.firstTokenSymbol} />
                                            <TokenLogo src={getIcon(item.secondTokenSymbol)} alt={item.secondTokenSymbol} />
                                        </AuxRow>
                                    </td>
                                    <td>
                                        {`${item.firstTokenSymbol}/${item.secondTokenSymbol} `}
                                        <AuxRow>
                                            <AuxItem>
                                                50/50
                                            </AuxItem>
                                        </AuxRow>
                                    </td>
                                    <td>
                                        100%
                                    </td>
                                    <td>
                                        $480,190
                                    </td>
                                    <td>
                                        $0.00
                                    </td>


                                </tr>
                            )


                        })}



                    </tbody>
                </table>
            </Row>




        </Fragment >
    )
}


const Row = styled.div`

    

    height: 250px;
    overflow-y: scroll;


    h3 {
        font-size: 20px;
        font-weight: 500;
    }

    table {
        width:100%;
        font-size: 14px;
    }

    th, td {
        padding-top: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ddd;
    }
`;

const AuxRow = styled.div`
    display: flex;
`;

const AuxItem = styled.div`
    font-size: 10px;
    font-weight: 500;
    word-wrap: break-word;
    padding: 2px 4px 2px 4px;
    border: 1px solid #eee;
    vertical-align: middle;
    margin-right: 4px;

`;

const TokenLogo = styled.img`
    width : 26px;
    height : 24px;
    margin-right: 2px;
`

export default LiquidityPoolPanel;

