import React, {Component} from 'react'
import {connect} from "react-redux";

import OrbitControls from 'orbit-controls-es6';
import {MeshText2D, textAlign} from 'three-text2d';

import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography/Typography";

import * as THREE from 'three'
import * as materiales from '../constants/materiales-threejs'
import * as Tipos from '../constants/morofologia-types';
import * as BalanceEnergetico from '../Utils/BalanceEnergetico';
import axios from "axios";

import {
    crearGeometriaPared, crearMeshPared, crearMeshPiso,
    crearMeshTecho, crearMeshVentana, crearMeshPuerta, clearThree
} from '../Utils/dibujosMesh'

import {
    casaPredefinidaDoble, casaPredefinidaDobleDosPisos, casaPredefinidaSimple,
    casaPredefinidaSimpleDosPisos, thunk_agregar_bloque, thunk_agregar_ventana,
    thunk_agregar_puerta, thunk_borrar_puerta, thunk_borrar_ventana, thunk_borrar_bloque,
} from '../actions/index';
import {seleccionarMorfologia, thunk_rotar_casa} from "../actions";
import {materialObstruccion} from "../constants/materiales-threejs";
import {materialSeleccionObstruccion} from "../constants/materiales-threejs";
import {SELECCIONAR_MORFOLOGIA} from "../constants/action-types";
import {materialHoveredMorf} from "../constants/materiales-threejs";
import {createMuiTheme} from "@material-ui/core";
const uuidv4 = require('uuid/v4');

//El estado en redux se mapean como props.
const mapStateToProps = state => {
    return {
        personas: state.variables.personas,
        temperatura: state.variables.temperatura,
        iluminacion: state.variables.iluminacion,
        aire: state.variables.aire,
        morfologia: state.morfologia,
        acciones: state.barra_herramientas_morfologia.acciones,
        camara3D: state.barra_herramientas_morfologia.camara3D,
        sunPosition: state.variables.mapa.sunPosition,
        sunPath: state.variables.mapa.sunPath,
        rotacion: state.morfologia.present.rotacion,
        verSol: state.barra_herramientas_morfologia.sol,
        fecha: state.barra_herramientas_morfologia.fecha,
        seleccionado: state.app.seleccion_morfologia,
    };
};

//Las acciones se mapean a props.
const mapDispatchToProps = dispatch => {
    return {
        casaPredefinidaSimple: () => dispatch(casaPredefinidaSimple()),
        casaPredefinidaDoble: () => dispatch(casaPredefinidaDoble()),
        casaPredefinidaSimpleDosPisos: () => dispatch(casaPredefinidaSimpleDosPisos()),
        casaPredefinidaDobleDosPisos: () => dispatch(casaPredefinidaDobleDosPisos()),
        thunk_agregar_bloque: (bloque, nivel) => dispatch(thunk_agregar_bloque(bloque, nivel)),
        thunk_agregar_ventana:
            (bloque, nivel, pared, ventana) =>
                dispatch(thunk_agregar_ventana(bloque, nivel, pared, ventana)),
        thunk_agregar_puerta:
            (bloque, nivel, pared, puerta) =>
                dispatch(thunk_agregar_puerta(bloque, nivel, pared, puerta)),
        thunk_borrar_puerta:
            (puerta, nivel, bloque, pared) =>
                dispatch(thunk_borrar_puerta(puerta, nivel, bloque, pared)),
        thunk_borrar_ventana:
            (ventana, nivel, bloque, pared) =>
                dispatch(thunk_borrar_ventana(ventana, nivel, bloque, pared)),
        thunk_borrar_bloque:
            (nivel, bloque) =>
                dispatch(thunk_borrar_bloque(bloque, nivel)),
        thunk_rotar_casa:
            (angulo) =>
                dispatch(thunk_rotar_casa(angulo)),
        seleccionarMorfologia: (seleccion,grupo) => dispatch(seleccionarMorfologia(seleccion,grupo)),
    }
};

class Morfologia extends Component {
    //Aqui se nomban objetos y se asocian a un metodo
    constructor(props) {
        super(props);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onChangeCamera = this.onChangeCamera.bind(this);

        this.temperaturasMes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        this.angleRotatedTemp = 0;
        this.angleRotated = 0;
        this.dragging = false;
        //this.coordenadasRotadas = false;

        this.state = {
            height: props.height,
            width: props.width,
            dragging: false,
            angleRotatedTemp: 0,
            angleRotated: 0,

        };

        var theme = createMuiTheme({
            palette: {
                primary: {
                    main: "#fc0f4f",
                },
            },
        });
        this.colorSelected = [theme.palette.primary.main,theme.palette.primary.contrastText];
    };

    componentDidUpdate(prevProps) {
        if (this.props.sunPosition !== prevProps.sunPosition && this.props.sunPosition !== null) {
            this.onSunpositionChanged();
            this.getSunPath();
            /*if(this.props.fecha != null) this.getSunPath(this.props.fecha);
            else this.getSunPath();*/
        }
        /*if(this.props.sunPath !== prevProps.sunPath || (this.sunPath == null && this.props.sunPosition != null)){
            this.getSunPath();
        }*/
        if (this.props.camara3D !== prevProps.camara3D) {
            this.onPerspectiveChanged();
        }

        if (this.props.seleccionado !== prevProps.seleccionado){
            this.handleSeleccionadoChange();
        }

        if (this.props.verSol !== prevProps.verSol) {
            this.sunPath.visible = this.props.verSol;
        }

        if (this.props.acciones.mover_camara !== prevProps.acciones.mover_camara) {
            if (this.props.acciones.mover_camara) {
                this.control2D.mouseButtons.PAN = THREE.MOUSE.LEFT;
                this.control3D.mouseButtons.PAN = THREE.MOUSE.LEFT;
            } else {
                this.control2D.mouseButtons.ORBIT = -1;
                this.control3D.mouseButtons.PAN = -1;
            }
        }

        if (this.props.comuna !== prevProps.comuna) {
            this.onComunaChanged();
        }

        if (this.props.width !== prevProps.width || this.props.height !== prevProps.height) {
            this.renderer.setSize(this.props.width, this.props.height);
            this.camara.aspect = this.props.width / this.props.height;
            this.camara.updateProjectionMatrix();
            this.renderer.render(this.escena, this.camara);
        }
        //Se actualizo la morfologia de la casa, esta se redibuja
        if (this.props.morfologia.present !== null && prevProps.morfologia.present !== this.props.morfologia.present) {
            this.dibujarEstado();
        }
    }

