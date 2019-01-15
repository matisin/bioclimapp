import {
    CAMBIAR_VARS_INTERNA,

    AGREGAR_BLOQUE,
    AGREGAR_NIVEL,
    AGREGAR_PUERTA,
    AGREGAR_VENTANA,
    BORRAR_PUERTA,
    BORRAR_BLOQUE,
    BORRAR_NIVEL,
    BORRAR_VENTANA,
    CASA_PREDEFINIDA_DOBLE,
    CASA_PREDEFINIDA_DOBLE_DOS_PISOS,
    CASA_PREDEFINIDA_SIMPLE,
    CASA_PREDEFINIDA_SIMPLE_DOS_PISOS,
    MODIFICAR_DIMENSIONES_BLOQUE,
    MODIFICAR_DIMENSIONES_VENTANA,
    MODIFICAR_DIMENSIONES_PUERTA,
    MODIFICAR_MARCO_VENTANA,
    MODIFICAR_MATERIAL_VENTANA,
    MODIFICAR_MATERIAL_PUERTA,

    CAMBIO_TIPO_CAMARA,
    ACTIVAR_ELIMINAR_MORFOLOGIA,
    VER_SOL,
    ACTIVAR_ROTAR,
    ACTIVAR_AGREGAR_BLOQUE,
    ACTIVAR_AGREGAR_PUERTA,
    ACTIVAR_AGREGAR_VENTANA,
    ACTIVAR_MOVER_CAMARA,
    ACTIVAR_SELECCIONAR_MORFOLOGIA,

    ACTIVAR_AGREGAR_CONTEXTO,
    ACTIVAR_ELIMINAR_CONTEXTO,
    MOSTRAR_OCULTAR_MAPA,
    ACTIVAR_SELECCIONAR_CONTEXTO,

    AGREGAR_OBSTRUCCION,
    ELIMINAR_OBSTRUCCION,
    SELECCIONAR_OBSTRUCCION,
    SETEAR_COMUNA,
    MODIFICAR_OBSTRUCCION,
    CONTEXTO_UNDO,
    CONTEXTO_REDO,
    MORFOLOGIA_UNDO,
    MORFOLOGIA_REDO,
    SET_STATE_MAPA,
    SET_CARGANDO,
    SET_STATE_INFO_GEO,
    ROTAR_CASA,
    CAMBIAR_FECHA,
    SELECCIONAR_MORFOLOGIA,
    SET_MATERIALES,
    SET_MATERIALES_VENTANAS,
    SET_MATERIALES_MARCOS,
    AGREGAR_CAPA_PARED,
    BORRAR_CAPA_PARED,
    BORRAR_CAPA_PISO,
    BORRAR_CAPA_TECHO,
    MODIFICAR_CAPA_PARED,
    MODIFICAR_CAPA_TECHO,
    MODIFICAR_CAPA_PISO,
    APLICAR_CAPA_A_PAREDES,
    APLICAR_CAPA_A_PISOS,
    APLICAR_CAPA_A_TECHOS,
    AGREGAR_CAPA_PISO,
    AGREGAR_CAPA_TECHO,
    MODIFICAR_POSICION_VENTANA,
    APLICAR_MATERIAL_A_VENTANAS,
    APLICAR_MATERIAL_A_PUERTAS,
    MODIFICAR_POSICION_PUERTA,
    APLICAR_MARCOS_A_VENTANAS,
    ACTUALIZAR_OBSTRUCCIONES_APP,
    SET_PERIODO,
    SET_FAR_VENTANAS,
    SET_CALCULANDO,
    SET_APORTE_INTERNO,
    SET_FAR_VENTANA,
    BORRAR_FAR_VENTANA, SET_APORTE_SOLAR, SET_PERDIDA_VENTILACION, SET_PERDIDA_CONDUCCION,

} from "../constants/action-types";
import axios from "axios";
import {getSunPath, getSunPosition} from "../Utils/sunMethods";
import {
    getComunas,
    getDifuseRadiationById,
    getDirectRadiationById, getFilteredRadiationDifusa, getFilteredRadiationDirecta,
    getGlobalRadiationById, getMateriales, getMaterialesMarcos, getMaterialesVentanas,
    getTemperaturesById
} from "../Utils/llamadasAxios";
import {getJsonMarcos, getJsonMateriales, getJsonVentanas} from "../Utils/materialesFormat";
import {
    aporteInterno,
    calcularAngulos, calcularAporteSolar,
    calcularFAR,
    calcularFARVentana,
    calcularRbParedes,
    gradosDias, perdidasConduccion, perdidasVentilacion, puenteTermicoRedux, transmitanciaSuperficies
} from "../Utils/BalanceEnergetico";


export const setStateMapa = (mapa) => (
    {
        type: SET_STATE_MAPA,
        mapa: mapa,
    }
);

export const setStateInfoGeo = (infoGeo) => (
    {
        type: SET_STATE_INFO_GEO,
        infoGeo: infoGeo,
    }
);

export const setCalculando = (calculando,sender) => (
    {
        type: SET_CALCULANDO,
        calculando: calculando,
        sender: sender,
    }
);

