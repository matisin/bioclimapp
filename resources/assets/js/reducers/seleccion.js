import {CAMBIAR_VARS_INTERNA, SELECCIONAR_MORFOLOGIA, SELECCIONAR_OBSTRUCCION} from "../constants/action-types";
import produce from "immer";

const initialState = {
    morfologia: null,
    contexto: null,
};

const seleccion = (state = initialState , action) =>
    produce(state,draft => {
        switch (action.type) {
            case SELECCIONAR_OBSTRUCCION:
                draft.contexto = action.indice;
                break;
            case SELECCIONAR_MORFOLOGIA:
                draft.morfologia = action.indice;
                break;
        }
    });


export default seleccion