    dibujarEstado() {
        this.paredes = [];
        this.pisos = [];
        this.techos = [];
        this.ventanas = [];
        this.puertas = [];
        this.superficies = [];
        this.allObjects = [];
        this.superficies.push(this.plano);

        let estadoCasa = this.props.morfologia.present.niveles;

        clearThree(this.casa);
        let nivelGroup;
        for (let nivel of estadoCasa) {
            nivelGroup = new THREE.Group();
            nivelGroup.userData.nivel = estadoCasa.indexOf(nivel);
            nivelGroup.position.set(0, nivel.altura, 0);
            this.casa.add(nivelGroup);
            let bloqueGroup;
            for (let bloque of nivel.bloques) {
                bloqueGroup = new THREE.Group();
                bloqueGroup.name = 'bloque';
                bloqueGroup.userData.bloque = nivel.bloques.indexOf(bloque);
                nivelGroup.add(bloqueGroup);
                bloqueGroup.position.set(
                    bloque.posicion.x,
                    0,
                    bloque.posicion.z
                );
                let paredMesh;
                for (let pared of bloque.paredes) {
                    paredMesh = crearMeshPared(pared.dimensiones.ancho, pared.dimensiones.alto, []);
                    paredMesh.castShadow = true;
                    paredMesh.receiveShadow = false;
                    paredMesh.userData.pared = bloque.paredes.indexOf(pared);
                    paredMesh.userData.tipo = Tipos.PARED;
                    bloqueGroup.add(paredMesh);
                    paredMesh.position.set(pared.posicion.x, pared.posicion.y, pared.posicion.z);
                    if (pared.orientacion.z !== 0) {
                        if (pared.orientacion.z !== 1) {
                            paredMesh.rotation.y = Math.PI;
                        }
                    } else {
                        if (pared.orientacion.x !== 1) {
                            paredMesh.rotation.y = -Math.PI / 2;
                        } else {
                            paredMesh.rotation.y = Math.PI / 2;
                            paredMesh.rotation.y = Math.PI / 2;
                        }
                    }

                    var holes = [];

                    for (let ventana of pared.ventanas) {
                        let ventanaMesh = crearMeshVentana(ventana.dimensiones.ancho, ventana.dimensiones.alto);
                        ventanaMesh.userData.ventana = pared.ventanas.indexOf(ventana);
                        ventanaMesh.userData.tipo = Tipos.VENTANA;
                        paredMesh.add(ventanaMesh);
                        ventanaMesh.position.set(ventana.posicion.x, ventana.posicion.y, 0);

                        let points = ventanaMesh.geometry.parameters.shapes.extractPoints().shape;
                        for (let point of points) {
                            point.x += ventana.posicion.x;
                            point.y += ventana.posicion.y;
                        }
                        holes.push(new THREE.Path(points));
                        this.ventanas.push(ventanaMesh);

                        let pos = new THREE.Vector3();
                        ventanaMesh.updateMatrixWorld();
                        ventanaMesh.getWorldPosition(pos);
                        /*paredMesh.getWorldPosition(pos);
                        bloqueGroup.getWorldPosition(pos);*/
                        let posicionReal = {
                            x : pos.x,
                                y: pos.y,
                                z : pos.z,
                        };
                        console.log('casaPred',pos);
                    }
                    for (let puerta of pared.puertas) {
                        let puertaMesh = crearMeshPuerta(puerta.dimensiones.ancho, puerta.dimensiones.alto);
                        puertaMesh.userData.puerta = pared.puertas.indexOf(puerta);
                        puertaMesh.userData.tipo = Tipos.PUERTA;
                        paredMesh.add(puertaMesh);
                        puertaMesh.position.set(puerta.posicion.x, puerta.posicion.y, 0);

                        let points = puertaMesh.geometry.parameters.shapes.extractPoints().shape;
                        for (let point of points) {
                            point.x += puerta.posicion.x;
                            point.y += puerta.posicion.y;
                        }
                        holes.push(new THREE.Path(points));
                        this.puertas.push(puertaMesh);
                    }
                    paredMesh.geometry = crearGeometriaPared(pared.dimensiones.ancho, pared.dimensiones.alto, holes);
                    this.paredes.push(paredMesh);

                }
                let pisoMesh = crearMeshPiso(bloque.dimensiones.ancho, bloque.dimensiones.largo);
                pisoMesh.userData.tipo = Tipos.PISO;
                bloqueGroup.add(pisoMesh);

                this.pisos.push(pisoMesh);

                if (bloque.techo) {
                    let techoMesh = crearMeshTecho(bloque.dimensiones.ancho, bloque.dimensiones.largo, bloque.dimensiones.alto);
                    techoMesh.userData.tipo = Tipos.TECHO;
                    bloqueGroup.add(techoMesh);
                    this.techos.push(techoMesh);
                    this.superficies.push(techoMesh);
                }

                nivelGroup.add(bloqueGroup);
            }
            this.casa.add(nivelGroup);
        }

        this.rotarSunPathCardinal(this.props.rotacion);

        Object.assign(this.allObjects,
            this.paredes
                .concat(this.ventanas)
                .concat(this.puertas)
                .concat(this.pisos)
                .concat(this.techos));
    }

    rotarSunPathCardinal(angulo) {
        this.sunPathCardinal.rotation.y = (Math.PI / 180) * angulo;
    }

    puertaDibujada(start, end, worldStart, worldEnd, pared) {
        start = start.clone();
        end = end.clone();
        worldStart = worldStart.clone();
        worldEnd = worldEnd.clone();

        clearThree(this.puertaDibujo);
        let width = Math.abs(start.x - end.x), heigth = end.y;
        let alturaPiso = worldEnd.y;
        if (width === 0 || heigth === 0) {
            return;
        }
        width = Math.round(width * 100) / 100;
        heigth = Math.round(heigth * 100) / 100;

        this.puertaDibujo.userData.dimensiones = {
            ancho: width,
            alto: heigth,
        };

        var dir = worldEnd.clone().sub(worldStart);
        var len = dir.length();
        dir = dir.normalize().multiplyScalar(len * 0.5);
        let pos = worldStart.clone().add(dir);

        this.puertaDibujo.position.set(
            pos.x,
            alturaPiso - heigth,
            pos.z,
        );

        let meshPuerta = crearMeshPuerta(width, heigth);
        meshPuerta.rotation.y = pared.rotation.y;

        let posicionLocal = this.puertaDibujo.position.clone();
        pared.worldToLocal(posicionLocal);

        this.puertaDibujo.userData.posicion = {
            x: posicionLocal.x,
            y: posicionLocal.y,
        };

        this.puertaDibujo.add(meshPuerta);
    }

    ventanaDibujada(start, end, worldStart, worldEnd, pared) {
        clearThree(this.ventanaDibujo);
        let width = Math.abs(start.x - end.x), heigth = Math.abs(start.y - end.y);
        let alturaPiso = Math.max(worldStart.y, worldEnd.y);
        if (width === 0 || heigth === 0) {
            return;
        }
        width = Math.round(width * 100) / 100;
        heigth = Math.round(heigth * 100) / 100;

        this.ventanaDibujo.userData.dimensiones = {
            ancho: width,
            alto: heigth,
        };

        var dir = worldEnd.clone().sub(worldStart);
        var len = dir.length();
        dir = dir.normalize().multiplyScalar(len * 0.5);
        let pos = worldStart.clone().add(dir);

        this.ventanaDibujo.position.set(
            pos.x,
            alturaPiso - heigth,
            pos.z,
        );

        let meshVentana = crearMeshVentana(width, heigth);
        meshVentana.rotation.y = pared.rotation.y;

        let posicionLocal = this.ventanaDibujo.position.clone();
        pared.worldToLocal(posicionLocal);

        this.ventanaDibujo.userData.posicion = {
            x: posicionLocal.x,
            y: posicionLocal.y,
        };

        this.ventanaDibujo.add(meshVentana);
    }

