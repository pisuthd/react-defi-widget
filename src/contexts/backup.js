const listBancorPools = () => {


    return new Promise((resolve, reject) => {

        const signer = web3context.library.getSigner();
        const contract = getContract(bancorContractBancorConverterRegistry, BancorConverterRegistryAbi, signer);
        console.log("load liquidity pools...", bancorContractBancorConverterRegistry);
        contract.getLiquidityPools().then(
            pools => {
                console.log("pools : ", pools);
                console.log("total pools : ", pools.length);

                contract.getConvertersBySmartTokens(pools).then(
                    converters => {
                        console.log("converters : ", converters)
                        let test = 0;
                        Promise.all(converters.map(converter => new Promise(resolve => {

                            const converterContract = getContract(converter, BancorConverterAbi, signer);
                            converterContract.reserveTokenCount().then(
                                reverseCount => {
                                    console.log("reverseCount : ", reverseCount)
                                    test += 1;
                                    console.log("test : ", test)
                                    resolve()
                                }
                            ).catch(error => {
                                console.log("error : ", error);
                                resolve()
                            })


                        }))).then(() => {
                            console.log("done")
                            resolve(["123", "456"])
                        })


                    }
                )

                /*
                Promise.all(pools.map(pool => new Promise(resolve => {
                    
                    const converter = getContract(pool, SmartTokenAbi, signer);
                    converter.symbol().then(
                        total => {
                            console.log("TOTAL : ", total)
                            resolve()
                        }
                    )

                    
                }))).then(() => {
                    resolve(["123", "456"])
                })
                */



            }
        ).catch(
            error => {
                console.log("Error : ", error)
            }
        )

        /*
        contract.getSmartTokenCount().then(
            totalContracts => {
                console.log("totalContracts : ", totalContracts.toString())
            }
        )
        */
        /*
        contract.getLiquidityPoolCount().then(
            totalPools => {
                console.log("Total Liquidity Pools : ", totalPools.toNumber());
                let pools = []

                const onUpdate = (item) => {

                    pools.push(item);

                    if (pools.length === totalPools.toNumber()) {
                        console.log("completed...")
                        resolve(pools)
                    }

                }

                for (let i = 0, p = Promise.resolve(); i < totalPools.toNumber(); i++) {
                    p = p.then(_ => new Promise(resolve => {

                        contract.getLiquidityPools(i).then(
                            poolAddress => {
                                console.log("converterAddress : ", poolAddress)

                                const converterContract = getContract(poolAddress, BancorConverterRegistryDataAbi, signer);
                                console.log("converterContract : ", converterContract)
                                onUpdate(poolAddress);
                                resolve();
                               


                            }
                        )

                    }
                    ));
                }


            }
        )
        */

    })
}