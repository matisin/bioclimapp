import React, {Component} from 'react'
import {connect} from "react-redux";
import {
    casaPredefinidaDoble,
    casaPredefinidaDobleDosPisos,
    casaPredefinidaSimple,
    casaPredefinidaSimpleDosPisos,
    thunk_agregar_bloque,
} from '../actions/index';
import * as THREE from 'three'
import OrbitControls from 'orbit-controls-es6';
import {MeshText2D, textAlign} from 'three-text2d';
import PropTypes from "prop-types";
import * as BalanceEnergetico from '../Utils/BalanceEnergetico';
import axios from "axios";
import Typography from "@material-ui/core/Typography/Typography";

const mapStateToProps = state => {
    return {
        personas: state.variables_internas.personas,
        temperatura: state.variables_internas.temperatura,
        iluminacion:  state.variables_internas.iluminacion,
        aire: state.variables_internas.aire,
        morfologia: state.morfologia,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        casaPredefinidaSimple: () => dispatch(casaPredefinidaSimple()),
        casaPredefinidaDoble: () => dispatch(casaPredefinidaDoble()),
        casaPredefinidaSimpleDosPisos: () => dispatch(casaPredefinidaSimpleDosPisos()),
        casaPredefinidaDobleDosPisos: () => dispatch(casaPredefinidaDobleDosPisos()),
        thunk_agregar_bloque: (bloque, nivel) => dispatch(thunk_agregar_bloque(bloque, nivel)),

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

        this.temperaturasMes = [0,0,0,0,0,0,0,0,0,0,0,0];

        this.angleRotatedTemp = 0;
        this.angleRotated = 0;
        this.dragging = false;
        this.coordenadasRotadas = false;

        this.state  = {
            height: props.height,
            width: props.width,
            dragging : false,
            angleRotatedTemp : 0,
            angleRotated: 0,

        };

    };

    componentDidUpdate(prevProps) {
        if (this.props.sunPosition !== prevProps.sunPosition || (this.sunPath == null && this.props.sunPosition != null)) {
            this.onSunpositionChanged();
            if(this.props.fecha != null) this.getSunPath(this.props.fecha);
            else this.getSunPath();
        }
        /*if(this.props.sunPath !== prevProps.sunPath || (this.sunPath == null && this.props.sunPosition != null)){
            this.getSunPath();
        }*/
        if (this.props.click2D !== prevProps.click2D) {
            this.onPerspectiveChanged();
        }
        if(this.paredes !== this.props.paredes && this.props.paredes != null){
            this.paredes = this.props.paredes.slice();
        }
        if(this.props.comuna !== prevProps.comuna){
            this.onComunaChanged();
        }

        if(this.props.width !== prevProps.width || this.props.height !== prevProps.height ){
            this.renderer.setSize(this.props.width, this.props.height);
            this.camara.aspect = this.props.width / this.props.height;
            this.camara.updateProjectionMatrix();
            this.renderer.render(this.escena, this.camara);
        }
        if(this.props.morfologia.present !== null && prevProps.morfologia.present !== this.props.morfologia.present){
            //Se actualizo la morfologia.
            this.dibujarEstado();
        }
    }

    dibujarEstado(){
        this.paredes = [];
        this.pisos = [];
        this.techos = [];
        this.ventanas = [];
        this.puertas = [];
        this.superficies = [];
        this.superficies.push(this.plano);

        let estadoCasa = this.props.morfologia.present.niveles;

        this.clearThree(this.casa);
        let nivelGroup;
        for(let nivel of estadoCasa){
            nivelGroup = new THREE.Group();
            nivelGroup.userData.nivel = estadoCasa.indexOf(nivel);
            nivelGroup.position.set(0,nivel.altura,0);
            this.casa.add(nivelGroup);
            let bloqueGroup;
            for(let bloque of nivel.bloques){
                bloqueGroup = new THREE.Group();
                bloqueGroup.name='bloque';
                bloqueGroup.userData.bloque = nivel.bloques.indexOf(bloque);
                nivelGroup.add(bloqueGroup);
                bloqueGroup.position.set(
                    bloque.posicion.x,
                    0,
                    bloque.posicion.z
                );
                let paredMesh;
                for(let pared of bloque.paredes){
                    paredMesh = this.crearMeshPared(pared.dimensiones.ancho,pared.dimensiones.alto,[]);
                    paredMesh.userData.pared = bloque.paredes.indexOf(pared);
                    bloqueGroup.add(paredMesh);
                    paredMesh.position.set(pared.posicion.x,pared.posicion.y,pared.posicion.z);
                    if(pared.orientacion.z !== 0){
                        if(pared.orientacion.z !== -1){
                            paredMesh.rotation.y = Math.PI;
                        }
                    }else{
                        if(pared.orientacion.x !== -1){
                            paredMesh.rotation.y = -Math.PI / 2;
                        }else{
                            paredMesh.rotation.y = Math.PI / 2;
                        }
                    }

                    var holes = [];

                    for(let ventana of pared.ventanas){
                        let ventanaMesh = this.crearMeshVentana(ventana.dimensiones.ancho,ventana.dimensiones.alto);
                        ventanaMesh.userData.ventana = pared.ventanas.indexOf(ventana);
                        paredMesh.add(ventanaMesh);
                        ventanaMesh.position.set(ventana.posicion.x,ventana.posicion.y,0);

                        let points = ventanaMesh.geometry.parameters.shapes.extractPoints().shape;
                        for(let point of points){
                            point.x+=ventana.posicion.x;
                            point.y+=ventana.posicion.y;
                        }
                        holes.push(new THREE.Path(points));
                        this.ventanas.push(ventanaMesh);
                    }
                    for(let puerta of pared.puertas){
                        let puertaMesh = this.crearMeshPuerta(puerta.dimensiones.ancho,puerta.dimensiones.alto);
                        puertaMesh.userData.ventana = pared.puertas.indexOf(puerta);
                        paredMesh.add(puertaMesh);
                        puertaMesh.position.set(puerta.posicion.x,puerta.posicion.y,0);

                        let points = puertaMesh.geometry.parameters.shapes.extractPoints().shape;
                        for(let point of points){
                            point.x+=puerta.posicion.x;
                            point.y+=puerta.posicion.y;
                        }
                        holes.push(new THREE.Path(points));
                        this.puertas.push(puertaMesh);
                    }
                    paredMesh.geometry = this.crearGeometriaPared(pared.dimensiones.ancho,pared.dimensiones.alto,holes);
                    this.paredes.push(paredMesh);

                }
                let pisoMesh = this.crearMeshPiso(bloque.dimensiones.ancho,bloque.dimensiones.largo);
                bloqueGroup.add(pisoMesh);

                this.pisos.push(pisoMesh);

                if(bloque.techo){
                    let techoMesh = this.crearMeshTecho(bloque.dimensiones.ancho,bloque.dimensiones.largo,bloque.dimensiones.alto);
                    techoMesh.updateMatrixWorld();
                    techoMesh.updateMatrix();

                    bloqueGroup.add(techoMesh);
                    this.techos.push(techoMesh);
                    this.superficies.push(techoMesh);
                }

                nivelGroup.add(bloqueGroup);
            }
            this.casa.add(nivelGroup);
        }

    }

    bloqueDibujado(start, end, height, altura ){
        console.log(start,end,altura);

        this.clearThree(this.bloqueDibujo);

        /*if(start.x > end.x){
            let aux = start.x;
            start.x = end.x;
            end.x = aux;
        }
        if(start.z > end.z){
            let aux = start.z;
            start.z = end.z;
            end.z = aux;
        }*/


        let width = Math.abs(start.x - end.x), depth = Math.abs(start.z - end.z);
        let widths = [width, depth, width, depth];

        this.bloqueDibujo.userData.dimensiones = {
            alto: height,
            ancho: width,
            largo: depth,
        };

        console.log("widts",width);
        console.log("widths",widths);

        var dir = end.clone().sub(start);
        var len = dir.length();
        dir = dir.normalize().multiplyScalar(len * 0.5);
        let pos = start.clone().add(dir);

        console.log("pos",pos);

        this.bloqueDibujo.position.set(
            pos.x,
            altura,
            pos.z
        );

        let pared1 =  this.crearMeshPared(widths[0],height,[]);
        pared1.position.z = depth / 2;
        pared1.userData.orientacion = {x:0,y:0,z:-1};
        pared1.userData.superficie = widths[0]*height;
        pared1.userData.dimensiones = {
            ancho: widths[0],
            alto: height,
        };

        let pared2 = this.crearMeshPared(widths[1], height, []);
        pared2.position.x = width / 2;
        pared2.rotation.y = Math.PI / 2;
        pared2.userData.orientacion = {x:-1,y:0,z:0};
        pared2.userData.superficie = widths[1]*height;
        pared2.userData.dimensiones = {
            ancho: widths[1],
            alto: height,
        };


        let pared3 = this.crearMeshPared(widths[2], height, []);
        pared3.position.z = -depth / 2;
        pared3.rotation.y = Math.PI;
        pared3.userData.orientacion = {x:0,y:0,z:1};
        pared3.userData.superficie = widths[2]*height;
        pared3.userData.dimensiones = {
            ancho: widths[2],
            alto: height,
        };

        let pared4 = this.crearMeshPared(widths[3], height, []);
        pared4.position.x = -width / 2;
        pared4.rotation.y = -Math.PI / 2;
        pared4.userData.orientacion = {x:1,y:0,z:0};
        pared4.userData.superficie = widths[3]*height;
        pared4.userData.dimensiones = {
            ancho: widths[3],
            alto: height,
        };

        let piso = this.crearMeshPiso(width, depth);
        piso.name = 'piso';
        let techo = this.crearMeshTecho(width,depth,height);
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

    clearThree(obj){
        while(obj.children.length > 0){
            this.clearThree(obj.children[0]);
            obj.remove(obj.children[0]);
        }
        if(obj.geometry) obj.geometry.dispose();
        if(obj.material) obj.material.dispose();
        if(obj.texture) obj.texture.dispose();
    }

    onComunaChanged() {
        axios.get("https://bioclimapp.host/api/temperaturas/"+this.props.comuna.id)
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

        this.light.position.set(sunPos.x, (sunAlt.y-1), sunPos.z);

        this.sol.position.set(sunPos.x, sunAlt.y -1, sunPos.z);
    }

    handleSunPathClicked(sunPathClicked){
        let group = this.escena.getObjectByName("sunPath");
        if(sunPathClicked === true){
            if(group != null){
                this.escena.remove(group);
            }
        }
        else {
            this.escena.add(this.sunPath);
        }
    }

    getSunPath(now = new Date()){
        let sunPath = this.escena.getObjectByName("sunPath");
        if(sunPath != null){
            this.escena.remove(sunPath);
        }
        let allPoints= [];
        let start = new Date(now.getFullYear(), 0, 0);
        let diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        let oneDay = 1000 * 60 * 60 * 24;
        let today = Math.floor(diff / oneDay);
        let invierno = new Date(now.getFullYear(),5,21);
        let verano = new Date(now.getFullYear(),11,21);
        let diff_invierno = (invierno - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        let diff_verano = (verano - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        let day_invierno = Math.floor(diff_invierno / oneDay);
        let day_verano = Math.floor(diff_verano / oneDay);
        if(today < day_invierno){
            today = day_invierno + (day_invierno - today);
        }
        if(today > day_verano){
            today = day_verano + (day_verano - today);
        }
        let day = day_invierno;
        let group = new THREE.Group();
        group.name = "sunPath";
        for(let daySunPath of this.props.sunPath){
            let curvePoints = [];
            for(let sunPosition of daySunPath){
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
            if(day === today){
                let material = new THREE.LineBasicMaterial({color: 0x950714, linewidth: 5});
                let curveObject = new THREE.Line(geometry, material);
                curveObject.position.set(curveObject.position.x, curveObject.position.y + 0.1, curveObject.position.z -0.1);
                group.add(curveObject);
            }
            else{
                let material = new THREE.LineBasicMaterial({color: 0xfbeb90, linewidth: 5, transparent: true, opacity: 0.5 });
                let curveObject = new THREE.Line(geometry, material);
                group.add(curveObject);
            }
            day++;

        }
        group.add(this.sol);
        group.add(this.light);
        this.sunPath = group;
        this.escena.add(group);
    }

    onPerspectiveChanged() {
        if (this.props.click2D) {
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
        this.objSeleccionado = null;

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
        camara2D.updateProjectionMatrix ();
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
            PAN: THREE.MOUSE.RIGHT,
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
        let sizePlano = 30;
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
            color: '#3D7B00',
            side: THREE.DoubleSide,
        }));
        plano.receiveShadow = true;
        plano.castShadow = false;
        escena.add(plano);
        this.light.target = plano;
        this.plano = plano;
        this.superficies.push(this.plano);

        //Grid del plano
        let gridHelper = new THREE.GridHelper(sizePlano,sizePlano, 0xCCCCCC, 0xCCCCCC);
        gridHelper.material = new THREE.LineBasicMaterial( {
            color: 0xffffff,
            linewidth: 4,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin:  'round' //ignored by WebGLRenderer
        } );
        escena.add(gridHelper);
        gridHelper.position.y+=0.001;

        //Ejes x e y
        let lineMaterial = new THREE.LineBasicMaterial({
            color: 0x950714,
            linewidth: 6,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin:  'round' //ignored by WebGLRenderer
        });
        let lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
            new THREE.Vector3(-sizePlano/2,0.003,0),
            new THREE.Vector3(sizePlano/2,0.003,0),
        );
        let ejeX = new THREE.Line(lineGeometry, lineMaterial);
        let ejeY = ejeX.clone();
        ejeY.rotation.y = Math.PI / 2;
        this.escena.add(ejeX);
        this.escena.add(ejeY);

        //Indicador de puntos cardinales
        let curve = new THREE.EllipseCurve(
            0, 0,            // ax, aY
            15, 15,           // xRadius, yRadius
            0, 2 * Math.PI,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        );

        var points = curve.getPoints(360);
        var circleGeometry = new THREE.BufferGeometry().setFromPoints(points);
        var circleMaterial = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 4});
        var cardinalPointsCircle = new THREE.Line(circleGeometry, circleMaterial,);

        cardinalPointsCircle.rotateX(-Math.PI / 2);
        cardinalPointsCircle.position.set(0, 0.001, 0);
        cardinalPointsCircle.name = "cardinalPointsCircle";
        this.cardinalPointsCircle = cardinalPointsCircle;
        this.circlePoints = points;

        escena.add(cardinalPointsCircle);

        var sprite = new MeshText2D("S", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(0, -15, 0.0);
        cardinalPointsCircle.add(sprite);

        sprite = new MeshText2D("N", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(0, 16, 0.0);
        cardinalPointsCircle.add(sprite);
        sprite = new MeshText2D("E", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(15.5, 0.3, 0);
        cardinalPointsCircle.add(sprite);

        sprite = new MeshText2D("O", {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '0xCCCCCC',
            antialias: false
        });
        sprite.scale.setX(0.03);
        sprite.scale.setY(0.03);
        sprite.position.set(-15.5, 0.3, 0);
        cardinalPointsCircle.add(sprite);

        //Indicador para dibujar bloques
        const geomeIndPared = new THREE.CylinderBufferGeometry(0.05, 0.05, 5, 32);
        const materialIndPared = new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.5, transparent: true});
        var indicadorPared = new THREE.Mesh(geomeIndPared, materialIndPared);
        indicadorPared.visible = false;
        escena.add(indicadorPared);

        //Materiales
        this.materialIndicador = new THREE.MeshBasicMaterial({
            color: '#433F81',
            opacity: 0.7,
            transparent: true,
            side : THREE.DoubleSide,
        });


        this.materialSeleccionado = new THREE.MeshLambertMaterial({
            color: '#FF0000',
            opacity: 0.7,
            transparent: true,
            side : THREE.DoubleSide,

        });

        var light = new THREE.AmbientLight(0x404040); // soft white light
        escena.add(light);

        //raycaster, usado para apuntar objetos
        var raycaster = new THREE.Raycaster();
        raycaster.linePrecision = 1;
        this.raycaster = raycaster;

        this.construyendo = false;

        this.indicador_dibujado = this.crearIndicadorConstruccionPared(this.heightWall, 0.05);
        escena.add(this.indicador_dibujado);
        this.casa = new THREE.Group();
        escena.add(this.casa);
        this.mount.appendChild(this.renderer.domElement);
        this.setMateriales();
        this.start();

        this.bloqueDibujo = new THREE.Group();
        this.escena.add(this.bloqueDibujo);
    }

    setMateriales(){
        //Materiales
        this.materialParedConstruccion = new THREE.MeshBasicMaterial({
            color: '#eaedc7',
            opacity: 0.7,
            transparent: true,
            side: THREE.DoubleSide,
        });

        this.materialPisoConstruccion = new THREE.MeshBasicMaterial({
            color: '#a1d1ee',
            opacity: 0.7,
            transparent: true,
            side: THREE.DoubleSide,
        });

        this.materialTechoConstruido = new THREE.MeshBasicMaterial({
            color: '#3d8179',
            opacity: 0.7,
            transparent: true,
            side: THREE.DoubleSide,
        });

        this.materialVentanaConstruccion = new THREE.MeshBasicMaterial({
            color: '#33ebed',
            opacity: 0.4,
            transparent: true,
            side: THREE.DoubleSide,
        });

        this.materialPuertaConstruccion = new THREE.MeshBasicMaterial({
            color: '#4b2400',
            opacity: 0.7,
            transparent: true,
            side: THREE.DoubleSide,
        });

        this.materialParedConstruida = new THREE.MeshLambertMaterial({
            color: '#eaedc7',
            side: THREE.DoubleSide,
        });

        this.materialVentanaConstruida = new THREE.MeshLambertMaterial({
            color: '#33ebed',
            side: THREE.DoubleSide,
        });

        this.materialPuertaConstruida = new THREE.MeshLambertMaterial({
            color: '#6b3403',
            side: THREE.DoubleSide,
        });

        this.materialPisoConstruido = new THREE.MeshLambertMaterial({
            color: '#a1d1ee',
            side: THREE.DoubleSide,
        });

        this.materialTechoConstruccion = new THREE.MeshLambertMaterial({
            color: '#B3B3B3',
            side: THREE.DoubleSide,
            opacity: 0.7,
            transparent: true,
        });

        this.materialError = new THREE.MeshBasicMaterial({
            color: '#FF0000',
            opacity: 0.4,
            transparent: true,
            side: THREE.DoubleSide,
        });

        this.materialGrid = new THREE.LineBasicMaterial( {
            color: 0xffffff,
            linewidth: 4,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin:  'round' //ignored by WebGLRenderer
        } );

    }

    crearIndicadorConstruccionPared(heightWall, radius) {
        const geometria = new THREE.CylinderBufferGeometry(radius, radius, heightWall, 32);
        var indicadorPared = new THREE.Mesh(geometria, this.materialIndicador.clone());
        indicadorPared.visible = false;
        return indicadorPared;
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
        //aqui ver el state.




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

        //seleccionado construccion de pared
        if (this.props.dibujando === 0) {
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
                    console.log(startHabitacion);
                    //this.managerCasas.setStartHabitacion(startHabitacion, this.raycaster);
                }
            }
        }

        if(this.props.rotando && event.button === 0){
            this.dragging = true;
            this.setState({dragging: this.dragging});
            this.prevX = event.screenX;
        }
    }

    datosBloque(bloque){
        let posicionBloque = bloque.position;
        return {
            posicion: {x: posicionBloque.x, z: posicionBloque.z},
            dimensiones: bloque.userData.dimensiones,
                paredes: this.datosPared(bloque.getObjectByName('paredes')),
            piso : {
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
            techo : {
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

    datosPared(paredes){
        let paredesInfo = [];
        for(let pared of paredes.children){
            let posicion = pared.position;
            let paredInfo = {
                ventanas : [],
                puertas : [],
                separacion : 0,
                superficie: pared.userData.superficie,
                orientacion : pared.userData.orientacion,
                posicion: {x: posicion.x, y: posicion.y, z: posicion.z },
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

    onMouseUp(event) {
        event.preventDefault();
        let rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / (rect.width)) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / (rect.height)) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camara);

        //seleccionado construccion de pared
        if (this.props.dibujando === 0) {
            //click derecho
            if (event.button === 0) {
                //this.managerCasas.agregarHabitacionDibujada();
                /*if(this.coordenadasRotadas){
                    //BalanceEnergetico.calcularGammaParedes(this.paredes, this.cardinalPointsCircle, this.circlePoints);
                }*/
                //this.handleChangeCasa();
                let posicionBloque = this.bloqueDibujo.position;
                let bloque = this.datosBloque(this.bloqueDibujo);
                console.log(bloque);
                let nivel;
                let object = this.intersectStart.object;
                if(object.parent.name === 'bloque'){
                    nivel = object.parent.parent.userData.nivel + 1;
                }else{
                    nivel = 0
                }
                this.props.thunk_agregar_bloque(bloque, nivel);
                this.clearThree(this.bloqueDibujo);
                this.construyendo = false;

            }
        }

        if(this.dragging && this.props.rotando){
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
            this.angleRotatedTemp = 0;
            //if(this.paredes.length > 0) this.props.onParedesChanged(this.paredes);
            //if(this.ventanas.length > 0) this.props.onVentanasChanged(this.ventanas);
            //this.props.onRotationChanged();
            this.coordenadasRotadas = true;
        }
    }

    changeColorSeleccion(elemento){
        switch (elemento.userData.tipo) {
            case  Morfologia.tipos.PARED:
                elemento.material = this.managerCasas.materialParedConstruida.clone();
                break;
            case  Morfologia.tipos.VENTANA:
                elemento.material = this.managerCasas.materialVentanaConstruccion.clone();
                break;
            case Morfologia.tipos.PUERTA:
                elemento.material = this.managerCasas.materialPuertaConstruida.clone();
                break;
            case Morfologia.tipos.PISO:
                elemento.material = this.managerCasas.materialPisoConstruido.clone();
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

    onMouseMove(event) {
        event.preventDefault();
        let rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / (rect.width)) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / (rect.height)) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camara);

        //Si se está seleccionado
        if(this.props.seleccionando){
            let intersects = this.raycaster.intersectObjects(this.allObjects);

            if(this.objSeleccionado !== null){
                this.changeColorSeleccion(this.objSeleccionado);
                this.objSeleccionado = null;

            }
            if(intersects.length > 0){
                let intersect = intersects[0].object;
                if(this.objApuntadoMouse !== intersect && this.objApuntadoMouse != null){
                    this.changeColorSeleccion(this.objApuntadoMouse);
                }
                this.objApuntadoMouse = intersect;
                this.objApuntadoMouse.material = this.materialSeleccionado.clone();

            }else{
                if(this.objApuntadoMouse !== null){
                    this.changeColorSeleccion(this.objApuntadoMouse);
                    this.objApuntadoMouse = null;
                }
            }

        }
        if(this.props.borrando){
            let intersects = this.raycaster.intersectObjects(this.allObjects);
            if(intersects.length > 0){
                let intersect = intersects[0].object;
                if(this.objApuntadoMouse !== intersect && this.objApuntadoMouse != null){
                    this.changeColorSeleccion(this.objApuntadoMouse);
                }
                this.objApuntadoMouse = intersect;
                this.objApuntadoMouse.material = this.materialSeleccionado.clone();

            }else{
                if(this.objApuntadoMouse != null){
                    this.changeColorSeleccion(this.objApuntadoMouse);
                    this.objApuntadoMouse = null;
                }
            }
        }

        //Si se está dibujando
        if (this.props.dibujando !== -1 && this.props.dibujando < 4) {

            let index = parseInt(this.props.dibujando);
            let intersect;
            //si se dibujan bloques
            if (this.props.dibujando === 0) {
                
                let intersects = this.raycaster.intersectObjects(this.superficies);
                if (intersects.length > 0) {
                    intersect = intersects[0];
                    this.indicador_dibujado.visible = true;
                    this.indicador_dibujado.position.copy(intersect.point).add(intersect.face.normal);
                    this.indicador_dibujado.position.round();

                    let worldPosition = intersect.object.localToWorld(new THREE.Vector3(0, 0, 0));

                    this.indicador_dibujado.position.y = worldPosition.y + this.heightWall/2;

                    if (this.construyendo) {
                        this.indicador_dibujado.position.y = this.worldPosition.y + this.heightWall/2;
                        var nextPosition = (intersect.point).add(intersect.face.normal).clone();
                        nextPosition.round();
                        this.bloqueDibujado(this.startHabitacion, nextPosition,this.heightWall,this.indicador_dibujado.position.y- this.heightWall/2 );
                        this.nexPosition = nextPosition;
                        //this.managerCasas.crecerHabitacion(nextPosition);
                    }else{

                    }
                }
            }
            //si se dibuja una ventana o pared, se intersecta con paredes.
            else if (this.props.dibujando === 1 || this.props.dibujando === 2 ) {
                this.indicador_dibujado.visible = false;
                let intersects = this.raycaster.intersectObjects(this.paredes);
                if (intersects.length > 0) {
                    intersect = intersects[0];
                    let pared = intersect.object;
                    let pos = intersect.point.clone();
                    if(this.props.dibujando === 1){
                        this.managerCasas.moverVentanaConstruccion(pared, pos);
                    }else{
                        this.managerCasas.moverPuertaConstruccion(pared, pos);
                    }

                }else{
                    if(this.props.dibujando === 1){
                        this.managerCasas.ocultarVentanaConstruccion();
                    }else{
                        this.managerCasas.ocultarPuertaConstruccion();
                    }
                }
            }
            else if(this.props.dibujando === 3){
                this.indicador_dibujado.visible = false;
                let intersects = this.raycaster.intersectObjects(this.paredes);
                if( intersects.length > 0){
                    intersect = intersects[0];
                    let pared = intersect.object;
                    this.managerCasas.moverTechoConstruccion(pared);
                }else{
                    intersects = this.raycaster.intersectObjects(this.pisos);
                    if( intersects.length > 0){
                        intersect = intersects[0];
                        let piso = intersect.object;
                        this.managerCasas.moverTechoConstruccion(piso);
                    }else{
                        this.managerCasas.ocultarTechoConstruccion();
                    }

                }
            }
        }

        else{
            if(this.indicador_dibujado != null){
                this.indicador_dibujado.visible = false;
            }
        }
        //si se está rotando
        if(this.dragging){
            let movementX = event.screenX - this.prevX;
            this.prevX = event.screenX;
            let angle = Math.PI * movementX / 180;
            this.angleRotatedTemp += (angle*180/Math.PI);
            this.angleRotated += (angle*180/Math.PI);
            if(this.angleRotated > 359 ) this.angleRotated = this.angleRotated - 359;
            if(this.angleRotated < 0){
                this.angleRotated = 360 + this.angleRotated;
            }
            this.managerCasas.setAngleRotated(this.angleRotated);
            this.setState({angleRotated: this.angleRotated});
            this.cardinalPointsCircle.rotateZ(angle);
            this.sunPath.rotateY(angle);
            this.light.target.position.set(0,0,0);
        }
    }

    handleChangeCasa(){
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

        if (this.props.dibujando === 1 && this.props.dibujando !== -1) {
            this.managerCasas.agregarVentana();
            this.props.onVentanasChanged(this.ventanas);

            this.handleChangeCasa();
        }

        if (this.props.dibujando === 2 && this.props.dibujando !== -1) {
            this.managerCasas.agregarPuerta();

            this.handleChangeCasa();
        }
        if(this.props.dibujando === 3 && this.props.dibujando !== -1){
            this.managerCasas.agregarTechoConstruccion();
            this.handleChangeCasa();
        }

        if(this.props.borrando){
            this.handleBorrado();
        }

        if(this.props.seleccionando){
            this.handleSeleccionado();

        }
    }

    handleSeleccionado(){
        if (this.objApuntadoMouse !== null){
            this.props.onSeleccionadoChanged(this.objApuntadoMouse);

        }
        if(this.objSeleccionado !== null){
            this.changeColorSeleccion(this.objSeleccionado);
        }
        this.objSeleccionado = this.objApuntadoMouse;
        console.log("objeto seleccionado", this.objSeleccionado);
    }

    handleBorrado(){
        if(this.objApuntadoMouse != null){
            this.managerCasas.borrarEstructura(this.objApuntadoMouse);
            if(this.objApuntadoMouse.userData.tipo === Morfologia.tipos.VENTANA ||
                this.objApuntadoMouse.userData.tipo === Morfologia.tipos.PISO ||
                this.objApuntadoMouse.userData.tipo === Morfologia.tipos.PARED
            ){
                this.props.onVentanasChanged(this.ventanas);
            }
            this.objApuntadoMouse = null;
            if(this.objSeleccionado !== null){
                this.changeColorSeleccion(this.objSeleccionado);
            }
            this.objSeleccionado = null;
        }
        this.handleChangeCasa();

    }

    crearGeometriaPared(width, height, holes) {
        let x1 = width / -2, x2 = width / 2, y1 = 0, y2 = height;
        let vertices = [
            new THREE.Vector2(x1,y1),
            new THREE.Vector2(x1,y2),
            new THREE.Vector2(x2,y2),
            new THREE.Vector2(x2,y1),

        ];
        let ParedShape = new THREE.Shape(vertices);
        ParedShape.holes = holes;


        let geometria = new THREE.ShapeBufferGeometry(ParedShape);
        geometria.userData.shape = ParedShape;

        return geometria;
    }

    crearGeometriaPiso(width, depth) {
        let geometria = new THREE.Geometry();
        let offset = 0.01;
        let x1 = width / -2, x2 = width / 2, y = offset, z1 = depth / -2, z2 = depth / 2;

        geometria.vertices.push(new THREE.Vector3(x1, y, z1));
        geometria.vertices.push(new THREE.Vector3(x1, y, z2));
        geometria.vertices.push(new THREE.Vector3(x2, y, z1));
        geometria.vertices.push(new THREE.Vector3(x2, y, z2));

        geometria.faces.push(new THREE.Face3(0, 2, 1));
        geometria.faces.push(new THREE.Face3(1, 2, 3));

        return geometria;
    }

    crearGeometriaTecho(width, depth) {
        let geometria = new THREE.Geometry();

        let x1 = width / -2, x2 = width / 2, y = 0, z1 = depth / -2, z2 = depth / 2;

        geometria.vertices.push(new THREE.Vector3(x1, y, z1));
        geometria.vertices.push(new THREE.Vector3(x1, y, z2));
        geometria.vertices.push(new THREE.Vector3(x2, y, z1));
        geometria.vertices.push(new THREE.Vector3(x2, y, z2));

        geometria.faces.push(new THREE.Face3(0, 2, 1));
        geometria.faces.push(new THREE.Face3(1, 2, 3));

        return geometria;
    }

    crearGeometriaVentana(width, height) {
        let x1 = width / -2, x2 = width / 2, y1 = 0, y2 = height;
        let vertices = [
            new THREE.Vector2(x1,y1),
            new THREE.Vector2(x1,y2),
            new THREE.Vector2(x2,y2),
            new THREE.Vector2(x2,y1),

        ];
        let VentanaShape = new THREE.Shape(vertices);
        VentanaShape.holes = [];


        let geometria = new THREE.ShapeBufferGeometry(VentanaShape);
        geometria.userData.shape = VentanaShape;

        return geometria;
    }

    crearSpriteTexto(texto){
        var sprite = new MeshText2D(texto, {
            align: textAlign.center,
            font: '40px Arial',
            fillStyle: '#000000',
            antialias: false
        });
        sprite.scale.setX(0.005);
        sprite.scale.setY(0.005);

        return sprite;
    }

    agregarDimensionesMesh(width, height, mesh){
        var derecha = new THREE.Vector3( 1, 0, 0 );
        var izquierda = new THREE.Vector3( -1, 0, 0 );

        var arriba = new THREE.Vector3( 0, 1, 0 );
        var abajo =  new THREE.Vector3( 0, -1, 0 );

        derecha.normalize();
        izquierda.normalize();

        arriba.normalize();
        abajo.normalize();

        const offset = 0.10;

        var originDerecha = new THREE.Vector3( offset, height+ 0.06, 0 );
        var originIzquierda = new THREE.Vector3( -offset, height + 0.06, 0 );

        var originArriba = new THREE.Vector3( width/2 + 0.06, height/2 + offset, 0 );
        var originAbajo = new THREE.Vector3( width/2 + 0.06, height/2 - offset, 0 );

        var hex = 0x000000;

        var rightArrow = new THREE.ArrowHelper( derecha, originDerecha, width/2-offset, hex ,0.1, 0.05);
        var leftArrow = new THREE.ArrowHelper( izquierda, originIzquierda, width/2-offset, hex ,0.1, 0.05);

        var upArrow = new THREE.ArrowHelper(arriba, originArriba, height/2 - offset, hex, 0.1, 0.05 );
        var downArrow = new THREE.ArrowHelper(abajo, originAbajo, height/2 - offset, hex, 0.1, 0.051 );

        mesh.add(rightArrow);
        mesh.add(leftArrow);
        mesh.add(upArrow);
        mesh.add(downArrow);

        var spriteAncho = this.crearSpriteTexto(width.toString()+' m');
        spriteAncho.position.set(0,height+0.12, 0.009);
        spriteAncho.scale.setX(0.002);
        spriteAncho.scale.setY(0.002);

        var spriteAlto = this.crearSpriteTexto(height.toString()+' m');
        spriteAlto.position.set(width/2 + 0.06,height/2+0.06 , 0.009);
        spriteAlto.scale.setX(0.002);
        spriteAlto.scale.setY(0.002);

        mesh.add(spriteAncho);
        mesh.add(spriteAlto);
    }

    crearMeshPared(width, height,holes = []) {
        let geometria = this.crearGeometriaPared(width, height, holes);

        let meshPared = new THREE.Mesh(geometria, this.materialParedConstruccion.clone());

        this.agregarDimensionesMesh(width, height,meshPared);

        return meshPared;
    }

    crearMeshPiso(width, depth) {
        //piso representa el numero de piso donde se encuentra el piso
        let geometria = this.crearGeometriaPiso(width, depth);

        return new THREE.Mesh(geometria, this.materialPisoConstruccion);
    }

    agregarGridTecho(width, depth, mesh){
        for(let i = 0; i <= width; i++){
            let lineGeometry = new THREE.Geometry();
            lineGeometry.vertices.push(
                new THREE.Vector3(-width/2+i,0,-depth/2),
                new THREE.Vector3(-width/2+i,0,depth/2),
            );
            let eje = new THREE.Line(lineGeometry, this.materialGrid);
            mesh.add(eje);
        }
        for(let j = 0; j <= depth; j++){
            let lineGeometry = new THREE.Geometry();
            lineGeometry.vertices.push(
                new THREE.Vector3(-width/2,0,-depth/2+j),
                new THREE.Vector3(width/2,0,-depth/2+j),
            );
            let eje = new THREE.Line(lineGeometry, this.materialGrid);
            mesh.add(eje);
        }
    }

    crearMeshTecho(width, depth, height) {
        let geometria = this.crearGeometriaTecho(width, depth);

        let meshTecho = new THREE.Mesh(geometria, this.materialTechoConstruccion);
        meshTecho.position.y = height;

        this.agregarGridTecho(width,depth,meshTecho);

        return meshTecho;
    }

    crearMeshVentana(width, height) {
        let geometria = this.crearGeometriaVentana(width, height);

        let ventana = new THREE.Mesh(geometria, this.materialVentanaConstruccion);

        this.agregarDimensionesMesh(width, height,ventana);

        return ventana;
    }

    crearMeshPuerta(width, height) {
        //Como son cuadrados, se utiliza la misma para el caso de la pared.
        let geometria = this.crearGeometriaVentana(width, height);

        let puerta = new THREE.Mesh(geometria, this.materialPuertaConstruccion);
        puerta.userData.width = width;
        puerta.userData.height = height;

        this.agregarDimensionesMesh(width, height,puerta);

        return puerta;
    }



    render() {
        console.log(this.dragging);
        return (
            <div style={{height: this.props.height}}>
                <div style={{height: 10}}
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
                            }}
                            align={"center"}
                            variant={"button"}
                            color={"textSecondary"}>
                    Rotar camara: Arrastrar click derecho
                </Typography>
                <TextoAccion
                    seleccionando={this.props.seleccionando}
                    rotando={this.props.rotando}
                    dragging={this.state.dragging}
                    angleRotated={this.state.angleRotated}
                    borrando={this.props.borrando}
                    dibujando={this.props.dibujando}

                />
            </div>

        )
    }
}

