import React from "react";
import { Link, Outlet } from 'react-router-dom'
export const Navigation = (props) => {
  // Función para manejar el clic en los enlaces
  const handleClick = (event, targetId) => {
    // Si estamos en la página de inicio de sesión, deja que el enlace navegue a la ruta correspondiente
    if (window.location.pathname === '/grafica') {
      return;
    }

    event.preventDefault(); // Evitar el comportamiento predeterminado del enlace

    // Obtener el elemento de destino
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      // Realizar el desplazamiento suave hasta el elemento de destino
      window.scrollTo({
        top: targetElement.offsetTop,
        behavior: "smooth"
      });
    }
  };
  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#bs-example-navbar-collapse-1"
          >
            {" "}
            <span className="sr-only">Toggle navigation</span>{" "}
            <span className="icon-bar"></span>{" "}
            <span className="icon-bar"></span>{" "}
            <span className="icon-bar"></span>{" "}
          </button>
          <Link to="/" className="navbar-brand page-scroll" href="#page-top">
            Trackview
          </Link>{" "}
        </div>

        <div
          className="collapse navbar-collapse"
          id="bs-example-navbar-collapse-1"
        >
          <ul className="nav navbar-nav navbar-right">
            <li>
              <Link to="/" className="page-scroll" onClick={(e) => handleClick(e, "#features")}>
                Features
              </Link>
            </li>
            <li>
              <Link to="/" className="page-scroll" onClick={(e) => handleClick(e, "#about")}>
                About
              </Link>
            </li>
            <li>
              <Link to="/" className="page-scroll" onClick={(e) => handleClick(e, "#services")}>
                Services
              </Link>
            </li>
            <li>
              <Link to="/" className="page-scroll" onClick={(e) => handleClick(e, "#portfolio")}>
                Gallery
              </Link>
            </li>
            <li>
              <Link to="/" className="page-scroll" onClick={(e) => handleClick(e, "#testimonials")}>
                Testimonials
              </Link>
            </li>
            <li>
              <Link to="/" className="page-scroll" onClick={(e) => handleClick(e, "#team")}>
                Team
              </Link>
            </li>
            {/* <li>
              <Link to="/" className="page-scroll" onClick={(e) => handleClick(e, "#contact")}>
                Contact
              </Link>
            </li> */}
            <li>
              <Link to="/grafica">Grafica</Link> {/* Nueva opción de navegación */}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
