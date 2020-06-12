
import React, { Component, useCallback, Fragment, useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';

export const SummaryHeadline = styled.div`
    ${({ width }) => width > 400 &&`
        font-size: 22px;
    `}
`;

export const Summary = styled.div`
    border: 1px solid #ddd;
    justify-content: center;
    width: 100%;

    ${({ width }) => width > 400
        ?
        `
        padding: 10px;
        padding-top: 20px;
        padding-bottom: 20px;
        font-size: 16px;
    `
        :
        `
        padding: 10px;
        padding-top: 15px;
        padding-bottom: 15px;
        font-size: 14px;
    `
    }


`;

export const SummaryContainer = styled.div`
    padding-top: 20px;
    padding-left: 0px;
    padding-right: 10px;

    div {
        margin-left: auto;
        margin-right: auto;
        max-width: 380px;
    }

`;


export const Row = styled.div`
    display: flex;
    :first-child {
        padding-top: 5px;
    }
`;

export const Column = styled.div`
    flex: 50%;
    
    :first-child {
        padding-right: 5px;
        flex: 50%;
    }

`;


