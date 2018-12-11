import {
    CAMBIAR_VARS_INTERNA,
    SELECCIONAR_MORFOLOGIA,
    SELECCIONAR_OBSTRUCCION, SET_CARGANDO,
    SET_STATE_MAPA
} from "../constants/action-types";
import produce from "immer";

const initialState = {
    personas: 5,
    iluminacion: 3,
    temperatura: 14,
    aire: 3,
    seleccion_morfologia: null,
    seleccion_contexto: null,
    mapa: {
        lat: -36.82013519999999,
        lng: -73.0443904,
        comuna: null,
        sunPosition: null,
        sunPath: null,
    },
    cargando : true,
};

const app = (state = initialState , action) =>
    produce(state,draft => {
        switch (action.type) {
            case CAMBIAR_VARS_INTERNA:
                draft[action.name] = action.value;
                break;
            case SELECCIONAR_OBSTRUCCION:
                draft.seleccion_contexto = action.indice;
                break;
            case SELECCIONAR_MORFOLOGIA:
                draft.seleccion_morfologia = action.indice;
                break;
            case SET_STATE_MAPA:
                draft.mapa = action.mapa;
                break;
            case SET_CARGANDO:
                draft.cargando = action.cargando;
        }
    });


export default app