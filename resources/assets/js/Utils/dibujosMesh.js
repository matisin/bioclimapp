import * as THREE from "three";
import {MeshText2D, textAlign} from "three-text2d";
import * as materiales from "../constants/materiales-threejs";

export function crearGeometriaObstruccion(width) {
    let height = 1;
    let x1 = width / -2, x2 = width / 2, y1 = 0, y2 = height;
    let vertices = [
        new THREE.Vector2(x1,y1),
        new THREE.Vector2(x1,y2),
        new THREE.Vector2(x2,y2),
        new THREE.Vector2(x2,y1),

    ];
    let ParedShape = new THREE.Shape(vertices);

    let geometria = new THREE.ShapeBufferGeometry(ParedShape);
    geometria.userData.shape = ParedShape;

    return geometria;
}

export function crearGeometriaPared(width, height, holes) {
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

function crearGeometriaPiso(width, depth) {
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

function crearGeometriaTecho(width, depth) {
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

function crearGeometriaVentana(width, height) {
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

function crearSpriteTexto(texto){
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

function agregarDimensionesMesh(width, height, mesh,z = false){
    var derecha = new THREE.Vector3( 1, 0, 0 );
    var izquierda = new THREE.Vector3( -1, 0, 0 );

    var arriba = new THREE.Vector3( 0, 1, 0 );
    var abajo =  new THREE.Vector3( 0, -1, 0 );

    derecha.normalize();
    izquierda.normalize();

    arriba.normalize();
    abajo.normalize();

    const offsetV = 0.25;
    const offsetH = 0.10;

    let lineGeometry;

    if(width > offsetV*2){

        const offsetVertical = 0.06;

        var destinoIzquierda = new THREE.Vector3(-width/2, height + offsetVertical, 0 );
        var originIzquierda = new THREE.Vector3( -offsetV, height + offsetVertical, 0 );

        var marcaIzquierdaArriba = new THREE.Vector3(-width/2, height + offsetVertical*2, 0 );
        var marcaIzquierdaAbajo = new THREE.Vector3(-width/2, height , 0 );

        var originDerecha = new THREE.Vector3( offsetV, height+ offsetVertical, 0 );
        var destinoDerecha = new THREE.Vector3(width/2, height + offsetVertical, 0 );

        var marcaDerechaArriba = new THREE.Vector3( width/2, height+ offsetVertical*2, 0 );
        var marcaDerechaAbajo = new THREE.Vector3( width/2, height, 0 );

        lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
            originIzquierda,
            destinoIzquierda,
        );
        let izqierdaAncho = new THREE.Line(lineGeometry, materiales.materialDimensiones);

        lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
            originDerecha,
            destinoDerecha,
        );
        let derechaAncho = new THREE.Line(lineGeometry, materiales.materialDimensiones);

        lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
            marcaIzquierdaAbajo,
            marcaIzquierdaArriba,
        );
        let marcaIzquierda = new THREE.Line(lineGeometry, materiales.materialDimensiones);

        lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
            marcaDerechaAbajo,
            marcaDerechaArriba,
        );
        let marcaDerecha = new THREE.Line(lineGeometry, materiales.materialDimensiones);

        mesh.add(izqierdaAncho );
        mesh.add(derechaAncho);
        mesh.add(marcaIzquierda);
        mesh.add(marcaDerecha);
    }

    if(height > offsetH*2){

        const offsetHorizontal = 0.06;
        var originArriba = new THREE.Vector3( -(width / 2 + offsetHorizontal), (height/2 + offsetH), 0 );
        var destinoArriba = new THREE.Vector3( -(width / 2 + offsetHorizontal), height , 0 );

        var marcaArribaArriba = new THREE.Vector3( -width/2 , height, 0 );
        var marcaArribaAbajo = new THREE.Vector3( -(width/2 + offsetHorizontal*2), height, 0 );

        var marcaAbajoArriba = new THREE.Vector3( -width/2 , 0, 0 );
        var marcaAbajoAbajo = new THREE.Vector3( -(width / 2 + offsetHorizontal * 2), 0, 0 );

        var originAbajo = new THREE.Vector3( -(width / 2 + offsetHorizontal), height/2 - offsetH, 0 );
        var destinoAbajo = new THREE.Vector3(-(width / 2 + offsetHorizontal), 0, 0 );

        lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
            originArriba,
            destinoArriba,
        );
        let arribaAlto = new THREE.Line(lineGeometry, materiales.materialDimensiones);

        lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
            originAbajo,
            destinoAbajo,
        );
        let abajoAlto = new THREE.Line(lineGeometry, materiales.materialDimensiones);

        lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
            marcaArribaArriba,
            marcaArribaAbajo,
        );
        let marcaArriba = new THREE.Line(lineGeometry, materiales.materialDimensiones);

        lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
            marcaAbajoArriba,
            marcaAbajoAbajo,
        );
        let marcaAbajo= new THREE.Line(lineGeometry, materiales.materialDimensiones);

        mesh.add(arribaAlto);
        mesh.add(marcaArriba);
        mesh.add(abajoAlto);
        mesh.add(marcaAbajo);
    }

    var spriteAncho = crearSpriteTexto(width.toString()+' m');
    spriteAncho.position.set(0,height+0.15, 0.009);
    let scale = 0.004;
    spriteAncho.scale.setX(scale);
    spriteAncho.scale.setY(scale);

    var spriteAlto = crearSpriteTexto(height.toString()+' m');
    spriteAlto.position.set(-(width/2 + 0.1),height/2+0.06 , 0.009);
    spriteAlto.scale.setX(scale);
    spriteAlto.scale.setY(scale);

    mesh.add(spriteAncho);
    mesh.add(spriteAlto);
}

