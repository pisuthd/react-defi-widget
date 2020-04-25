import styled from "styled-components";
import { COLORS } from "../../constants";
import "../../scss/animation.scss";
import "../../scss/common.scss";


export const Container = styled.div`
    min-height: 400px;
    color: rgba(0, 0, 0, 0.7);
    
`;

export const Card = styled.div`
    background: #fff;
    border-radius: 5px;
    display: flex;
    min-height: 400px;
    position: relative;
    padding: 10px;
    color: rgba(0, 0, 0, 0.7);
    
`

// box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);

export const LauncherButton = styled.button`
    @include animation(0, 0.5s, slide-in);

    

    align-self: flex-end;
    background-color: ${COLORS.primary};
    border: 0;
    border-radius: 50%;
    box-shadow: 0px 2px 10px 1px $grey-3;
    height: 60px;
    margin-top: 10px;
    width: 60px;
    cursor: pointer;

    &:focus {
        outline: none;
    }

    ${ props => props.isOpened 
    ?`
        width: 20px;
        @include animation(0, 0.5s, rotation-lr);
    `
    :`
        
        @include animation(0, 0.5s, rotation-rl);
    `
    }

`;

export const LauncherIcon = styled.img`
    filter: invert(91%) sepia(2%) saturate(1410%) hue-rotate(197deg) brightness(105%) contrast(93%);
`;

export const Header = styled.div`
    font-size: 20px;
    font-weight: 500;
    span {
        cursor: pointer;
    }
`;