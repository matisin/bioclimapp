import React, {Component} from 'react';
import * as THREE from 'three';
import {connect} from "react-redux";
import Orbitcontrols from 'orbit-controls-es6';
import {MeshText2D, textAlign} from 'three-text2d';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Popper from '@material-ui/core/Popper';
import InfoObstruccion from './InfoObstruccion';
import {
    eliminarObstruccion,
    modificarObstrucion,
    seleccionarObstruccion,
    thunk_agregar_obstruccion,
    thunk_eliminar_obstruccion,
    actualizarObstruccionesApp, thunk_actualizar_obstrucciones_app
} from "../actions";
import {
    clearThree, crearGeometriaPared,
    crearMeshObstruccion,
    crearMeshPared, crearMeshPiso,
    crearMeshPuerta, crearMeshTecho,
    crearMeshVentana
} from "../Utils/dibujosMesh";
import {materialHovered, materialObstruccion, materialSeleccionObstruccion} from "../constants/materiales-threejs";
import * as Tipos from "../constants/morofologia-types";

const styles = theme => ({
    typography: {
        padding: theme.spacing.unit * 2,
    },
});

const mapStateToProps = state => {
    return{
        contexto: state.contexto,
        seleccion: state.app.seleccion_contexto,
        obstrucciones: state.contexto.present.obstrucciones,
        acciones: state.barra_herramientas_contexto.acciones,
        seleccionado: state.app.seleccion_contexto,
        morfologia: state.morfologia,

    }
};

const mapDispatchToProps = dispatch => {
    return {
        thunk_agregar_obstruccion: (obstruccion) => dispatch(thunk_agregar_obstruccion(obstruccion)),
        thunk_eliminar_obstruccion: (indice) => dispatch(thunk_eliminar_obstruccion(indice)),
        seleccionarObstruccion: (indice) => dispatch(seleccionarObstruccion(indice)),
        thunk_actualizar_obstrucciones_app : (obstrucciones) => dispatch(thunk_actualizar_obstrucciones_app(obstrucciones)),
    }
};

class Context extends Component {

