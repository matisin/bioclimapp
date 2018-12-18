import * as THREE from "three";

export const materialPared = new THREE.MeshBasicMaterial({
    color: '#eaedc7',
    opacity: 0.7,
    transparent: true,
    side: THREE.DoubleSide,
});

export const materialPiso = new THREE.MeshBasicMaterial({
    color: '#a1d1ee',
    opacity: 0.7,
    transparent: true,
    side: THREE.DoubleSide,
});

export const materialVentana = new THREE.MeshBasicMaterial({
    color: '#33ebed',
    opacity: 0.4,
    transparent: true,
    side: THREE.DoubleSide,
});

export const materialPuerta = new THREE.MeshBasicMaterial({
    color: '#4b2400',
    opacity: 0.7,
    transparent: true,
    side: THREE.DoubleSide,
});

export const materialTecho = new THREE.MeshLambertMaterial({
    color: '#B3B3B3',
    side: THREE.DoubleSide,
    opacity: 0.7,
    transparent: true,
});

export const materialSeleccionado = new THREE.MeshLambertMaterial({
    color: '#FF0000',
    opacity: 0.7,
    transparent: true,
    side : THREE.DoubleSide,

});


export const materialHoveredMorf = new THREE.MeshLambertMaterial({
    color: 0x8BC5BF,
    opacity: 0.7,
    transparent: true,
    side : THREE.DoubleSide,

});

export const materialError = new THREE.MeshBasicMaterial({
    color: '#FF0000',
    opacity: 0.4,
    transparent: true,
    side: THREE.DoubleSide,
});

export const materialDimensiones = new THREE.LineBasicMaterial( {
    color: 0x000000,
    linewidth: 1,
    linecap: 'round', //ignored by WebGLRenderer
    linejoin:  'round' //ignored by WebGLRenderer
} );

export const materialIndicador = new THREE.MeshBasicMaterial({
    color: '#433F81',
    opacity: 0.7,
    transparent: true,
    side : THREE.DoubleSide,
});

export const materialIndicadorVentana = new THREE.LineBasicMaterial( {
    color: 0x433F81,
    opacity: 0.7,
    transparent: true,
    side : THREE.DoubleSide,
    linewidth: 2,
    linecap: 'round', //ignored by WebGLRenderer
    linejoin:  'round' //ignored by WebGLRenderer
} );

export const materialGrid = new THREE.LineBasicMaterial( {
    color: 0xffffff,
    linewidth: 4,
    linecap: 'round', //ignored by WebGLRenderer
    linejoin:  'round' //ignored by WebGLRenderer
} );
export const materialObstruccionMorf = new THREE.MeshBasicMaterial({
    color: 0x000000,
    opacity: 0.5,
    transparent: true,
    side: THREE.DoubleSide,
});


export const materialObstruccion = new THREE.MeshBasicMaterial({color: 0x000000});

export const materialHovered = new THREE.MeshBasicMaterial({color: 0x8BC5BF});

export const materialSeleccionObstruccion = new THREE.MeshBasicMaterial({color: 0xff0000});
