import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import html2pdf from 'html2pdf.js';
import { AxesHelper, ArrowHelper } from "three";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { MeshBasicMaterial, Mesh } from "three";

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
        camera.current = new THREE.OrthographicCamera(-30 * aspect, 30 * aspect, 30, -30, 0.1, 1000);

        renderer.current = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
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
        camera.current.position.set(0, 0, 40);
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
    
    const onMouseMove = (event) => {
        const containerBounds = document.getElementById("scene-container").getBoundingClientRect();
    
        mouse.x = ((event.clientX - containerBounds.left) / containerBounds.width) * 2 - 1;
        mouse.y = -((event.clientY - containerBounds.top) / containerBounds.height) * 2 + 1;
    
        raycaster.setFromCamera(mouse, camera.current);
    
        const intersects = raycaster.intersectObjects(cube.current.children, true);
    
        let selectedObject = null;
    
        if (intersects.length > 0) {
            selectedObject = intersects.find((obj) => obj.object.userData.isPoint);
    
            if (selectedObject) {
                const originalValues = selectedObject.object.userData.originalValues;
                const formattedOriginalValues = `Point: x=${originalValues.x.toFixed(2)}, y=${originalValues.y.toFixed(2)}, Hora=${originalValues.z}`;
    
                labelDiv.style.left = `${event.clientX + 10}px`;
                labelDiv.style.top = `${event.clientY - 20}px`;
    
                labelDiv.innerText = formattedOriginalValues;
                labelDiv.style.display = 'block';
            } else {
                labelDiv.style.display = 'none';
            }
        } else {
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

    const resetCameraPosition = () => {
        camera.current.position.set(0, 0, 40);
        camera.current.lookAt(new THREE.Vector3(0, 0, 0));
    };

    const zoomStep = 0.1; // Puedes ajustar el valor según tus necesidades

    const zoomIn = () => {
        camera.current.zoom -= zoomStep;
        camera.current.updateProjectionMatrix();
    };

    const zoomOut = () => {
        camera.current.zoom += zoomStep;
        camera.current.updateProjectionMatrix();
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
            //folder.__controllers[0].setValue(false);
        });

        folder.add({ ResetPosition: () => resetCameraPosition() }, "ResetPosition");

        folder.add({ CargarJSON: () => loadPointsFromJSON() }, "CargarJSON");

        folder.add({ ZoomIn: () => zoomIn() }, "ZoomIn"); // Botón para disminuir el zoom
        folder.add({ ZoomOut: () => zoomOut() }, "ZoomOut"); // Botón para aumentar el zoom
        folder.add({ ImprimirPDF: () => imprimirPDF() }, "ImprimirPDF");

        guiContainer.appendChild(gui.domElement);
        gui.domElement.style.position = "absolute";
        gui.domElement.style.top = "90px";
        gui.domElement.style.left = "0px";
    };

    const imprimirPDF = () => {
        const container = document.getElementById("scene-container");

        html2pdf(container, {
            margin: 10,
            filename: 'escenario.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        });
    };

    const crearCubo = () => {
        if (!cube.current) {
            cube.current = new THREE.Group();
            scene.current.add(cube.current);
            // Agregar AxesHelper al cubo
            const axesHelper = new AxesHelper(30);
            axesHelper.position.set(-15, -15, 0);
            cube.current.add(axesHelper);

            // Agregar flechas al final de los ejes
            const arrowX = new ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(15, -15, 0), 10, 0xff0000);
            const arrowY = new ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-15, 15, 0), 10, 0x00ff00);
            const arrowZ = new ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(-15, -15, 30), 10, 0x0000ff);

            // Ajusta la longitud de las flechas según tus preferencias
            cube.current.add(arrowX);
            cube.current.add(arrowY);
            cube.current.add(arrowZ);
            // Agregar textos en los extremos de AxesHelper
            const loader = new FontLoader();
            loader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json", function (font) {
                agregarTexto("X", font, 15, -15, 0);
                agregarTexto("Y", font, -15, 15, 0);
                agregarTexto("T", font, -15, -15, 30);
            });
        } else {
            // Limpiar todos los elementos del cubo existente, excepto el AxesHelper
            cube.current.children.slice().forEach((child) => {
                if (!(child instanceof AxesHelper)) {
                    cube.current.remove(child);
                }
            });
        }
        const geometry = new THREE.PlaneGeometry(30, 30);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.3,
        });
        const plane1 = new THREE.Mesh(geometry, material);
        const plane2 = new THREE.Mesh(geometry, material);
        // Asignar propiedad adicional a los planos
        plane1.isPlane = true;
        plane2.isPlane = true;

        plane2.position.z = 30;

        const boxGeo = new THREE.BoxGeometry(30, 30, 30);
        const edgeGeo = new THREE.EdgesGeometry(boxGeo);

        const line = new THREE.LineSegments(
            edgeGeo,
            new THREE.LineBasicMaterial({
                color: new THREE.Color("black"),
                linewidth: 5,
            })
        );
        line.position.z = 15;

        cube.current = new THREE.Group();
        cube.current.add(plane1);
        cube.current.add(plane2);
        cube.current.add(line);
        scene.current.add(cube.current);
    };

    // Función para agregar texto al cubo
    const agregarTexto = (text, font, x, y, z) => {
        const geometry = new TextGeometry(text, {
            font: font,
            size: 1, // Ajusta el tamaño del texto según tus preferencias
            height: 0.2, // Ajusta la altura del texto según tus preferencias
        });

        const material = new MeshBasicMaterial({ color: 0x000000 }); // Ajusta el color del texto según tus preferencias

        const textMesh = new Mesh(geometry, material);
        textMesh.position.set(x, y, z);
        cube.current.add(textMesh);
    };

    const agregarLineas = (data) => {
        if (!showLines) {
            return;
        }

        if ('points' in data) {
            // Para un solo camino con la propiedad "points"
            const pointsData = data.points;
            let anyPointOutsideCube = false; 

            if (!Array.isArray(pointsData) || pointsData.length < 2) {
                console.warn('Invalid path format: "points" array is missing or has insufficient points.');
                return;
            }

            const minZ = Math.min(...pointsData.map(point => new Date(`1970-01-01T${point.z}`).getTime()));
            const maxZ = Math.max(...pointsData.map(point => new Date(`1970-01-01T${point.z}`).getTime()));
            const zRange = maxZ - minZ;

            const curvePoints = pointsData.flatMap((point) => {
                if (
                    typeof point.x === 'number' &&
                    typeof point.y === 'number' &&
                    typeof point.z === 'string'
                ) {
                    const time = new Date(`1970-01-01T${point.z}`);
                    const normalizedZ = (time.getTime() - minZ) / zRange;
                    const scaledZ = normalizedZ * 30; // Assuming the height of the cube is 10 units
                    if (point.x <= 15 && point.y <= 15 && point.x >= -15 && point.y >= -15){
                        return new THREE.Vector3(point.x, point.y, scaledZ);
                    }else {
                        anyPointOutsideCube = true;
                        return [];
                    }
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

            if (!anyPointOutsideCube) {
                cube.current.add(thickLine);
            }
        } else if ('paths' in data) {
            // Para múltiples caminos con la propiedad "paths"
            if (!Array.isArray(data.paths) || data.paths.length === 0) {
                console.warn('Invalid JSON format: "paths" array is missing or empty.');
                return;
            }

            let minZ = Infinity;
            let maxZ = -Infinity;
            let allPathsInsideCube = true;

            data.paths.forEach((path) => {
                const pointsData = path.points;

                if (!Array.isArray(pointsData) || pointsData.length < 2) {
                    console.warn('Invalid path format: "points" array is missing or has insufficient points.');
                    return;
                }

                // Calcular la hora más baja y la hora más alta para todos los puntos
                const pathMinZ = Math.min(...pointsData.map(point => new Date(`1970-01-01T${point.z}`).getTime()));
                const pathMaxZ = Math.max(...pointsData.map(point => new Date(`1970-01-01T${point.z}`).getTime()));

                minZ = Math.min(minZ, pathMinZ);
                maxZ = Math.max(maxZ, pathMaxZ);

                let allPointsInsidePath = true;

                const curvePoints = pointsData.flatMap((point) => {
                    if (
                        typeof point.x === 'number' &&
                        typeof point.y === 'number' &&
                        typeof point.z === 'string'
                    ) {
                        const time = new Date(`1970-01-01T${point.z}`);
                        const normalizedZ = (time.getTime() - minZ) / (maxZ - minZ);

                        const scaledZ = normalizedZ * 30; // Assuming the height of the cube is 10 units

                        if (point.x <= 15 && point.y <= 15 && point.x >= -15 && point.y >= -15){
                            return new THREE.Vector3(point.x, point.y, scaledZ);
                        }else {
                            allPointsInsidePath = false;
                            return [];
                        }
                    } else {
                        console.warn('Invalid point coordinates:', point);
                        return [];
                    }
                });

                if (curvePoints.length < 2) {
                    console.warn('Not enough valid points to create lines.');
                    return;
                }

                if (curvePoints.length >= 3 && allPointsInsidePath) {
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
                } else {
                    allPathsInsideCube = false;
                }
            });

            if (!allPathsInsideCube) {
                // Limpia las líneas existentes antes de agregar nuevas
                cube.current.children.slice().forEach((child) => {
                    if (child instanceof Line2) {
                        cube.current.remove(child);
                    }
                });
            }
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

                        // Eliminar solo los elementos de puntos y líneas
                        cube.current.children.slice().forEach((child) => {
                            if (child instanceof THREE.Group) {
                                cube.current.remove(child);
                            } else if (child instanceof Line2) {
                                cube.current.remove(child);
                            }
                        });

                        if ("imageURL" in data) {
                            cargarImagenDesdeURL(data.imageURL);
                        }

                        addPointsFromJSON(data);
                        agregarLineas(data);
                    } catch (error) {
                        console.error("Error parsing JSON file:", error);
                        // Muestra una notificación en el navegador
                        alert("Error al parsear el archivo JSON. Asegúrate de que el formato sea correcto.");
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

        if ('points' in data) {
            // Para un solo camino con la propiedad "points"
            const pointsData = data.points;

            if (!Array.isArray(pointsData) || pointsData.length === 0) {
                console.warn('Invalid JSON format: "points" array is missing or empty.');
                return;
            }

            const spheres = new THREE.Group();

            let anyPointOutsideCube = false;

            // Obtener la hora más baja y la hora más alta
            const minZ = Math.min(...pointsData.map(point => new Date(`1970-01-01T${point.z}`).getTime()));
            const maxZ = Math.max(...pointsData.map(point => new Date(`1970-01-01T${point.z}`).getTime()));
            const zRange = maxZ - minZ;

            pointsData.forEach((point) => {
                if (
                    typeof point.x === 'number' &&
                    typeof point.y === 'number' &&
                    typeof point.z === 'string'
                ) {
                    const time = new Date(`1970-01-01T${point.z}`);
                    if (isNaN(time.getTime())) {
                        alert("¡Advertencia! El formato de hora en al menos uno de los puntos no es válido.");
                        return;
                    }
                    const normalizedZ = (time.getTime() - minZ) / zRange;

                    const scaledZ = normalizedZ * 30; // Assuming the height of the cube is 10 units

                    // Verificar si el punto está fuera del cubo antes de agregarlo
                    if (point.x <= 15 && point.y <= 15 && point.x >= -15 && point.y >= -15) {
                        const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
                        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x800080 });
                        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

                        // Almacenar los valores originales en userData
                        sphere.userData.originalValues = { x: point.x, y: point.y, z: point.z };

                        sphere.position.set(point.x, point.y, scaledZ);
                        sphere.userData.isPoint = true;
                        spheres.add(sphere);
                    } else {
                        anyPointOutsideCube = true;
                        alert("¡Advertencia! Al menos uno de los puntos está fuera del cubo.");
                    }
                } else {
                    alert(`Invalid point coordinates: x=${point.x}, y=${point.y}, z=${point.z}`);
                }
            });

            if (!anyPointOutsideCube) {
                cube.current.add(spheres);
            }
        } else if ('paths' in data) {
            let minZ = Infinity;
            let maxZ = -Infinity;
            let allPathsInsideCube = true;
            // Para múltiples caminos con la propiedad "paths"
            if (!Array.isArray(data.paths) || data.paths.length === 0) {
                console.warn('Invalid JSON format: "paths" array is missing or empty.');
                return;
            }

            const pathsGroup = new THREE.Group();

            data.paths.forEach((path) => {
                const pointsData = path.points;

                if (!Array.isArray(pointsData) || pointsData.length === 0) {
                    console.warn('Invalid path format: "points" array is missing or empty.');
                    return;
                }

                let allPointsInsidePath = true;

                // Calcular la hora más baja y la hora más alta para todos los puntos
                const pathMinZ = Math.min(...pointsData.map(point => new Date(`1970-01-01T${point.z}`).getTime()));
                const pathMaxZ = Math.max(...pointsData.map(point => new Date(`1970-01-01T${point.z}`).getTime()));

                minZ = Math.min(minZ, pathMinZ);
                maxZ = Math.max(maxZ, pathMaxZ);

                const spheres = new THREE.Group();

                pointsData.forEach((point) => {
                    if (
                        typeof point.x === 'number' &&
                        typeof point.y === 'number' &&
                        typeof point.z === 'string'
                    ) {
                        const time = new Date(`1970-01-01T${point.z}`);
                        if (isNaN(time.getTime())) {
                            alert("¡Advertencia! El formato de hora en al menos uno de los puntos no es válido.");
                            return;
                        }
                        const normalizedZ = (time.getTime() - minZ) / (maxZ - minZ);

                        const scaledZ = normalizedZ * 30; // Assuming the height of the cube is 10 units

                        if (point.x <= 15 && point.y <= 15 && point.x >= -15 && point.y >= -15){
                            const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
                            const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x800080 });
                            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    
                            // Almacenar los valores originales en userData
                            sphere.userData.originalValues = { x: point.x, y: point.y, z: point.z };
    
                            sphere.position.set(point.x, point.y, scaledZ);
                            sphere.userData.isPoint = true;
                            spheres.add(sphere);
                        }else {
                            allPointsInsidePath = false;
                        }
                    } else {
                        alert(`Invalid point coordinates: x=${point.x}, y=${point.y}, z=${point.z}`);
                        allPointsInsidePath = false;
                    }
                });

                if (allPointsInsidePath) {
                    pathsGroup.add(spheres);
                } else {
                    allPathsInsideCube = false;
                }
            });
            if (allPathsInsideCube) {
                cube.current.add(pathsGroup);
            } else {
                alert("¡Advertencia! Al menos uno de los caminos contiene puntos fuera del cubo.");
            }
        } else {
            console.warn('Invalid JSON format: "points" or "paths" property is missing.');
            alert("Error al parsear el archivo JSON. Asegúrate de que el formato sea correcto.");
        }
    };

    const actualizarVisibilidad = () => {
        cube.current.children.forEach((child) => {
            if (child instanceof THREE.Group && child.children.length > 0) {
                child.children.forEach((point) => {
                    // Verificar si es un punto en un camino y ajustar la visibilidad en consecuencia
                    if (point.userData.isPoint && point.parent instanceof THREE.Group) {
                        point.visible = showPoints;
                    } else {
                        point.visible = showPoints;
                    }
                });
            } else if (child instanceof Line2 && !esLineaBorde(child)) {
                child.visible = showLines;
            } else if (child instanceof THREE.Mesh && child.userData.isLabel) {
                child.visible = showLabels;
            }
        });
    };

    const onWindowResize = () => {
        const aspect = window.innerWidth / window.innerHeight;
        camera.current.left = -30 * aspect;
        camera.current.right = 30 * aspect;
        camera.current.top = 30;
        camera.current.bottom = -30;
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