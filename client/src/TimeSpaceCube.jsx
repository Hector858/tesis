import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const CubeTimelineComponent = () => {
  const scene = useRef(null);
  const camera = useRef(null);
  const renderer = useRef(null);
  const cube = useRef(null);
  const controls = useRef(null);

  let showPoints = true;
  let showLines = true;

  const init = () => {
    // Configuración básica
    scene.current = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    camera.current = new THREE.OrthographicCamera(-10 * aspect, 10 * aspect, 10, -10, 0.1, 1000);

    renderer.current = new THREE.WebGLRenderer();
    renderer.current.setSize(window.innerWidth - 20, window.innerHeight - 20);
    renderer.current.setClearColor(new THREE.Color().setRGB(0.5, 0.5, 0.7));
    document.body.appendChild(renderer.current.domElement);

    // Configuración de la cámara
    camera.current.position.set(0, 0, 20);
    crearCubo();
    const grid = new THREE.GridHelper(20, 10, 0x202020, 0x202020);
    grid.position.set(0, 0, 0);
    grid.rotation.x = Math.PI / 4;
    grid.rotation.y = Math.PI / 4;

    // Llamar a la animación
    animate();

    // Manejar eventos de redimensionamiento
    window.addEventListener("resize", onWindowResize, false);

    // Configuración de los controles de órbita
    controls.current = new OrbitControls(camera.current, renderer.current.domElement);
  };

  const crearCubo = () => {
    const geometry = new THREE.PlaneGeometry(10, 10);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.3,
    });
    const plane1 = new THREE.Mesh(geometry, material);
    const plane2 = new THREE.Mesh(geometry, material);
    plane2.position.z = 10;

    const boxGeo = new THREE.BoxGeometry(10, 10, 10);
    const edgeGeo = new THREE.EdgesGeometry(boxGeo);

    const line = new THREE.LineSegments(
      edgeGeo,
      new THREE.LineBasicMaterial({
        color: new THREE.Color("white"),
        linewidth: 5,
      })
    );
    line.position.z = 5;

    cube.current = new THREE.Group();
    cube.current.add(plane1);
    cube.current.add(plane2);
    cube.current.add(line);
    scene.current.add(cube.current);
  };

  const agregarLineas = (data) => {
    if (!showLines) {
      return;
    }

    if ('points' in data) {
      // Para un solo camino con la propiedad "points"
      const pointsData = data.points;

      if (!Array.isArray(pointsData) || pointsData.length < 2) {
        console.warn('Invalid path format: "points" array is missing or has insufficient points.');
        return;
      }

      const curvePoints = pointsData.flatMap((point) => {
        if (
          typeof point.x === 'number' &&
          typeof point.y === 'number' &&
          typeof point.z === 'string'
        ) {
          const time = new Date(`1970-01-01T${point.z}`);
          const hours = time.getHours();
          const minutes = time.getMinutes();
          const seconds = time.getSeconds();

          return new THREE.Vector3(point.x, point.y, hours + minutes / 60 + seconds / 3600);
        } else {
          console.warn('Invalid point coordinates:', point);
          return [];
        }
      });

      if (curvePoints.length < 2) {
        console.warn('Not enough valid points to create lines.');
        return;
      }

      const curve = new THREE.CatmullRomCurve3(curvePoints);

      const geometry = new THREE.BufferGeometry().setFromPoints(
        curve.getPoints(50)
      );

      const material = new THREE.LineBasicMaterial({
        color: 0xff0000,
        linewidth: 5,
      });

      const thickLine = new THREE.Line(geometry, material);
      cube.current.add(thickLine);
    } else if ('paths' in data) {
      // Para múltiples caminos con la propiedad "paths"
      if (!Array.isArray(data.paths) || data.paths.length === 0) {
        console.warn('Invalid JSON format: "paths" array is missing or empty.');
        return;
      }

      data.paths.forEach((path) => {
        const pointsData = path.points;

        if (!Array.isArray(pointsData) || pointsData.length < 2) {
          console.warn('Invalid path format: "points" array is missing or has insufficient points.');
          return;
        }

        const curvePoints = pointsData.flatMap((point) => {
          if (
            typeof point.x === 'number' &&
            typeof point.y === 'number' &&
            typeof point.z === 'string'
          ) {
            const time = new Date(`1970-01-01T${point.z}`);
            const hours = time.getHours();
            const minutes = time.getMinutes();
            const seconds = time.getSeconds();

            return new THREE.Vector3(point.x, point.y, hours + minutes / 60 + seconds / 3600);
          } else {
            console.warn('Invalid point coordinates:', point);
            return [];
          }
        });

        if (curvePoints.length < 2) {
          console.warn('Not enough valid points to create lines.');
          return;
        }

        const curve = new THREE.CatmullRomCurve3(curvePoints);

        const geometry = new THREE.BufferGeometry().setFromPoints(
          curve.getPoints(50)
        );

        const material = new THREE.LineBasicMaterial({
          color: 0xff0000,
          linewidth: 5,
        });

        const thickLine = new THREE.Line(geometry, material);
        cube.current.add(thickLine);
      });
    } else {
      console.warn('Invalid JSON format: "points" or "paths" property is missing.');
    }
  };

  const esLineaBorde = (linea) => {
    const colorLinea = linea.material.color;
    return colorLinea.equals(new THREE.Color("white"));
  };

  const cargarImagenDesdeURL = (url) => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(url, (texture) => {
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 1,
      }); // Establecer la opacidad a 1 (sin opacidad)
      cube.current.children[0].material = material; // Actualizar el material del plane1
    });
  };

  const loadPointsFromJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.addEventListener("change", (event) => {
      const file = event.target.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = JSON.parse(e.target.result);

            if ("imageURL" in data) {
              cargarImagenDesdeURL(data.imageURL);
            }

            addPointsFromJSON(data);
            agregarLineas(data);
          } catch (error) {
            console.error("Error parsing JSON file:", error);
          }
        };

        reader.readAsText(file);
      }
    });

    input.click();
  };



  const addPointsFromJSON = (data) => {
    if (!showPoints) {
      return;
    }
    const labelMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Color del texto

    if ('points' in data) {
      // Para un solo camino con la propiedad "points"
      const pointsData = data.points;

      if (!Array.isArray(pointsData) || pointsData.length === 0) {
        console.warn('Invalid JSON format: "points" array is missing or empty.');
        return;
      }

      const positions = pointsData.flatMap((point) => {
        if (
          typeof point.x === 'number' &&
          typeof point.y === 'number' &&
          typeof point.z === 'string'
        ) {
          const time = new Date(`1970-01-01T${point.z}`);
          return [point.x, point.y, time.getHours() + time.getMinutes() / 60 + time.getSeconds() / 3600];
        } else {
          console.warn('Invalid point coordinates:', point);
          return [];
        }
      });

      const pointsGeometry = new THREE.BufferGeometry();
      const pointsMaterial = new THREE.PointsMaterial({
        color: 0x800080,
        size: 5,
      });

      pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

      const points = new THREE.Points(pointsGeometry, pointsMaterial);
      cube.current.add(points);

      // Añadir etiquetas
      pointsData.forEach((point) => {
        const time = new Date(`1970-01-01T${point.z}`);
        const label = createTextLabel(`${point.label}`);
        label.position.set(point.x, point.y, time.getHours() + time.getMinutes() / 60 + time.getSeconds() / 3600 + 0.1); // Ajusta la posición del texto
        cube.current.add(label);
      });
    } else if ('paths' in data) {
      // Para múltiples caminos con la propiedad "paths"
      if (!Array.isArray(data.paths) || data.paths.length === 0) {
        console.warn('Invalid JSON format: "paths" array is missing or empty.');
        return;
      }

      data.paths.forEach((path) => {
        const pointsData = path.points;

        if (!Array.isArray(pointsData) || pointsData.length === 0) {
          console.warn('Invalid path format: "points" array is missing or empty.');
          return;
        }

        const positions = pointsData.flatMap((point) => {
          if (
            typeof point.x === 'number' &&
            typeof point.y === 'number' &&
            typeof point.z === 'string'
          ) {
            const time = new Date(`1970-01-01T${point.z}`);
            return [point.x, point.y, time.getHours() + time.getMinutes() / 60 + time.getSeconds() / 3600];
          } else {
            console.warn('Invalid point coordinates:', point);
            return [];
          }
        });

        const pointsGeometry = new THREE.BufferGeometry();
        const pointsMaterial = new THREE.PointsMaterial({
          color: 0x800080,
          size: 5,
        });

        pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const points = new THREE.Points(pointsGeometry, pointsMaterial);
        cube.current.add(points);

        // Añadir etiquetas
        pointsData.forEach((point) => {
          const time = new Date(`1970-01-01T${point.z}`);
          const label = createTextLabel(`${point.label}`);
          label.position.set(point.x, point.y, time.getHours() + time.getMinutes() / 60 + time.getSeconds() / 3600 + 0.1); // Ajusta la posición del texto
          cube.current.add(label);
        });
      });
    } else {
      console.warn('Invalid JSON format: "points" or "paths" property is missing.');
    }
  };

  // Función para crear etiquetas de texto
  function createTextLabel(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Ajustar el tamaño de la fuente y el color del texto
    context.font = 'Bold 50px Arial';
    context.fillStyle = '#000000'; // Color negro
    context.textAlign = 'center'; // Alineación centrada
    context.textBaseline = 'middle'; // Alineación vertical centrada

    // Medir el tamaño del texto para ajustar el tamaño del canvas
    const textMeasure = context.measureText(text);
    canvas.width = textMeasure.width + 20; // Añadir espacio adicional
    canvas.height = 70; // Ajustar según el tamaño de la fuente y preferencias

    // Rellenar el fondo con transparencia
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar el texto en el centro del canvas
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    // Configurar la textura con fondo transparente
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true; // Asegurarse de que la textura se actualice correctamente

    // Configurar el material con transparencia
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true, // Activar transparencia
      side: THREE.DoubleSide
    });

    // Configurar la geometría del texto
    const textGeometry = new THREE.PlaneGeometry(canvas.width / 25, canvas.height / 25);

    // Configurar el mesh del texto
    const textMesh = new THREE.Mesh(textGeometry, material);

    return textMesh;
  }

  const togglePoints = () => {
    showPoints = !showPoints;
    actualizarVisibilidad();
  };

  const toggleLines = () => {
    showLines = !showLines;
    actualizarVisibilidad();
  };

  const actualizarVisibilidad = () => {
    cube.current.children.forEach((child) => {
      if (child instanceof THREE.Points) {
        child.visible = showPoints;
      } else if (child instanceof THREE.Line && !esLineaBorde(child)) {
        child.visible = showLines;
      }
    });
  };

  const onWindowResize = () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.current.left = -10 * aspect;
    camera.current.right = 10 * aspect;
    camera.current.top = 10;
    camera.current.bottom = -10;
    camera.current.updateProjectionMatrix();

    renderer.current.setSize(window.innerWidth - 20, window.innerHeight - 20);
  };

  const animate = () => {
    requestAnimationFrame(animate);

    if (cube.current) {
      renderer.current.render(scene.current, camera.current);
    }
  };

  useEffect(() => {
    init();
    // Limpiar controles al desmontar el componente
    return () => {
      controls.current.dispose();
    };
  }, []);

  useEffect(() => {
    actualizarVisibilidad();
  }, [showPoints, showLines]);

  return (
    <div>
      <div>
        <button onClick={togglePoints}>
          {showPoints ? "Ocultar Puntos" : "Mostrar Puntos"}
        </button>
        <button onClick={toggleLines}>
          {showLines ? "Ocultar Líneas" : "Mostrar Líneas"}
        </button>
        <button onClick={loadPointsFromJSON}>Cargar JSON</button>
      </div>
    </div>
  );
};

export default CubeTimelineComponent;