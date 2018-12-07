import {
    CAMBIAR_VARS_INTERNA,

    AGREGAR_BLOQUE,AGREGAR_NIVEL,AGREGAR_PUERTA,AGREGAR_VENTANA,BORRAR_PUERTA,
    BORRAR_BLOQUE,BORRAR_NIVEL,BORRAR_VENTANA,CASA_PREDEFINIDA_DOBLE,
    CASA_PREDEFINIDA_DOBLE_DOS_PISOS,CASA_PREDEFINIDA_SIMPLE,
    CASA_PREDEFINIDA_SIMPLE_DOS_PISOS,MODIFICAR_DIMENSIONES_BLOQUE,
    MODIFICAR_DIMENSIONES_VENTANA,MODIFICAR_DIMENSIONES_PUERTA,
    MODIFICAR_MARCO_VENTANA,MODIFICAR_MATERIAL_VENTANA,MODIFICAR_MATERIAL_PUERTA,

    CAMBIO_TIPO_CAMARA,ACTIVAR_ELIMINAR_MORFOLOGIA,VER_SOL,ACTIVAR_ROTAR,
    ACTIVAR_AGREGAR_BLOQUE,ACTIVAR_AGREGAR_PUERTA, ACTIVAR_AGREGAR_VENTANA,
    ACTIVAR_MOVER_CAMARA, ACTIVAR_SELECCIONAR_MORFOLOGIA,

    ACTIVAR_AGREGAR_CONTEXTO,ACTIVAR_ELIMINAR_CONTEXTO,MOSTRAR_OCULTAR_MAPA,
    ACTIVAR_SELECCIONAR_CONTEXTO,

    AGREGAR_OBSTRUCCION,ELIMINAR_OBSTRUCCION,SELECCIONAR_OBSTRUCCION,SETEAR_COMUNA,
    MODIFICAR_OBSTRUCCION,

} from "../constants/action-types";
import store from "../store";

export const activarAgregarContexto = () => (
    {
        type: ACTIVAR_AGREGAR_CONTEXTO,
    }
);

export const activarEliminarContexto = () => (
    {
        type: ACTIVAR_ELIMINAR_CONTEXTO,
    }
);

export const mostrarOcultarMapa = () => (
    {
        type: MOSTRAR_OCULTAR_MAPA,
    }
);

export const activarSeleccionarContexto = () => (
    {
        type: ACTIVAR_SELECCIONAR_CONTEXTO,
    }
);

export const agregarObstruccion = obstruccion => (
    {
        type: AGREGAR_OBSTRUCCION,
        obstruccion: obstruccion,
    }
);

export const thunk_agregar_obstruccion = obstruccion => {

    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        //HACER CALCULOS
        dispatch(agregarObstruccion(obstruccion));
    }
};

export const eliminarObstruccion = obstruccion => (
    {
        type: ELIMINAR_OBSTRUCCION,
        obstruccion: obstruccion,
    }
);

export const thunk_eliminar_obstruccion = obstruccion => {

    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        //HACER CALCULOS
        dispatch(eliminarObstruccion(obstruccion));
    }
};


export const seleccionarObstruccion = obstruccion => (
    {
        type: SELECCIONAR_OBSTRUCCION,
        obstruccion: obstruccion,
    }
);

export const thunk_seleccionar_obstruccion = obstruccion => {

    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        //HACER CALCULOS
        dispatch(seleccionarObstruccion(obstruccion));
    }
};


export const modificarObstrucion = obstruccion => (
    {
        type: MODIFICAR_OBSTRUCCION,
        obstruccion: obstruccion,
    }
);

export const thunk_modificar_obstruccion = obstruccion => {

    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        //HACER CALCULOS
        dispatch(modificarObstrucion(obstruccion));
    }
};

export const setearComuna = comuna => (
    {
        type: SETEAR_COMUNA,
        comuna: comuna,
    }
);

export const thunk_setear_comuna = comuna => {

    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        //HACER CALCULOS
        dispatch(setearComuna(comuna));
    }
};

export const cambiarVarsInterna = variable => (
    {
        type: CAMBIAR_VARS_INTERNA,
        name: variable.name,
        value: variable.value,
    }
);

export const thunk_cambiar_variables_internas = variable => {
    //SETEAR CALCULANDO
    return function (dispatch) {
        //HACER CALCULOS NECESARIOS
        dispatch(cambiarVarsInterna(variable));
    }
};

export const agregarNivel = (altura) => (
    {
        type: AGREGAR_NIVEL,
        altura: altura,

    }
);

export const agregarBloque = (bloque, nivel) =>(
    {
        type: AGREGAR_BLOQUE,
        nivel : nivel,
        bloque: bloque,

    }
);

export const thunk_agregar_bloque = (bloque, nivel) => {

    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        //HACER CALCULOS
        const state = getState().morfologia.present;
        dispatch(agregarBloque(bloque, nivel));
        console.log('niveles',state.niveles);
        //AGREGAR NIVEL EN CASAS PREDEFINIDAS
        if(state.niveles[nivel+1] === undefined){
            dispatch(agregarNivel((nivel+1)*bloque.dimensiones.alto));
        }

    }
};

export const thunk_agregar_ventana = (bloque, nivel, pared, ventana) => {

    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        //HACER CALCULOS
        const state = getState().morfologia.present;
        console.log(bloque, nivel, pared, ventana);
        dispatch(agregarVentana(bloque, nivel, pared, ventana));

    }
};

export const thunk_agregar_puerta = (bloque, nivel, pared, puerta) => {

    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        //HACER CALCULOS
        const state = getState().morfologia.present;
        console.log(bloque, nivel, pared, puerta);
        dispatch(agregarPuerta(bloque, nivel, pared, puerta));

    }
};