    bloqueDibujado(start, end, height, altura) {
        clearThree(this.bloqueDibujo);

        let width = Math.abs(start.x - end.x), depth = Math.abs(start.z - end.z);
        let widths = [width, depth, width, depth];

        if (width === 0 || depth === 0) {
            return;
        }

        this.bloqueDibujo.userData.dimensiones = {
            alto: height,
            ancho: width,
            largo: depth,
        };

        var dir = end.clone().sub(start);
        var len = dir.length();
        dir = dir.normalize().multiplyScalar(len * 0.5);
        let pos = start.clone().add(dir);

        this.bloqueDibujo.position.set(
            pos.x,
            altura,
            pos.z
        );

        let pared1 = crearMeshPared(widths[0], height, []);
        pared1.position.z = depth / 2;
        pared1.userData.orientacion = {x: 0, y: 0, z: 1};
        pared1.userData.superficie = widths[0] * height;
        pared1.userData.dimensiones = {
            ancho: widths[0],
            alto: height,
        };

        let pared2 = crearMeshPared(widths[1], height, []);
        pared2.position.x = width / 2;
        pared2.rotation.y = Math.PI / 2;
        pared2.userData.orientacion = {x: 1, y: 0, z: 0};
        pared2.userData.superficie = widths[1] * height;
        pared2.userData.dimensiones = {
            ancho: widths[1],
            alto: height,
        };


        let pared3 = crearMeshPared(widths[2], height, []);
        pared3.position.z = -depth / 2;
        pared3.rotation.y = Math.PI;
        pared3.userData.orientacion = {x: 0, y: 0, z: -1};
        pared3.userData.superficie = widths[2] * height;
        pared3.userData.dimensiones = {
            ancho: widths[2],
            alto: height,
        };

        let pared4 = crearMeshPared(widths[3], height, []);
        pared4.position.x = -width / 2;
        pared4.rotation.y = -Math.PI / 2;
        pared4.userData.orientacion = {x: -1, y: 0, z: 0};
        pared4.userData.superficie = widths[3] * height;
        pared4.userData.dimensiones = {
            ancho: widths[3],
            alto: height,
        };

        let piso = crearMeshPiso(width, depth);
        piso.name = 'piso';
        let techo = crearMeshTecho(width, depth, height);
        techo.name = 'techo';

        let paredes = new THREE.Group();
        paredes.name = 'paredes';

        this.bloqueDibujo.add(piso);
        this.bloqueDibujo.add(techo);
        paredes.add(pared1);
        paredes.add(pared2);
        paredes.add(pared3);
        paredes.add(pared4);
        this.bloqueDibujo.add(paredes);

    }

    onComunaChanged() {
        axios.get("https://bioclimapp.host/api/temperaturas/" + this.props.comuna.id)
            .then(response => this.getJson(response));

    }

    getJson(response) {
        let data = response.data.slice();
        for (let i = 0; i < data.length; i++) {
            this.temperaturasMes[i] = data[i].valor;
        }
        let res = BalanceEnergetico.gradosDias(this.temperaturasMes, this.temperaturaConfort);
        let gradoDias = res[0];
        let periodo = res[1];
        this.managerCasas.setZona(this.props.comuna.zona);
        this.managerCasas.setGradosDias(gradoDias, periodo);
        this.props.onParedesChanged(this.paredes);
        this.props.onFarChanged(this.ventanas);
        this.handleChangeCasa();
    }

    onSunpositionChanged() {
        var sunDegrees = this.transformGammaToDegree(this.props.sunPosition.azimuth);
        let index = Math.round(sunDegrees);
        let sunPosCircle = this.circlePoints[index];
        index = Math.round(this.props.sunPosition.altitude);
        if (index < 0) {
            index = 360 + index;
        }
        let sunAlt = this.circlePoints[index];

        let sunPos = new THREE.Vector3(sunPosCircle.x, 0, sunPosCircle.y);
        let d = sunPos.distanceTo(new THREE.Vector3(0, 0.001, 0));
        let f = sunAlt.x / d;
        sunPos = sunPos.clone().multiplyScalar(Math.abs(f));

        this.light.position.set(sunPos.x, (sunAlt.y - 1), sunPos.z);
        this.sol.position.set(sunPos.x, sunAlt.y - 1, sunPos.z);
    }

    handleSunPathClicked(sunPathClicked) {
        let group = this.escena.getObjectByName("sunPath");
        if (sunPathClicked === true) {
            if (group != null) {
                this.escena.remove(group);
            }
        } else {
            this.escena.add(this.sunPath);
        }
    }

