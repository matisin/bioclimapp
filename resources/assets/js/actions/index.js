import {
    ADD_ARTICLE,
    AGREGAR_BLOQUE,
    AGREGAR_NIVEL,
    AGREGAR_PUERTA,
    AGREGAR_VENTANA,
    BORRAR_BLOQUE,
    BORRAR_NIVEL,
    BORRAR_VENTANA,
    CAMBIAR_VARS_INTERNA,
    CASA_PREDEFINIDA_DOBLE,
    CASA_PREDEFINIDA_DOBLE_DOS_PISOS,
    CASA_PREDEFINIDA_SIMPLE,
    CASA_PREDEFINIDA_SIMPLE_DOS_PISOS,
    MODIFICAR_DIMENSIONES_BLOQUE,
    MODIFICAR_DIMENSIONES_VENTANA,
    MODIFICAR_DIMENSIONES_PUERTA,
    MODIFICAR_MARCO_VENTANA,
    MODIFICAR_MATERIAL_VENTANA, MODIFICAR_MATERIAL_PUERTA,
} from "../constants/action-types";
import store from "../store";

export const addArticle = article => (
    {
        type: ADD_ARTICLE,
        payload: article,
    }
);

export const cambiarVarsInterna = variable => (
    {
        type: CAMBIAR_VARS_INTERNA,
        name: variable.name,
        value: variable.value,
    }
);

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
        if(state.niveles[nivel+1] === undefined){
            dispatch(agregarNivel((nivel+1)*bloque.dimensiones.alto));
        }

    }
};

export const agregarVentana = (ventana, nivel, bloque, pared) =>(
    {
        type: AGREGAR_VENTANA,
        nivel : nivel,
        bloque : bloque,
        pared: pared,
        payload: ventana,
    }
);

export const agregarPuerta = (puerta, nivel, bloque, pared) =>(
    {
        type: AGREGAR_PUERTA,
        nivel : nivel,
        bloque : bloque,
        pared: pared,
        payload: puerta,
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

export const borrarVentana = (ventana, nivel, bloque, pared) => (
    {
        type: BORRAR_VENTANA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        ventana: ventana,
    }
);

export const borrarPuerta = (puerta, nivel, bloque, pared) => (
    {
        type: BORRAR_PUERTA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        puerta: puerta,
    }
);

export const borrarTecho = (techo, nivel, bloque, pared) => (
    {
        type: BORRAR_TECHO,
        nivel: nivel,
        bloque: bloque,
    }
);

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







