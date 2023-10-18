import React, { useState } from 'react';
import Plot from 'react-plotly.js';

const ClimateGraph = () => {
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

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {data && (
        <Plot
          data={data}  // Coloca aquí tus datos en el formato adecuado para Plotly.js
          layout={{ title: 'Time-Space Cube' }}
        />
      )}
    </div>
  );
};

export default ClimateGraph;
