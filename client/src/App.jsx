import React, { useState, useEffect } from "react";
import { Navigation } from "./components/navigation";
import { Header } from "./components/header";
import { Features } from "./components/features";
import { About } from "./components/about";
import { Services } from "./components/services";
import { Gallery } from "./components/gallery";
import { Testimonials } from "./components/testimonials";
import { Team } from "./components/Team";
import { Contact } from "./components/contact";
import { Login } from "./components/login";
import Cubo from "./components/cubo";
import JsonData from "./data/data.json";
import SmoothScroll from "smooth-scroll";
import { BrowserRouter as Router, Route, Routes, Outlet, useNavigate } from 'react-router-dom';
import "./App.css";

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const [landingPageData, setLandingPageData] = useState({});
  const [showNavigation, setShowNavigation] = useState(true); // Estado para gestionar la visibilidad de la navegación
  const navigate = useNavigate();

  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);

  // Función para manejar la navegación a /grafica
  const handleNavigateToGrafica = () => {
    navigate('/grafica');
  };

  // Escuchar cambios en la ruta
  useEffect(() => {
    const currentPath = window.location.pathname;
    setShowNavigation(currentPath !== '/grafica');
  }, [window.location.pathname]);

  return (
    <div>
      {showNavigation && <Navigation />} {/* Mostrar la navegación solo si showNavigation es true */}
      <Routes>
        <Route path="/" element={<>
          <Header data={landingPageData.Header} />
          <Features data={landingPageData.Features} />
          <About data={landingPageData.About} />
          <Services data={landingPageData.Services} />
          <Gallery data={landingPageData.Gallery} />
          <Testimonials data={landingPageData.Testimonials} />
          <Team data={landingPageData.Team} />
          {/* <Contact data={landingPageData.Contact} /> */}
        </>} />
        <Route
          path="/grafica"
          element={<Cubo />}
          onClick={handleNavigateToGrafica} // Manejar la navegación a /grafica
        />
      </Routes>
      <Outlet />
    </div>
  );
};

export default App;
