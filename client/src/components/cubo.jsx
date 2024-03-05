import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { AxesHelper, ArrowHelper } from "three";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { MeshBasicMaterial, Mesh } from "three";
import { BsArrowsFullscreen, BsFiletypeJson, BsFillDashSquareFill, BsPlusSquareFill } from "react-icons/bs";
import { BiLineChart, BiSolidFilePdf, BiSolidCheckbox, BiSolidTimeFive } from "react-icons/bi";
import { FcScatterPlot } from "react-icons/fc";
import { AiOutlineMenu, AiOutlineFundView, AiOutlineFile, AiOutlineExpand } from "react-icons/ai";
import { WiTime1, WiTime9 } from "react-icons/wi";
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { CgArrowLeftO } from "react-icons/cg";
import swal from 'sweetalert';

const Cubo = () => {
    const scene = useRef(null);
    const camera = useRef(null);
    const renderer = useRef(null);
    const cube = useRef(null);
    const controls = useRef(null);
    const [showPoints, setShowPoints] = useState(true);
    const [showLines, setShowLines] = useState(true);
    const [fullscreen, setFullscreen] = useState(false);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let labelDiv = null;
    const menuContainer = useRef(null);
    const mainContainer = useRef(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState(""); 
    const navigate = useNavigate();

    const handleNavigateHome = () => {
        navigate('/');
      };

    //método para actualizar la hora
    const actualizarFiltroHora = (newStartHour, newEndHour) => {
    // Limpia las líneas existentes antes de agregar nuevas
    cube.current.children.slice().forEach((child) => {
        if (child instanceof Line2) {
            cube.current.remove(child);
        }
    });
        // Obtener los valores de las horas seleccionadas
        const startHour = newStartHour ? new Date(`1970-01-01T${startTime}`).getTime() : -Infinity;
        const endHour = newEndHour ? new Date(`1970-01-01T${endTime}`).getTime() : Infinity;
        // Función para actualizar la visibilidad de los puntos
        const updatePointVisibility = (point) => {
            const pointTime = new Date(`1970-01-01T${point.userData.originalValues.z}`).getTime();
            point.visible = pointTime >= startHour && pointTime <= endHour;
        };

        let minZ = Infinity;
        let maxZ = -Infinity;

    cube.current.children.forEach((child) => {
        if (child instanceof THREE.Group && child.children.length > 0) {
            child.children.forEach((path) => {
                if (path.userData.isPoint && path.parent instanceof THREE.Group) {
                    const pointTime = new Date(`1970-01-01T${path.userData.originalValues.z}`).getTime();
                    minZ = Math.min(minZ, pointTime);
                    maxZ = Math.max(maxZ, pointTime);
                } else if (path instanceof THREE.Group && path.children.length > 0) {
                    path.children.forEach((point) => {
                        if (point.userData.isPoint && point.parent instanceof THREE.Group) {
                            const pointTime = new Date(`1970-01-01T${point.userData.originalValues.z}`).getTime();
                            minZ = Math.min(minZ, pointTime);
                            maxZ = Math.max(maxZ, pointTime);
                        }
                    });
                }
            });
        } else if (child instanceof Line2 && !esLineaBorde(child)) {
            const pointsArray = child.geometry.attributes.position.array;
            for (let i = 2; i < pointsArray.length; i += 3) {
                const pointTime = new Date(`1970-01-01T${pointsArray[i]}:00`).getTime();
                minZ = Math.min(minZ, pointTime);
                maxZ = Math.max(maxZ, pointTime);
            }
        }
    });
const addLinesForVisiblePaths = (pathsData) => {
    // Obtener el mínimo y máximo global antes de recorrer los caminos
    pathsData.forEach((path) => {
        // Filtra y obtiene el array de los puntos visibles
        const visiblePoints = path.points.filter((point) => {
            const pointTime = new Date(`1970-01-01T${point.z}`).getTime();
            return pointTime >= startHour && pointTime <= endHour;
        });

        // Cuando haya 2 o más puntos se crea la línea
        if (visiblePoints.length >= 2) {
            const zRange = maxZ - minZ;
            const curvePoints = visiblePoints.flatMap((point) => {
                const time = new Date(`1970-01-01T${point.z}`).getTime();
                const normalizedZ = (time - minZ) / zRange;
                const scaledZ = normalizedZ * 30;
                return new THREE.Vector3(point.x, point.y, scaledZ);
            });

            // Crea la curva
            const curve = new THREE.CatmullRomCurve3(curvePoints);  
            // Valor de la curva
            const points = curve.getPoints(180);
            // Vectores de las posiciones
            const positions = points.flatMap(v => [v.x, v.y, v.z]);

            // Crea los colores
            const colors = [];
            const divisions = Math.round(100 * curvePoints.length);
  
            const lineColor = generateRandomColor();
            for (let i = 0, l = divisions; i < l; i++) {
              colors.push(lineColor.r, lineColor.g, lineColor.b);
            }

            // Une las posiciones y colores de la línea
            const geometry = new LineGeometry().setPositions(positions);
            geometry.setColors(colors);

            // Crea el material de la línea
            const material = new LineMaterial({
                color: 0xffffff,
                linewidth: 5,
                resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
                dashed: false,
                transparent: true,
                vertexColors: true,
            });

            // Crea la línea
            const thickLine = new Line2(geometry, material);
            thickLine.computeLineDistances();
            // Agrega la línea
            cube.current.add(thickLine);
        }
    });
};

const existingLines = [];
    
        // Actualizar la visibilidad de los puntos dentro de varios caminos (paths)
        cube.current.children.forEach((child) => {
            if (child instanceof THREE.Group && child.children.length > 0) {
                child.children.forEach((path) => {
                     if (path instanceof THREE.Group && path.children.length > 0) {
                        path.children.forEach((point) => {
                            if (point.userData.isPoint && point.parent instanceof THREE.Group) {
                                //agrega los puntos visibles
                                updatePointVisibility(point);
                            }
                        });
                        //agrega las lineas correspondientes a los puntos visibles
                        const pathPoints = path.children.map((p) => p.userData.originalValues);
                        addLinesForVisiblePaths([{ points: pathPoints }]);
                    }
                });
            }else if (child instanceof Line2 && !esLineaBorde(child)) {
                // Guarda la referencia de las líneas existentes
                existingLines.push(child);
            }
        });
    };
    
     const handleStartTimeChange = (event) => {
        setStartTime(event.target.value);
        
        // Actualizar opciones de la hora final solo si hay una hora de inicio seleccionada
        if (endTime !== "" && event.target.value !== "" && event.target.value >= endTime) {
            const filteredOptions = generateTimeOptions1().filter(option => option.key > event.target.value);
            setEndTime(filteredOptions.length > 0 ? filteredOptions[0].key : "");
        }
        actualizarFiltroHora(event.target.value, endTime);
    };

    // Método para manejar cambios en la hora de fin
    const handleEndTimeChange = (event) => {
        setEndTime(event.target.value);
        actualizarFiltroHora(event.target.value, startTime);
    };

    const handleMenuToggle = () => {
        setShowSidebar(!showSidebar);
    };

    const init = () => {
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
        camera.current.position.set(0, 0, 60);
        camera.current.up.set(0, 0, 1);
        crearCubo();
        const grid = new THREE.GridHelper(20, 10, 0x202020, 0x202020);
        grid.position.set(0, 0, 0);
        grid.rotation.x = Math.PI / 4;
        grid.rotation.y = Math.PI / 4;

        // Configuración de los controles de órbita
        controls.current = new OrbitControls(camera.current, renderer.current.domElement);
        container.appendChild(controls.current.domElement); // Adjuntar controles al nuevo contenedor
        // Invertir dirección de teclas
        controls.current.keyPanSpeed = -controls.current.keyPanSpeed;
        controls.current.listenToKeyEvents( window );
        // Llamar a la animación
        animate();

        // Manejar eventos de redimensionamiento
        window.addEventListener("resize", onWindowResize, false);

        // Configuración del evento de mover el mouse
        document.addEventListener('mousemove', onMouseMove, false);
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
        const container = mainContainer.current;
        const menuContainerElem = menuContainer.current;

        if (!fullscreen) {
            // Intenta activar el modo de pantalla completa
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.mozRequestFullScreen) {
                container.mozRequestFullScreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }

            // Intenta activar el modo de pantalla completa para el contenedor del menú
            if (menuContainerElem.requestFullscreen) {
                menuContainerElem.requestFullscreen();
            } else if (menuContainerElem.mozRequestFullScreen) {
                menuContainerElem.mozRequestFullScreen();
            } else if (menuContainerElem.webkitRequestFullscreen) {
                menuContainerElem.webkitRequestFullscreen();
            } else if (menuContainerElem.msRequestFullscreen) {
                menuContainerElem.msRequestFullscreen();
            }
        } else {
            // Intenta salir del modo de pantalla completa
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }

        // Actualiza el estado fullscreen
        setFullscreen(!fullscreen);
    };
    const resetCameraPosition = () => {
        camera.current.position.set(0, 0, 60);
        camera.current.lookAt(new THREE.Vector3(0, 0, 0));
        camera.current.rotation.set(0, 0, 0);

        // Ajustar el campo de visión para una vista ortográfica
        const aspect = window.innerWidth / window.innerHeight;
        camera.current.left = -30 * aspect;
        camera.current.right = 30 * aspect;
        camera.current.top = 30;
        camera.current.bottom = -30;

        // Actualizar la matriz de proyección de la cámara
        camera.current.updateProjectionMatrix();
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

    const toggleMostrar = (tipo) => {
        if (tipo === 'MostrarPuntos') {
            setShowPoints(!showPoints);
        } else if (tipo === 'MostrarLineas') {
            setShowLines(!showLines);
        }
        actualizarVisibilidad();
    };

    const imprimirPDF = () => {
        const sceneContainer = document.getElementById("scene-container");

        // Crear un nuevo objeto jsPDF
        const pdf = new jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'landscape',
        });

        // Agregar tu imagen como símbolo en la parte superior izquierda
        const imgPath = 'https://i.postimg.cc/63w0wyQC/TRACKVIEW.png'; // Reemplaza esto con la ruta de tu imagen
        pdf.addImage(imgPath, 'PNG', 10, 10, 30, 30);

        // Definir el estilo del título
        const estiloTitulo = {
            fontSize: 20,  // Tamaño de fuente más grande
            fontWeight: 'bold',  // Texto en negrita
            align: 'center',  // Alineación centrada
            color: 'darkblue',
        };

        // Agregar el título al PDF con el nuevo estilo
        pdf.text('Gráfica de Datos Espacio-Temporales', pdf.internal.pageSize.getWidth() / 2, 10, estiloTitulo);

        // Agregar la descripción al PDF con el nombre del archivo
        const descripcion = `A continuación, se presenta la gráfica generada por la aplicación web TRACKVIEW la cual se encarga de presentar dentro de un cubo los datos espacio-temporales.`;

        // Ajustar el estilo de la descripción
        pdf.setFontSize(13);  // Tamaño de fuente para la descripción
        const imgRight = 10 + 30 + 10; // La posición derecha de la imagen + un margen
        const availableWidth = pdf.internal.pageSize.getWidth() - imgRight - 10;
        const lines = pdf.splitTextToSize(descripcion, availableWidth);
        pdf.text(lines, imgRight, 20); 

        // Renderizar el contenido HTML del contenedor en una imagen usando html2canvas
        html2canvas(sceneContainer).then((canvas) => {
            const imgData = canvas.toDataURL('image/jpeg');
            const imgWidth = pdf.internal.pageSize.getWidth() - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Agregar la imagen al PDF
            pdf.addImage(imgData, 'JPEG', 10, 45, imgWidth, imgHeight);

            // Guardar el PDF con el mismo nombre y formato que especificaste
            pdf.save('TRACKVIEW.pdf');
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
                agregarTexto("X", font, 15, -15, 0, 'color1');
                agregarTexto("Y", font, -15, 15, 0, 'color2');
                agregarTexto("T", font, -15, -15, 30, 'color3');
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
            opacity: 0,
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

    const agregarTexto = (text, font, x, y, z, olor) => {
        // Crear geometría de texto
        const geometry = new TextGeometry(text, {
            font: font,
            size: 1.7, // Ajusta el tamaño del texto según tus preferencias
            height: 0.2, // Ajusta la altura del texto según tus preferencias
        });
    
        // Crear material con color según el olor
        let material;
        switch (olor) {
            case 'color1':
                material = new MeshBasicMaterial({ color: 0xFF0000 }); // Rojo
                break;
            case 'color2':
                material = new MeshBasicMaterial({ color: 0x00FF00 }); // Verde
                break;
            case 'color3':
                material = new MeshBasicMaterial({ color: 0x0000FF }); // Verde
                break;
            // Agrega más casos según tus necesidades
            default:
                material = new MeshBasicMaterial({ color: 0x000000 }); // Negro por defecto
                break;
        }
    
        // Crear malla de texto con el material
        const textMesh = new Mesh(geometry, material);
        textMesh.position.set(x, y, z);
    
        // Agregar la malla de texto al objeto cube
        cube.current.add(textMesh);
    };

    const agregarLineas = (data) => {

        if ('paths' in data) {
            let allPathsInsideCube = true;
            let minZ = Infinity;
            let maxZ = -Infinity;
        
            // Calcular la hora más baja y la hora más alta para todos los puntos
            data.paths.forEach((path) => {
                const pointsData = path.points;
                pointsData.forEach((point) => {
                    if (typeof point.x === 'number' && typeof point.y === 'number' && typeof point.z === 'string') {
                        const time = new Date(`1970-01-01T${point.z}`);
                        if (!isNaN(time.getTime())) {
                            minZ = Math.min(minZ, time.getTime());
                            maxZ = Math.max(maxZ, time.getTime());
                        } else {
                            allPathsInsideCube = false;
                        }
                    } else {
                        allPathsInsideCube = false;
                    }
                });
            });
        
            if (allPathsInsideCube) {
                const zRange = maxZ - minZ;
        
                
                    // Aplicar lógica para múltiples líneas con colores aleatorios
                    data.paths.forEach((path) => {
                      const pointsData = path.points;
                      let allPointsInsidePath = true;
                      const curvePoints = pointsData.flatMap((point) => {
                        if (typeof point.x === 'number' && typeof point.y === 'number' && typeof point.z === 'string') {
                          const time = new Date(`1970-01-01T${point.z}`);
                          const normalizedZ = (time.getTime() - minZ) / zRange;
                          const scaledZ = normalizedZ * 30; // Assuming the height of the cube is 10 units
              
                          if (point.x <= 15 && point.y <= 15 && point.x >= -15 && point.y >= -15) {
                            return new THREE.Vector3(point.x, point.y, scaledZ);
                          } else {
                            allPointsInsidePath = false;
                            return [];
                          }
                        } else {
                          //alert(`Invalid point coordinates: x=${point.x}, y=${point.y}, z=${point.z}`);
                          return [];
                        }
                      });
              
                      if (curvePoints.length >= 2 && allPointsInsidePath) {
                        const curve = new THREE.CatmullRomCurve3(curvePoints);
                        const points = curve.getPoints(180);
                        const positions = points.flatMap(v => [v.x, v.y, v.z]);
              
                        const colors = [];
                        const divisions = Math.round(100 * curvePoints.length);
              
                        const lineColor = generateRandomColor();
                        for (let i = 0, l = divisions; i < l; i++) {
                          colors.push(lineColor.r, lineColor.g, lineColor.b);
                        }
              
                        const geometry = new LineGeometry().setPositions(positions);
                        geometry.setColors(colors);
              
                        const material = new LineMaterial({
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
                console.log("¡Advertencia! Al menos uno de los caminos contiene información incorrecta.");
            }
        }
    };

    // Función para generar un color aleatorio
    function generateRandomColor() {
        const darkFactor = 0.5; // Puedes ajustar este valor según tus preferencias
        return new THREE.Color(
            Math.random() * darkFactor,
            Math.random() * darkFactor,
            Math.random() * darkFactor
        );
    }

    const esLineaBorde = (linea) => {
        const colorLinea = linea.material.color;
        return colorLinea.equals(new THREE.Color("black"));
    };

    const cargarImagenDesdeURL = (url) => {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(url, (texture) => {
            // Material para el plano 1
            const material1 = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 1,
            });
    
            // Actualizar el material de ambos planos (plane1 y plane2)
            cube.current.children.forEach((child) => {
                if (child instanceof THREE.Mesh && child.isPlane) {
                    if (child === cube.current.children[0]) {
                        child.material = material1;
                    }
                }
            });
        });
    };
    
    const eliminarImagen = () => {
        cube.current.children.forEach((child) => {
            if (child instanceof THREE.Mesh && child.isPlane) {
                // Eliminar textura del plano (tanto plano 1 como plano 2)
                if (child.material.map) {
                    child.material.map.dispose();
                }
                // Dispose de otros recursos asociados al material del plano
                child.material.dispose();
                // Configurar un nuevo material con opacidad 0
                child.material = new THREE.MeshBasicMaterial({
                    transparent: true,
                    opacity: 0,
                });
            }
        });
    };
    
    //función para cargar json
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
        if ('paths' in data) {
            let allPathsInsideCube = true;
            let minZ = Infinity;
            let maxZ = -Infinity;
        
            // Calcular la hora más baja y la hora más alta para todos los puntos
            data.paths.forEach((path) => {
                const pointsData = path.points;
                pointsData.forEach((point) => {
                    if (typeof point.x === 'number' && typeof point.y === 'number' && typeof point.z === 'string') {
                        const time = new Date(`1970-01-01T${point.z}`);
                        if (!isNaN(time.getTime())) {
                            minZ = Math.min(minZ, time.getTime());
                            maxZ = Math.max(maxZ, time.getTime());
                        } else {
                            swal({
                                title: "¡Error!",
                                text: "El formato de hora en al menos uno de los puntos no es válido",
                                icon: "error",
                            });
                            allPathsInsideCube = false;
                            eliminarImagen();
                            console.log(`El formato de hora en al menos uno de los puntos no es válido: ${point.z}`);
                        }
                    } else {
                        swal({
                            title: "¡Error!",
                            text: "Coordenadas inválidas o mayores al rango del cubo",
                            icon: "error",
                        });
                        allPathsInsideCube = false;
                        eliminarImagen();
                        console.log(`Coordenadas con puntos inválidos: x=${point.x}, y=${point.y}, z=${point.z}`);
                    }
                });
            });
        
            if (allPathsInsideCube) {
                const zRange = maxZ - minZ;
        
                const pathsGroup = new THREE.Group();
                data.paths.forEach((path) => {
                    const pointsData = path.points;
                    const spheres = new THREE.Group();
                    let allPointsInsidePath = true;
                    pointsData.forEach((point) => {
                        if (typeof point.x === 'number' && typeof point.y === 'number' && typeof point.z === 'string') {
                            const time = new Date(`1970-01-01T${point.z}`);
                            const normalizedZ = (time.getTime() - minZ) / zRange;
                            const scaledZ = normalizedZ * 30; // Assuming the height of the cube is 10 units
        
                            if (point.x <= 15 && point.y <= 15 && point.x >= -15 && point.y >= -15) {
                                const sphereGeometry = new THREE.SphereGeometry(0.35, 16, 16);
                                const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x800080 });
                                const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                                // Almacenar los valores originales en userData
                                sphere.userData.originalValues = { x: point.x, y: point.y, z: point.z };
                                sphere.position.set(point.x, point.y, scaledZ);
                                sphere.userData.isPoint = true;
                                spheres.add(sphere);
                            }else {
                                swal({
                                    title: "¡Error!",
                                    text: "Coordenadas inválidas o mayores al rango del cubo",
                                    icon: "error",
                                });
                                allPointsInsidePath = false;
                                eliminarImagen();
                                console.log(`Coordenadas con puntos inválidos: x=${point.x}, y=${point.y}, z=${point.z}`);
                            }
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
                    if ("imageURL" in data) {
                        cargarImagenDesdeURL(data.imageURL);
                    }
                } else {
                    swal({
                        title: "¡Error!",
                        text: "Al menos una de las trayectorias contiene coordenadas fuera del cubo.",
                        icon: "error",
                    });
                    eliminarImagen();
                }
            } else {
                console.log("¡Advertencia! Al menos uno de los caminos contiene información incorrecta.");
            }
        } else {
            swal({
                title: "¡Error!",
                text: "Error al parsear el archivo JSON. Asegúrate de que el formato sea correcto.",
                icon: "error",
            });
            eliminarImagen();
        }
    };

    const actualizarVisibilidad = () => {
        cube.current.children.forEach((child) => {
            if (child instanceof THREE.Group && child.children.length > 0) {
                child.children.forEach((point) => {
                    if (point.userData.isPoint && point.parent instanceof THREE.Group) {
                        const startHour = startTime ? new Date(`1970-01-01T${startTime}`).getTime() : -Infinity;
                        const endHour = endTime ? new Date(`1970-01-01T${endTime}`).getTime() : Infinity;
                        const pointTime = new Date(`1970-01-01T${point.userData.originalValues.z}`).getTime();
                        point.visible = showPoints && pointTime >= startHour && pointTime <= endHour;
                    }else{
                        point.visible=showPoints;
                    }
                });
            } else if (child instanceof Line2 && !esLineaBorde(child)) {
                child.visible = showLines;
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

    // Método para generar opciones de horas y minutos
    const generateTimeOptions = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
            // Formatear la hora como cadena en formato hh
            const formattedHour = hour.toString().padStart(2, '0');
            const hourOption = `${formattedHour}:00`;
            options.push(
                <option key={hourOption} value={hourOption}>
                    {hourOption}
                </option>
            );
        }
        return options;
    };

    // Método para generar opciones de horas y minutos
    const generateTimeOptions1 = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
            // Formatear la hora como cadena en formato hh
            const formattedHour = hour.toString().padStart(2, '0');
            const hourOption = `${formattedHour}:00`;
            // Deshabilitar opciones mayores a la hora de inicio solo en la hora final
            const isDisabled = (startTime !== "" && endTime === "" && hourOption <= startTime) || (endTime !== "" && hourOption <= startTime);

            options.push(
                <option key={hourOption} value={hourOption} disabled={isDisabled}>
                    {hourOption}
                </option>
            );
        }
        return options;
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

    useEffect(() => {
        actualizarFiltroHora(startTime, endTime);
    }, [startTime, endTime]);

    return (

        <div style={{ display: 'flex' }} ref={mainContainer}>
            <Sidebar collapsed={!showSidebar} style={{ height: "100vh", position: 'absolute' }} backgroundColor="rgba(7,21,56,255)" ref={menuContainer}>
            
                <Menu iconShape="square">

                    <MenuItem icon={<AiOutlineMenu style={{ fontSize: '35px', color: hoveredItem === 0 ? 'rgba(7,21,56,255)' : 'white' }}/>}onClick={() => { handleMenuToggle();}} style={{ textAlign: "center", color: hoveredItem === 0 ? 'rgba(7,21,56,255)' : 'white' }} onMouseEnter={() => setHoveredItem(0)}
                    onMouseLeave={() => setHoveredItem(null)}>{" "}<h2 style={{ color: hoveredItem === 0 ? 'rgba(7,21,56,255)' : 'white', margin: '10px' }}>Menú</h2></MenuItem>

                    <SubMenu label="Cargar Información" icon={<AiOutlineFile style={{ fontSize: '32px', color: hoveredItem === 11 ? 'rgba(7,21,56,255)' : 'white' }} />} style={{ color: hoveredItem === 11 ? 'rgba(7,21,56,255)' : 'white' }} onMouseEnter={() => setHoveredItem(11)} onMouseLeave={() => setHoveredItem(null)}>
                        <MenuItem style={{ background: hoveredItem === 5 ? 'white' : 'rgba(7,21,56,255)', color: hoveredItem === 5 ? 'rgba(7,21,56,255)' : 'white' }} icon={<BsFiletypeJson style={{ fontSize: '27px', color: hoveredItem === 5 ? 'rgba(7,21,56,255)' : 'yellow' }} />} onClick={loadPointsFromJSON} onMouseEnter={() => setHoveredItem(5)} onMouseLeave={() => setHoveredItem(null)}>
                            <b>Cargar JSON</b>
                        </MenuItem>

                        <MenuItem style={{ background: hoveredItem === 8 ? 'white' : 'rgba(7,21,56,255)', color: hoveredItem === 8 ? 'rgba(7,21,56,255)' : 'white' }} icon={<BiSolidFilePdf style={{ fontSize: '32px', color: 'red' }} />} onClick={imprimirPDF} onMouseEnter={() => setHoveredItem(8)}
                        onMouseLeave={() => setHoveredItem(null)}>
                            <b>Captura</b>
                        </MenuItem>
                    </SubMenu>
                    
                    <SubMenu label="Visualizaciones" icon={<AiOutlineFundView style={{ fontSize: '32px', color: hoveredItem === 10 ? 'rgba(7,21,56,255)' : 'white' }} />} style={{ color: hoveredItem === 10 ? 'rgba(7,21,56,255)' : 'white' }} onMouseEnter={() => setHoveredItem(10)} onMouseLeave={() => setHoveredItem(null)}>
                        <MenuItem style={{ background: hoveredItem === 1 ? 'white' : 'rgba(7,21,56,255)', color: hoveredItem === 1 ? 'rgba(7,21,56,255)' : 'white' }} icon={<FcScatterPlot style={{ fontSize: '32px', color: hoveredItem === 1 ? 'rgba(7,21,56,255)' : 'white' }} />} onClick={(e) => toggleMostrar('MostrarPuntos', e.target.checked)} onMouseEnter={() => setHoveredItem(1)}
                        onMouseLeave={() => setHoveredItem(null)} defaultChecked>
                            <b>Puntos</b>
                        </MenuItem>

                        <MenuItem style={{ background: hoveredItem === 2 ? 'white' : 'rgba(7,21,56,255)', color: hoveredItem === 2 ? 'rgba(7,21,56,255)' : 'white' }} icon={<BiLineChart style={{ fontSize: '32px', color: hoveredItem === 2 ? 'rgba(7,21,56,255)' : 'white' }} />} onClick={(e) => toggleMostrar('MostrarLineas', e.target.checked)} onMouseEnter={() => setHoveredItem(2)}
                        onMouseLeave={() => setHoveredItem(null)} defaultChecked>
                            <b>Líneas</b>
                        </MenuItem>

                        <MenuItem style={{ background: hoveredItem === 4 ? 'white' : 'rgba(7,21,56,255)', color: hoveredItem === 4 ? 'rgba(7,21,56,255)' : 'white' }} icon={<BiSolidCheckbox style={{ fontSize: '32px', color: hoveredItem === 4 ? 'rgba(7,21,56,255)' : 'white' }} />} onClick={resetCameraPosition} onMouseEnter={() => setHoveredItem(4)} onMouseLeave={() => setHoveredItem(null)}>
                            <b>2D</b>
                        </MenuItem> 
                    </SubMenu>

                    <SubMenu label="Zoom" icon={<AiOutlineExpand style={{ fontSize: '32px', color: hoveredItem === 12 ? 'rgba(7,21,56,255)' : 'white' }} />} style={{ color: hoveredItem === 12 ? 'rgba(7,21,56,255)' : 'white' }} onMouseEnter={() => setHoveredItem(12)} onMouseLeave={() => setHoveredItem(null)}>

                        <MenuItem style={{ background: hoveredItem === 3 ? 'white' : 'rgba(7,21,56,255)', color: hoveredItem === 3 ? 'rgba(7,21,56,255)' : 'white' }} icon={<BsArrowsFullscreen style={{ fontSize: '27px', color: hoveredItem === 3 ? 'rgba(7,21,56,255)' : 'white' }} />} onClick={toggleFullscreen} onMouseEnter={() => setHoveredItem(3)}
                        onMouseLeave={() => setHoveredItem(null)}>
                            <b>Fullscreen</b>
                        </MenuItem>

                        <MenuItem style={{ background: hoveredItem === 6 ? 'white' : 'rgba(7,21,56,255)', color: hoveredItem === 6 ? 'rgba(7,21,56,255)' : 'white' }} icon={<BsFillDashSquareFill style={{ fontSize: '27px', color: hoveredItem === 6 ? 'rgba(7,21,56,255)' : 'white' }} />} onClick={zoomIn} onMouseEnter={() => setHoveredItem(6)} onMouseLeave={() => setHoveredItem(null)}>
                            <b>Zoom -</b>
                        </MenuItem>

                        <MenuItem style={{ background: hoveredItem === 7 ? 'white' : 'rgba(7,21,56,255)', color: hoveredItem === 7 ? 'rgba(7,21,56,255)' : 'white' }} icon={<BsPlusSquareFill style={{ fontSize: '27px', color: hoveredItem === 7 ? 'rgba(7,21,56,255)' : 'white' }} />} onClick={zoomOut} onMouseEnter={() => setHoveredItem(7)} onMouseLeave={() => setHoveredItem(null)}>
                            <b>Zoom +</b>
                        </MenuItem>
                    </SubMenu>

                    <SubMenu label="Filtro" icon={<BiSolidTimeFive style={{ fontSize: '32px', color: hoveredItem === 13 ? 'rgba(7,21,56,255)' : 'white' }} />} style={{ color: hoveredItem === 13 ? 'rgba(7,21,56,255)' : 'white' }} onMouseEnter={() => setHoveredItem(13)} onMouseLeave={() => setHoveredItem(null)}>

                        <MenuItem style={{ background: hoveredItem === 9 ? 'white' : 'rgba(7,21,56,255)', color: hoveredItem === 9 ? 'rgba(7,21,56,255)' : 'white' }} icon={<WiTime1 style={{ fontSize: '32px', color: hoveredItem === 9 ? 'rgba(7,21,56,255)' : 'white'}}/>} onMouseEnter={() => setHoveredItem(9)} onMouseLeave={() => setHoveredItem(null)}>
                            <select value={startTime} onChange={handleStartTimeChange} style={{ color:'black' }} >
                                <option value="">--:--</option>
                                {generateTimeOptions()}
                            </select>
                            <b> Inicio</b>
                        </MenuItem>

                        <MenuItem style={{ background: hoveredItem === 14 ? 'white' : 'rgba(7,21,56,255)', color: hoveredItem === 14 ? 'rgba(7,21,56,255)' : 'white' }} icon={<WiTime9 style={{ fontSize: '32px', color: hoveredItem === 14 ? 'rgba(7,21,56,255)' : 'white'}}/>} onMouseEnter={() => setHoveredItem(14)} onMouseLeave={() => setHoveredItem(null)}>
                            <select value={endTime} onChange={handleEndTimeChange} style={{ color:'black' }}>
                                <option value="">--:--</option>
                                {generateTimeOptions1()}
                            </select>
                            <b> Fin</b>
                        </MenuItem>
                    </SubMenu>
                    <MenuItem
            icon={<CgArrowLeftO style={{ fontSize: '32px'}}/>} 
            onClick={handleNavigateHome}
            style={{color: hoveredItem === 15 ? 'rgba(7,21,56,255)' : 'white' }}
            onMouseEnter={() => setHoveredItem(15)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <b>Volver al Inicio</b>
          </MenuItem>
                </Menu>
            </Sidebar>
            <div id="scene-container" style={{ flex: 1 }}>
            </div>
        </div>
        
    );
}

export default Cubo;