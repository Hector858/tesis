import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

const Cubo = () => {
    const scene = useRef(null);
    const camera = useRef(null);
    const renderer = useRef(null);
    const cube = useRef(null);
    const controls = useRef(null);

    let showPoints = true;
    let showLines = true;
    let showLabels = true;


    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let labelDiv = null;

    const init = () => {
        // Configuración básica
        scene.current = new THREE.Scene();

        const aspect = window.innerWidth / window.innerHeight;
        camera.current = new THREE.OrthographicCamera(-10 * aspect, 10 * aspect, 10, -10, 0.1, 1000);

        renderer.current = new THREE.WebGLRenderer();
        renderer.current.setSize(window.innerWidth, window.innerHeight);
        renderer.current.setClearColor(new THREE.Color().setRGB(0.5, 0.5, 0.7));


        // Crear contenedor para la escena y los controles
        const container = document.getElementById("scene-container");
        container.appendChild(renderer.current.domElement);

        labelDiv = document.createElement('div');
        labelDiv.style.position = 'absolute';
        labelDiv.style.pointerEvents = 'none';
        labelDiv.style.zIndex = '10';
        labelDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        labelDiv.style.padding = '5px';
        labelDiv.style.borderRadius = '5px';
        labelDiv.style.display = 'none';

        container.appendChild(labelDiv);

        // Configuración de la cámara
        camera.current.position.set(0, 0, 20);
        crearCubo();
        const grid = new THREE.GridHelper(20, 10, 0x202020, 0x202020);
        grid.position.set(0, 0, 0);
        grid.rotation.x = Math.PI / 4;
        grid.rotation.y = Math.PI / 4;



        // Configuración de los controles de órbita
        controls.current = new OrbitControls(camera.current, renderer.current.domElement);
        container.appendChild(controls.current.domElement); // Adjuntar controles al nuevo contenedor



        // Llamar a la animación
        animate();

        // Manejar eventos de redimensionamiento
        window.addEventListener("resize", onWindowResize, false);

        // Configuración del evento de mover el mouse
        document.addEventListener('mousemove', onMouseMove, false);

        initGUI(container);
    };

    const formatTime = (hours) => {
        const totalSeconds = hours * 3600;
        const formattedHours = Math.floor(hours).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const seconds = Math.floor(totalSeconds % 60);
        const formattedSeconds = seconds.toString().padStart(2, '0');
      
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
      };
    
      const onMouseMove = (event) => {
        // Calcula la posición normalizada del mouse en el rango [-1, 1]
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        // Actualiza el raycaster con la posición del mouse
        raycaster.setFromCamera(mouse, camera.current);
    
        // Comprueba la intersección con los objetos Points
        const intersects = raycaster.intersectObjects(scene.current.children, true);
    
        if (intersects.length > 0) {
          // Muestra la información del punto en la consola (puedes personalizar esto)
          const selectedObject = intersects[0].object;
    
          if (selectedObject.material instanceof THREE.PointsMaterial) {
            const position = selectedObject.geometry.attributes.position;
            const index = intersects[0].index;
            const x = position.getX(index);
            const y = position.getY(index);
            const z = position.getZ(index);
            const formattedTime = formatTime(z);
            
            // Actualiza la posición de la etiqueta div
            labelDiv.style.left = `${event.clientX + 10}px`;
            labelDiv.style.top = `${event.clientY - 20}px`;
    
            // Muestra la información en la etiqueta
            labelDiv.innerText = `Point: x=${x.toFixed(2)}, y=${y.toFixed(2)}, Hora=${formattedTime}`;
    
    
            // Muestra la etiqueta
            labelDiv.style.display = 'block';
    
            //console.log(`Point information: x=${x}, y=${y}, z=${z}`);
          }else {
            // Oculta la etiqueta si no hay intersección con un punto
            labelDiv.style.display = 'none';
          }
        }else {
          // Oculta la etiqueta si no hay intersección con un punto
          labelDiv.style.display = 'none';
        }
      };

    const toggleFullscreen = () => {
        const container = document.getElementById("scene-container");

        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.mozRequestFullScreen) {
            container.mozRequestFullScreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }
    };

    const exitFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    };

    const initGUI = (container) => {
        const guiContainer = document.createElement("div");
        container.appendChild(guiContainer);

        // Agrega controles y configuraciones del GUI aquí
        const gui = new GUI({ autoPlace: false });
        const folder = gui.addFolder("Opciones");

        folder.add({ MostrarPuntos: showPoints }, "MostrarPuntos").onChange((value) => {
            showPoints = value;
            actualizarVisibilidad();
        });

        folder.add({ MostrarLineas: showLines }, "MostrarLineas").onChange((value) => {
            showLines = value;
            actualizarVisibilidad();
        });

        folder.add({ Fullscreen: false }, "Fullscreen").onChange((value) => {
            if (value) {
                toggleFullscreen();
            } else {
                exitFullscreen();
            }
            // Restaurar el valor a false para que el botón esté disponible para el próximo clic
            folder.__controllers[0].setValue(false);
        });

        folder.add({ CargarJSON: () => loadPointsFromJSON() }, "CargarJSON");



        guiContainer.appendChild(gui.domElement);
        gui.domElement.style.position = "absolute";
        gui.domElement.style.top = "90px";
        gui.domElement.style.right = "10px";
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
                color: new THREE.Color("black"),
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
            const points = curve.getPoints(50);
            const positions = points.flatMap(v => [v.x, v.y, v.z]);

            const colors = [];
            const divisions = Math.round(25 * curvePoints.length);
            const color = new THREE.Color();

            for (let i = 0, l = divisions; i < l; i++) {
                const t = i / l;
                color.setHSL(t, 1.0, 0.5, THREE.SRGBColorSpace);
                colors.push(color.r, color.g, color.b);
            }

            const geometry = new LineGeometry().setPositions(positions);
            geometry.setColors(colors);

            const material = new LineMaterial({
                color: 0xffffff,
                linewidth: 5,
                resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
                dashed: false,
                transparent: true,
                vertexColors: true,
            });

            const thickLine = new Line2(geometry, material);
            thickLine.computeLineDistances();
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
                const points = curve.getPoints(50);
                const positions = points.flatMap(v => [v.x, v.y, v.z]);

                const colors = [];
                const divisions = Math.round(25 * curvePoints.length);
                const color = new THREE.Color();

                for (let i = 0, l = divisions; i < l; i++) {
                    const t = i / l;
                    color.setHSL(t, 1.0, 0.5, THREE.SRGBColorSpace);
                    colors.push(color.r, color.g, color.b);
                }

                const geometry = new LineGeometry().setPositions(positions);
                geometry.setColors(colors);

                const material = new LineMaterial({
                    color: 0xffffff,
                    linewidth: 5,
                    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
                    dashed: false,
                    transparent: true,
                    vertexColors: true,
                });

                const thickLine = new Line2(geometry, material);
                thickLine.computeLineDistances();
                cube.current.add(thickLine);
            });
        } else {
            console.warn('Invalid JSON format: "points" or "paths" property is missing.');
        }
    };

    const esLineaBorde = (linea) => {
        const colorLinea = linea.material.color;
        return colorLinea.equals(new THREE.Color("black"));
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
                size: 15,
            });

            pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

            const points = new THREE.Points(pointsGeometry, pointsMaterial);
            cube.current.add(points);
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
                    size: 15,
                });

                pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

                const points = new THREE.Points(pointsGeometry, pointsMaterial);
                cube.current.add(points);
            });
        } else {
            console.warn('Invalid JSON format: "points" or "paths" property is missing.');
        }
    };

    const actualizarVisibilidad = () => {
        cube.current.children.forEach((child) => {
            if (child instanceof THREE.Points) {
                child.visible = showPoints;
            } else if (child instanceof Line2 && !esLineaBorde(child)) {
                child.visible = showLines;
            } else if (child instanceof THREE.Mesh && child.userData.isLabel) {
                child.visible = showLabels;
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

        renderer.current.setSize(window.innerWidth, window.innerHeight);
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
        <div id="scene-container">
            {/* Contenedor para la escena y los controles */}
        </div>
    );
}

export default Cubo;