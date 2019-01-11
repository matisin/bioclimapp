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
    middleware_agregar_obstruccion,
    middleware_eliminar_obstruccion,
    middleware_actualizar_obstrucciones_app
} from "../actions";
import {
    clearThree,
    crearMeshObstruccion,
    crearMeshPiso,
} from "../Utils/dibujosMesh";
import {materialHovered, materialObstruccion, materialSeleccionObstruccion} from "../constants/materiales-threejs";

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
        middleware_agregar_obstruccion: (obstruccion) => dispatch(middleware_agregar_obstruccion(obstruccion)),
        middleware_eliminar_obstruccion: (indice) => dispatch(middleware_eliminar_obstruccion(indice)),
        seleccionarObstruccion: (indice) => dispatch(seleccionarObstruccion(indice)),
        middleware_actualizar_obstrucciones_app : (obstrucciones) => dispatch(middleware_actualizar_obstrucciones_app(obstrucciones)),
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
    }


    componentDidUpdate(prevProps, prevState, snapshot) {
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
        this.props.middleware_actualizar_obstrucciones_app(this.obstrucciones);
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
        let mesh = new THREE.Mesh( geometria, new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.DoubleSide}) );
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
            let text = document.getElementById("text");
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
                this.props.middleware_agregar_obstruccion(this.obstruccionDibujo.userData.info);
                clearThree(this.obstruccionDibujo);

            }
        }
    }

    onMouseLeave(event) {
        if (document.getElementById("text")) {
            let text = document.getElementById("text");
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
    }

    onDeleteObstruction() {
        let state = this.props.contexto.present;

        if(this.hoveredObstruction !== null){
            this.props.middleware_eliminar_obstruccion(this.hoveredObstruction.userData.indice);
        }else{
            if(this.props.seleccion !== null && this.hoveredSelected){
                this.props.middleware_eliminar_obstruccion(this.seleccionado.userData.indice);
            }
        }
        this.hoveredObstruction = null;
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

    render() {
        const open = this.props.seleccion != null;
        const id = open ? 'simple-popper' : null;

        let divStyle = {
            position: 'absolute ',
            left: this.state.popperCoords != null ? (this.state.popperCoords.x + (window.innerWidth - this.dif) - this.dif) + 'px' : 0,
            top: this.state.popperCoords != null ? this.state.popperCoords.y + 'px' : 0,
            zIndex: 1
        };
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
    middleware_agregar_obstruccion: PropTypes.func,
    middleware_eliminar_obstruccion: PropTypes.func,
    seleccionarObstruccion: PropTypes.func,
};

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(Context));