export const agregarVentana = (bloque, nivel, pared, ventana) =>(
    {
        type: AGREGAR_VENTANA,
        nivel : nivel,
        bloque : bloque,
        pared: pared,
        ventana: ventana,
    }
);

export const agregarPuerta = (bloque, nivel, pared, puerta) =>(
    {
        type: AGREGAR_PUERTA,
        nivel : nivel,
        bloque : bloque,
        pared: pared,
        puerta: puerta,
    }
);

export const agregarTecho = (techo, nivel, bloque, pared) =>(
    {
        type: AGREGAR_TECHO,
        nivel : nivel,
        bloque : bloque,
        techo: techo,
    }
);

export const casaPredefinidaSimple = () => (
    {
        type : CASA_PREDEFINIDA_SIMPLE,
    }
);

export const casaPredefinidaDoble = () => (
    {
        type : CASA_PREDEFINIDA_DOBLE,
    }
);

export const casaPredefinidaSimpleDosPisos = () => (
    {
        type : CASA_PREDEFINIDA_SIMPLE_DOS_PISOS,
    }
);

export const casaPredefinidaDobleDosPisos = () => (
    {
        type : CASA_PREDEFINIDA_DOBLE_DOS_PISOS,
    }
);

export const borrarNivel = nivel => (
    {
        type: BORRAR_NIVEL,
        nivel: nivel,

    }
);

export const borrarBloque = (bloque, nivel) => (
    {
        type: BORRAR_BLOQUE,
        nivel: nivel,
        bloque: bloque,
    }
);

export const thunk_borrar_bloque = (nivel, bloque) => {

    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        //HACER CALCULOS
        const state = getState().morfologia.present;
        dispatch(borrarBloque(nivel, bloque));

    }
};
export const borrarVentana = (ventana, nivel, bloque, pared) => (
    {
        type: BORRAR_VENTANA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        ventana: ventana,
    }
);


export const thunk_borrar_ventana = (ventana, nivel, bloque, pared) => {

    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        //HACER CALCULOS
        const state = getState().morfologia.present;
        dispatch(borrarVentana(ventana, nivel, bloque, pared));

    }
};

export const borrarPuerta = (puerta, nivel, bloque, pared) => (
    {
        type: BORRAR_PUERTA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        puerta: puerta,
    }
);

export const thunk_borrar_puerta = (puerta, nivel, bloque, pared) => {

    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        //HACER CALCULOS
        const state = getState().morfologia.present;
        console.log(bloque, nivel, pared, puerta);
        dispatch(borrarPuerta(puerta, nivel, bloque, pared));

    }
};

export const rotarCasa = angulo => (
    {
        type: ROTAR_CASA,
        angulo: angulo,
    }
);

export const modificarDimensionesBloque = (bloque, nivel, dimensiones) => (
    {
        type: MODIFICAR_DIMENSIONES_BLOQUE,
        nivel: nivel,
        bloque: bloque,
        dimensiones: dimensiones,
    }
);

export const modificarDimensionesVentana = (ventana, nivel, bloque, pared, dimensiones) => (
    {
        type: MODIFICAR_DIMENSIONES_VENTANA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        ventana: ventana,
        dimensiones: dimensiones,
    }
);

export const modificarDimensionesPuerta = (puerta, nivel, bloque, pared, dimensiones) => (
    {
        type: MODIFICAR_DIMENSIONES_PUERTA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        puerta: puerta,
        dimensiones: dimensiones,
    }
);

export const modificarCapaPared = (nivel, bloque, pared, capas) => (
    {
        type: MODIFICAR_CAPA_PARED,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        capas: capas
    }
);

export const modificarCapaPiso = (nivel, bloque, capas) => (
    {
        type: MODIFICAR_CAPA_PISO,
        nivel: nivel,
        bloque: bloque,
        capas: capas,
    }
);

export const modificarCapaTecho = (nivel, bloque, capas) => (
    {
        type: MODIFICAR_CAPA_TECHO,
        nivel: nivel,
        bloque: bloque,
        capas: capas,
    }
);

export const modificarMarcoVentana = (nivel, bloque, pared, ventana) => (
    {
        type: MODIFICAR_MARCO_VENTANA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        ventana: ventana,
    }
);

export const modificarMaterialVentana = (nivel, bloque, pared, ventana) => (
    {
        type: MODIFICAR_MATERIAL_VENTANA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        ventana: ventana,
    }
);

export const modificarMaterialPuerta = (nivel, bloque, pared, puerta) => (
    {
        type: MODIFICAR_MATERIAL_PUERTA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        puerta: puerta,
    }
);


export const cambioTipoCamara = () => (
    {
        type: CAMBIO_TIPO_CAMARA,
    }
);

export const activarAgregarBloque = () => (
    {
        type: ACTIVAR_AGREGAR_BLOQUE,
    }
);

export const activarAgregarVentana = () => (
    {
        type: ACTIVAR_AGREGAR_VENTANA,
    }
);

export const activarAgregarPuerta = () => (
    {
        type: ACTIVAR_AGREGAR_PUERTA,
    }
);

export const activarEliminarMorfologia = () => (
    {
        type: ACTIVAR_ELIMINAR_MORFOLOGIA,
    }
);

export const activarSeleccionarMorfologia = () => (
    {
        type: ACTIVAR_SELECCIONAR_MORFOLOGIA,
    }
);

export const verSol = () => (
    {
        type: VER_SOL,
    }
);

export const cambiarFecha = (fecha) => (
    {
        type: CAMBIAR_FECHA,
        fecha: fecha,
    }
);

export const activarRotar = () => (
    {
        type: ACTIVAR_ROTAR,
    }
);

export const activarMoverCamara = () => (
    {
        type: ACTIVAR_MOVER_CAMARA,
    }
);









