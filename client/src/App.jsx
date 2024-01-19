import React from 'react';
import TimeSpaceCubePlot from './TimeSpaceCube'; // Asegúrate de especificar la ruta correcta
import Navbar from './navegacion/navbarpe';
import { Routes, Router, Route } from 'react-router-dom';
import Cubo from './pages/cubo';
import Inicio from './pages/inicio';
import Nosotros from './pages/nosotros';


const App = () => {
  return (
    <div>


      <Routes>
        <Route path='/' element={<Navbar />}>
          <Route path='/' element={<Inicio />} />
          <Route path='/grafica' element={<Cubo />} />
          <Route path='/nosotros' element={<Nosotros />} />
        </Route>
      </Routes>

      {/* <TimeSpaceCubePlot /> */}
    </div>
  );
};

export default App;
