import React, { Component, useEffect, useState } from 'react'
import {
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavbarText,
    NavLink,
    DropdownToggle,
    Container,
    DropdownItem,
    DropdownMenu,
    UncontrolledDropdown,
    Collapse

} from "reactstrap"
import styled from "styled-components"

const NavBar = (props) => {

    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    return (
        <StyledNavbar style={{ marginBottom: "20px" }} color="light" light expand="md">
            <Container>

                <NavbarBrand>
                    <BrandHeader>
                        <NavLink href="/">
                            React Defi Widget
                        </NavLink>
                    </BrandHeader>

                </NavbarBrand>
                <NavbarToggler style={{ color: "red" }} onClick={toggle} />
                <Collapse isOpen={isOpen} navbar>
                    <Nav className="ml-auto" navbar>
                        {/*
                        <NavItem>
                            <Link to="/">
                                <NavLink>Token Swap</NavLink>
                            </Link>
                        </NavItem>
                        <NavItem>
                            <Link to="/pools">
                                <NavLink>Pool Creation/Stake Liquidity</NavLink>
                            </Link>
                        </NavItem>
                        */}
                        <NavItem>
                            <NavLink href="https://github.com/pisuthd/react-defi-widget" target="_blank">GitHub</NavLink>
                        </NavItem>
                    </Nav>

                </Collapse>

            </Container>

        </StyledNavbar>
    )
}

const BrandHeader = styled.span`
    font-family: Pacifico;
    font-size: 20px;

`;

const StyledNavbar = styled(Navbar)`
-webkit-box-shadow: 0 4px 6px -6px #222;
-moz-box-shadow: 0 4px 6px -6px #222;
box-shadow: 0 4px 6px -6px #222;
`;

//background-image: linear-gradient(#0275d8 70%, white 175px);

export default NavBar;