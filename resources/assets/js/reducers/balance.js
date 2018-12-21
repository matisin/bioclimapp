import {
    SET_APORTE_INTERNO, BORRAR_FAR_VENTANA, SET_FAR_VENTANA,
    SET_FAR_VENTANAS, SET_APORTE_SOLAR,
} from "../constants/action-types";
import produce from "immer";

const initialState = {
    farVentanas: {

    },
    aporteInterno : null,
    aporteSolar : null,

};

const balance = (state = initialState , action) =>
    produce(state,draft => {
        switch (action.type) {
            case SET_FAR_VENTANAS:
                draft.farVentanas = action.farVentanas;
                break;
            case SET_FAR_VENTANA:
                draft.farVentanas[action.id] = action.farVentana;
                if(draft.farVentanas.indices === undefined){
                    draft.farVentanas.indices = [];
                }
                draft.farVentanas.indices.push(action.indices);
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

        }
    });


export default balance