function TextoAccion(props){
    let text = '';
    let angulo = props.angleRotated;

    if(props.seleccionando) text = Morfologia.texto_accion.seleccionar;
    else if(props.rotando) {
        if(props.dragging){
            text = 'Angulo rotado: '+Math.round(angulo)+'° ';
        }else{
            text = Morfologia.texto_accion.rotar;
        }

    }
    else if(props.borrando) text = Morfologia.texto_accion.borrar;
    else if(props.dibujando === 0) text = Morfologia.texto_accion.bloque_paredes;
    else if(props.dibujando === 1) text = Morfologia.texto_accion.ventanas;
    else if(props.dibujando === 2) text = Morfologia.texto_accion.puertas;
    else if(props.dibujando === 3) text = Morfologia.texto_accion.techos;
    return (
        <Typography style={{
            fontSize: 'x-small',
            zIndex: 0,
            position: 'relative',
        }}
                    align={"center"}
                    variant={"button"}
                    color={"textSecondary"}>
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



};

Morfologia.tipos = {PARED : 0, VENTANA : 1, PUERTA : 2, TECHO : 3, PISO : 4,};
Morfologia.separacion = {EXTERIOR : 0,  INTERIOR : 1};
Morfologia.aislacionPiso = {CORRIENTE: 0, MEDIO : 1, AISLADO : 2};
Morfologia.tipos_texto = {
    0 : 'Pared',
    1 : 'Ventana',
    2 : 'Puerta',
    3 : 'Techo',
    4 : 'Piso',
};

Morfologia.texto_accion = {
    seleccionar: '\nseleccionar: click izquierdo en un elemento',
    rotar: '\nrotar coordenadas: arrastrar click izquierdo',
    borrar: '\neliminar: click izquierdo en un elemento',
    bloque_paredes: '\nAgregar bloque paredes: arrastrar click izquierdo desde punto inicio hasta punto final',
    ventanas: '\nAgregar ventanas: click izquierdo dentro de una pared',
    puertas: '\nAgregar puertas: click izquierdo dentro de una pared ',
    techos: '\nAgregar techos: Click izquierdo dentro de un bloque de paredes',
};

export default connect(mapStateToProps,mapDispatchToProps)(Morfologia);