export const middleware_set_state_mapa = (lat, lng) => {

    return function (dispatch, getState) {
        const date = getState().barra_herramientas_morfologia.fecha;
        const tempConfort = getState().variables.temperatura;
        const angulo = getState().morfologia.present.rotacion;
        //wait(10000);
        dispatch(setCalculando(true,'set_state_mapa'));
        getComunas(lat, lng)
            .then(response => {
                    if (response.data.length > 0) {

                        let map = {
                            lat: lat,
                            lng: lng,
                            comuna: response.data[0],
                            sunPosition: getSunPosition(lat, lng, date),
                            sunPath: getSunPath(lat, lng, date)
                        };
                        dispatch(setStateMapa(map));
                        axios.all([
                                getTemperaturesById(response.data[0].id),
                                getGlobalRadiationById(response.data[0].id),
                                getDirectRadiationById(response.data[0].id),
                                getDifuseRadiationById(response.data[0].id),
                                getFilteredRadiationDirecta(response.data[0].id),
                                getFilteredRadiationDifusa(response.data[0].id),
                            ],

                        ).then(axios.spread(function (temps, global, direct, difuse, filtredDirect, filteredDifuse) {
                            let infoGeo = {
                                temperatura: temps.data,
                                global: global.data,
                                directa: direct.data,
                                difusa: difuse.data,
                                filtredDirect: filtredDirect.data.valor,
                                filteredDifuse: filteredDifuse.data.valor,
                            };
                            let result = gradosDias(temps.data,tempConfort);
                            let grados = result[0];
                            let periodo = result[1];
                            let rbParedes = calcularRbParedes(lat,lng,periodo,angulo);
                            dispatch(setPeriodo(periodo, rbParedes, grados));
                            dispatch(middleware_recalcular_perdida_ventilacion());
                            dispatch(middleware_recalcular_aporte_interno());
                            dispatch(setCalculando(false,'set_state_mapa'));
                            dispatch(setStateInfoGeo(infoGeo));
                            dispatch(middleware_recalcular_transmitancias());

                        }));

                    } else {
                        dispatch(setCalculando(false,'set_state_mapa'));
                        alert("No se encuentra comuna en la base de datos");
                    }
                }
            );


    }
};

export const clickMapa = (lat, long) => (
    {}
);

export const activarAgregarContexto = () => (
    {
        type: ACTIVAR_AGREGAR_CONTEXTO,
    }
);

export const activarEliminarContexto = () => (
    {
        type: ACTIVAR_ELIMINAR_CONTEXTO,
    }
);

export const mostrarOcultarMapa = () => (
    {
        type: MOSTRAR_OCULTAR_MAPA,
    }
);

export const activarSeleccionarContexto = () => (
    {
        type: ACTIVAR_SELECCIONAR_CONTEXTO,
    }
);

export const agregarObstruccion = obstruccion => (
    {
        type: AGREGAR_OBSTRUCCION,
        obstruccion: obstruccion,
    }
);

export const middleware_agregar_obstruccion = (obstruccion) => {

    //SETEAR CALCULANDO
    //store.dispatch(setCargando(true));
    return function (dispatch, getState) {
        //HACER CALCULOS
        let estadoCasa = getState().morfologia.present.niveles;
        let obstrucciones = getState().app.obstrucciones;
        dispatch(agregarObstruccion(obstruccion));
        //calcularFAR(obstrucciones,estadoCasa);
        //dispatch(setCargando(false));
    }
};

export const eliminarObstruccion = (indice) => (
    {
        type: ELIMINAR_OBSTRUCCION,
        indice: indice,
    }
);

export const middleware_eliminar_obstruccion = (indice) => {

    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        let seleccionado = getState().app.seleccion_contexto;
        if (seleccionado === indice) {
            dispatch(seleccionarObstruccion(null));
        }
        if (seleccionado !== null && seleccionado > indice) {
            dispatch(seleccionarObstruccion(seleccionado - 1));
        }
        //HACER CALCULOS
        dispatch(eliminarObstruccion(indice));
    }
};


export const seleccionarObstruccion = indice => (
    {
        type: SELECCIONAR_OBSTRUCCION,
        indice: indice,
    }
);

export const seleccionarMorfologia = (seleccion, grupo) => (
    {
        type: SELECCIONAR_MORFOLOGIA,
        seleccion: seleccion,
        grupo: grupo,
    }
);

export const modificarObstrucion = (obstruccion, indice) => (
    {
        type: MODIFICAR_OBSTRUCCION,
        obstruccion: obstruccion,
        indice: indice,
    }
);

export const middleware_modificar_obstruccion = (obstruccion, indice) => {

    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        //HACER CALCULOS
        dispatch(modificarObstrucion(obstruccion, indice));
    }
};

export const setearComuna = comuna => (
    {
        type: SETEAR_COMUNA,
        comuna: comuna,
    }
);

export const middleware_setear_comuna = comuna => {

    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        //HACER CALCULOS
        dispatch(setearComuna(comuna));
    }
};

export const cambiarVarsInterna = variable => (
    {
        type: CAMBIAR_VARS_INTERNA,
        name: variable.name,
        value: variable.value,
    }
);

export const setFarVentanas = farVentanas => (
    {
        type: SET_FAR_VENTANAS,
        farVentanas : farVentanas,
    }
);

