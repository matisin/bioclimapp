import {
    CAMBIAR_VARS_INTERNA, SET_STATE_INFO_GEO,
    SET_STATE_MAPA,SET_PERIODO
} from "../constants/action-types";
import produce from "immer";

const initialState = {
    personas: 5,
    iluminacion: 3,
    temperatura: 14,
    aire: 3,

    mapa: {
        lat: -36.82013519999999,
        lng: -73.0443904,
        comuna: null,
        sunPosition: null,
        sunPath: null,
    },
    infoGeo: {
        temperatura: null,
        global: null,
        directa: null,
        difusa: null,
    },
    periodo: {

    },
    rbParedes: null,
    gradosDias: null,
};

const variables = (state = initialState , action) =>
    produce(state,draft => {
        switch (action.type) {
            case CAMBIAR_VARS_INTERNA:
                draft[action.name] = action.value;
                break;
            case SET_STATE_MAPA:
                draft.mapa = action.mapa;
                break;
            case SET_STATE_INFO_GEO:
                draft.infoGeo = action.infoGeo;
                break;
            case SET_PERIODO:
                draft.periodo = action.periodo;
                draft.rbParedes = action.rbParedes;
                draft.gradosDias = action.gradosDias;
        }
    });


export default variables