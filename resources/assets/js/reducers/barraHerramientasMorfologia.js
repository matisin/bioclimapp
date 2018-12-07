import {
    ACTIVAR_AGREGAR_BLOQUE, ACTIVAR_AGREGAR_PUERTA,
    ACTIVAR_AGREGAR_VENTANA, ACTIVAR_ELIMINAR_MORFOLOGIA,
    ACTIVAR_MOVER_CAMARA, ACTIVAR_ROTAR, ACTIVAR_SELECCIONAR_MORFOLOGIA, CAMBIAR_FECHA
    , CAMBIO_TIPO_CAMARA, VER_SOL
} from "../constants/action-types";
import produce from "immer";

const initialState = {
    camara3D: true,
    accion: null,
    acciones: {
        mover_camara: false,
        agregar_bloque : false,
        agregar_ventana: false,
        agregar_puerta : false,
        seleccionar: false,
        eliminar: false,
        rotar: false,

    },
    fecha: null,
    sol: true,
};

const barra_herramientas_morfologia = (state = initialState , action) =>
    produce(state,draft => {
        switch (action.type) {
            case ACTIVAR_MOVER_CAMARA :
                if(draft.accion !== null){
                    draft.acciones[draft.accion] = false;
                }
                draft.acciones.mover_camara = true;
                draft.accion = 'mover_camara';
                break;
            case ACTIVAR_AGREGAR_BLOQUE :
                console.log("ddd");
                if(draft.accion !== null){
                    draft.acciones[draft.accion] = false;
                }
                draft.acciones.agregar_bloque = true;
                draft.accion = 'agregar_bloque';
                break;
            case ACTIVAR_AGREGAR_VENTANA :
                if(draft.accion !== null){
                    draft.acciones[draft.accion] = false;
                }
                draft.acciones.agregar_ventana = true;
                draft.accion = 'agregar_ventana';
                break;
            case ACTIVAR_AGREGAR_PUERTA :
                console.log("asdsda");
                if(draft.accion !== null){
                    draft.acciones[draft.accion] = false;
                }
                draft.acciones.agregar_puerta = true;
                draft.accion = 'agregar_puerta';
                break;
            case ACTIVAR_SELECCIONAR_MORFOLOGIA :
                console.log(draft.acciones[draft.accion] );
                if(draft.accion !== null){
                    draft.acciones[draft.accion] = false;
                }
                draft.acciones.seleccionar = true;
                draft.accion = 'seleccionar';
                break;
            case ACTIVAR_ELIMINAR_MORFOLOGIA :
                console.log(draft.acciones[draft.accion] );
                if(draft.accion !== null){
                    draft.acciones[draft.accion] = false;
                }
                draft.acciones.eliminar = true;
                draft.accion = 'eliminar';
                break;
            case ACTIVAR_ROTAR :
                if(draft.accion !== null){
                    draft.acciones[draft.accion] = false;
                }
                draft.acciones.rotar = true;
                draft.accion = 'rotar';
                break;

            case VER_SOL :
                draft.sol = !draft.sol;
                break;
            case CAMBIAR_FECHA :
                draft.fecha = action.fecha;
                break;
            case CAMBIO_TIPO_CAMARA :
                draft.camara3D = !draft.camara3D;
                break;
        }
    });


export default barra_herramientas_morfologia