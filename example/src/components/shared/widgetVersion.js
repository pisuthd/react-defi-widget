import React, { useEffect, Fragment, useState } from 'react';

import styled from "styled-components"

const WidgetVersion = () => {
    return (
        <Wrapper>
            <span>DeFi Widget 0.1.3</span>{` `}
            |{` `}
            <a target="_blank" href="https://github.com/pisuthd/react-defi-widget">Github</a>{` `}
        </Wrapper>
    )
}

export default WidgetVersion;

const Wrapper = styled.div`
    text-align: center;
    font-size: 12px;

    p {
        font-size: 16px;
    }

    span {
        font-weight: 600;
    }

    a {
        color: inherit;
        text-decoration: underline;
        cursor: pointer;
    }
`;