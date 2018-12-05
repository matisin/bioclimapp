import {CAMBIAR_VARS_INTERNA} from "../constants/action-types";
import produce from "immer";

const initialState = {
    personas: 5,
    iluminacion: 3,
    temperatura: 14,
    aire: 3,
};

const variables_internas = (state = initialState , action) =>
    produce(state,draft => {
        switch (action.type) {
            case CAMBIAR_VARS_INTERNA:
                draft[action.name] = action.value;
                break;
        }
    });


export default variables_internas