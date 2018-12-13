import undoable, { distinctState } from 'redux-undo'
import produce from "immer";
import {
    predefinidaSimpleState,
    predefinidaDobleState,
    predefinidaSimpleDosPisosState,
    predefinidaDobleDosPisosState,
} from '../constants/casasPredefinidas'
import {
    AGREGAR_BLOQUE,
    AGREGAR_NIVEL,
    AGREGAR_PUERTA,
    AGREGAR_TECHO,
    AGREGAR_VENTANA,
    BORRAR_BLOQUE,
    BORRAR_NIVEL,
    BORRAR_TECHO,
    BORRAR_VENTANA,
    BORRAR_PUERTA,
    CASA_PREDEFINIDA_DOBLE,
    CASA_PREDEFINIDA_DOBLE_DOS_PISOS,
    CASA_PREDEFINIDA_SIMPLE,
    CASA_PREDEFINIDA_SIMPLE_DOS_PISOS,
    MODIFICAR_CAPA_PARED,
    MODIFICAR_CAPA_PISO,
    MODIFICAR_CAPA_TECHO,
    MODIFICAR_DIMENSIONES_BLOQUE,
    MODIFICAR_DIMENSIONES_PUERTA,
    MODIFICAR_DIMENSIONES_VENTANA,
    MODIFICAR_MARCO_VENTANA,
    MODIFICAR_MATERIAL_PUERTA, MODIFICAR_MATERIAL_VENTANA, ROTAR_CASA, MORFOLOGIA_UNDO, MORFOLOGIA_REDO,
} from "../constants/action-types";
import {agregarNivel} from "../actions";

const initialState = {
    rotacion: 0,//TODO: REVISAR ROTACION INICIAL.
    niveles:[{
        bloques:[],
        altura: 0,
    }],
    aporteInterno: 0,
    perdidaVentilacion: 0,
    perdidaConduccion: 0,
    transmitanciaSuperficies: 0,
    volumen: 0,
    area: 0,
};

const morfologia = (state = initialState, action) =>
    produce(state, draft => {
        switch (action.type) {
            case AGREGAR_NIVEL:
                draft.niveles.push({bloques: [],altura: action.altura});
                break;
            case AGREGAR_BLOQUE:
                draft.niveles[action.nivel].bloques.push(action.bloque);
                if(draft.niveles[action.nivel+1] === undefined){
                    draft.niveles.push({bloques: [],altura: action.bloque.dimensiones.alto+draft.niveles[action.nivel].altura});
                }
                break;
            case AGREGAR_PUERTA:
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].puertas.push(action.puerta);
                break;
            case AGREGAR_VENTANA:
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].ventanas.push(action.ventana);
                break;
            case AGREGAR_TECHO:
                draft.niveles[action.nivel].bloques[action.bloque].techo = action.techo;
                break;
            case CASA_PREDEFINIDA_SIMPLE:
                delete draft.niveles;
                Object.assign(draft,predefinidaSimpleState);
                break;
            case CASA_PREDEFINIDA_SIMPLE_DOS_PISOS:
                delete draft.niveles;
                Object.assign(draft,predefinidaSimpleDosPisosState);
                break;
            case CASA_PREDEFINIDA_DOBLE:
                delete draft.niveles;
                Object.assign(draft,predefinidaDobleState);
                break;
            case CASA_PREDEFINIDA_DOBLE_DOS_PISOS:
                delete draft.niveles;
                Object.assign(draft,predefinidaDobleDosPisosState);
                break;
            case BORRAR_NIVEL:
                delete draft.niveles[action.nivel];
                break;
            case BORRAR_BLOQUE:
                draft.niveles[action.nivel].bloques.splice(action.bloque,1);
                break;
            case BORRAR_VENTANA:
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].ventanas.splice(action.ventana,1);
                break;
            case BORRAR_PUERTA:
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].puertas.splice(action.puerta,1);
                console.log('draft',draft);
                break;
            case BORRAR_TECHO:
                delete draft.niveles[action.nivel].bloques[action.bloque].techo;
                break;
            case ROTAR_CASA:
                draft.rotacion = action.angulo;
                break;
            case MODIFICAR_DIMENSIONES_BLOQUE:
                draft.niveles[action.nivel].bloques[action.bloque].dimensiones = action.dimensiones;
                break;
            case MODIFICAR_DIMENSIONES_VENTANA:
                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .ventanas[action.ventana]
                    .dimensiones = action.dimensiones;
                break;
            case MODIFICAR_DIMENSIONES_PUERTA:
                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .puertas[action.puerta]
                    .dimensiones = action.dimensiones;
                break;
            case MODIFICAR_CAPA_PARED:
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].capas = action.capas;
                break;
            case MODIFICAR_CAPA_PISO:
                draft.niveles[action.nivel].bloques[action.bloque].piso.capas = action.capas;
                break;
            case MODIFICAR_CAPA_TECHO:
                draft.niveles[action.nivel].bloques[action.bloque].techo.capas = action.capas;
                break;
            case MODIFICAR_MARCO_VENTANA:
                break;
            case MODIFICAR_MATERIAL_VENTANA:
                break;
            case MODIFICAR_MATERIAL_PUERTA:
                break;

        }

    });

const undoableMorfologia = undoable(morfologia, {
    filter: distinctState(),
    undoType: MORFOLOGIA_UNDO,
    redoType: MORFOLOGIA_REDO,
});

export default undoableMorfologia