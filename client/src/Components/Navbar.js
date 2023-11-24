import React from 'react';
import { NavLink } from 'react-router-dom';
import Image from '../Images/logo.png';
import '../Styles/Navbar.css'
function Navbar() {

    return (
        <div>
            <nav className="menu">
                <ul>
                    <li>
                        <p>Inteligente Motors</p>
                    </li>
                    <li>
                        <NavLink to="/"><img className="img" src={Image} alt="Loading" /></NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    );
}
export default Navbar;