export function crearMeshPared(width, height,holes = []) {
    let geometria = crearGeometriaPared(width, height, holes);

    let meshPared = new THREE.Mesh(geometria, materiales.materialPared.clone());

    agregarDimensionesMesh(width, height,meshPared);

    return meshPared;
}

export function crearMeshPiso(width, depth) {
    //piso representa el numero de piso donde se encuentra el piso
    let geometria = crearGeometriaPiso(width, depth);

    return new THREE.Mesh(geometria, materiales.materialPiso);
}

export function agregarGridTecho(width, depth, mesh){
    for(let i = 0; i <= width; i++){
        let lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
            new THREE.Vector3(-width/2+i,0,-depth/2),
            new THREE.Vector3(-width/2+i,0,depth/2),
        );
        let eje = new THREE.Line(lineGeometry, materiales.materialGrid);
        mesh.add(eje);
    }
    for(let j = 0; j <= depth; j++){
        let lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
            new THREE.Vector3(-width/2,0,-depth/2+j),
            new THREE.Vector3(width/2,0,-depth/2+j),
        );
        let eje = new THREE.Line(lineGeometry, materiales.materialGrid);
        mesh.add(eje);
    }
}

export function crearMeshTecho(width, depth, height) {
    let geometria = crearGeometriaTecho(width, depth);

    let meshTecho = new THREE.Mesh(geometria, materiales.materialTecho);
    meshTecho.position.y = height;

    agregarGridTecho(width,depth,meshTecho);

    return meshTecho;
}

export function crearMeshVentana(width, height) {
    let geometria = crearGeometriaVentana(width, height);

    let ventana = new THREE.Mesh(geometria, materiales.materialVentana);

    agregarDimensionesMesh(width, height,ventana);

    return ventana;
}

export function crearMeshPuerta(width, height) {
    //Como son cuadrados, se utiliza la misma para el caso de la pared.
    let geometria = crearGeometriaVentana(width, height);

    let puerta = new THREE.Mesh(geometria, materiales.materialPuerta);
    puerta.userData.width = width;
    puerta.userData.height = height;

    agregarDimensionesMesh(width, height, puerta);

    return puerta;
}

export function crearMeshObstruccion(width,height,rotacion) {
    let geometria = new THREE.BoxGeometry( width, 1, 1);
    //let geometria = crearGeometriaObstruccion(width);

    let obstruccion = new THREE.Mesh(geometria, materiales.materialObstruccion);

    crearTextoObstruccion(obstruccion,height,width);
    obstruccion.rotation.x = -Math.PI / 2;
    obstruccion.position.y = 1;
    crearTextoObstruccionRotacion(obstruccion,rotacion);
    return obstruccion;
}

export function crearMeshObstruccionMorf(width,height,rotacion) {
    let geometria = new THREE.BoxGeometry( width, 1, height );

    let obstruccion = new THREE.Mesh(geometria, materiales.materialObstruccionMorf);
    obstruccion.rotation.x = -Math.PI / 2;
    return obstruccion;
}

function crearTextoObstruccion(obstruccion,altura,longitud) {
    let sprite = new MeshText2D("Altura: " + altura + " m   Longitud: " + longitud+" m  ", {
        align: textAlign.center,
        font: '40px Arial',
        fillStyle: '#000000',
        antialias: false
    });
    sprite.scale.setX(0.045);
    sprite.scale.setY(0.045);
    sprite.position.set(sprite.position.x, sprite.position.y, sprite.position.z + 1);
    //sprite.rotateZ(-Math.PI / 2);
    sprite.name = "info";
    obstruccion.add(sprite);
}


function crearTextoObstruccionRotacion(obstruccion,rotacion) {
    let degree = rotacion * 180 / Math.PI;
    degree = Math.round(degree);
    let sprite = new MeshText2D("Rotación: " + degree+ " °", {
        align: textAlign.center,
        font: '40px Arial',
        fillStyle: '#000000',
        antialias: false
    });
    sprite.scale.setX(0.045);
    sprite.scale.setY(0.045);
    sprite.position.set(sprite.position.x, sprite.position.y+3, sprite.position.z + 1);
    //sprite.rotateZ(-Math.PI / 2);
    sprite.name = "info";
    obstruccion.add(sprite);
}

export function clearThree(obj){
    while(obj.children.length > 0){
        clearThree(obj.children[0]);
        obj.remove(obj.children[0]);
    }
    if(obj.geometry) obj.geometry.dispose();
    if(obj.material) obj.material.dispose();
    if(obj.texture) obj.texture.dispose();
}

