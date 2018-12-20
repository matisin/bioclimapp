import {
    SET_FAR_VENTANAS ,
} from "../constants/action-types";
import produce from "immer";

const initialState = {
    farVentanas: {

    },
};

const balance = (state = initialState , action) =>
    produce(state,draft => {
        switch (action.type) {
            case SET_FAR_VENTANAS:
                draft.farVentanas = action.farVentanas;
                break;
        }
    });


export default balance