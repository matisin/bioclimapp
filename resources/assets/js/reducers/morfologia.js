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
    MODIFICAR_MATERIAL_PUERTA,
    MODIFICAR_MATERIAL_VENTANA,
    ROTAR_CASA,
    MORFOLOGIA_UNDO,
    MORFOLOGIA_REDO,
    AGREGAR_CAPA_PARED,
    AGREGAR_CAPA_TECHO,
    AGREGAR_CAPA_PISO,
    BORRAR_CAPA_PARED,
    BORRAR_CAPA_TECHO,
    BORRAR_CAPA_PISO,
    APLICAR_CAPA_A_PAREDES,
    APLICAR_CAPA_A_TECHOS,
    APLICAR_CAPA_A_PISOS,
    MODIFICAR_POSICION_VENTANA,
    APLICAR_MARCOS_A_VENTANAS, APLICAR_MATERIAL_A_VENTANAS, APLICAR_MATERIAL_A_PUERTAS, MODIFICAR_POSICION_PUERTA,
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
        let capas,material,marco;
        switch (action.type) {
            case AGREGAR_NIVEL:
                draft.niveles.push({bloques: [],altura: action.altura});
                break;
            case AGREGAR_BLOQUE:
                draft.niveles[action.nivel].bloques.push(action.bloque);
                if(draft.niveles[action.nivel+1] === undefined){
                    draft.niveles.push({bloques: [],altura: action.bloque.dimensiones.alto+draft.niveles[action.nivel]
                            .altura});
                }
                break;
            case AGREGAR_CAPA_PARED:
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].capas.push(action.capa);
                break;
            case BORRAR_CAPA_PARED:
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].capas.splice(action.capa,1);
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
            case AGREGAR_CAPA_TECHO:
                draft.niveles[action.nivel].bloques[action.bloque].techo.capas.push(action.capa);
                break;
            case BORRAR_CAPA_TECHO:
                draft.niveles[action.nivel].bloques[action.bloque].techo.capas.splice(action.capa,1);
                break;
            case AGREGAR_CAPA_PISO:
                draft.niveles[action.nivel].bloques[action.bloque].piso.capas.push(action.capa);
                break;
            case BORRAR_CAPA_PISO:
                draft.niveles[action.nivel].bloques[action.bloque].piso.capas.splice(action.capa,1);
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

                for(let pared of draft.niveles[action.nivel].bloques[action.bloque].paredes){
                    if(pared.orientacion.z !== 0){
                        pared.dimensiones =  {
                            ancho : action.dimensiones.ancho,
                            alto: action.dimensiones.alto,
                        };
                        pared.posicion = {
                            x: 0,
                            y:0,
                            z: Math.round(action.dimensiones.largo/2*10)/10 * -pared.orientacion.z,
                        }
                    }else{
                        pared.dimensiones= {
                            ancho : action.dimensiones.largo,
                            alto: action.dimensiones.alto,
                        };
                        pared.posicion = {
                            x: Math.round(action.dimensiones.ancho/2*10)/10 *  -pared.orientacion.x,
                            y:0,
                            z: 0,
                        }
                    }
                }
                draft.niveles[action.nivel].bloques[action.bloque].dimensiones = action.dimensiones;

                if(draft.niveles[action.nivel+1].altura !==
                    (draft.niveles[action.nivel].altura +
                    action.dimensiones.alto)){
                    for(let i = action.nivel+1; i < draft.niveles.length ; i++){
                        console.log(draft.niveles[i-1].bloques[0],'bloques a subir');
                        if(draft.niveles[i-1].bloques[0] !== undefined){
                            console.log(i);
                            draft.niveles[i].altura =
                                draft.niveles[i-1].altura +
                                draft.niveles[i-1].bloques[0].dimensiones.alto;
                        }
                    }
                }

                break;
            case MODIFICAR_DIMENSIONES_VENTANA:
                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .ventanas[action.ventana]
                    .dimensiones = action.dimensiones;
                break;
            case MODIFICAR_POSICION_VENTANA:
                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .ventanas[action.ventana]
                    .posicion = action.posicion;
                break;
            case MODIFICAR_POSICION_PUERTA:
                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .puertas[action.puerta]
                    .posicion = action.posicion;
                break;
            case MODIFICAR_DIMENSIONES_PUERTA:
                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .puertas[action.puerta]
                    .dimensiones = action.dimensiones;
                break;
            case MODIFICAR_CAPA_PARED:
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].capas[action.indice] = action.capa;
                break;
            case MODIFICAR_CAPA_PISO:
                draft.niveles[action.nivel].bloques[action.bloque].piso.capas[action.indice] = action.capa;
                break;
            case MODIFICAR_CAPA_TECHO:
                draft.niveles[action.nivel].bloques[action.bloque].techo.capas[action.indice] = action.capa;
                break;
            case APLICAR_CAPA_A_PAREDES:
                capas = draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].capas;
                for(let indice of action.indices){
                    draft.niveles[indice.nivel]
                        .bloques[indice.bloque]
                        .paredes[indice.pared]
                        .capas = capas;
                }
                break;
            case APLICAR_CAPA_A_PISOS:
                capas = draft.niveles[action.nivel].bloques[action.bloque].piso.capas;
                for(let indice of action.indices){
                    draft.niveles[indice.nivel]
                        .bloques[indice.bloque]
                        .piso
                        .capas = capas;
                }
                break;
            case APLICAR_CAPA_A_TECHOS:
                capas = draft.niveles[action.nivel].bloques[action.bloque].techo.capas;
                for(let indice of action.indices){
                    draft.niveles[indice.nivel]
                        .bloques[indice.bloque]
                        .techo
                        .capas = capas;
                }
                break;
            case APLICAR_MATERIAL_A_PUERTAS:
                material = draft
                    .niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .puertas[action.puerta]
                    .material;
                for(let indice of action.indices){
                    draft.niveles[indice.nivel]
                        .bloques[indice.bloque]
                        .paredes[indice.pared]
                        .puertas[indice.puerta]
                        .material = material;
                }
                break;
            case APLICAR_MATERIAL_A_VENTANAS:
                material = draft
                    .niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .ventanas[action.ventana]
                    .material;
                for(let indice of action.indices){
                    draft.niveles[indice.nivel]
                        .bloques[indice.bloque]
                        .paredes[indice.pared]
                        .ventanas[indice.ventana]
                        .material = material;
                }
                break;
            case APLICAR_MARCOS_A_VENTANAS:
                marco = draft
                    .niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .ventanas[action.ventana]
                    .marco;
                for(let indice of action.indices){
                    draft.niveles[indice.nivel]
                        .bloques[indice.bloque]
                        .paredes[indice.pared]
                        .ventanas[indice.ventana]
                        .marco = marco;
                }
                break;
            case MODIFICAR_MARCO_VENTANA:
                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .ventanas[action.ventana]
                    .marco = action.marco;
                break;
            case MODIFICAR_MATERIAL_VENTANA:
                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .ventanas[action.ventana]
                    .material = action.material;
                break;
            case MODIFICAR_MATERIAL_PUERTA:
                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .puertas[action.puerta]
                    .material = action.material;
                break;

        }

    });

const undoableMorfologia = undoable(morfologia, {
    filter: distinctState(),
    undoType: MORFOLOGIA_UNDO,
    redoType: MORFOLOGIA_REDO,
});

export default undoableMorfologia