import undoable, { distinctState } from 'redux-undo'
import produce from "immer";
import {
    AGREGAR_OBSTRUCCION,ELIMINAR_OBSTRUCCION,SELECCIONAR_OBSTRUCCION,SETEAR_COMUNA,
    MODIFICAR_OBSTRUCCION,
} from "../constants/action-types";

const initialState = {
    seleccion: null,
    obstrucciones: [],
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
                draft.obstrucciones.splice(action.obstruccion.indice,1);
                break;
            case SELECCIONAR_OBSTRUCCION:
                draft.seleccion = action.obstruccion.indice;
                break;
            case SETEAR_COMUNA:
                draft.comuna = comuna;
                break;
            case MODIFICAR_OBSTRUCCION:
                draft[action.obstruccion.indice] = action.obstruccion;
                break;
        }
    });

const undoableContexto = undoable(contexto, {
    filter: distinctState()
});

export default undoableContexto