import React from 'react'
import { Link, Outlet } from 'react-router-dom'


const Navbar = () => {
    return (
        <div>
            <nav class="navbar navbar-expand-lg bg-body-tertiary">
                <div class="container-fluid">
                    <Link class="navbar-brand" to='/'>Graficas de datos espacio-temporales</Link>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNavDropdown">
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <Link class="nav-link active" aria-current="page" to='/'>Inicio</Link>
                            </li>
                            <li class="nav-item">
                                <Link class="nav-link" to='/grafica'>Grafica</Link>
                            </li>
                            <li class="nav-item">
                                <Link class="nav-link" to='/nosotros'>Nosotros</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <hr />
            <Outlet />
        </div>
    )
}

export default Navbar;