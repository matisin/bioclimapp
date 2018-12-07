import {
    ACTIVAR_AGREGAR_CONTEXTO, ACTIVAR_ELIMINAR_CONTEXTO,
    MOSTRAR_OCULTAR_MAPA, ACTIVAR_SELECCIONAR_CONTEXTO,
} from "../constants/action-types";
import produce from "immer";

const initialState = {
    accion: null,
    acciones: {
        seleccionar: false,
        eliminar : false,
        agregar: false,

    },
    mostrar_mapa: false,
};

const barra_herramientas_contexto = (state = initialState , action) =>
    produce(state,draft => {
        switch (action.type) {
            case ACTIVAR_AGREGAR_CONTEXTO :
                if(draft.accion !== null){
                    draft.acciones[draft.accion] = false;
                }
                draft.acciones.agregar = true;
                draft.accion = 'agregar';
                break;
            case ACTIVAR_ELIMINAR_CONTEXTO :
                if(draft.accion !== null){
                    draft.acciones[draft.accion] = false;
                }
                draft.acciones.eliminar = true;
                draft.accion = 'eliminar';
                break;
            case ACTIVAR_SELECCIONAR_CONTEXTO :
                if(draft.accion !== null){
                    draft.acciones[draft.accion] = false;
                }
                draft.acciones.seleccionar = true;
                draft.accion = 'seleccionar';
                break;
            case MOSTRAR_OCULTAR_MAPA :
                draft.mostrar_mapa = !draft.mostrar_mapa;
                break;
        }
    });

export default barra_herramientas_contexto