export const middleware_cambiar_variables_internas = (variable) =>{
    return function (dispatch,getState) {
        dispatch(setCalculando(true,'variables'));
        setTimeout(function() {
            dispatch(cambiarVarsInterna(variable));
            if(variable.name === "temperatura"){
                let variables = getState().variables;
                let angulo = getState().morfologia.present.rotacion;
                let result = gradosDias(variables.infoGeo.temperatura,variable.value);
                let grados = result[0];
                let periodo = result[1];
                let lat = variables.mapa.lat;
                let lng = variables.mapa.lng;
                let rbParedes = calcularRbParedes(lat,lng,periodo,angulo);
                dispatch(setPeriodo(periodo, rbParedes, grados));
                dispatch(middleware_recalcular_aporte_interno());
                dispatch(middleware_recalcular_perdida_ventilacion());
            }
            if(variable.name === "iluminacion" || variable.name === "personas"){
                dispatch(middleware_recalcular_aporte_interno());
            }else if(variable.name === "aire"){
                dispatch(middleware_recalcular_perdida_ventilacion());
            }
            dispatch(setCalculando(false,'variables'));
        }, 300);
    }
};

/*export const middleware_cambiar_variables_internas = variable => {
    //SETEAR CALCULANDO
    return (dispatch,getState) => {
        //HACER CALCULOS NECESARIOS
        dispatch(setCargando(true,'variables'));
        asyncCambioVariable(dispatch,getState,variable);
    }
};*/


export const agregarBloque = (bloque, nivel) => (
    {
        type: AGREGAR_BLOQUE,
        nivel: nivel,
        bloque: bloque,

    }
);

export const middleware_agregar_bloque = (bloque, nivel) => {
    return function (dispatch, getState) {
        dispatch(agregarBloque(bloque, nivel));
        dispatch(middleware_recalcular_aporte_interno());
        dispatch(middleware_recalcular_perdida_ventilacion());
        dispatch(middleware_recalcular_transmitancias());
        dispatch(seleccionarMorfologia(null,null));
    }
};

export const agregarCapaPared = (nivel, bloque, pared, capa) => (
    {
        type: AGREGAR_CAPA_PARED,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        capa: capa,
    }
);

export const agregarCapaPiso = (nivel, bloque, capa) => (
    {
        type: AGREGAR_CAPA_PISO,
        nivel: nivel,
        bloque: bloque,
        capa: capa,
    }
);

export const agregarCapaTecho = (nivel, bloque, capa) => (
    {
        type: AGREGAR_CAPA_TECHO,
        nivel: nivel,
        bloque: bloque,
        capa: capa,
    }
);

export const borrarCapaPared = (nivel, bloque, pared, capa) => (
    {
        type: BORRAR_CAPA_PARED,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        capa: capa,
    }
);

export const borrarCapaPiso = (nivel, bloque, capa) => (
    {
        type: BORRAR_CAPA_PISO,
        nivel: nivel,
        bloque: bloque,
        capa: capa,
    }
);

export const borrarCapaTecho = (nivel, bloque, pared, capa) => (
    {
        type: BORRAR_CAPA_TECHO,
        nivel: nivel,
        bloque: bloque,
        capa: capa,
    }
);

export const modificarCapaPared = (nivel, bloque, pared, indice, capa) => (
    {
        type: MODIFICAR_CAPA_PARED,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        indice: indice,
        capa: capa,
    }
);

export const aplicarCapaAParedes = (nivel, bloque, pared, indices) => (
    {
        type: APLICAR_CAPA_A_PAREDES,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        indices: indices,
    }
);

export const aplicarCapaAPisos = (nivel, bloque, indices) => (
    {
        type: APLICAR_CAPA_A_PISOS,
        nivel: nivel,
        bloque: bloque,
        indices: indices,
    }
);

export const aplicarCapaATechos = (nivel, bloque, indices) => (
    {
        type: APLICAR_CAPA_A_TECHOS,
        nivel: nivel,
        bloque: bloque,
        indices: indices,
    }
);

export const modificarCapaPiso = (nivel, bloque, indice, capa) => (
    {
        type: MODIFICAR_CAPA_PISO,
        nivel: nivel,
        bloque: bloque,
        indice: indice,
        capa: capa,
    }
);

export const modificarCapaTecho = (nivel, bloque, indice, capa) => (
    {
        type: MODIFICAR_CAPA_TECHO,
        nivel: nivel,
        bloque: bloque,
        indice: indice,
        capa: capa,
    }
);

export const actualizarObstruccionesApp = (obstrucciones) => (
    {
        type: ACTUALIZAR_OBSTRUCCIONES_APP,
        obstrucciones : obstrucciones,
    }
);



export const setPeriodo = (periodo,rbParedes,gradosDias) => (
    {
        type: SET_PERIODO,
        periodo: periodo,
        rbParedes:rbParedes,
        gradosDias: gradosDias,
    }
);

export const setFarVentana = (id, farVentana, indices) => (
    {
        type: SET_FAR_VENTANA,
        id: id,
        farVentana: farVentana,
        indices: indices,
    }
);

export const middleware_recalcular_far = () => {
    return (dispatch, getState) =>{
        let estadoCasa = getState().morfologia.present.niveles;
        let rotacion = getState().morfologia.present.rotacion;
        let obstrucciones = getState().app.obstrucciones;
        let result = calcularFAR(obstrucciones, estadoCasa,rotacion);
        dispatch(setFarVentanas(result));
        dispatch(middleware_recalcular_aporte_solar());
    };
};