    getSunPath() {
        let now = this.props.fecha;
        clearThree(this.sunPath);
        let allPoints = [];
        let start = new Date(now.getFullYear(), 0, 0);
        let diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        let oneDay = 1000 * 60 * 60 * 24;
        let today = Math.floor(diff / oneDay);
        let invierno = new Date(now.getFullYear(), 5, 21);
        let verano = new Date(now.getFullYear(), 11, 21);
        let diff_invierno = (invierno - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        let diff_verano = (verano - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        let day_invierno = Math.floor(diff_invierno / oneDay);
        let day_verano = Math.floor(diff_verano / oneDay);
        if (today < day_invierno) {
            today = day_invierno + (day_invierno - today);
        }
        if (today > day_verano) {
            today = day_verano + (day_verano - today);
        }
        let day = day_invierno;
        let group = new THREE.Group();
        for (let daySunPath of this.props.sunPath) {
            let curvePoints = [];
            for (let sunPosition of daySunPath) {
                let sunDegrees = this.transformGammaToDegree(sunPosition.azimuth);
                let index = Math.round(sunDegrees);
                let sunPosCircle = this.circlePoints[index];
                index = Math.round(sunPosition.altitude);
                if (index < 0) {
                    index = 360 + index;
                }
                let sunAlt = this.circlePoints[index];

                let sunPos = new THREE.Vector3(sunPosCircle.x, 0, sunPosCircle.y);
                let d = sunPos.distanceTo(new THREE.Vector3(0, 0.001, 0));
                let f = sunAlt.x / d;
                sunPos = sunPos.clone().multiplyScalar(Math.abs(f));
                curvePoints.push(new THREE.Vector3(sunPos.x, sunAlt.y - 1, sunPos.z));
            }
            let curve = new THREE.CatmullRomCurve3(curvePoints, true);
            let points = curve.getPoints(100);
            allPoints.push(points);
            let geometry = new THREE.BufferGeometry().setFromPoints(points);
            if (day === today) {
                let material = new THREE.LineBasicMaterial({color: 0x950714, linewidth: 5});
                let curveObject = new THREE.Line(geometry, material);
                curveObject.position.set(curveObject.position.x, curveObject.position.y + 0.1, curveObject.position.z - 0.1);
                group.add(curveObject);
            } else {
                let material = new THREE.LineBasicMaterial({
                    color: 0xfbeb90,
                    linewidth: 5,
                    transparent: true,
                    opacity: 0.3
                });
                let curveObject = new THREE.Line(geometry, material);
                group.add(curveObject);
            }
            day++;

        }
        group.add(this.sol);
        group.add(this.light);
        this.sunPath.add(group);
    }

    onPerspectiveChanged() {
        if (!this.props.camara3D) {
            this.camara = this.camara2D;
            this.control2D.enabled = true;
            this.control3D.enabled = false;

        } else {
            this.camara = this.camara3D;
            this.control3D.enabled = true;
            this.control2D.enabled = false;
        }
    }

    componentDidMount() {
        //configuracion pantalla
        const width = this.state.width;
        const height = this.state.height;

        //posicion de mouse en la pantalla
        this.mouse = new THREE.Vector2();

        //arreglo de objetos visibles que podrían interactuar
        this.superficies = [];

        this.allObjects = [];

        //arreglos de objetos Object3D de three js para saber a que objeto se está apuntando.
        this.paredes = [];
        this.ventanas = [];
        this.puertas = [];
        this.pisos = [];

        //objetos que se están destacando
        this.objApuntadoMouse = null;
        this.objSeleccionado = [];

        //Hay que cargar escena, camara, y renderer,

        //Escena
        let escena = new THREE.Scene();
        escena.background = new THREE.Color(0xf0f0f0);
        this.escena = escena;

        this.heightWall = 2.5;
        //Camaras

        //camara 2d
        const val = 2 * 16;
        let camara2D = new THREE.OrthographicCamera(width / -val, width / val, height / val, height / -val, 1, 1000);
        camara2D.position.set(0, 3, 0);
        camara2D.zoom = 2.5;
        camara2D.updateProjectionMatrix();
        this.camara2D = camara2D;
        //CAMARA 3D
        let camara3D = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
        camara3D.position.set(0, 6, 15);
        camara3D.lookAt(new THREE.Vector3());
        this.camara3D = camara3D;

        //camara de la escena es 3D al principio
        this.camara = this.camara3D;

        //Renderer
        var renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.setClearColor('#F0F0F0');
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer = renderer;

        this.escena.add(new THREE.AmbientLight(0xB1B1B1));
        //this.escena.add(this.casas);

        //Luz
        this.light = new THREE.DirectionalLight(0xffff00, 1, 100);
        this.light.castShadow = true;

        this.light.shadow.mapSize.width = 2048;
        this.light.shadow.mapSize.height = 2048;
        var d = 50;
        this.light.shadow.camera.left = -d;
        this.light.shadow.camera.right = d;
        this.light.shadow.camera.top = d;
        this.light.shadow.camera.bottom = -d;
        this.light.shadow.camera.far = 35;
        this.light.shadow.bias = -0.0001;

        //Mesh Sol
        var solGeometry = new THREE.SphereBufferGeometry(2, 32, 32);
        var solMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
        this.sol = new THREE.Mesh(solGeometry, solMaterial);
        this.sol.position.set(this.light.position.x, this.light.position.y, this.light.position.z);

        //Controles para la camara2D
        const control2D = new OrbitControls(camara2D, renderer.domElement);
        control2D.enabled = false;
        control2D.maxDistance = 10;
        control2D.mouseButtons = {
            PAN: -1,
            ZOOM: THREE.MOUSE.MIDDLE,
            ORBIT: -1,
        };
        this.control2D = control2D;

        //Controles para la camara3D
        const control3D = new OrbitControls(camara3D, renderer.domElement);
        control3D.enabled = true;
        control3D.maxDistance = 100;
        control3D.mouseButtons = {
            PAN: -1,
            ZOOM: THREE.MOUSE.MIDDLE,
            ORBIT: THREE.MOUSE.RIGHT,
        };
        this.control3D = control3D;

        //Plano se agrega a objetos
        let sizePlano = 40;
        let planoGeometria = new THREE.PlaneBufferGeometry(sizePlano, sizePlano);
        planoGeometria.rotateX(-Math.PI / 2);
        planoGeometria.computeFaceNormals();
        planoGeometria.computeVertexNormals();

        this.positionParedes = [];
        for (let i = 0; i < sizePlano; i++) {
            this.positionParedes[i] = [];
            for (let j = 0; j < sizePlano; j++) {
                this.positionParedes[i][j] = [];
            }
        }

        let plano = new THREE.Mesh(planoGeometria, new THREE.MeshLambertMaterial({
            color: '#549833',
            side: THREE.DoubleSide,
        }));
        plano.receiveShadow = true;
        plano.castShadow = false;
        escena.add(plano);
        this.light.target = plano;
        this.plano = plano;
        this.superficies.push(this.plano);

        //Grid del plano
        let gridHelper = new THREE.GridHelper(sizePlano, sizePlano, 0xCCCCCC, 0xCCCCCC);
        gridHelper.material = new THREE.LineBasicMaterial({
            color: 0x1E3E0E,
            linewidth: 4,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin: 'round' //ignored by WebGLRenderer
        });
        escena.add(gridHelper);
        gridHelper.position.y += 0.001;

        //Ejes x e y
        let lineMaterial = new THREE.LineBasicMaterial({
            color: 0x90E567,
            linewidth: 6,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin: 'round' //ignored by WebGLRenderer
        });
        let lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
            new THREE.Vector3(-sizePlano / 2, 0.003, 0),
            new THREE.Vector3(sizePlano / 2, 0.003, 0),
        );
        let ejeX = new THREE.Line(lineGeometry, lineMaterial);

        let ejeY = ejeX.clone();
        ejeY.rotation.y = Math.PI / 2;
        this.escena.add(ejeX);
        this.escena.add(ejeY);

        //Indicador de puntos cardinales
        let curve = new THREE.EllipseCurve(
            0, 0,            // ax, aY
            sizePlano/2, sizePlano/2,           // xRadius, yRadius
            0, 2 * Math.PI,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        );

        var points = curve.getPoints(360);
        var circleGeometry = new THREE.BufferGeometry().setFromPoints(points);
        var circleMaterial = new THREE.LineBasicMaterial({color: 0x1E3E0E, linewidth: 5});
        var cardinalPointsCircle = new THREE.Line(circleGeometry, circleMaterial,);

        cardinalPointsCircle.rotateX(-Math.PI / 2);
        cardinalPointsCircle.position.set(0, 0.001, 0);
        cardinalPointsCircle.name = "cardinalPointsCircle";
        this.cardinalPointsCircle = cardinalPointsCircle;
        this.circlePoints = points;

        this.sunPathCardinal = new THREE.Group();
        this.sunPath = new THREE.Group();
        this.sunPathCardinal.add(this.cardinalPointsCircle);
        this.sunPathCardinal.add(this.sunPath);

        escena.add(this.sunPathCardinal);

        var sprite = new MeshText2D("S", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(0,-sizePlano/2, 0.0);
        cardinalPointsCircle.add(sprite);

        sprite = new MeshText2D("N", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(0, sizePlano/2 + 2, 0.0);
        cardinalPointsCircle.add(sprite);
        sprite = new MeshText2D("E", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(sizePlano/2+1, 0.3, 0);
        cardinalPointsCircle.add(sprite);

        sprite = new MeshText2D("O", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(-sizePlano/2-1, 0.3, 0);
        cardinalPointsCircle.add(sprite);

        var light = new THREE.AmbientLight(0x404040); // soft white light
        escena.add(light);

        //raycaster, usado para apuntar objetos
        var raycaster = new THREE.Raycaster();
        raycaster.linePrecision = 1;
        this.raycaster = raycaster;

        this.construyendo = false;

        this.indicador_dibujado = this.crearIndicadorConstruccionPared(this.heightWall, 0.05);
        escena.add(this.indicador_dibujado);

        this.indicador_dibujado_ventana = this.crearIndicardorConstruccionVentana(0.09);
        escena.add(this.indicador_dibujado_ventana);

        this.casa = new THREE.Group();
        escena.add(this.casa);
        this.mount.appendChild(this.renderer.domElement);

        this.start();

        this.bloqueDibujo = new THREE.Group();
        this.ventanaDibujo = new THREE.Group();
        this.puertaDibujo = new THREE.Group();
        this.escena.add(this.bloqueDibujo);
        this.escena.add(this.ventanaDibujo);
        this.escena.add(this.puertaDibujo);

        this.dibujarEstado();
    }

    crearIndicadorConstruccionPared(heightWall, radius) {
        const geometria = new THREE.CylinderBufferGeometry(radius, radius, heightWall, 32);
        var indicadorPared = new THREE.Mesh(geometria, materiales.materialIndicador.clone());
        indicadorPared.visible = false;
        return indicadorPared;
    }

    crearGeometriaIndicadorConstruccionPared(heightWall,radius){
        return new THREE.CylinderBufferGeometry(radius, radius, heightWall, 32);
    }

    crearIndicardorConstruccionVentana(radius) {
        let indicadorVentana = new THREE.Group();
        const geometriaX = new THREE.CircleBufferGeometry(radius, 32);
        let lineGeometryX = new THREE.Geometry();
        lineGeometryX.vertices.push(
            new THREE.Vector3(-radius / 2, 0, 0),
            new THREE.Vector3(radius / 2, 0, 0),
        );
        let ejeX = new THREE.Line(lineGeometryX, materiales.materialIndicadorVentana);

        const geometriaY = new THREE.CircleBufferGeometry(radius, 32);
        let lineGeometryY = new THREE.Geometry();
        lineGeometryY.vertices.push(
            new THREE.Vector3(0, -radius / 2, 0),
            new THREE.Vector3(0, radius / 2, 0),
        );
        let ejeY = new THREE.Line(lineGeometryY, materiales.materialIndicadorVentana);
        indicadorVentana.add(ejeX);
        indicadorVentana.add(ejeY);

        indicadorVentana.visible = false;
        indicadorVentana.position.y = 1;
        return indicadorVentana;
    }

    componentWillUnmount() {
        this.stop();
        this.mount.removeChild(this.renderer.domElement);
    }

    start() {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate)
        }
    }

    stop() {
        cancelAnimationFrame(this.frameId)
    }

    animate() {
        this.renderScene();
        this.frameId = window.requestAnimationFrame(this.animate)
    }

    renderScene() {
        this.renderer.render(this.escena, this.camara);
    }

    onChangeCamera(event) {
        this.setState({camara: event.target.value})
    }

    onMouseDown(event) {
        event.preventDefault();
        let rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / (rect.width)) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / (rect.height)) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camara);

        //Agregando bloques
        if (this.props.acciones.agregar_bloque) {
            this.indicador_dibujado.visible = true;
            this.indicador_dibujado_ventana.visible = false;
            if (event.button === 0) {
                this.construyendo = true;
                let intersects = this.raycaster.intersectObjects(this.superficies);
                if (intersects.length > 0) {
                    let intersect = intersects[0];

                    this.worldPosition = intersect.object.localToWorld(new THREE.Vector3(0, 0, 0));
                    this.intersectStart = intersect;

                    let startHabitacion = (intersect.point).add(intersect.face.normal).clone();
                    startHabitacion = startHabitacion.round();
                    startHabitacion.y = this.worldPosition.y;
                    this.startHabitacion = startHabitacion;
                    //this.managerCasas.setStartHabitacion(startHabitacion, this.raycaster);
                }
            }
        } else if (this.props.acciones.agregar_puerta || this.props.acciones.agregar_ventana) {
            this.indicador_dibujado.visible = false;
            this.indicador_dibujado_ventana.visible = true;
            if (event.button === 0) {
                this.construyendo = true;
                let intersects = this.raycaster.intersectObjects(this.paredes);
                if (intersects.length > 0) {
                    let intersect = intersects[0];
                    this.paredIntersect = intersect.object;
                    this.pointStart = intersect.point.clone();
                    this.paredIntersect.worldToLocal(this.pointStart);
                }
            }
        } else {
            this.indicador_dibujado.visible = false;
            this.indicador_dibujado_ventana.visible = false;
        }

        if (this.props.acciones.rotar && event.button === 0) {
            this.dragging = true;
            this.setState({dragging: this.dragging});
            this.prevX = event.screenX;
        }
    }

