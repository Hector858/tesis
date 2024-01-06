import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const CubeTimelineComponent = () => {
  const scene = useRef(null);
  const camera = useRef(null);
  const renderer = useRef(null);
  const cube = useRef(null);
  const thickLine = useRef(null);
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
    controls.current = new OrbitControls(
      camera.current,
      renderer.current.domElement
    );
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
    const pointsData = data.points;
    const curvePoints = pointsData.flatMap(
      (point) => new THREE.Vector3(point.x, point.y, point.z)
    );
    const curve = new THREE.CatmullRomCurve3(curvePoints);

    const geometry = new THREE.BufferGeometry().setFromPoints(
      curve.getPoints(50)
    );

    const material = new THREE.LineBasicMaterial({
      color: 0xff0000,
      linewidth: 5,
    });
    thickLine.current = new THREE.Line(geometry, material);

    cube.current.add(thickLine.current);
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
    const pointsGeometry = new THREE.BufferGeometry();
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x800080,
      size: 5,
    });

    let positions = [];

    if (data && typeof data === "object" && "points" in data) {
      const pointsData = data.points;
      if (
        Array.isArray(pointsData) &&
        pointsData.length > 0 &&
        typeof pointsData[0] === "object" &&
        "x" in pointsData[0] &&
        "y" in pointsData[0] &&
        "z" in pointsData[0]
      ) {
        positions = pointsData.flatMap((point) => [point.x, point.y, point.z]);
      } else {
        console.error("Invalid JSON format:", pointsData);
        return;
      }
    } else {
      console.error("Invalid JSON format:", data);
      return;
    }

    pointsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );

    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    cube.current.add(points);
  };

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

  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  const onMouseMove = (e) => {
    const deltaMove = {
      x: e.clientX - previousMousePosition.current.x,
      y: e.clientY - previousMousePosition.current.y,
    };

    if (isDragging.current) {
      const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          toRadians(deltaMove.y * 1),
          toRadians(deltaMove.x * 1),
          0,
          "XYZ"
        )
      );

      cube.current.quaternion.multiplyQuaternions(
        deltaRotationQuaternion,
        cube.current.quaternion
      );
    }

    previousMousePosition.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const onMouseDown = (e) => {
    isDragging.current = true;
    previousMousePosition.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const onMouseUp = () => {
    isDragging.current = false;
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
      <button onClick={togglePoints}>
        {showPoints ? "Ocultar Puntos" : "Mostrar Puntos"}
      </button>
      <button onClick={toggleLines}>
        {showLines ? "Ocultar Líneas" : "Mostrar Líneas"}
      </button>
      <button onClick={loadPointsFromJSON}>Cargar JSON</button>
    </div>
  );
};

export default CubeTimelineComponent;