export const middleware_actualizar_obstrucciones_app = (obstrucciones) => {
    return (dispatch,getState) =>{
        dispatch(setCalculando(true,'calcFar'));
        setTimeout(function(){
            let estadoCasa = getState().morfologia.present.niveles;
            let rotacion = getState().morfologia.present.rotacion;
            let result = calcularFAR(obstrucciones, estadoCasa,rotacion);
            dispatch(actualizarObstruccionesApp(obstrucciones));
            dispatch(setFarVentanas(result));
            dispatch(middleware_recalcular_aporte_solar());
            dispatch(setCalculando(false,'calcFar'));

        },500);

    }
};
    /*return function (dispatch,getState) {
        //("ESPERANDO 20 segundos]");
        return hola(dispatch).then(result => {
            dispatch(setCargando(false,'calcFar'));
        })


            /!*("YOOOO");
            let estadoCasa = getState().morfologia.present.niveles;
            let rotacion = getState().morfologia.present.rotacion;
            dispatch(actualizarObstruccionesApp(obstrucciones));
            calcularFAR(obstrucciones, estadoCasa,rotacion);
            dispatch(setCargando(false,'calcFar'));*!/


        //HACER CALCULOS
        //dispatch(setCargando(true,'actualizando obstrucciones'));
        /!*let estadoCasa = getState().morfologia.present.niveles;
        let rotacion = getState().morfologia.present.rotacion;
        dispatch(actualizarObstruccionesApp(obstrucciones));
        calcularFAR(obstrucciones, estadoCasa,rotacion);*!/

    }*/



export const middleware_aplicar_capa_paredes = (nivel, bloque, pared, indices) => {
    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        dispatch(aplicarCapaAParedes(nivel, bloque, pared, indices));
        dispatch(middleware_recalcular_transmitancias());
    }
};

export const middleware_aplicar_capa_pisos = (nivel, bloque, indices) => {
    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        dispatch(aplicarCapaAPisos(nivel, bloque, indices));
        dispatch(middleware_recalcular_transmitancias());
    }
};

export const middleware_aplicar_capa_techos = (nivel, bloque, indices) => {
    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        dispatch(aplicarCapaATechos(nivel, bloque, indices));
        dispatch(middleware_recalcular_transmitancias());
    }
};

export const middleware_recalcular_transmitancias = () => {
    return function (dispatch,getState) {
        let elementos = getState().morfologia.present.elementos;
        let zona = getState().variables.mapa.comuna.zona;
        let info_materiales = getState().app.materiales;
        let info_ventanas = getState().app.materiales_ventanas;
        let res = transmitanciaSuperficies(elementos,zona,info_materiales, info_ventanas);
        let gradosDias = getState().variables.gradosDias;

        let puenteTermico = 0;
        let puenteTermicoObjetivo = 0;
        let bloques = getState().morfologia.present.niveles[0];
        for(let bloque of bloques.bloques){
            let piso = bloque.piso;
            piso.aislacion = res.transmitanciasElementos[piso.id].aislacion;
            let puente = puenteTermicoRedux(piso,zona);
            puenteTermico += puente.puenteTermico;
            puenteTermicoObjetivo += puente.puenteTermicoObjetivo;
        }

        let perdidas = {
            normal: perdidasConduccion(res.total, gradosDias, puenteTermico),
            objetivo:  perdidasConduccion(res.totalObjetivo, gradosDias, puenteTermicoObjetivo),
        };

        dispatch(setPerdidaConduccion(perdidas));
    }
};

export const  middleware_recalcular_aporte_solar = () => {
    return function (dispatch,getState) {
        let ventanas = getState().morfologia.present.ventanas;
        let periodo = getState().variables.periodo;
        let farVentanas = getState().balance.farVentanas;
        let difusa = getState().variables.infoGeo.difusa;
        let directa = getState().variables.infoGeo.directa;
        let info_material = getState().app.materiales_ventanas;
        let marco = getState().app.materiales_marcos;
        let rb = getState().variables.rbParedes;
        let res = calcularAporteSolar(periodo, farVentanas, ventanas, difusa, directa, info_material, marco, rb);
        dispatch(setAporteSolar(res));
    }
};

export const  middleware_recalcular_perdida_ventilacion = () => {
    return function (dispatch,getState) {
        let volumen = getState().morfologia.present.volumen;
        let gradosDias = getState().variables.gradosDias;
        let volumenAire = getState().variables.aire;
        let res = perdidasVentilacion(volumen, volumenAire, gradosDias);
        console.log("PERDIDA", res);
        dispatch(setPerdidaVentilacion(res));
    }
};

export const middleware_agregar_far = (ventana) => {
    return function (dispatch, getState) {
        let obstrucciones = getState().app.obstrucciones;
        let rotacion = getState().morfologia.present.rotacion;
        let result = calcularFARVentana(obstrucciones,rotacion,ventana);

        dispatch(setFarVentana(ventana.id,result));
        dispatch(middleware_recalcular_aporte_solar());
    }
};

export const middleware_agregar_ventana = (bloque, nivel, pared, ventana) => {
    return function (dispatch, getState) {
        //HACER CALCULOS
        const state = getState().morfologia.present;
        let paredInfo = state.niveles[nivel].bloques[bloque].paredes[pared];
        ventana.orientacion = paredInfo.orientacion;

        dispatch(agregarVentana(bloque, nivel, pared, ventana));
        dispatch(middleware_recalcular_transmitancias());
        dispatch(middleware_agregar_far(ventana));
        dispatch(seleccionarMorfologia(null,null));
    }
};

