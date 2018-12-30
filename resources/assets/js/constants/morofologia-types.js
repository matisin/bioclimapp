export const PARED = 0;
export const VENTANA = 1;
export const PUERTA = 2;
export const TECHO = 3;
export const PISO = 4;

export const EXTERIOR = 0, INTERIOR = 1;
export const CORRIENTE = 0, MEDIO = 1, AISLADO = 2;

export const TEXTOMESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export const texto_accion = {
    seleccionar: '\nseleccionar: click izquierdo en un elemento',
    rotar: '\nrotar coordenadas: arrastrar click izquierdo',
    borrar: '\neliminar: click izquierdo en un elemento',
    bloque_paredes: '\nAgregar bloque paredes: arrastrar click izquierdo desde punto inicio hasta punto final',
    ventanas: '\nAgregar ventanas: click izquierdo dentro de una pared',
    puertas: '\nAgregar puertas: click izquierdo dentro de una pared ',
    techos: '\nAgregar techos: Click izquierdo dentro de un bloque de paredes',
    mover_camara: '\nMover camara: arrastrar click izquierdo'
};