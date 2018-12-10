import undoable, { distinctState } from 'redux-undo'
import produce from "immer";
import {
    AGREGAR_OBSTRUCCION, ELIMINAR_OBSTRUCCION, SELECCIONAR_OBSTRUCCION, SETEAR_COMUNA,
    MODIFICAR_OBSTRUCCION, CONTEXTO_REDO, CONTEXTO_UNDO,
} from "../constants/action-types";

const initialState = {
    seleccion: null,
    obstrucciones: [
        /*{
            longitud: 15,
            altura: 10,
            posicion: {
                x: 15,
                z: 15,
            },
            grados: 15,
        },
        {
            longitud: 10,
            altura: 20,
            posicion: {
                x: -18,
                z: -15,
            },
            grados: 23,
        }*/
    ],
    comuna: {},
    zona: null,
    grados_dias: null,
    periodo: [],
};

const contexto = (state = initialState, action) =>
    produce(state, draft => {
        switch (action.type) {
            case AGREGAR_OBSTRUCCION:
                draft.obstrucciones.push(action.obstruccion);
                break;
            case ELIMINAR_OBSTRUCCION:

                draft.obstrucciones.splice(action.indice,1);
                break;
            case SETEAR_COMUNA:
                draft.comuna = comuna;
                break;
            case MODIFICAR_OBSTRUCCION:
                draft[action.indice] = action.obstruccion;
                break;
        }
    });

const undoableContexto = undoable(contexto, {
    filter: distinctState(),
    undoType: CONTEXTO_UNDO,
    redoType: CONTEXTO_REDO,
});

export default undoableContexto