export const middleware_modificar_capa_pared = (nivel, bloque, pared, indice, capa) => {
    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        dispatch(modificarCapaPared(nivel, bloque, pared, indice, capa));
        dispatch(middleware_recalcular_transmitancias());
    }
};
export const middleware_modificar_capa_piso = (nivel, bloque, indice, capa) => {
    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        dispatch(modificarCapaPiso(nivel, bloque, indice, capa));
        dispatch(middleware_recalcular_transmitancias());
    }
};
export const middleware_modificar_capa_techo = (nivel, bloque, indice, capa) => {
    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        dispatch(modificarCapaTecho(nivel, bloque, indice, capa));
        dispatch(middleware_recalcular_transmitancias());

    }
};

export const middleware_agregar_capa_pared = (nivel, bloque, pared, capa) => {
    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        dispatch(agregarCapaPared(nivel, bloque, pared, capa));
        dispatch(middleware_recalcular_transmitancias());
    }
};

export const middleware_agregar_capa_piso = (nivel, bloque, capa) => {
    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        dispatch(agregarCapaPiso(nivel, bloque, capa));
        dispatch(middleware_recalcular_transmitancias());
    }
};


export const middleware_agregar_capa_techo = (nivel, bloque, capa) => {
    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        dispatch(agregarCapaTecho(nivel, bloque, capa));
        dispatch(middleware_recalcular_transmitancias());
    }
};

export const middleware_borrar_capa_pared = (nivel, bloque, pared, capa) => {
    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        dispatch(borrarCapaPared(nivel, bloque, pared, capa));
        dispatch(middleware_recalcular_transmitancias());
    }
};

export const middleware_borrar_capa_piso = (nivel, bloque, capa) => {
    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        dispatch(borrarCapaPiso(nivel, bloque, capa));
        dispatch(middleware_recalcular_transmitancias());
    }
};

export const middleware_borrar_capa_techo = (nivel, bloque, capa) => {
    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        dispatch(borrarCapaTecho(nivel, bloque, capa));
        dispatch(middleware_recalcular_transmitancias());
    }
};


export const middleware_agregar_puerta = (bloque, nivel, pared, puerta) => {
    return function (dispatch, getState) {
        dispatch(agregarPuerta(bloque, nivel, pared, puerta));
        dispatch(middleware_recalcular_transmitancias());
        dispatch(seleccionarMorfologia(null,null));
    }
};

export const agregarVentana = (bloque, nivel, pared, ventana) => (
    {
        type: AGREGAR_VENTANA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        ventana: ventana,
    }
);

export const agregarPuerta = (bloque, nivel, pared, puerta) => (
    {
        type: AGREGAR_PUERTA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        puerta: puerta,
    }
);

export const casaPredefinidaSimple = () => (
    {
        type: CASA_PREDEFINIDA_SIMPLE,
    }
);

export const casaPredefinidaDoble = () => (
    {
        type: CASA_PREDEFINIDA_DOBLE,
    }
);

export const casaPredefinidaSimpleDosPisos = () => (
    {
        type: CASA_PREDEFINIDA_SIMPLE_DOS_PISOS,
    }
);

export const casaPredefinidaDobleDosPisos = () => (
    {
        type: CASA_PREDEFINIDA_DOBLE_DOS_PISOS,
    }
);

export const borrarNivel = nivel => (
    {
        type: BORRAR_NIVEL,
        nivel: nivel,

    }
);

export const borrarBloque = (bloque, nivel) => (
    {
        type: BORRAR_BLOQUE,
        nivel: nivel,
        bloque: bloque,
    }
);

export const middleware_borrar_bloque = (nivel, bloque) => {
    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        dispatch(borrarBloque(nivel, bloque));
        dispatch(middleware_recalcular_aporte_interno());
        dispatch(middleware_recalcular_perdida_ventilacion());
        dispatch(middleware_recalcular_transmitancias());
        dispatch(seleccionarMorfologia(null,null));
    }
};
export const borrarVentana = (ventana, nivel, bloque, pared) => (
    {
        type: BORRAR_VENTANA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        ventana: ventana,
    }
);


export const middleware_borrar_ventana = (ventana, nivel, bloque, pared) => {

    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        //HACER CALCULOS
        const state = getState().morfologia.present.niveles;
        let id = state[nivel].bloques[bloque].paredes[pared].ventanas[ventana].id;
        dispatch(borrarVentana(ventana, nivel, bloque, pared));
        dispatch(borrarFarVentana(id));
        dispatch(middleware_recalcular_aporte_solar());
        dispatch(middleware_recalcular_transmitancias());
        dispatch(seleccionarMorfologia(null,null));

    }
};

export const borrarFarVentana = (id) => (
    {
        type: BORRAR_FAR_VENTANA,
        id: id,
    }
);

export const borrarPuerta = (puerta, nivel, bloque, pared) => (
    {
        type: BORRAR_PUERTA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        puerta: puerta,
    }
);

export const middleware_borrar_puerta = (puerta, nivel, bloque, pared) => {

    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        //HACER CALCULOS
        dispatch(borrarPuerta(puerta, nivel, bloque, pared));
        dispatch(middleware_recalcular_transmitancias());
        dispatch(seleccionarMorfologia(null,null));

    }
};