    onMouseMove(event) {
        event.preventDefault();
        let rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / (rect.width)) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / (rect.height)) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camara);

        //Si se está seleccion
        if (this.props.acciones.seleccionar) {
            this.apuntaSel = false;
            let intersects = this.raycaster.intersectObjects(this.allObjects);
            if (this.objApuntadoMouse !== null) {
                this.changeColorSeleccion(this.objApuntadoMouse);
            }
            if (intersects.length > 0) {
                let intersect = intersects[0].object;
                for(let seleccionado of this.objSeleccionado){
                    if(intersect === seleccionado){
                        this.objSeleccionado.material = materiales.materialSeleccionado;
                        this.apuntaSel = true;
                        break;
                    }
                }
                if(!this.apuntaSel){
                    this.objApuntadoMouse = intersect;
                    this.objApuntadoMouse.material = materiales.materialHoveredMorf;
                }
                /*if (intersect === this.objSeleccionado) {
                    this.objSeleccionado.material = materiales.materialSeleccionado;
                    this.apuntaSel = true;
                } else {
                    this.objApuntadoMouse = intersect;
                    this.objApuntadoMouse.material = materiales.materialHoveredMorf;
                }*/

            } else {
                this.objApuntadoMouse = null;
            }

        }
        if (this.props.acciones.eliminar) {
            let intersects = this.raycaster.intersectObjects(this.allObjects);
            if (intersects.length > 0) {
                let intersect = intersects[0].object;
                if (this.objApuntadoMouse !== intersect && this.objApuntadoMouse !== null) {
                    this.changeColorSeleccion(this.objApuntadoMouse);
                }
                this.objApuntadoMouse = intersect;
                this.objApuntadoMouse.material = materiales.materialHoveredMorf;

            } else {
                if (this.objApuntadoMouse !== null) {
                    this.changeColorSeleccion(this.objApuntadoMouse);
                }
            }
        }

        //Si se está dibujando
        if (this.props.acciones.agregar_ventana
            || this.props.acciones.agregar_puerta
            || this.props.acciones.agregar_bloque) {

            let index = parseInt(this.props.dibujando);
            let intersect;
            //si se dibujan bloques
            if (this.props.acciones.agregar_bloque) {

                let intersects = this.raycaster.intersectObjects(this.superficies);
                if (intersects.length > 0) {
                    intersect = intersects[0];
                    this.indicador_dibujado.visible = true;
                    this.indicador_dibujado_ventana.visible = false;
                    this.indicador_dibujado.position.copy(intersect.point).add(intersect.face.normal);
                    this.indicador_dibujado.position.round();

                    let worldPosition = intersect.object.localToWorld(new THREE.Vector3(0, 0, 0));



                    let niveles = this.props.morfologia.present.niveles;
                    let nivel;
                    if(intersect.object.userData.tipo === Tipos.TECHO){
                        nivel = intersect.object.parent.parent.userData.nivel + 1;
                    }else{
                        nivel = 0;
                    }
                    if(niveles[nivel].bloques.length > 0){
                        this.heightWall = niveles[nivel].bloques[0].dimensiones.alto;
                    }else{
                        this.heightWall = 2.5;
                    }
                    this.indicador_dibujado.geometry.dispose();
                    this.indicador_dibujado.geometry = this.crearGeometriaIndicadorConstruccionPared(this.heightWall,0.05);

                    this.indicador_dibujado.position.y = worldPosition.y + this.heightWall / 2;

                    console.log(this.heightWall);
                    if (this.construyendo) {
                        this.indicador_dibujado.position.y = this.worldPosition.y + this.heightWall / 2;
                        var nextPosition = (intersect.point).add(intersect.face.normal).clone();
                        nextPosition.round();
                        this.bloqueDibujado(this.startHabitacion, nextPosition, this.heightWall, this.indicador_dibujado.position.y - this.heightWall / 2);
                        this.nexPosition = nextPosition;
                    }
                }
            } else if (this.props.acciones.agregar_ventana || this.props.acciones.agregar_puerta) {
                this.indicador_dibujado.visible = false;
                let intersects = this.raycaster.intersectObjects(this.paredes);
                if (intersects.length > 0) {
                    intersect = intersects[0];
                    let pared = intersect.object;
                    if (this.construyendo) {
                        if (intersect.object !== this.paredIntersect) {
                            return;
                        }
                    }
                    this.indicador_dibujado_ventana.visible = true;
                    this.indicador_dibujado_ventana.position.set(
                        intersect.point.x,
                        intersect.point.y,
                        intersect.point.z);
                    switch (pared.rotation.y) {
                        case(0):
                            this.indicador_dibujado_ventana.position.set(
                                intersect.point.x,
                                intersect.point.y,
                                intersect.point.z + 0.01
                            );
                            break;
                        case(Math.PI / 2):
                            this.indicador_dibujado_ventana.position.set(
                                intersect.point.x + 0.01,
                                intersect.point.y,
                                intersect.point.z
                            );
                            break;
                        case (Math.PI):
                            this.indicador_dibujado_ventana.position.set(
                                intersect.point.x,
                                intersect.point.y,
                                intersect.point.z - 0.01
                            );
                            break;
                        case (-Math.PI / 2):
                            this.indicador_dibujado_ventana.position.set(
                                intersect.point.x - 0.01,
                                intersect.point.y,
                                intersect.point.z
                            );
                            break;
                    }
                    this.indicador_dibujado_ventana.position.multiplyScalar(100);
                    this.indicador_dibujado_ventana.position.round();
                    this.indicador_dibujado_ventana.position.multiplyScalar(0.01);
                    this.indicador_dibujado_ventana.rotation.y = pared.rotation.y;

                    if (this.construyendo) {
                        if (this.props.acciones.agregar_ventana) {
                            let pointEnd = this.indicador_dibujado_ventana.position.clone();
                            let pointStartWorld = this.pointStart.clone();
                            this.paredIntersect.updateMatrixWorld();
                            this.paredIntersect.updateMatrix();
                            this.paredIntersect.localToWorld(pointStartWorld);

                            this.paredIntersect.worldToLocal(pointEnd);
                            this.ventanaDibujada(
                                this.pointStart,
                                pointEnd,
                                pointStartWorld,
                                this.indicador_dibujado_ventana.position,
                                this.paredIntersect,
                            );
                        } else {
                            let pointEnd = this.indicador_dibujado_ventana.position.clone();
                            let pointStartWorld = this.pointStart.clone();
                            this.paredIntersect.updateMatrixWorld();
                            this.paredIntersect.updateMatrix();
                            this.paredIntersect.localToWorld(pointStartWorld);

                            this.paredIntersect.worldToLocal(pointEnd);
                            this.puertaDibujada(
                                this.pointStart,
                                pointEnd,
                                pointStartWorld,
                                this.indicador_dibujado_ventana.position,
                                this.paredIntersect,
                            );
                        }

                    }
                }
            }
        } else {
            this.indicador_dibujado.visible = false;
            this.indicador_dibujado_ventana.visible = false;
        }
        //si se está rotando
        if (this.dragging && event.button === 0) {
            let movementX = event.screenX - this.prevX;
            this.prevX = event.screenX;
            let angle = Math.PI * movementX / 180;
            this.angleRotatedTemp += (angle * 180 / Math.PI);
            this.angleRotated += (angle * 180 / Math.PI);
            if (this.angleRotated > 359) this.angleRotated = this.angleRotated - 359;
            if (this.angleRotated < 0) {
                this.angleRotated = 360 + this.angleRotated;
            }
            //this.managerCasas.setAngleRotated(this.angleRotated);
            this.setState({angleRotated: this.angleRotated});
            this.rotarSunPathCardinal(this.angleRotated);
            /*this.cardinalPointsCircle.rotateZ(angle);
            this.sunPath.rotateY(angle);
            this.light.target.position.set(0,0,0);*/
        }
    }

    onMouseUp(event) {
        event.preventDefault();
        let rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / (rect.width)) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / (rect.height)) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camara);

        //seleccion construccion de pared
        if (this.props.acciones.agregar_bloque) {
            //click derecho
            if (event.button === 0) {
                //this.managerCasas.agregarHabitacionDibujada();
                /*if(this.coordenadasRotadas){
                    //BalanceEnergetico.calcularGammaParedes(this.paredes, this.cardinalPointsCircle, this.circlePoints);
                }*/
                //this.handleChangeCasa();
                let posicionBloque = this.bloqueDibujo.position;
                let bloque = this.datosBloque(this.bloqueDibujo);
                let nivel;
                let object = this.intersectStart.object;
                if (object.parent.name === 'bloque') {
                    nivel = object.parent.parent.userData.nivel + 1;
                } else {
                    nivel = 0
                }
                this.props.thunk_agregar_bloque(bloque, nivel);
                clearThree(this.bloqueDibujo);
                this.construyendo = false;

            }
        }//seleccion construccion de ventana
        else if (this.props.acciones.agregar_ventana || this.props.acciones.agregar_puerta) {
            //click derecho
            if (event.button === 0) {
                let object = this.paredIntersect;
                let bloque = object.parent.userData.bloque;
                let nivel = object.parent.parent.userData.nivel;
                let pared = object.userData.pared;
                if (this.props.acciones.agregar_ventana) {
                    let ventana = this.datosVentana(this.ventanaDibujo);
                    this.props.thunk_agregar_ventana(bloque, nivel, pared, ventana);
                    clearThree(this.ventanaDibujo);
                } else {
                    let puerta = this.datosPuerta(this.puertaDibujo);
                    this.props.thunk_agregar_puerta(bloque, nivel, pared, puerta);
                    clearThree(this.puertaDibujo);
                }


                this.construyendo = false;

            }
        }

        if (this.dragging && this.props.acciones.rotar) {
            this.dragging = false;
            //TODO: cambiar la accion de rotar para que modifique el estado y recualcule lo que sea necezsario
            /*for(let pared of this.paredes){
                let resultAngle = pared.userData.gamma + this.angleRotatedTemp;
                if(resultAngle > 180){
                    do{
                        resultAngle = resultAngle - 360;
                    }while(resultAngle > 180);

                }
                else if(resultAngle <= -180){
                    do{
                        resultAngle = resultAngle + 360;
                    }while(resultAngle <= -180);
                }
                pared.userData.gamma = resultAngle;
                for(let child of pared.children){
                    if(child.userData.tipo === Morfologia.tipos.VENTANA){
                        child.userData.orientacion.applyAxisAngle(new THREE.Vector3(0,1,0), -this.angleRotatedTemp * Math.PI / 180);
                    }
                }
            }*/
            this.setState({dragging: this.dragging});
            this.props.thunk_rotar_casa(this.angleRotated);
            this.angleRotatedTemp = 0;
            //if(this.paredes.length > 0) this.props.onParedesChanged(this.paredes);
            //if(this.ventanas.length > 0) this.props.onVentanasChanged(this.ventanas);
            //this.props.onRotationChanged();
            //this.coordenadasRotadas = true;
        }
    }

    datosBloque(bloque) {
        let posicionBloque = bloque.position;
        return {
            posicion: {x: posicionBloque.x, z: posicionBloque.z},
            dimensiones: bloque.userData.dimensiones,
            paredes: this.datosPared(bloque.getObjectByName('paredes')),
            piso: {
                tipo: Tipos.PISO,
                superficie: bloque.userData.dimensiones.ancho * bloque.userData.dimensiones.largo,
                id: uuidv4(),
                capas: [
                    {
                        material: 10,
                        tipo: null,
                        propiedad: 0,
                        //conductividad: this.info_material[2].propiedades[0].conductividad,
                        espesor: 0.1
                    },
                    {
                        material: 15,
                        tipo: 0,
                        propiedad: 0,
                        //conductividad: this.info_material[11].tipos[2].propiedades[0].conductividad,
                        espesor: 0.2
                    }
                ],
                separacion: 0,
            },
            techo: {
                tipo: Tipos.TECHO,
                superficie: bloque.userData.dimensiones.ancho * bloque.userData.dimensiones.largo,
                id: uuidv4(),
                capas: [
                    {
                        material: 10,
                        tipo: null,
                        propiedad: 0,
                        //conductividad: this.info_material[2].propiedades[0].conductividad,
                        espesor: 0.1
                    },
                    {
                        material: 15,
                        tipo: 0,
                        propiedad: 0,
                        //conductividad: this.info_material[11].tipos[2].propiedades[0].conductividad,
                        espesor: 0.2
                    }
                ],
                separacion: 0,
            }

        };
    }

    datosVentana(ventana) {
        let pos = new THREE.Vector3();
        ventana.getWorldPosition(pos);
        return {
            id: uuidv4(),
            tipo: Tipos.VENTANA,
            dimensiones: ventana.userData.dimensiones,
            superficie: ventana.userData.dimensiones.ancho*ventana.userData.dimensiones.alto,
            posicion: ventana.userData.posicion,
            posicionReal : {
                x : pos.x,
                y: pos.y,
                z : pos.z,
            },
            material: {
                material: 0,
                tipo: 0,
                //fs: this.info_ventana[0].tipos[0].propiedad.FS,
                /*fsObjetivo: 0.87,
                //u: this.info_ventana[0].tipos[0].propiedad.U,
                uObjetivo: 5.8*/
            },
            marco: {
                material: 0,
                tipo: 0,
            },

        };

    }

    datosPuerta(puerta) {
        return {
            id: uuidv4(),
            tipo: Tipos.PUERTA,
            dimensiones: puerta.userData.dimensiones,
            superficie: puerta.userData.dimensiones.ancho*puerta.userData.dimensiones.alto,
            posicion: puerta.userData.posicion,
            separacion: 0,
            material: {
                material: 15,
                tipo: 4,
                propiedad: 0,
                //conductividad: this.info_material[1].propiedades[0].conductividad,
                espesor: 0.1,
            }
        };
    }

    datosPared(paredes) {
        let paredesInfo = [];
        for (let pared of paredes.children) {
            let posicion = pared.position;
            let paredInfo = {
                id: uuidv4(),
                tipo: Tipos.PARED,
                ventanas: [],
                puertas: [],
                separacion: 0,
                superficie: pared.userData.superficie,
                orientacion: pared.userData.orientacion,
                posicion: {x: posicion.x, y: posicion.y, z: posicion.z},
                dimensiones: pared.userData.dimensiones,
                capas: [
                    {
                        material: 10,
                        tipo: null,
                        propiedad: 0,
                        //conductividad: this.info_material[2].propiedades[0].conductividad,
                        espesor: 0.1
                    },
                    {
                        material: 15,
                        tipo: 0,
                        propiedad: 0,
                        //conductividad: this.info_material[11].tipos[2].propiedades[0].conductividad,
                        espesor: 0.2
                    }
                ],
            };
            paredesInfo.push(paredInfo);
        }
        return paredesInfo;
    }

    changeColorSeleccion(elemento) {
        switch (elemento.userData.tipo) {
            case  Tipos.PARED:
                elemento.material = materiales.materialPared.clone();
                break;
            case  Tipos.VENTANA:
                elemento.material = materiales.materialVentana.clone();
                break;
            case Tipos.PUERTA:
                elemento.material = materiales.materialPuerta.clone();
                break;
            case Tipos.PISO:
                elemento.material = materiales.materialPiso.clone();
                break;
            case Tipos.TECHO:
                elemento.material = materiales.materialTecho.clone();
                break;
            default:
                break;
        }
    }

    transformDegreeToGamma(degree) {
        if (degree > 270 && degree <= 360) degree = 180 - degree;
        else degree -= 90;
        return degree;
    }

    transformGammaToDegree(gamma) {
        if (gamma < -90) gamma += 450;
        else gamma += 90;
        return gamma;
    }

    handleChangeCasa() {
        let casa = this.managerCasas.getCasa();
        this.props.onCasaChanged(
            casa.userData.aporteInterno,
            casa.userData.perdidaVentilacion,
            casa.userData.perdidaVentilacionObjetivo,
            casa.userData.perdidaPorConduccion,
            casa.userData.perdidaPorConduccionObjetivo,
            casa.userData.volumen,
            casa.userData.area,
        );
    }

    onClick(event) {
        event.preventDefault();

        if (this.props.acciones.eliminar) {
            this.handleBorrado();
        }

        if (this.props.acciones.seleccionar) {
            this.handleSeleccionado(event);

        }
    }

    handleSeleccionadoChange(){
        let seleccionado = this.props.seleccionado;

        if (this.objSeleccionado[0] !== null) {
            for(let select of this.objSeleccionado){
                this.changeColorSeleccion(select);
            }
        }
        this.objSeleccionado.splice(0,this.objSeleccionado.length);
        if(seleccionado[0] !== null){
            for(let select of seleccionado){
                let obj;
                switch (select.tipo) {
                    case Tipos.PARED:
                        obj = this.paredes[select.indice_arreglo];
                        break;
                    case Tipos.VENTANA:
                        obj= this.ventanas[select.indice_arreglo];
                        break;
                    case Tipos.PUERTA:
                        obj= this.puertas[select.indice_arreglo];
                        break;
                    case Tipos.PISO:
                        obj= this.pisos[select.indice_arreglo];
                        break;
                    case Tipos.TECHO:
                        obj= this.techos[select.indice_arreglo];
                        break;
                }
                this.objSeleccionado.push(obj);
                obj.material = materiales.materialSeleccionado;
            }
        }else{
            this.objSeleccionado = [];
        }

    }

    handleSeleccionado(event) {

        if (!this.apuntaSel) {
            /*if (this.objSeleccionado !== null) {
                this.changeColorSeleccion(this.objSeleccionado);
            }*/
            if (this.objApuntadoMouse !== null) {
                //this.objSeleccionado = this.objApuntadoMouse;
                //this.objSeleccionado.material = materiales.materialSeleccionado;
                let bloque, nivel, pared, ventana, puerta;
                let indices, indice_arreglo;
                switch (this.objApuntadoMouse.userData.tipo) {
                    case  Tipos.PARED:
                        bloque = this.objApuntadoMouse.parent.userData.bloque;
                        nivel = this.objApuntadoMouse.parent.parent.userData.nivel;
                        pared = this.objApuntadoMouse.userData.pared;
                        indices = {bloque: bloque, nivel: nivel, pared: pared};
                        indice_arreglo = this.paredes.indexOf(this.objApuntadoMouse);
                        break;
                    case  Tipos.VENTANA:
                        bloque = this.objApuntadoMouse.parent.parent.userData.bloque;
                        nivel = this.objApuntadoMouse.parent.parent.parent.userData.nivel;
                        pared = this.objApuntadoMouse.parent.userData.pared;
                        ventana = this.objApuntadoMouse.userData.ventana;
                        indices = {bloque: bloque, nivel: nivel, pared: pared, ventana: ventana};
                        indice_arreglo = this.ventanas.indexOf(this.objApuntadoMouse);
                        break;
                    case Tipos.PUERTA:
                        bloque = this.objApuntadoMouse.parent.parent.userData.bloque;
                        nivel = this.objApuntadoMouse.parent.parent.parent.userData.nivel;
                        pared = this.objApuntadoMouse.parent.userData.pared;
                        puerta = this.objApuntadoMouse.userData.puerta;
                        indices = {bloque: bloque, nivel: nivel, pared: pared, puerta: puerta};
                        indice_arreglo = this.puertas.indexOf(this.objApuntadoMouse);
                        break;
                    case Tipos.PISO:
                        bloque = this.objApuntadoMouse.parent.userData.bloque;
                        nivel = this.objApuntadoMouse.parent.parent.userData.nivel;
                        indices = {bloque: bloque, nivel: nivel};
                        indice_arreglo = this.pisos.indexOf(this.objApuntadoMouse);
                        break;
                    case Tipos.TECHO:
                        bloque = this.objApuntadoMouse.parent.userData.bloque;
                        nivel = this.objApuntadoMouse.parent.parent.userData.nivel;
                        indices = {bloque: bloque, nivel: nivel};
                        indice_arreglo = this.techos.indexOf(this.objApuntadoMouse);
                        break;
                    default:
                        break;
                }
                let elemento = {
                    indices: indices,
                    tipo: this.objApuntadoMouse.userData.tipo,
                    indice_arreglo: indice_arreglo,
                };
                if(event.ctrlKey){
                    if(elemento.tipo === this.objSeleccionado[0].userData.tipo){
                        this.props.seleccionarMorfologia(elemento, true);
                    }else {
                        this.props.seleccionarMorfologia(elemento, false);
                    }
                }else{
                    this.props.seleccionarMorfologia(elemento, false);
                }
                this.objApuntadoMouse = null;
            } else {
                this.props.seleccionarMorfologia(null, false);
            }
        }
    }

    handleBorrado() {
        if (this.objApuntadoMouse !== null) {
            let bloque, nivel, pared, ventana, puerta;
            switch (this.objApuntadoMouse.userData.tipo) {
                case  Tipos.PARED:
                    bloque = this.objApuntadoMouse.parent.userData.bloque;
                    nivel = this.objApuntadoMouse.parent.parent.userData.nivel;
                    this.props.thunk_borrar_bloque(nivel, bloque);
                    break;
                case  Tipos.VENTANA:
                    bloque = this.objApuntadoMouse.parent.parent.userData.bloque;
                    nivel = this.objApuntadoMouse.parent.parent.parent.userData.nivel;
                    pared = this.objApuntadoMouse.parent.userData.pared;
                    ventana = this.objApuntadoMouse.userData.ventana;
                    this.props.thunk_borrar_ventana(ventana, nivel, bloque, pared);
                    break;
                case Tipos.PUERTA:
                    bloque = this.objApuntadoMouse.parent.parent.userData.bloque;
                    nivel = this.objApuntadoMouse.parent.parent.parent.userData.nivel;
                    pared = this.objApuntadoMouse.parent.userData.pared;
                    puerta = this.objApuntadoMouse.userData.puerta;
                    this.props.thunk_borrar_puerta(puerta, nivel, bloque, pared);
                    break;
                case Tipos.PISO:
                    bloque = this.objApuntadoMouse.parent.userData.bloque;
                    nivel = this.objApuntadoMouse.parent.parent.userData.nivel;
                    this.props.thunk_borrar_bloque(nivel, bloque);
                    break;
                case Tipos.TECHO:
                    bloque = this.objApuntadoMouse.parent.userData.bloque;
                    nivel = this.objApuntadoMouse.parent.parent.userData.nivel;
                    this.props.thunk_borrar_bloque(nivel, bloque);
                    break;
                default:
                    break;
            }
            this.objApuntadoMouse = null;
        }

    }

    render() {
        let text = '';
        if (this.props.acciones.seleccionar) text = Morfologia.texto_accion.seleccionar;
        else if (this.props.acciones.rotar) {
            if (this.state.dragging) {
                text = 'Angulo rotado: ' + Math.round(this.state.angleRotated) + '° ';
            } else {
                text = Morfologia.texto_accion.rotar;
            }

        } else if (this.props.acciones.eliminar) text = Morfologia.texto_accion.borrar;
        else if (this.props.acciones.agregar_bloque) text = Morfologia.texto_accion.bloque_paredes;
        else if (this.props.acciones.agregar_ventana) text = Morfologia.texto_accion.ventanas;
        else if (this.props.acciones.agregar_puerta) text = Morfologia.texto_accion.puertas;
        else if (this.props.acciones.mover_camara) text = Morfologia.texto_accion.mover_camara;
        return (
            <div style={{height: this.props.height}}>
                <div style={{height: 5,
                    backgroundImage: 'linear-gradient(to bottom, rgba(128,128,128,1),rgba(128,128,128,0.9))'
                }}
                    //tabIndex="0"
                     onMouseDown={this.onMouseDown}
                     onMouseUp={this.onMouseUp}
                     onMouseMove={this.onMouseMove}
                     onClick={this.onClick}
                     ref={(mount) => {
                         this.mount = mount
                     }}
                />
                <Typography style={{
                    fontSize: 'x-small',
                    zIndex: 0,
                    position: 'relative',
                    color: this.colorSelected[1],
                    backgroundImage: 'linear-gradient(to bottom, rgba(128,128,128,0.5),rgba(128,128,128,0.5))',
                }}
                            align={"center"}
                            variant={"button"}>
                    Rotar camara: Arrastrar click derecho
                    <br/>{text}
                </Typography>
                {/*<TextoAccion
                    seleccionando={this.props.acciones.seleccionar}
                    rotando={this.props.acciones.rotar}
                    dragging={this.state.dragging}
                    angleRotated={this.state.angleRotated}
                    borrando={this.props.acciones.eliminar}
                    agregar_puerta={this.props.acciones.agregar_puerta}
                    agregar_ventana={this.props.acciones.agregar_ventana}
                    agregar_bloque={this.props.acciones.agregar_bloque}
                    mover_camara={this.props.acciones.mover_camara}

                />*/}
            </div>

        )
    }
}