    constructor(props) {
        super(props);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.handleRotation = this.handleRotation.bind(this);
        this.handleParamChange = this.handleParamChange.bind(this);
        this.resetObstrucciones = this.resetObstrucciones.bind(this);

        this.state = {
            height: props.height,
            width: props.width,
            anchorEl: null,
            open: false
        };
        this.dibujando = false;
        this.seleccionando = false;
        this.borrando = false;
        this.ventanas = [];
        let PW_N = new Map(); // p/w orientacion norte para calculo de FAV2
        this.PW_N = PW_N;
        this.dif = 0;
        PW_N.set(0, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
        PW_N.set(0.2, [0.89, 0.94, 0.97, 0.99, 0.99, 0.99, 1, 1, 1, 1]);
        PW_N.set(0.4, [0.75, 0.81, 0.89, 0.94, 0.96, 0.98, 0.99, 1, 1, 1]);
        PW_N.set(0.6, [0.64, 0.71, 0.81, 0.87, 0.91, 0.94, 0.99, 0.99, 1, 1]);
        PW_N.set(0.8, [0.57, 0.64, 0.74, 0.81, 0.86, 0.89, 0.96, 0.99, 1, 1]);
        PW_N.set(1, [0.53, 0.59, 0.7, 0.77, 0.82, 0.85, 0.95, 0.99, 1, 1]);
        PW_N.set(1.5, [0.49, 0.55, 0.65, 0.72, 0.78, 0.81, 0.9, 0.98, 0.99, 0.99]);
        PW_N.set(2, [0.44, 0.5, 0.62, 0.7, 0.76, 0.79, 0.92, 0.99, 1, 1]);
        PW_N.set(4, [0.35, 0.41, 0.53, 0.63, 0.7, 0.74, 0.87, 0.99, 1, 1]);
        PW_N.set(6, [0.3, 0.37, 0.49, 0.58, 0.67, 0.71, 0.85, 0.98, 0.99, 1]);
        PW_N.set(10, [0.26, 0.32, 0.44, 0.54, 0.63, 0.68, 0.83, 0.97, 0.99, 1]);
        let SW = [0.1, 0.2, 0.4, 0.6, 0.8, 1, 2, 4, 6, 8]; // s/w para calculo de FAV2
        this.SW = SW;
        let PW_EOS = new Map(); // p/w orientaciones este, oeste y sur para calculo de FAV2
        this.PW_EOS = PW_EOS;
        PW_EOS.set(0, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
        PW_EOS.set(0.2, [0.9, 0.94, 0.98, 0.99, 0.99, 1, 1, 1, 1, 1]);
        PW_EOS.set(0.4, [0.77, 0.83, 0.91, 0.95, 0.97, 0.99, 1, 1, 1, 1]);
        PW_EOS.set(0.6, [0.67, 0.74, 0.84, 0.9, 0.94, 0.97, 0.99, 1, 1, 1]);
        PW_EOS.set(0.8, [0.61, 0.68, 0.79, 0.86, 0.91, 0.95, 0.99, 1, 1, 1]);
        PW_EOS.set(1, [0.56, 0.63, 0.74, 0.82, 0.88, 0.92, 0.99, 1, 1, 1]);
        PW_EOS.set(1.5, [0.5, 0.57, 0.68, 0.76, 0.82, 0.86, 0.97, 0.99, 1, 1]);
        PW_EOS.set(2, [0.45, 0.53, 0.64, 0.73, 0.79, 0.84, 0.97, 0.99, 1, 1]);
        PW_EOS.set(4, [0.37, 0.45, 0.57, 0.67, 0.75, 0.8, 0.96, 0.99, 1, 1]);
        PW_EOS.set(6, [0.33, 0.41, 0.53, 0.63, 0.72, 0.77, 0.94, 0.99, 1, 1]);
        PW_EOS.set(10, [0.28, 0.35, 0.48, 0.59, 0.68, 0.73, 0.9, 0.99, 1, 1]);
        let LH_N = new Map(); // l/h orientacion norte para calculo de FAV1
        this.LH_N = LH_N;
        LH_N.set(0.5, [0.79, 0.87, 0.93]);
        LH_N.set(1, [0.57, 0.69, 0.81]);
        LH_N.set(1.5, [0.42, 0.55, 0.69]);
        LH_N.set(2, [0.33, 0.44, 0.59]);
        LH_N.set(3, [0.22, 0.32, 0.44]);
        let LH_EOS = new Map();
        this.LH_EOS = LH_EOS; // l/h orientacion oeste, este y sur para calculo de FAV1
        LH_EOS.set(0.5, [0.88, 0.93, 0.96]);
        LH_EOS.set(1, [0.74, 0.82, 0.89]);
        LH_EOS.set(1.5, [0.63, 0.73, 0.82]);
        LH_EOS.set(2, [0.54, 0.65, 0.76]);
        LH_EOS.set(3, [0.42, 0.52, 0.65]);
        this.DH = [0.2, 0.5, 1]; // d/h para calculo de FAV1
    }


    componentDidUpdate(prevProps, prevState, snapshot) {
        //Si se cerró el popper y se modificó alguna obstrucción entonces se debe volver a calcular el FAR
        if (prevState.open === true && this.state.open === false && this.ventanas != null) {
            this.calcularFAR(this.ventanas);
        }
        if (this.props.agregarContexto) {
            this.agregarContexto = true;
            this.seleccionando = false;
            this.borrando = false;
            let geometry = new THREE.BoxBufferGeometry(0.05, 2, 0.05);
            const material = new THREE.MeshBasicMaterial({color: '#433F81', opacity: 0.5, transparent: true});
            let obstruccionFantasma = new THREE.Mesh(geometry, material);
            obstruccionFantasma.visible = false;
            this.escena.add(obstruccionFantasma);
            this.obstruccionFantasma = obstruccionFantasma;
        }
        if (this.props.seleccionar) {
            this.seleccionando = true;
            this.agregarContexto = false;
            this.borrando = false;
        }
        if (this.props.borrarContexto) {
            this.seleccionando = true;
            this.agregarContexto = false;
            this.borrando = true;
        }
        if (this.ventanas !== this.props.ventanas && prevProps.ventanas !== this.props.ventanas) {
            this.ventanas = this.props.ventanas.slice();
            this.calcularFAR(this.ventanas);

        }
        if(this.props.contexto.present !== null && prevProps.contexto.present !== this.props.contexto.present){
            this.dibujarEstado();
        }

        if(this.props.seleccion !== prevProps.seleccion){
            this.handleSeleccionadoChange();
        }

        if (this.props.width !== prevProps.width || this.props.height !== prevProps.height) {
            if (this.props.width < prevProps.width) {
                this.dif = prevProps.width - this.props.width;
            }
            else {
                this.dif = 0;
            }
            this.renderer.setSize(this.props.width, this.props.height);
            this.escena.remove(this.camara);
            this.camara = new THREE.OrthographicCamera(this.props.width / -20, this.props.width / 20, this.props.height / 20, this.props.height / -20, 1, 2000);
            this.camara.position.set(0, 10, 0);
            this.camara.lookAt(new THREE.Vector3());
            this.camara.zoom = 0.8;
            this.camara.updateProjectionMatrix();
            this.escena.add(this.camara);
            this.control = new Orbitcontrols(this.camara, this.renderer.domElement);
            this.control.maxPolarAngle = 0;
            this.control.maxAzimuthAngle = 0;
            this.control.minAzimuthAngle = 0;
            this.control.enabled = true;
            this.control.enableKeys = true;
            this.renderer.render(this.escena, this.camara);
        }
        if (this.props.morfologia.present !== null && prevProps.morfologia.present !== this.props.morfologia.present) {
            this.dibujarEstadoMorf();
        }
    }

    handleSeleccionadoChange(){
        let seleccionado = this.props.seleccion;
        if(this.seleccionado != null){
            this.seleccionado.material = materialObstruccion;
        }
        if(seleccionado === null){
            this.seleccionado = null;
        }else{
            this.seleccionado = this.obstrucciones[seleccionado];
            this.seleccionado.material = materialSeleccionObstruccion;
        }

    }

    dibujarEstadoMorf() {

        let estadoCasa = this.props.morfologia.present.niveles;
        let rotacion = this.props.morfologia.present.rotacion;

        clearThree(this.casa);
        let nivelGroup;
        for (let nivel of estadoCasa) {
            for (let bloque of nivel.bloques) {
                let pisoMesh = crearMeshPiso(bloque.dimensiones.ancho, bloque.dimensiones.largo);
                pisoMesh.position.set(
                    bloque.posicion.x,
                    0.01,
                    bloque.posicion.z
                );
                this.casa.add(pisoMesh);

            }

        }
        this.casa.rotation.y = (Math.PI / 180) * rotacion   ;
    }

    dibujarEstado(){
        this.obstrucciones = [];
        clearThree(this.obstruccionesGroup);
        let estadoObstruccinoes = this.props.contexto.present.obstrucciones;
        let meshObstruccion;
        for(let obstruccion of estadoObstruccinoes){
            meshObstruccion = crearMeshObstruccion(obstruccion.longitud,obstruccion.altura,obstruccion.rotacion);
            meshObstruccion.position.set(obstruccion.posicion.x,0.01,obstruccion.posicion.z);
            meshObstruccion.rotation.z = obstruccion.rotacion;
            let indice = estadoObstruccinoes.indexOf(obstruccion);

            meshObstruccion.userData.info ={
                longitud: obstruccion.longitud,
                altura: obstruccion.altura,
                posicion: {
                    x: obstruccion.posicion.x,
                    z: obstruccion.posicion.z,
                },
                rotacion: obstruccion.rotacion,
                indice: indice,
            };
            meshObstruccion.userData.indice = indice;

            if(indice === this.props.seleccion){
                this.seleccionado = meshObstruccion;
                meshObstruccion.material = materialSeleccionObstruccion;
                //POPER ACA.
            }
            meshObstruccion.updateMatrixWorld();

            this.obstrucciones.push(meshObstruccion);
            this.obstruccionesGroup.add(meshObstruccion);
        }
        this.props.thunk_actualizar_obstrucciones_app(this.obstrucciones);
    }

    componentDidMount() {
        this.props.onRef(this);
        const width = this.state.width;
        const height = this.state.height;
        this.mouse = new THREE.Vector2();
        //arreglo de objetos de obstruccion
        this.obstrucciones = [];
        //Hay que cargar this.escena, this.camara, y renderer,
        //this.escena
        this.escena = new THREE.Scene();
        this.escena.background = new THREE.Color(0xf0f0f0);

        //Renderer
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.shadowMap.enabled = true;
        this.renderer.setClearColor('#F0F0F0');
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // // 2D camara
        this.camara = new THREE.OrthographicCamera(width / -20, width / 20, height / 20, height / -20, 1, 2000);
        this.camara.position.set(0, 10, 0);
        this.camara.lookAt(new THREE.Vector3());
        this.camara.zoom = 0.8;
        this.camara.updateProjectionMatrix();
        this.escena.add(this.camara);
        //controles de camara
        this.control = new Orbitcontrols(this.camara, this.renderer.domElement);
        this.control.maxPolarAngle = 0;
        this.control.maxAzimuthAngle = 0;
        this.control.minAzimuthAngle = 0;
        this.control.enabled = true;
        this.control.enableKeys = true;

        //Plano
        let planoGeometria = new THREE.PlaneBufferGeometry(150, 150);
        planoGeometria.rotateX(-Math.PI / 2);
        this.plano = new THREE.Mesh(planoGeometria, new THREE.MeshBasicMaterial({visible: true}));
        this.escena.add(this.plano);

        //Grid del plano
        let gridHelper = new THREE.GridHelper(150, 150, 0xCCCCCC, 0xCCCCCC);
        this.escena.add(gridHelper);

        //Indicador de puntos cardinales
        let curve = new THREE.EllipseCurve(
            0, 0,            // ax, aY
            50, 50,           // xRadius, yRadius
            0, 2 * Math.PI,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        );
        let points = curve.getPoints(359);
        let circleGeometry = new THREE.BufferGeometry().setFromPoints(points);
        let circleMaterial = new THREE.LineBasicMaterial({color: 0xCCCCCC});
        this.cardinalPointsCircle = new THREE.Line(circleGeometry, circleMaterial);
        //Circulo de puntos cardinales con letras
        this.cardinalPointsCircle.rotateX(-Math.PI / 2);
        this.cardinalPointsCircle.position.set(0, 0.001, 0);
        this.cardinalPointsCircle.name = "cardinalPointsCircle";
        this.escena.add(this.cardinalPointsCircle);
        let sprite = new MeshText2D("S", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '#000000',
            antialias: false
        });
        sprite.scale.setX(0.1);
        sprite.scale.setY(0.1);
        sprite.position.set(0, 0.3, 50);
        sprite.rotateX(-Math.PI / 2);
        this.escena.add(sprite);
        sprite = new MeshText2D("N", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '#000000',
            antialias: false
        });
        sprite.scale.setX(0.1);
        sprite.scale.setY(0.1);
        sprite.position.set(0, 0.3, -50);
        sprite.rotateX(-Math.PI / 2);
        this.escena.add(sprite);
        sprite = new MeshText2D("E", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '#000000',
            antialias: false
        });
        sprite.scale.setX(0.1);
        sprite.scale.setY(0.1);
        sprite.position.set(50, 0.3, 0);
        sprite.rotateX(-Math.PI / 2);
        this.escena.add(sprite);
        sprite = new MeshText2D("O", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '#000000',
            antialias: false
        });
        sprite.scale.setX(0.1);
        sprite.scale.setY(0.1);
        sprite.position.set(-50, 0.3, 0);
        sprite.rotateX(-Math.PI / 2);
        this.escena.add(sprite);
        //caja que representa la casa al centro del plano

        let vertices = [
            new THREE.Vector2(-1,-0.7),
            new THREE.Vector2(-1.3,-0.7),
            new THREE.Vector2(0,-2),
            new THREE.Vector2(1.3,-0.7),
            new THREE.Vector2(1,-0.7),
            new THREE.Vector2(1,-1),
            new THREE.Vector2(1,1),
            new THREE.Vector2(-1,1),

        ];
        let shape = new THREE.Shape(vertices);
        vertices = [
            new THREE.Vector2(-0.3,-0.2),
            new THREE.Vector2(0.3,-0.2),
            new THREE.Vector2(0.3,1),
            new THREE.Vector2(-0.3,1),
            new THREE.Vector2(-0.3, -0.2)
        ];
        shape.holes = [new THREE.Path(vertices)];
        let geometria = new THREE.ShapeBufferGeometry(shape);
        geometria.rotateX(Math.PI/2);
        var mesh = new THREE.Mesh( geometria, new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.DoubleSide}) );
        mesh.position.set(0,0.1,0);
        this.escena.add(mesh);

        const light = new THREE.AmbientLight(0x404040, 100); // soft white light
        this.escena.add(light);

        this.obstruccionesGroup = new THREE.Group();
        this.escena.add(this.obstruccionesGroup);
        this.dibujarEstado();

        this.obstruccionDibujo = new THREE.Group();
        this.escena.add(this.obstruccionDibujo);

        let arrows = new THREE.Group();
        arrows.name = 'flechas';
        this.escena.add(arrows);

        this.casa = new THREE.Group();
        this.escena.add(this.casa);

        this.selectedObstruction = null;
        this.hoveredObstruction = null;
        this.hoveredSelected = false;

        this.mount.appendChild(this.renderer.domElement);
        this.start();
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
        this.stop();
        this.mount.removeChild(this.renderer.domElement)
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
        this.renderer.render(this.escena, this.camara)
    }

    onMouseMove(event) {
        event.preventDefault();
        if (document.getElementById("text")) {
            var text = document.getElementById("text");
            text.parentNode.removeChild(text);
        }
        let rect = this.renderer.domElement.getBoundingClientRect();
        let mouse = this.mouse;
        this.raycasterMouse = new THREE.Raycaster();
        mouse.x = ((event.clientX - rect.left) / (rect.width)) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / (rect.height)) * 2 + 1;
        this.raycasterMouse.setFromCamera(mouse, this.camara);
        let intersections = this.raycasterMouse.intersectObject(this.plano);
        let point = {x: 0, y: 0};
        if (intersections.length > 0) {
            point = {x: intersections[0].point.x, y: -intersections[0].point.z}
        }
        this.mouse = mouse;
        this.mousePoint = point; // Coordenadas del mouse en el world pero 2D x: eje x, y: -eje z
        //elemento HTML que indica las coordenadas en el plano
        let text2 = document.createElement('div');
        text2.setAttribute("id", "text");
        text2.style.position = 'absolute';
        text2.style.width = 100;
        text2.style.height = 100;
        text2.style.backgroundColor = "#f0f0f0";
        text2.innerHTML = Math.round(point.x) + "," + Math.round(point.y);
        text2.style.top = (event.clientY - 60 ) + 'px';
        text2.style.left = (event.clientX + 20 + (window.innerWidth - this.dif) - this.dif) + 'px';
        this.mount.parentNode.insertBefore(text2, this.mount);

        if (this.props.acciones.agregar) {
            if(this.dibujando){
                this.obstruccionDibujado();
            }

            //this.nuevaObstruccion();
        }
        if (this.props.acciones.seleccionar || this.props.acciones.eliminar) {
            this.onHoverObstruction();
        }
    }

    onClick(event) {
        if (this.props.acciones.seleccionar) {
            this.onSelectObstruction(event.clientX, event.clientY);
        }
        if (this.props.acciones.eliminar) {
            this.onDeleteObstruction();
        }
    }

    onMouseDown(event) {
        if (this.props.acciones.agregar && event.button === 0) {
            this.construyendo = true;
            this.dibujando = true;
            this.puntoInicial = new THREE.Vector3(Math.round(this.mousePoint.x), 0,
                -Math.round(this.mousePoint.y));
            console.log(this.mousePoint.y);
        }
    }

    onMouseUp(event) {
        if (this.props.acciones.agregar) {
            if(this.dibujando){
                this.dibujando = false;
                this.props.thunk_agregar_obstruccion(this.obstruccionDibujo.userData.info);
                clearThree(this.obstruccionDibujo);

            }
            /*let material = new THREE.MeshBasicMaterial({color: 0x000000});
            let obstruccion = this.obstruccionFantasma.clone();
            obstruccion.material = material;
            obstruccion.ventanas = [];
            obstruccion.userData.altura = obstruccion.geometry.parameters.height;
            this.obstrucciones.push(obstruccion);
            this.escena.add(obstruccion);
            this.crearTextoObstruccion(obstruccion);
            this.obstruccionFantasma.visible = false;
            this.dibujando = false;
            this.calcularFAR(this.ventanas);*/
        }
    }

    onMouseLeave(event) {
        if (document.getElementById("text")) {
            var text = document.getElementById("text");
            text.parentNode.removeChild(text);
        }
    }

    onHoverObstruction() {
        this.intersections = this.raycasterMouse.intersectObjects(this.obstrucciones);
        if (this.intersections.length > 0) {
            if (this.intersections[0].object !== this.hoveredObstruction) {
                if(this.intersections[0].object.userData.indice !== this.props.seleccion){
                    this.hoveredObstruction = this.intersections[0].object;
                    this.hoveredObstruction.material = materialHovered;
                    this.hoveredSelected = false;
                }else{
                    this.hoveredSelected = true;
                }
            }
        }
        else {
            this.hoveredSelected = false;
            if (this.hoveredObstruction !== null) {

                this.hoveredObstruction.material = materialObstruccion;
                this.hoveredObstruction = null;
            }
        }
    }

    onSelectObstruction(x, y) {
        this.props.seleccionarObstruccion(null);
        if(this.hoveredObstruction !== null){
            this.setState({ popperCoords: {x: x, y: y}});
            this.props.seleccionarObstruccion(this.hoveredObstruction.userData.indice);
            this.hoveredObstruction = null;
        }else{
            if(!this.hoveredSelected){
                this.props.seleccionarObstruccion(null);
            }else{
                this.props.seleccionarObstruccion(this.seleccion.userData.indice);
            }
        }
        /*
        if (this.intersections.length > 0) {
            if (this.selectedObstruction !== this.hoveredObstruction && this.selectedObstruction != null) {
                this.selectedObstruction.material = new THREE.MeshBasicMaterial({color: this.selectedObstruction.currentHex});
            }
            this.selectedObstruction = this.hoveredObstruction;
            this.setState({open: true, popperCoords: {x: x, y: y}});
        }
        else {
            this.selectedObstruction.material = new THREE.MeshBasicMaterial({color: this.selectedObstruction.currentHex});
            this.selectedObstruction = null;
            this.setState({open: false});
        }*/
    }

    onDeleteObstruction() {
        /*this.setState({open: false});
        this.escena.remove(this.selectedObstruction);
        let index = this.obstrucciones.indexOf(this.selectedObstruction);
        this.obstrucciones.splice(index, 1);*/

        let state = this.props.contexto.present;
        //let seleccion = state.seleccion;

        if(this.hoveredObstruction !== null){
            console.log(this.hoveredObstruction);
            this.props.thunk_eliminar_obstruccion(this.hoveredObstruction.userData.indice);
        }else{
            if(this.props.seleccion !== null && this.hoveredSelected){
                this.props.thunk_eliminar_obstruccion(this.seleccionado.userData.indice);
            }
        }
        this.hoveredObstruction = null;
        /*this.calcularFAR(this.ventanas);*/
    }

    onKeyDown(event) {

    }

    compareVectors(v1, v2) {
        if (v1 == null || v2 == null) return false;
        return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;

    }

    resetObstrucciones() {
        for (let obs of this.obstrucciones) {
            obs.ventanas = [];
        }
    }
