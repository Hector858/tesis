import React from "react";

export const Services = (props) => {
  return (
    <div id="services" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>¿Cómo usar la aplicación web?</h2>
          <p>
            A continuación se presenta el paso a paso para visualizar los datos espacio-temporales.
          </p>
        </div>
        <div className="row">

          <div className="col-md-4">
            {" "}
            <img
              src="https://i.postimg.cc/6qZTw7Vt/menu.png"
              alt="Logo"
              style={{ height: "45px", marginRight: "0px", marginBottom: "250px" }}
            />
            <div className="service-desc">
              <h3>1. Ir a Gráfica</h3>
              <p>En el menú superior dar clic en la opción de Gráfica para dirigirse a la página para visualizar los datos.</p>
            </div>
          </div>

          <div className="col-md-4">
            {" "}
            <img
              src="https://i.postimg.cc/d0Dswkvp/abrir-Menu.png"
              alt="Logo"
              style={{ height: "300px", width: "350px", marginRight: "3px" }}
            />
            <div className="service-desc">
              <h3>2. Abrir el menú</h3>
              <p>Ya en la página de Gráfica, en la parte izquierda abrir el menu para observar las opciónes.</p>
            </div>
          </div>

          <div className="col-md-4">
            {" "}
            <img
              src="https://i.postimg.cc/KYZ28Kbx/cargar-Json.png"
              alt="Logo"
              style={{ height: "300px", marginRight: "3px", width: "350px" }}
            />
            <div className="service-desc">
              <h3>3. Cargar datos</h3>
              <p>En la opción de Cargar Información subir el archivo JSON con el formato anteriormente mencionado</p>
            </div>
          </div>

          <div className="col-md-4">
            {" "}
            <img
              src="https://i.postimg.cc/TPLg4Pyq/visualizacion.png"
              alt="Logo"
              style={{ height: "300px", marginRight: "3px", width: "350px" }}
            />
            <div className="service-desc">
              <h3>4. Personalización</h3>
              <p>Para mostrar/ocultar los puntos y las lineas, o ver los datos en perspectiva 2d elegir la opción de Visualizaciones</p>
            </div>
          </div>

          <div className="col-md-4">
            {" "}
            <img
              src="https://i.postimg.cc/hv4KjpdD/zoom.png"
              alt="Logo"
              style={{ height: "300px", marginRight: "3px", width: "350px" }}
            />
            <div className="service-desc">
              <h3>5. Zoom</h3>
              <p>En la opción de Zoom se aumente o disminuye la visualización de los datos, tambien incluye ver en pantalla completa el escenario.</p>
            </div>
          </div>


          <div className="col-md-4">
            {" "}
            <img
              src="https://i.postimg.cc/BbzR0g5w/filtro.png"
              alt="Logo"
              style={{ height: "300px", marginRight: "3px", width: "350px" }}
            />
            <div className="service-desc">
              <h3>6. Filtro</h3>
              <p>Elija la hora de inicio y la hora final que desea ver los datos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
