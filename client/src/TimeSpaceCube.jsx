import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

const TimeSpaceCubePlot = () => {
  const [data, setData] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;
      setData(JSON.parse(fileContent));
    };

    reader.readAsText(file);
  };

  //probando los layout
  const customLayout = {
    scene: {
      xaxis: {
        backgroundcolor: "rgb(200, 200, 230)",
        gridcolor: "rgb(255, 255, 255)",
        showbackground: true,
        zerolinecolor: "rgb(255, 255, 255)",
      },
      yaxis: {
        backgroundcolor: "rgb(230, 200, 230)",
        gridcolor: "rgb(255, 255, 255)",
        showbackground: true,
        zerolinecolor: "rgb(255, 255, 255)",
      },
      zaxis: {
        backgroundcolor: "rgb(230, 230, 200)",
        gridcolor: "rgb(255, 255, 255)",
        showbackground: true,
        zerolinecolor: "rgb(255, 255, 255)",
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {data && (
        <Plot
          data={data}  // Coloca aquí tus datos en el formato adecuado para Plotly.js
          layout={{
            title: 'Time-Space Cube PRO',
            scene: {
              xaxis: { title: 'X-axis' },
              yaxis: { title: 'Y-axis' },
              zaxis: { title: 'Z-axis' },
              ...customLayout.scene // Agregar el diseño personalizado
            }
          }}
          config={{ responsive: true }}
          useResizeHandler={true}
        />
      )}
    </div>
  );
};

export default TimeSpaceCubePlot;
