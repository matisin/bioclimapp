import {
    SET_APORTE_INTERNO,
    BORRAR_FAR_VENTANA,
    SET_FAR_VENTANA,
    SET_FAR_VENTANAS,
    SET_APORTE_SOLAR,
    SET_PERDIDA_VENTILACION,
    SET_TRANSMITANCIAS,
    SET_TRANSMITANCIA_ELEMENTO,
    SET_ELIMINAR_TRANSMITANCIA, SET_PERDIDA_CONDUCCION,
} from "../constants/action-types";
import produce from "immer";

const initialState = {
    farVentanas: {

    },
    aporteInterno : 0,
    aporteSolar : {
        normal : 0,
        objetivo : 0,
    },
    perdidaVentilacion : {
        normal : 0,
        objetivo : 0,
    },
    transmitancias: {
        total: 0,
        totalObjetivo: 0,
        transmitanciasElementos: {},
    },
    puenteTermico: {

    },
    perdidaConduccion:{
        normal: 0,
        objetivo: 0,
    }

};

const balance = (state = initialState , action) =>
    produce(state,draft => {
        switch (action.type) {
            case SET_FAR_VENTANAS:
                draft.farVentanas = action.farVentanas;
                break;
            case SET_FAR_VENTANA:
                draft.farVentanas[action.id] = action.farVentana;
                break;
            case BORRAR_FAR_VENTANA:
                delete draft.farVentanas[action.id];
                break;
            case SET_APORTE_INTERNO:
                draft.aporteInterno = action.aporteInterno;
                break;
            case SET_APORTE_SOLAR:
                draft.aporteSolar = action.aporteSolar;
                break;
            case SET_PERDIDA_VENTILACION:
                draft.perdidaVentilacion = action.perdida;
                break;
            case SET_PERDIDA_CONDUCCION:
                draft.perdidaConduccion = action.perdida;
                break;
            case SET_TRANSMITANCIAS:
                draft.transmitancias = action.transmitancias;
                break;
            case SET_TRANSMITANCIA_ELEMENTO:
                if(draft.transmitancias.transmitanciasElementos[action.id] !== undefined){
                    let perdidas = draft.transmitancias.transmitanciasElementos[action.id];
                    draft.total-=perdidas.normal;
                    draft.totalObjetivo-=perdidas.objetivo;
                }
                draft.transmitancias.transmitanciasElementos[action.id] = action.perdida;
                draft.total+=action.perdida.normal;
                draft.totalObjetivo+=action.perdida.objetivo;
                break;
            case SET_ELIMINAR_TRANSMITANCIA:
                let perdidas = draft.transmitancias[action.id];
                draft.total-=perdidas.normal;
                draft.totalObjetivo-=perdidas.objetivo;
                delete draft.transmitancias[action.id];

        }
    });


export default balance