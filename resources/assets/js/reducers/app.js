import {
    ACTUALIZAR_OBSTRUCCIONES_APP,
    AGREGAR_OBSTRUCCION,
    CAMBIAR_VARS_INTERNA,
    SELECCIONAR_MORFOLOGIA,
    SELECCIONAR_OBSTRUCCION, SET_CALCULANDO,
    SET_CARGANDO,
    SET_MATERIALES,
    SET_MATERIALES_MARCOS,
    SET_MATERIALES_VENTANAS,
    SET_STATE_INFO_GEO,
    SET_STATE_MAPA
} from "../constants/action-types";
import produce from "immer";

const initialState = {
    seleccion_morfologia: [null],
    seleccion_contexto: null,
    cargando : {},
    calculando : {},
    materiales : null,
    materiales_ventanas : null,
    materiales_marcos : null,
    obstrucciones : [],
};

const app = (state = initialState , action) =>
    produce(state,draft => {
        switch (action.type) {
            case SELECCIONAR_OBSTRUCCION:
                draft.seleccion_contexto = action.indice;
                break;
            case SELECCIONAR_MORFOLOGIA:
                console.log('grupo',action.grupo);
                if(action.grupo){
                    draft.seleccion_morfologia.push(action.seleccion);
                }else{
                    draft.seleccion_morfologia.splice(0,draft.seleccion_morfologia.length);
                    draft.seleccion_morfologia.push(action.seleccion);
                }
                //draft.seleccion_morfologia = action.seleccion;
                break;
            case SET_CALCULANDO:
                let calculando = {};
                Object.assign(calculando,draft.calculando);
                if(action.calculando){
                    calculando[action.sender] = action.calculando;
                }else{
                    delete calculando[action.sender];
                }
                draft.calculando = calculando;
                break;
            case SET_CARGANDO:
                let cargando = {};
                Object.assign(cargando,draft.cargando);
                if(action.cargando){
                    cargando[action.sender] = action.cargando;
                }else{
                    delete cargando[action.sender];
                }
                draft.cargando = cargando;
                break;
            case SET_MATERIALES:
                draft.materiales = action.materiales;
                break;
            case SET_MATERIALES_VENTANAS:
                draft.materiales_ventanas = action.materiales_ventanas;
                break;
            case SET_MATERIALES_MARCOS:
                draft.materiales_marcos = action.materiales_marcos;
                break;
            case ACTUALIZAR_OBSTRUCCIONES_APP:
                draft.obstrucciones = action.obstrucciones;

        }
    });


export default app