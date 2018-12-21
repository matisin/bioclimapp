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
    action: null,
};

const morfologia = (state = initialState, action) =>
    produce(state, draft => {
        let capas,material,marco,dimensiones,superficie;
        switch (action.type) {
            case AGREGAR_NIVEL:
                draft.action = action;
                draft.niveles.push({bloques: [],altura: action.altura});
                break;
            case AGREGAR_BLOQUE:
                draft.action = action;
                draft.niveles[action.nivel].bloques.push(action.bloque);
                if(draft.niveles[action.nivel+1] === undefined){
                    draft.niveles.push({bloques: [],altura: action.bloque.dimensiones.alto+draft.niveles[action.nivel]
                            .altura});
                }
                dimensiones = action.bloque.dimensiones;
                draft.area+= dimensiones.ancho * dimensiones.largo;
                draft.volumen+= dimensiones.ancho * dimensiones.largo* dimensiones.largo;
                break;
            case AGREGAR_CAPA_PARED:
                draft.action = action;
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].capas.push(action.capa);
                break;
            case BORRAR_CAPA_PARED:
                draft.action = action;
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].capas.splice(action.capa,1);
                break;
            case AGREGAR_PUERTA:
                draft.action = action;
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].superficie-=action.puerta.superficie;
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].puertas.push(action.puerta);
                break;
            case AGREGAR_VENTANA:
                draft.action = action;
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].superficie-=action.ventana.superficie;
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].ventanas.push(action.ventana);
                break;
            case AGREGAR_TECHO:
                draft.action = action;
                draft.niveles[action.nivel].bloques[action.bloque].techo = action.techo;
                break;
            case AGREGAR_CAPA_TECHO:
                draft.action = action;
                draft.niveles[action.nivel].bloques[action.bloque].techo.capas.push(action.capa);
                break;
            case BORRAR_CAPA_TECHO:
                draft.action = action;
                draft.niveles[action.nivel].bloques[action.bloque].techo.capas.splice(action.capa,1);
                break;
            case AGREGAR_CAPA_PISO:
                draft.action = action;
                draft.niveles[action.nivel].bloques[action.bloque].piso.capas.push(action.capa);
                break;
            case BORRAR_CAPA_PISO:
                draft.action = action;
                draft.niveles[action.nivel].bloques[action.bloque].piso.capas.splice(action.capa,1);
                break;
            case CASA_PREDEFINIDA_SIMPLE:
                draft.action = action;
                delete draft.niveles;
                Object.assign(draft,predefinidaSimpleState);
                break;
            case CASA_PREDEFINIDA_SIMPLE_DOS_PISOS:
                draft.action = action;
                delete draft.niveles;
                Object.assign(draft,predefinidaSimpleDosPisosState);
                break;
            case CASA_PREDEFINIDA_DOBLE:
                draft.action = action;
                delete draft.niveles;
                Object.assign(draft,predefinidaDobleState);
                break;
            case CASA_PREDEFINIDA_DOBLE_DOS_PISOS:
                draft.action = action;
                delete draft.niveles;
                Object.assign(draft,predefinidaDobleDosPisosState);
                break;
            case BORRAR_NIVEL:
                draft.action = action;
                delete draft.niveles[action.nivel];
                break;
            case BORRAR_BLOQUE:
                draft.action = action;
                dimensiones = draft.niveles[action.nivel].bloques[action.bloque].dimensiones;
                draft.niveles[action.nivel].bloques.splice(action.bloque,1);
                draft.area-=dimensiones.alto* dimensiones.ancho;
                draft.volumen-= dimensiones.alto* dimensiones.ancho * dimensiones.largo;
                break;
            case BORRAR_VENTANA:
                draft.action = action;
                superficie = draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].ventanas[action.ventana].superficie;
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].superficie+=superficie;
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].ventanas.splice(action.ventana,1);
                break;
            case BORRAR_PUERTA:
                draft.action = action;
                superficie = draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].puertas[action.puerta].superficie;
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].superficie+=superficie;
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].puertas.splice(action.puerta,1);
                break;
            case BORRAR_TECHO:
                draft.action = action;
                delete draft.niveles[action.nivel].bloques[action.bloque].techo;
                break;
            case ROTAR_CASA:
                draft.action = action;
                draft.rotacion = action.angulo;
                break;
            case MODIFICAR_DIMENSIONES_BLOQUE:
                draft.action = action;

                for(let pared of draft.niveles[action.nivel].bloques[action.bloque].paredes){
                    if(pared.orientacion.z !== 0){
                        pared.dimensiones =  {
                            ancho : action.dimensiones.ancho,
                            alto: action.dimensiones.alto,
                        };
                        pared.posicion = {
                            x: 0,
                            y:0,
                            z: Math.round(action.dimensiones.largo/2*10)/10 * pared.orientacion.z,
                        }
                    }else{
                        pared.dimensiones= {
                            ancho : action.dimensiones.largo,
                            alto: action.dimensiones.alto,
                        };
                        pared.posicion = {
                            x: Math.round(action.dimensiones.ancho/2*10)/10 *  pared.orientacion.x,
                            y:0,
                            z: 0,
                        }
                    }
                }
                dimensiones = draft.niveles[action.nivel].bloques[action.bloque].dimensiones;
                draft.volumen-= dimensiones.alto* dimensiones.ancho * dimensiones.largo;
                draft.area-=dimensiones.alto* dimensiones.ancho;
                draft.niveles[action.nivel].bloques[action.bloque].dimensiones = action.dimensiones;
                draft.volumen+= action.dimensiones.alto* action.dimensiones.ancho * action.dimensiones.largo;
                draft.area+=action.dimensiones.alto* action.dimensiones.ancho;

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
                draft.action = action;
                superficie = draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].ventanas[action.ventana].superficie;
                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared].superficie+= superficie;

                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .ventanas[action.ventana]
                    .dimensiones = action.dimensiones;

                superficie = action.dimensiones.alto * action.dimensiones.ancho;

                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared].superficie-=superficie;

                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .ventanas[action.ventana]
                    .superficie = superficie;
                break;
            case MODIFICAR_POSICION_VENTANA:
                draft.action = action;
                let diferenciaY = action.posicion.y - draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .ventanas[action.ventana]
                    .posicion.y;
                let diferenciaX = action.posicion.x - draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .ventanas[action.ventana]
                    .posicion.x;
                let orientacion = draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .ventanas[action.ventana].orientacion;
                if(orientacion.z !== 0){
                    draft.niveles[action.nivel]
                        .bloques[action.bloque]
                        .paredes[action.pared]
                        .ventanas[action.ventana]
                        .posicionReal.x += diferenciaX*orientacion.z ;
                }else{
                    draft.niveles[action.nivel]
                        .bloques[action.bloque]
                        .paredes[action.pared]
                        .ventanas[action.ventana]
                        .posicionReal.z += diferenciaX*-orientacion.x ;
                }
                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .ventanas[action.ventana]
                    .posicionReal.y += diferenciaY;
                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .ventanas[action.ventana]
                    .posicion = action.posicion;
                break;
            case MODIFICAR_POSICION_PUERTA:
                draft.action = action;
                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .puertas[action.puerta]
                    .posicion = action.posicion;
                break;
            case MODIFICAR_DIMENSIONES_PUERTA:
                draft.action = action;
                superficie =
                    draft.niveles[action.nivel]
                        .bloques[action.bloque]
                        .paredes[action.pared]
                        .puertas[action.puerta].superficie;
                console.log(superficie);
                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared].superficie+= superficie;

                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .puertas[action.puerta]
                    .dimensiones = action.dimensiones;

                superficie = action.dimensiones.alto * action.dimensiones.ancho;

                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared].superficie-=superficie;

                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .puertas[action.puerta]
                    .superficie = superficie;
                break;
            case MODIFICAR_CAPA_PARED:
                draft.action = action;
                draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].capas[action.indice] = action.capa;
                break;
            case MODIFICAR_CAPA_PISO:
                draft.action = action;
                draft.niveles[action.nivel].bloques[action.bloque].piso.capas[action.indice] = action.capa;
                break;
            case MODIFICAR_CAPA_TECHO:
                draft.action = action;
                draft.niveles[action.nivel].bloques[action.bloque].techo.capas[action.indice] = action.capa;
                break;
            case APLICAR_CAPA_A_PAREDES:
                draft.action = action;
                capas = draft.niveles[action.nivel].bloques[action.bloque].paredes[action.pared].capas;
                for(let indice of action.indices){
                    draft.niveles[indice.nivel]
                        .bloques[indice.bloque]
                        .paredes[indice.pared]
                        .capas = capas;
                }
                break;
            case APLICAR_CAPA_A_PISOS:
                draft.action = action;
                capas = draft.niveles[action.nivel].bloques[action.bloque].piso.capas;
                for(let indice of action.indices){
                    draft.niveles[indice.nivel]
                        .bloques[indice.bloque]
                        .piso
                        .capas = capas;
                }
                break;
            case APLICAR_CAPA_A_TECHOS:
                draft.action = action;
                capas = draft.niveles[action.nivel].bloques[action.bloque].techo.capas;
                for(let indice of action.indices){
                    draft.niveles[indice.nivel]
                        .bloques[indice.bloque]
                        .techo
                        .capas = capas;
                }
                break;
            case APLICAR_MATERIAL_A_PUERTAS:
                draft.action = action;
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
                console.log("LO HICISMOS");
                break;
            case APLICAR_MATERIAL_A_VENTANAS:
                draft.action = action;
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
                draft.action = action;
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
                draft.action = action;
                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .ventanas[action.ventana]
                    .marco = action.marco;
                break;
            case MODIFICAR_MATERIAL_VENTANA:
                draft.action = action;
                draft.niveles[action.nivel]
                    .bloques[action.bloque]
                    .paredes[action.pared]
                    .ventanas[action.ventana]
                    .material = action.material;
                break;
            case MODIFICAR_MATERIAL_PUERTA:
                draft.action = action;
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