function TextoAccion(props) {
    let text = '';
    let angulo = props.angleRotated;

    if (props.seleccionando) text = Morfologia.texto_accion.seleccionar;
    else if (props.rotando) {
        if (props.dragging) {
            text = 'Angulo rotado: ' + Math.round(angulo) + '° ';
        } else {
            text = Morfologia.texto_accion.rotar;
        }

    } else if (props.borrando) text = Morfologia.texto_accion.borrar;
    else if (props.agregar_bloque) text = Morfologia.texto_accion.bloque_paredes;
    else if (props.agregar_ventana) text = Morfologia.texto_accion.ventanas;
    else if (props.agregar_puerta) text = Morfologia.texto_accion.puertas;
    else if (props.mover_camara) text = Morfologia.texto_accion.mover_camara;
    return (
        <Typography style={{
            fontSize: 'x-small',
            zIndex: 0,
            position: 'relative',
        }}
                    align={"center"}
                    variant={"button"}
                    color={"contrastText"}>
            {text}
        </Typography>
    )
}

Morfologia.propTypes = {
    dibujando: PropTypes.number,
    click2D: PropTypes.bool,
    sunPosition: PropTypes.object,
    borrando: PropTypes.bool,
    seleccionando: PropTypes.bool,
    onSeleccionadoChanged: PropTypes.func,
    dimensiones: PropTypes.object,
    onCapaReady: PropTypes.func,
    onCasaPredefinidaChanged: PropTypes.func,

    casaPredefinidaSimple: PropTypes.func,
    casaPredefinidaDoble: PropTypes.func,
    casaPredefinidaSimpleDosPisos: PropTypes.func,
    casaPredefinidaDobleDosPisos: PropTypes.func,

    thunk_agregar_bloque: PropTypes.func,
    thunk_agregar_ventana: PropTypes.func,
    thunk_agregar_puerta: PropTypes.func,
    thunk_borrar_puerta: PropTypes.func,
    thunk_borrar_ventana: PropTypes.func,
    thunk_borrar_bloque: PropTypes.func,


};

Morfologia.tipos = {PARED: 0, VENTANA: 1, PUERTA: 2, TECHO: 3, PISO: 4,};
Morfologia.separacion = {EXTERIOR: 0, INTERIOR: 1};
Morfologia.aislacionPiso = {CORRIENTE: 0, MEDIO: 1, AISLADO: 2};
Morfologia.tipos_texto = {
    0: 'Pared',
    1: 'Ventana',
    2: 'Puerta',
    3: 'Techo',
    4: 'Piso',
};

Morfologia.texto_accion = {
    seleccionar: '\nseleccionar: click izquierdo en un elemento',
    rotar: '\nrotar coordenadas: arrastrar click izquierdo',
    borrar: '\neliminar: click izquierdo en un elemento',
    bloque_paredes: '\nAgregar bloque paredes: arrastrar click izquierdo desde punto inicio hasta punto final',
    ventanas: '\nAgregar ventanas: click izquierdo dentro de una pared',
    puertas: '\nAgregar puertas: click izquierdo dentro de una pared ',
    techos: '\nAgregar techos: Click izquierdo dentro de un bloque de paredes',
    mover_camara: '\nMover camara: arrastrar click izquierdo',
};

export default connect(mapStateToProps, mapDispatchToProps)(Morfologia);