export const setAporteInterno = (aporteInterno) => (
    {
        type: SET_APORTE_INTERNO,
        aporteInterno: aporteInterno,
    }
);

export const setPerdidaVentilacion = (perdida) => (
    {
        type: SET_PERDIDA_VENTILACION,
        perdida: perdida,
    }
);

export const setPerdidaConduccion = (perdida) => (
    {
        type: SET_PERDIDA_CONDUCCION,
        perdida: perdida,
    }
);

export const setAporteSolar = (aporteSolar) => (
    {
        type: SET_APORTE_SOLAR,
        aporteSolar: aporteSolar,
    }
);
export const middleware_recalcular_aporte_interno = () => {
    return function (dispatch, getState) {
        dispatch(setCalculando(true,'aporteInterno'));
        setTimeout(function () {
            let variables = getState().variables;
            let ocupantes = variables.personas;
            let horasIluminacion = variables.iluminacion;
            let periodo = variables.periodo;
            let area = getState().morfologia.present.area;
            let aporte = aporteInterno(ocupantes,area,horasIluminacion,periodo);
            dispatch(setAporteInterno(aporte));
            console.log("APORTE",aporte);
            dispatch(setCalculando(false,'aporteInterno'));
        },200);
    }
};

export const middleware_rotar_casa = (angulo) => {

    //SETEAR CALCULANDO
    return function (dispatch, getState) {
        dispatch(setCalculando(true,'rotacion'));
        setTimeout(function () {
            let variables = getState().variables;
            let gradosDias = variables.gradosDias;
            let periodo = variables.periodo;
            let lat = variables.mapa.lat;
            let lng = variables.mapa.lng;
            let rbParedes = calcularRbParedes(lat,lng,periodo,angulo);
            dispatch(setPeriodo(periodo, rbParedes, gradosDias));
            dispatch(middleware_recalcular_aporte_interno());
            dispatch(rotarCasa(angulo));
            dispatch(middleware_recalcular_aporte_solar());

            dispatch(setCalculando(false,'rotacion'));
        },300);

    }
};

export const rotarCasa = angulo => (
    {
        type: ROTAR_CASA,
        angulo: angulo,
    }
);

export const middleware_modificar_dimensiones_bloque = (bloque, nivel, dimensiones) => {
    //SETEAR CALCULAMO
    return function (dispatch, getState) {
        let morfologia = getState().morfologia.present;
        let bloqueAntiguo = morfologia.niveles[nivel].bloques[bloque];
        let bloques = morfologia.niveles[nivel].bloques;
        if (dimensiones.alto !== bloqueAntiguo.dimensiones.alto) {
            let index, newDimen;
            for (let bloqueDeNivel of bloques) {
                index = bloques.indexOf(bloqueDeNivel);
                newDimen = {
                    alto: dimensiones.alto,
                    ancho: bloqueDeNivel.dimensiones.ancho,
                    largo: bloqueDeNivel.dimensiones.largo,
                };
                dispatch(modificarDimensionesBloque(index, nivel, newDimen));
            }
        } else {
            dispatch(modificarDimensionesBloque(bloque, nivel, dimensiones));
        }
        dispatch(middleware_recalcular_aporte_interno());
        dispatch(middleware_recalcular_perdida_ventilacion());
        dispatch(middleware_recalcular_transmitancias());

    }

};

export const middleware_modificar_material_ventana = (nivel, bloque, pared, ventana, material) => {
    //SETEAR CALCULANDO
    return function (dispatch,getState) {
        dispatch(modificarMaterialVentana(nivel,bloque,pared,ventana,material));
        dispatch(middleware_recalcular_transmitancias());
        dispatch(middleware_recalcular_aporte_solar());
    }
};

export const middleware_modificar_material_puerta = (nivel, bloque, pared, puerta, material) => {
    //SETEAR CALCULANDO
    return function (dispatch,getState) {
        dispatch(modificarMaterialPuerta(nivel,bloque,pared,puerta,material));
        dispatch(middleware_recalcular_transmitancias());
    }
};

export const middleware_modificar_marco_ventana = (nivel, bloque, pared, ventana, marco) => {
    //SETEAR CALCULANDO
    return function (dispatch,getState) {
        dispatch(modificarMarcoVentana(nivel,bloque,pared,ventana,marco));
        dispatch(middleware_recalcular_transmitancias());
        dispatch(middleware_recalcular_aporte_solar());
    }
};

export const middleware_modificar_dimensiones_ventana = (nivel, bloque, pared, ventana, dimensiones) => {
    //SETEAR CALCULANDO
    return function (dispatch,getState) {
        dispatch(modificarDimensionesVentana(nivel,bloque,pared,ventana,dimensiones));
        dispatch(middleware_recalcular_transmitancias());
        dispatch(middleware_recalcular_aporte_solar());
    }
};

export const middleware_modificar_dimensiones_puerta = (nivel, bloque, pared, puerta, dimensiones) => {
    //SETEAR CALCULANDO
    return function (dispatch,getState) {
        dispatch(modificarDimensionesPuerta(nivel,bloque,pared,puerta,dimensiones));
        dispatch(middleware_recalcular_transmitancias());
    }
};