/*
    calcularFarVentana(ventanaNueva) {

    }

    calcularFarObstrucciones(){
        for(let ventana of ventanas){
            let axisY = new THREE.Vector3(0, 1, 0);
            let raycasterFAR = new THREE.Raycaster();
            let orientacionVentana = ventana.
            let angleLeft = ventana.userData.orientacion.clone().applyAxisAngle(axisY, Math.PI / 4);
        }
    }*/


    calcularFAR(ventanas) {
        for (let obs of this.obstrucciones) {
            for (let vent of obs.ventanas) {
                vent.betaIndex = null;
                vent.betaAngle = null;
            }
        }
        for (let ventana of ventanas) {
            let axisY = new THREE.Vector3(0, 1, 0);
            let raycasterFAR = new THREE.Raycaster();
            let angleLeft = ventana.userData.orientacion.clone().applyAxisAngle(axisY, Math.PI / 4);
            let angle = angleLeft.clone();
            let obstruccionesVentana = [];
            let current = {};
            let pos = new THREE.Vector3();
            ventana.getWorldPosition(pos);
            for (let x = 0; x < 90; x++) {
                angle = angle.normalize();
                raycasterFAR.set(new THREE.Vector3(0,pos.y,0), angle);
                let intersections = raycasterFAR.intersectObjects(this.obstrucciones);
                let masAlto = {aDistance: 0};
                //para cada obstruccion en el angulo actual se obtiene su aDistance y su bDistance, además se almacena el más alto
                for (let i = 0; i < intersections.length; i++) {
                    if (intersections[i].distance > 50) {
                        intersections[i].object.fuera = true
                    }
                    /*let aDistance = intersections[i].object.userData.altura - pos.y;
                    let bDistance = ventana.userData.orientacion.clone().dot(intersections[i].object.position);*/
                    /*let far = Math.pow(0.2996, (aDistance / bDistance));*/
                    let ventanaObstruida = {
                        id: ventana.uuid,
                        orientacion: ventana.userData.orientacion,
                        aDistance: aDistance,
                        bDistance: bDistance,
                        far: far,
                    };
                    intersections[i].aDistance = aDistance;
                    let ventanaAgregada = intersections[i].object.ventanas.find(element => element.id === ventanaObstruida.id);
                    if (!ventanaAgregada) intersections[i].object.ventanas.push(ventanaObstruida);
                    else {
                        intersections[i].object.ventanas[intersections[i].object.ventanas.findIndex(elem => elem === ventanaAgregada)].aDistance = aDistance;
                        intersections[i].object.ventanas[intersections[i].object.ventanas.findIndex(elem => elem === ventanaAgregada)].bDistance = bDistance;
                        intersections[i].object.ventanas[intersections[i].object.ventanas.findIndex(elem => elem === ventanaAgregada)].far = far;
                    }
                    if (aDistance > masAlto.aDistance) {
                        masAlto = intersections[i];
                    }
                }
                //si no hay obstruccion en el angulo actual entonces pasamos al siguiente
                if (masAlto.point == null) {
                    angle.applyAxisAngle(axisY, -Math.PI / 180); //angulo + 1
                    continue;
                }
                //si cambiamos de obstruccion mas alta entonces se reinicia el start point
                if (masAlto.object !== current) {
                    current.startPoint = null;
                    current = masAlto.object;
                    //el beta index indica si hay un nuevo angulo que agregar a la obstruccion
                    let betaIndex = current.ventanas.find(ele => ele.id === ventana.uuid).betaIndex;
                    if (betaIndex == null) betaIndex = -1;
                    betaIndex += 1
                    current.ventanas.find(ele => ele.id === ventana.uuid).betaIndex = betaIndex;
                }
                //cuando se cambia de obstruccion se reinicia el startpoint,
                // entonces si ha sido reiniciado y volvemos a la misma obstruccion lo inicializamos de nuevo
                if (current.startPoint == null) {
                    current.startPoint = masAlto.point;
                }
                //se inicializa el arreglo de angulos beta
                let betaAngle = current.ventanas.find(ele => ele.id === ventana.uuid).betaAngle;
                let betaIndex = current.ventanas.find(ele => ele.id === ventana.uuid).betaIndex;
                if (betaAngle == null) betaAngle = [];
                betaAngle[betaIndex] = current.startPoint.angleTo(masAlto.point) * 180 / Math.PI;
                current.ventanas.find(ele => ele.id === ventana.uuid).betaAngle = betaAngle;
                //se agrega la obstruccion actual a las obstrucciones de la ventana si es que no ha sido agregada antes
                //además las obstrucciones de una ventana se pintan rojas
                if (!obstruccionesVentana.includes(current)) {
                    obstruccionesVentana.push(current);
                }

                //pasamos al siguiente angulo
                angle.applyAxisAngle(axisY, -Math.PI / 180);
            }
            //se calcula el far de la ventana en base a la formula
            ventana.userData.obstrucciones = obstruccionesVentana;
            let f1 = 1;
            let f2 = 0;
            for (let obs of ventana.userData.obstrucciones) {
                // Si la obstrucción está fuera del rango y tiene FAR > 0.95 no se considera
                if (obs.ventanas.find(element => element.id === ventana.uuid).far > 0.95 && obs.fuera) {
                    ventana.userData.obstrucciones.splice(ventana.userData.obstrucciones.indexOf(obs), 1);
                    obs.startPoint = null;
                    continue;
                }
                obs.startPoint = null; //reseteamos el punto de inicio de la obstruccion para futuros cálculos
                obs.material.color.setHex(0xff0000);
                obs.currentHex = 0xff0000;
                // if(ventana.userData.obstrucciones.length === 1 && obs.betaAngle.length > 1){
                //     console.log("beta angle", obs.betaAngle);
                //     obs.betaAngle = [obs.betaAngle[0]];
                // }
                for (let beta of obs.ventanas.find(element => element.id === ventana.uuid).betaAngle) {
                    f1 -= beta / 90;
                    f2 += obs.ventanas.find(element => element.id === ventana.uuid).far * beta / 90;
                }
            }
            ventana.userData.far = f1 + f2;
        }
        this.props.onFarChanged(ventanas);
    }

    obstruccionDibujado(){
        clearThree(this.obstruccionDibujo);
        let puntoActual = new THREE.Vector3(Math.round(this.mousePoint.x), 0,
            -Math.round(this.mousePoint.y));
        let dir = puntoActual.sub(this.puntoInicial);
        let largo = dir.length();
        largo = Math.round(largo );

        dir = dir.normalize().multiplyScalar(largo / 2);
        let pos = this.puntoInicial.clone().add(dir);
        let rotacion;
        if(dir.x > 0){
            rotacion = Math.atan2(-dir.z, dir.x);
        }else{
            rotacion = Math.atan2(dir.z, -dir.x);
        }

        let meshObstruccion = crearMeshObstruccion(largo,10,rotacion);
        meshObstruccion.position.set(pos.x, 0.01, pos.z);

        meshObstruccion.rotation.z = rotacion;
        this.obstruccionDibujo.add(meshObstruccion);
        this.obstruccionDibujo.userData.info = {
            longitud: largo,
            altura: 10,
            posicion: {
                x: pos.x,
                z: pos.z,
            },
            rotacion: rotacion,
        };

    }


    nuevaObstruccion() {
        let puntoActual = new THREE.Vector3(Math.round(this.mousePoint.x), 0,
            -Math.round(this.mousePoint.y));
        let dir = puntoActual.sub(this.puntoInicial);
        let largo = dir.length();
        this.obstruccionFantasma.geometry = new THREE.BoxBufferGeometry(largo, 3, 0.5);
        dir = dir.normalize().multiplyScalar(largo / 2);
        let pos = this.puntoInicial.clone().add(dir);
        this.obstruccionFantasma.position.set(pos.x, 0, pos.z);
        this.obstruccionFantasma.rotation.y = Math.atan2(-dir.z, dir.x);
        this.obstruccionFantasma.visible = true;
    }

    crearTextoObstruccion(obstruccion) {
        let sprite = new MeshText2D("alt: " + obstruccion.geometry.parameters.height + "   long: " + Math.round(obstruccion.geometry.parameters.width), {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '#000000',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(sprite.position.x, sprite.position.y, sprite.position.z + 1);
        sprite.rotateX(-Math.PI / 2);
        sprite.name = "info";
        obstruccion.add(sprite);
    }


    handleRotation(sentido) {
        if (sentido < 0) {
            this.selectedObstruction.rotateY(Math.PI / 180);
        }
        else {
            this.selectedObstruction.rotateY(-Math.PI / 180);
        }
        this.setState({
            selectedObstruction: this.selectedObstruction
        })
    }


    handleParamChange(name, value) {
        if (name === 'altura') {
            this.selectedObstruction.userData.altura = value;
            let sprite = this.selectedObstruction.getObjectByName("info");
            sprite.text = "alt: " + value + "   long: " + Math.round(this.selectedObstruction.geometry.parameters.width);
        }
        if (name === 'longitud') {
            this.selectedObstruction.geometry = new THREE.BoxBufferGeometry(value, this.selectedObstruction.geometry.parameters.height, 0.5);
            let sprite = this.selectedObstruction.getObjectByName("info");
            sprite.text = "alt: " + this.selectedObstruction.geometry.parameters.height + "   long: " + Math.round(value);
        }
        this.setState({
            selectedObstruction: this.selectedObstruction
        })

    }

    getFAV2(pw, sw, orientacion) {
        let pw_values = [0, 0.2, 0.4, 0.6, 0.8, 1, 1.5, 2, 4, 6, 10];
        let closest = pw_values.reduce(function (prev, curr) {
            return (Math.abs(curr - pw) < Math.abs(prev - pw) ? curr : prev);
        });
        if (orientacion.z > 0) { //orientacion norte
            return this.PW_N.get(closest)[this.SW.indexOf(sw)];
        }
        else {
            return this.PW_EOS.get(closest)[this.SW.indexOf(sw)];
        }
    }

    getFAV1(lh, dh, orientacion) {
        let lh_values = [0.5, 1, 1.5, 2, 3];
        let closest = lh_values.reduce(function (prev, curr) {
            return (Math.abs(curr - lh) < Math.abs(prev - lh) ? curr : prev);
        });
        if (orientacion.z > 0) { //orientacion norte
            return this.LH_N.get(closest)[this.DH.indexOf(sw)];
        }
        else {
            return this.LH_EOS.get(closest)[this.DH.indexOf(sw)];
        }
    }


    render() {
        const open = this.props.seleccion != null;
        const id = open ? 'simple-popper' : null;

        let divStyle = {
            position: 'absolute ',
            left: this.state.popperCoords != null ? (this.state.popperCoords.x + (window.innerWidth - this.dif) - this.dif) + 'px' : 0,
            top: this.state.popperCoords != null ? this.state.popperCoords.y + 'px' : 0,
            zIndex: 1
        };
        console.log(open);
        return (
            <div style={{height: this.props.height}}>
                <div
                    ref={(popper) => {
                        this.popper = popper
                    }}
                    style={divStyle}
                />

                <div
                    ref={(mount) => {
                        this.mount = mount
                    }}
                    onMouseMove={this.onMouseMove}
                    onClick={this.onClick}
                    onMouseDown={this.onMouseDown}
                    onMouseUp={this.onMouseUp}
                    onMouseLeave={this.onMouseLeave}
                    onKeyDown={this.onKeyDown}
                />
                <div style={divStyle}>
                    <Popper id={id} open={open} anchorEl={this.popper} style={{zIndex: 1}}>
                        <InfoObstruccion
                        />
                    </Popper>
                </div>

            </div>


        )
    }
}

Context.propTypes = {
    classes: PropTypes.object.isRequired,
    thunk_agregar_obstruccion: PropTypes.func,
    thunk_eliminar_obstruccion: PropTypes.func,
    seleccionarObstruccion: PropTypes.func,
};

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(Context));
