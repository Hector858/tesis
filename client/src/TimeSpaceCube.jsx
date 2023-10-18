import React, { useState } from 'react';
import Plot from 'react-plotly.js';

const TimeSpaceCubePlot = () => {
  const [data, setData] = useState([]);

  const handleFileChange = (event) => {
    const files = event.target.files;
    const newFilesData = [];

    // Read each file and extract data
    for (const file of files) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const fileContent = e.target.result;
        newFilesData.push(JSON.parse(fileContent));

        // If data from all files is collected, set the combined data
        if (newFilesData.length === files.length) {
          setData(newFilesData);
        }
      };

      reader.readAsText(file);
    }
  };

  const combinedData = data.reduce((acc, curr) => {
    if (curr && curr.length > 0) {
      acc.push(...curr);
    }
    return acc;
  }, []);

  return (
    <div>
      <input type="file" onChange={handleFileChange} multiple />
      {combinedData.length > 0 && (
        <Plot
          data={combinedData} // Combine and place your data in the appropriate format for Plotly.js
          layout={{ title: 'Time-Space Cube' }}
        />
      )}
    </div>
  );
};

export default TimeSpaceCubePlot;