export const middleware_modificar_posicion_ventana = (nivel, bloque, pared, ventana, posicion) => {
    //SETEAR CALCULANDO
    return function (dispatch,getState) {
        dispatch(modificarPosicionVentana(nivel,bloque,pared,ventana,posicion));


        let ventanaInfo = estadoCasa[nivel].bloques[bloque].paredes[pared].ventanas[ventana];
        dispatch(middleware_agregar_far(ventanaInfo));
        dispatch(middleware_recalcular_transmitancias());
    }
};

export const middleware_modificar_posicion_puerta = (nivel, bloque, pared, puerta, posicion) => {
    //SETEAR CALCULANDO
    return function (dispatch,getState) {
        dispatch(modificarPosicionPuerta(nivel,bloque,pared,puerta,posicion));
        dispatch(middleware_recalcular_transmitancias());
    }
};

export const middleware_aplicar_material_ventanas = (nivel,bloque,pared,ventana,indices) => {
    //SETEAR CALCULANDO
    return function (dispatch,getState) {
        dispatch(aplicarMaterialAVentanas(nivel,bloque,pared,ventana,indices));
        dispatch(middleware_recalcular_transmitancias());
    }
};

export const middleware_aplicar_marco_ventanas = (nivel,bloque,pared,ventana,indices) => {
    //SETEAR CALCULANDO
    return function (dispatch,getState) {
        dispatch(aplicarMarcosAVentanas(nivel,bloque,pared,ventana,indices));
        dispatch(middleware_recalcular_transmitancias());

    }
};

export const middleware_aplicar_material_puertas = (nivel,bloque,pared,puerta,indices) => {
    //SETEAR CALCULANDO
    return function (dispatch,getState) {
        dispatch(aplicarMaterialAPuertas(nivel,bloque,pared,puerta,indices));
        dispatch(middleware_recalcular_transmitancias());

    }
};

export const aplicarMaterialAVentanas = (nivel,bloque,pared,ventana,indices) => (
    {
        type: APLICAR_MATERIAL_A_VENTANAS,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        ventana: ventana,
        indices: indices,
    }
);

export const aplicarMarcosAVentanas = (nivel,bloque,pared,ventana,indices) => (
    {
        type: APLICAR_MARCOS_A_VENTANAS,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        ventana: ventana,
        indices: indices,
    }
);

export const aplicarMaterialAPuertas = (nivel,bloque,pared,puerta,indices) => (
    {
        type: APLICAR_MATERIAL_A_PUERTAS,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        puerta: puerta,
        indices: indices,
    }
);


export const modificarDimensionesBloque = (bloque, nivel, dimensiones) => (
    {
        type: MODIFICAR_DIMENSIONES_BLOQUE,
        nivel: nivel,
        bloque: bloque,
        dimensiones: dimensiones,
    }
);

export const modificarDimensionesVentana = (nivel, bloque, pared, ventana, dimensiones) => (
    {
        type: MODIFICAR_DIMENSIONES_VENTANA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        ventana: ventana,
        dimensiones: dimensiones,
    }
);

export const modificarPosicionVentana = (nivel, bloque, pared, ventana, posicion) => (
    {
        type: MODIFICAR_POSICION_VENTANA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        ventana: ventana,
        posicion: posicion,
    }
);

export const modificarPosicionPuerta = (nivel, bloque, pared, puerta, posicion) => (
    {
        type: MODIFICAR_POSICION_PUERTA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        puerta: puerta,
        posicion: posicion,
    }
);

export const modificarDimensionesPuerta = (puerta, nivel, bloque, pared, dimensiones) => (
    {
        type: MODIFICAR_DIMENSIONES_PUERTA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        puerta: puerta,
        dimensiones: dimensiones,
    }
);

export const modificarMarcoVentana = (nivel, bloque, pared, ventana,marco) => (
    {
        type: MODIFICAR_MARCO_VENTANA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        ventana: ventana,
        marco: marco,
    }
);

export const modificarMaterialVentana = (nivel, bloque, pared, ventana,material) => (
    {
        type: MODIFICAR_MATERIAL_VENTANA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        ventana: ventana,
        material: material,
    }
);

export const modificarMaterialPuerta = (nivel, bloque, pared, puerta, material) => (
    {
        type: MODIFICAR_MATERIAL_PUERTA,
        nivel: nivel,
        bloque: bloque,
        pared: pared,
        puerta: puerta,
        material: material,
    }
);


export const cambioTipoCamara = () => (
    {
        type: CAMBIO_TIPO_CAMARA,
    }
);

export const activarAgregarBloque = () => (
    {
        type: ACTIVAR_AGREGAR_BLOQUE,
    }
);

export const activarAgregarVentana = () => (
    {
        type: ACTIVAR_AGREGAR_VENTANA,
    }
);

export const activarAgregarPuerta = () => (
    {
        type: ACTIVAR_AGREGAR_PUERTA,
    }
);

export const activarEliminarMorfologia = () => (
    {
        type: ACTIVAR_ELIMINAR_MORFOLOGIA,
    }
);

export const activarSeleccionarMorfologia = () => (
    {
        type: ACTIVAR_SELECCIONAR_MORFOLOGIA,
    }
);

export const verSol = () => (
    {
        type: VER_SOL,
    }
);

export const setMateriales = (materiales) => ({
        type: SET_MATERIALES,
        materiales: materiales,

    }
);

