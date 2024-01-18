import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const Cubo = () => {
    const scene = useRef(null);
    const camera = useRef(null);
    const renderer = useRef(null);
    const cube = useRef(null);
    const controls = useRef(null);

    let showPoints = true;
    let showLines = true;
    let showLabels = true;

    const [jsonData, setJsonData] = useState(null);
    const init = () => {
        // Configuración básica
        scene.current = new THREE.Scene();

        const aspect = window.innerWidth / window.innerHeight;
        camera.current = new THREE.OrthographicCamera(-30 * aspect, 30 * aspect, 30, -30, 0.1, 1000);

        renderer.current = new THREE.WebGLRenderer();
        renderer.current.setSize(window.innerWidth, window.innerHeight);
        renderer.current.setClearColor(new THREE.Color().setRGB(0.5, 0.5, 0.7));


        // Crear contenedor para la escena y los controles
        const container = document.getElementById("scene-container");
        container.appendChild(renderer.current.domElement);

        // Configuración de la cámara
        camera.current.position.set(0, 0, 40); // el ultimo para poder ver todo bien 
        crearCubo();
        //ESTO NO X Q DA ERROR loadPointsFromJSON();
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

        initGUI(container);

        //initFullscreenButton();
    };

    // const initFullscreenButton = () => {
    //     const fullscreenButton = document.createElement("button");
    //     fullscreenButton.innerHTML = "Fullscreen";
    //     fullscreenButton.style.position = "absolute";
    //     fullscreenButton.style.top = "10px";
    //     fullscreenButton.style.right = "10px";
    //     fullscreenButton.addEventListener("click", toggleFullscreen);
    //     document.body.appendChild(fullscreenButton);
    // };

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

        folder.add({ MostrarEtiquetas: true }, "MostrarEtiquetas").onChange((value) => {
            showLabels = value;
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
        // Verificar si hay datos cargados desde el archivo JSON
        if (jsonData && jsonData.points) {
            // Obtener el array de puntos desde la data cargada
            const points = jsonData.points;

            // Encontrar los valores máximos de x, y, y z utilizando reduce
            const maxX = points.reduce((max, point) => Math.max(max, point.x), -Infinity);
            const maxY = points.reduce((max, point) => Math.max(max, point.y), -Infinity);
            const maxZ = points.reduce((max, point) => {
                // Obtener solo los dos primeros números de la propiedad z
                const zNumbers = point.z.split(":").slice(0, 2).map(Number);
                const zValue = zNumbers[0] * 60 + zNumbers[1]; // Convertir a minutos
                return Math.max(max, zValue);
            }, -Infinity);

            // Imprimir en consola los valores máximos
            console.log("Valor máximo de x:", maxX);
            console.log("Valor máximo de y:", maxY);
            console.log("Valor máximo de z:", maxZ);
        } else {
            // Manejar el caso cuando no hay datos cargados
            console.warn("No hay datos cargados desde el archivo JSON.");
        }

        const geometry = new THREE.PlaneGeometry(30, 30); // TAMA;O EN LARGO PARA LO  VERDE Y EL MAPA
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.3,
        });
        const plane1 = new THREE.Mesh(geometry, material);
        const plane2 = new THREE.Mesh(geometry, material);
        plane2.position.z = 30; //ubicacion de la cosa verde arriba

        const boxGeo = new THREE.BoxGeometry(30, 30, 30); //sumar 15 a los valores originales EL CUBO EN GENERAL
        const edgeGeo = new THREE.EdgesGeometry(boxGeo);

        const line = new THREE.LineSegments(
            edgeGeo,
            new THREE.LineBasicMaterial({
                color: new THREE.Color("black"),
                linewidth: 5,
            })
        );
        line.position.z = 15; //ubicacion del mapa

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
                        // Eliminar solo los elementos que no son parte del cubo base
                        cube.current.children.slice(3).forEach((child) => {
                            cube.current.remove(child);
                        });
                        const data = JSON.parse(e.target.result);

                        if ("imageURL" in data) {
                            cargarImagenDesdeURL(data.imageURL);
                        }

                        addPointsFromJSON(data);
                        agregarLineas(data);

                        // Guardar los datos en el estado
                        setJsonData(data);
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
                label.userData.isLabel = true; // Marcar la etiqueta como tal
                label.position.set(point.x, point.y, time.getHours() + time.getMinutes() / 60 + time.getSeconds() / 3600 + 0.1);
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
                    label.userData.isLabel = true; // Marcar la etiqueta como tal
                    label.position.set(point.x, point.y, time.getHours() + time.getMinutes() / 60 + time.getSeconds() / 3600 + 0.1);
                    cube.current.add(label);
                });
            });
        } else {
            console.warn('Invalid JSON format: "points" or "paths" property is missing.');
        }
    };

    // Función para crear etiquetas de texto
    // Función para crear etiquetas de texto con fondo transparente y letras de color negro
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

    const actualizarVisibilidad = () => {
        cube.current.children.forEach((child) => {
            if (child instanceof THREE.Points) {
                child.visible = showPoints;
            } else if (child instanceof THREE.Line && !esLineaBorde(child)) {
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

    // Ejemplo:
    useEffect(() => {
        // Llamar a crearCubo después de cargar los datos
        crearCubo();
        if (jsonData) {
            console.log("Datos cargados desde el archivo JSON:", jsonData);
            // Puedes realizar operaciones adicionales con los datos cargados
        }
    }, [jsonData]);

    return (
        <div id="scene-container">
            {/* Contenedor para la escena y los controles */}
        </div>
    );
}

export default Cubo;