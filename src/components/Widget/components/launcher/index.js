import React from 'react';

import defiLauncher from "../../../../../assets/ethereum.svg";
import closeLauncher from "../../../../../assets/close.svg";

import { LauncherButton, LauncherIcon } from "../../../Common";

const Launcher = ({ toggle, isOpened }) => {

    return (
        <LauncherButton type="button" className={isOpened ? 'defi-launcher defi-hide-sm' : 'defi-launcher'} onClick={toggle}>
            {isOpened ?
                <LauncherIcon isOpened={isOpened} width="34px" height="32px"  src={closeLauncher} alt="" /> :
                <LauncherIcon isOpened={isOpened} width="34px" height="32px" src={defiLauncher}  alt="" />
            }
        </LauncherButton>
    )
}

export default Launcher;