export const setMaterialesVentanas = (materiales_ventanas) => ({
        type: SET_MATERIALES_VENTANAS,
        materiales_ventanas: materiales_ventanas,

    }
);

export const setMaterialesMarcos = (materiales_marcos) => ({
        type: SET_MATERIALES_MARCOS,
        materiales_marcos: materiales_marcos,

    }
);

export const middleware_set_materiales = () => {
    return function (dispatch, getState) {
        getMateriales().then(
            response => {
                let materiales = getJsonMateriales(response);
                dispatch(setMateriales(materiales));
            }
        );
        getMaterialesVentanas().then(
            response => {
                let materiales_ventana = getJsonVentanas(response);
                dispatch(setMaterialesVentanas(materiales_ventana));
            }
        );
        getMaterialesMarcos().then(
            response => {
                let materiales_ventana = getJsonMarcos(response);
                dispatch(setMaterialesMarcos(materiales_ventana));
            }
        );

    }
};

export const cambiarFecha = (fecha) => (
    {
        type: CAMBIAR_FECHA,
        fecha: fecha,
    }
);

export const middleware_cambiar_fecha = (fecha) => {
    //SET CALC]ULANDO
    return function (dispatch, getState) {
        const {lat, lng, comuna} = getState().variables.mapa;
        dispatch(cambiarFecha(fecha));
        let map = {
            lat: lat,
            lng: lng,
            comuna: comuna,
            sunPosition: getSunPosition(lat, lng, fecha),
            sunPath: getSunPath(lat, lng, fecha)
        };
        dispatch(setStateMapa(map));

    }

};

export const activarRotar = () => (
    {
        type: ACTIVAR_ROTAR,
    }
);

export const activarMoverCamara = () => (
    {
        type: ACTIVAR_MOVER_CAMARA,
    }
);

export const contextoUndo = () => {

    //SETEAR CALCULANDO
    return function (dispatch) {
        //HACER CALCULOS
        dispatch(seleccionarObstruccion(null));
        dispatch({type: CONTEXTO_UNDO});

    }
};

export const contextoRedo = () => {

    //SETEAR CALCULANDO
    return function (dispatch) {
        //HACER CALCULOS
        dispatch(seleccionarObstruccion(null));
        dispatch({type: CONTEXTO_REDO});

    }
};

export const morfologiaUndo = () => {

    //SETEAR CALCULANDO
    return function (dispatch,getState) {
        //HACER CALCULOS
        let action = getState().morfologia.present.action;
        dispatch({type: MORFOLOGIA_UNDO});
        if(action.type === MODIFICAR_DIMENSIONES_BLOQUE || action.type === AGREGAR_BLOQUE || action.type === BORRAR_BLOQUE){
            dispatch(middleware_recalcular_aporte_interno());
            dispatch(middleware_recalcular_perdida_ventilacion());
        }else if(action.type === AGREGAR_VENTANA || action.type === BORRAR_VENTANA || action.type === MODIFICAR_DIMENSIONES_VENTANA){
            dispatch(middleware_recalcular_far());
        }else if(action.type === ROTAR_CASA){
            dispatch(setCalculando(true,'rotacion'));
            setTimeout(function () {
                let variables = getState().variables;
                let gradosDias = variables.gradosDias;
                let periodo = variables.periodo;
                let angulo = getState().morfologia.present.rotacion;
                let lat = variables.mapa.lat;
                let lng = variables.mapa.lng;
                let rbParedes = calcularRbParedes(lat,lng,periodo,angulo);
                dispatch(setPeriodo(periodo, rbParedes, gradosDias));
                dispatch(middleware_recalcular_aporte_interno());
                dispatch(middleware_recalcular_far());
                dispatch(setCalculando(false,'rotacion'));
            },300);
        }
        dispatch(middleware_recalcular_transmitancias());


    }
};

export const morfologiaRedo = () => {
    return function (dispatch,getState) {
        let action = getState().morfologia.present.action;
        dispatch({type: MORFOLOGIA_REDO});
        if(action.type === MODIFICAR_DIMENSIONES_BLOQUE || action.type === AGREGAR_BLOQUE || action.type === BORRAR_BLOQUE){
            dispatch(middleware_recalcular_aporte_interno());
            dispatch(middleware_recalcular_perdida_ventilacion());
        }else if(action.type === AGREGAR_VENTANA || action.type === BORRAR_VENTANA || action.type === MODIFICAR_DIMENSIONES_VENTANA){
            dispatch(middleware_recalcular_far());
        }else if(action.type === ROTAR_CASA){
            dispatch(setCalculando(true,'rotacion'));
            setTimeout(function () {
                let variables = getState().variables;
                let gradosDias = variables.gradosDias;
                let periodo = variables.periodo;
                let angulo = getState().morfologia.present.rotacion;
                let lat = variables.mapa.lat;
                let lng = variables.mapa.lng;
                let rbParedes = calcularRbParedes(lat,lng,periodo,angulo);
                dispatch(setPeriodo(periodo, rbParedes, gradosDias));
                dispatch(middleware_recalcular_aporte_interno());
                dispatch(middleware_recalcular_far());
                dispatch(setCalculando(false,'rotacion'));
            },300);
        }
        dispatch(middleware_recalcular_transmitancias());

    }
};







