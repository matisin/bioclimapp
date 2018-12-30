import * as THREE from 'three'
import Morfologia from "../components/Morfologia";
import {AISLADO, CORRIENTE, MEDIO, PARED, PISO, PUERTA, TECHO, VENTANA} from "../constants/morofologia-types";


let SunCalc = require('suncalc');

let periodo = [];
const diasMeses = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const uso = 1407.12;
const resistenciasTermicasSuperficie = [
    [0.17, 0.24],
    [0.17, 0.24],
    [0.17, 0.24],
    [0.14, 0.10],
    [0.22, 0.34]];
const transmitanciaLineal = [1.4, 1.2, 1.0];
const rangos_transmitancia = [[0.15, 0.25], [0.26, 0.6]];
const uObjetivoMuro = [4, 3, 1.9, 1.7, 1.6, 1.1, 0.6];
const uObjetivoTecho = [0.84, 0.6, 0.47, 0.38, 0.33, 0.28, 0.25];
const uObjetivoPiso = [3.6, 0.87, 0.7, 0.6, 0.5, 0.39, 0.32];
const rtObjetivoPiso = [0.28, 1.15, 1.43, 1.67, 2, 2.56, 3.13];

//se simplifico el calculo del uso ya que es constante el multiplicar el perfilde uso con el coeficiente de usuario
function aporteInterno(ocupantes, superficie, horasIluminacion, periodo) {
    const ilumuinacion = 1.5 * horasIluminacion * superficie;
    const aporte_usuarios = uso * ocupantes;
    const aportes = ilumuinacion + aporte_usuarios;
    let valor = 0;
    for (let i = periodo[0]; i <= periodo[1]; i++) {
        valor += (aportes) * diasMeses[i];
    }
    return valor;
}

function gradosDias(temperaturasMes, temperaturaConfort) {
    let gd = 0;
    let periodo = [];
    for (let i = 0; i < temperaturasMes.length - 1; i++) {
        if ((temperaturaConfort - temperaturasMes[i].valor) > 0) {
            if (periodo.length === 0) {
                periodo.push(i);
            }
            gd = gd + (temperaturaConfort - temperaturasMes[i].valor) * diasMeses[i];
        } else {
            if (periodo.length === 1) {
                periodo.push(i - 1);
            }
        }
    }
    if (periodo.length === 1) {
        periodo.push(temperaturasMes.length - 2);
    }

    return [gd, periodo];

}

function transmitanciaSuperficieRedux(elemento, zona, info_materiales, info_ventanas) {
    let transmitancia = 0, u, res,conductividad;
    console.log("ELEMENTO",elemento);
    switch (elemento.tipo) {
        case PARED:
            for (let capa of elemento.capas) {
                conductividad = getConductividadCapa(capa,info_materiales);
                transmitancia += capa.espesor / conductividad;
            }
            transmitancia += resistenciasTermicasSuperficie[elemento.tipo][elemento.separacion];
            u = 1 / transmitancia;
            return {
                transSup: u * elemento.superficie,
                transSupObjetivo: uObjetivoMuro[zona - 1] * elemento.superficie,
            };
        case PISO:
            for (let capa of elemento.capas) {
                conductividad = getConductividadCapa(capa,info_materiales);
                transmitancia += capa.espesor / conductividad;
            }
            transmitancia += resistenciasTermicasSuperficie[elemento.tipo][elemento.separacion];
            u = 1 / transmitancia;

            res = {
                transSup: u * elemento.superficie,
                transSupObjetivo: uObjetivoPiso[zona - 1] * elemento.superficie,
            };

            if (res.transSup >= 0.15 && res.transSup <= 0.25) {
                res.aislacion = CORRIENTE;
            } else if (res.transSup >= 0.26 && res.transSup <= 0.60) {
                res.aislacion = MEDIO;
            } else {
                res.aislacion = AISLADO;
            }
            return res;
        case TECHO:
            for (let capa of elemento.capas) {
                conductividad = getConductividadCapa(capa,info_materiales);
                transmitancia += capa.espesor / conductividad;
            }
            transmitancia += resistenciasTermicasSuperficie[elemento.tipo][elemento.separacion];
            u = 1 / transmitancia;
            return {
                transSup: u * elemento.superficie,
                transSupObjetivo: uObjetivoTecho[zona - 1] * elemento.superficie,
            };
        case VENTANA:
            u = info_ventanas[elemento.material.material].tipos[elemento.material.tipo].propiedad.U;
            return {
                transSupObjetivo: 5.8 * elemento.superficie,
                transSup: u * elemento.superficie,
            };
        case PUERTA:

            conductividad = getConductividadCapa(elemento.material,info_materiales);
            console.log(conductividad);
            transmitancia += elemento.material.espesor / conductividad;
            transmitancia += resistenciasTermicasSuperficie[elemento.tipo][elemento.separacion];

            u = 1 / transmitancia;

            return {
                transSup: u * elemento.superficie,
                transSupObjetivo: uObjetivoMuro[zona - 1] * elemento.superficie,
            };
    }
}

export function puenteTermicoRedux(piso, zona) {
    let aislacionObjetivo = CORRIENTE;
    if (rtObjetivoPiso[zona - 1] > 0.6) aislacionObjetivo = AISLADO;
    else if (rtObjetivoPiso[zona - 1] < 0.6 && rtObjetivoPiso[zona - 1] > 0.26) aislacionObjetivo = MEDIO;
    return {
        puenteTermico: piso.superficie * transmitanciaLineal[piso.aislacion],
        puenteTermicoObjetivo: piso.superficie * transmitanciaLineal[aislacionObjetivo],
    }
}

export function transmitanciaSuperficies(elementos,zona,info_materiales, info_ventanas){
    let total = 0;
    let totalObjetivo = 0;
    let transElemento;
    let transmitanciasElementos = {};
    for(let elemento of Object.values(elementos)){
        transElemento = transmitanciaSuperficieRedux(elemento, zona, info_materiales, info_ventanas);
        total+= transElemento.transSup;
        totalObjetivo+= transElemento.transSupObjetivo;
        transmitanciasElementos[elemento.id] = transElemento;
    }
    return{
        total: total,
        totalObjetivo: totalObjetivo,
        transmitanciasElementos: transmitanciasElementos,
    }
}

function getConductividadCapa(capa,info_materiales) {
    let conductividad;
    if(info_materiales[capa.material].hasOwnProperty('tipos')){
        conductividad = info_materiales[capa.material].tipos[capa.tipo].propiedades[capa.propiedad].conductividad;

    }else{
        conductividad = info_materiales[capa.material].propiedades[capa.propiedad].conductividad;
    }
    return conductividad;
}


function puenteTermico(piso, zona) {
    let aislacionObjetivo = Morfologia.aislacionPiso.CORRIENTE;
    if (rtObjetivoPiso[zona - 1] > 0.6) aislacionObjetivo = Morfologia.aislacionPiso.AISLADO;
    else if (rtObjetivoPiso[zona - 1] < 0.6 && rtObjetivoPiso[zona - 1] > 0.26) aislacionObjetivo = Morfologia.aislacionPiso.MEDIO;
    piso.userData.puenteTermico = piso.userData.perimetro * transmitanciaLineal[piso.userData.aislacion];
    piso.userData.puenteTermicoObjetivo = piso.userData.perimetro * transmitanciaLineal[aislacionObjetivo];
}

function perdidasVentilacion(volumenInterno, volmenAire, gradosDias) {
    return {
        normal: 24 * (0.34 * volmenAire * gradosDias * volumenInterno),
        objetivo:  24 * (0.34 * 7 * gradosDias * volumenInterno),
    };
}

function perdidasConduccion(transmitanciaSuperficies, gradosDias, puenteTermico) {
    return 24 * ((transmitanciaSuperficies + puenteTermico) * gradosDias);
}

function calcularGammaParedes(paredes, cardinalPointsCircle, circlePoints) {
    for (let pared of paredes) {
        let orientacionRaycaster = new THREE.Raycaster();
        orientacionRaycaster.set(new THREE.Vector3(), pared.userData.orientacion);
        let inter = orientacionRaycaster.intersectObject(cardinalPointsCircle);
        let interPoint = inter[0].point.add(inter[1].point);
        interPoint = interPoint.multiplyScalar(0.5);
        let closestDistance = 99;
        let closestPoint = {};
        let i = 0;
        let index = 0;
        for (let point of circlePoints) {
            let circlePoint = new THREE.Vector3(point.x, 0.001, point.y);
            let temp = circlePoint.distanceTo(interPoint);
            if (temp < closestDistance) {
                closestDistance = temp;
                closestPoint = circlePoint;
                index = i;
            }
            i++;
        }
        pared.userData.gamma = transformDegreeToGamma(index);
    }
}


function transformDegreeToGamma(degree) {
    if (degree > 270 && degree <= 360) degree = 180 - degree;
    else degree -= 90;
    return degree;
}

export function transformGammaToDegree(gamma) {
    if (gamma < -90) gamma += 450;
    else gamma += 90;
    return gamma;
}

function getDayOfYear(date) {
    let now = date;
    let start = new Date(now.getFullYear(), 0, 0);
    let diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    let oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);

}

function getHourAngle(date, sunTimes) {
    let dif = date - sunTimes.solarNoon;
    return (dif / 36e5) * 15;
}

function hourAngleToDate(date, angle, latitud, longitud) {
    let dif = (angle / 15) * 36e5;
    let solarNoon = SunCalc.getTimes(date, latitud, longitud).solarNoon;
    let solardate = dif + solarNoon.getTime();
    return new Date(solardate);
}

function sign(x) {
    if (x > 0) return 1;
    if (x < 0) return -1;
    if (x === 0) return 0;
}

function calcularFAR(threejsObs, estadoCasa, rotacion) {
    if (threejsObs.length === 0) {
        return {};
    }
    let farVentanas = {};
    let indices = {};
    for (let nivel of estadoCasa) {
        for (let bloque of nivel.bloques) {
            for (let pared of bloque.paredes) {
                for (let ventana of pared.ventanas) {
                    if (threejsObs.length === 0) {
                        farVentanas[ventana.id] = {
                            far: 1,
                            obstrucciones: [],

                        };
                        continue;
                    }
                    let axisY = new THREE.Vector3(0, 1, 0);
                    let raycasterFAR = new THREE.Raycaster();
                    let orientacion = new THREE.Vector3(
                        pared.orientacion.x,
                        pared.orientacion.y,
                        pared.orientacion.z
                    );
                    let angleLeft = orientacion.clone().applyAxisAngle(axisY, -Math.PI / 4 + (Math.PI / 180) * rotacion);
                    let angle = angleLeft.clone();
                    let posVentana = new THREE.Vector3(
                        ventana.posicionReal.x,
                        ventana.posicionReal.y,
                        ventana.posicionReal.z
                    );
                    let pos = posVentana.clone();
                    pos.applyAxisAngle(axisY, (Math.PI / 180) * rotacion);
                    let origin = new THREE.Vector3(pos.x, 0, pos.z);
                    let obstrucciones = {};
                    let obstuccionActual = null;
                    let infoPunto = null;
                    for (let x = 0; x < 90; x++) {
                        angle = angle.normalize();
                        raycasterFAR.set(origin, angle);
                        raycasterFAR.far = 100;
                        let intersections = raycasterFAR.intersectObjects(threejsObs);
                        //Se hace un barrido de izqueirda a derecha, buscando los puntos del angulo beta;
                        let razonMaxima = 0;
                        let obstruccion = null;
                        for (let i = 0; i < intersections.length; i++) {
                            let intersected = intersections[i];
                            let altura = intersected.object.userData.info.altura;
                            let razon = altura / intersected.distance;
                            if (razon > razonMaxima) {
                                obstruccion = intersected.object;
                                infoPunto = intersected.point;
                                razonMaxima = razon;
                            }
                        }
                        if (obstruccion === null) {
                            //NUNCA EXISTIO O PUDO HABER TERMINADO ALGO
                            if (obstuccionActual !== null) {
                                obstrucciones[obstuccionActual.userData.info.indice].end = infoPunto;
                                obstuccionActual = null;
                            }
                        } else {
                            if (obstruccion !== obstuccionActual) {
                                obstrucciones[obstruccion.userData.info.indice] = {};
                                obstrucciones[obstruccion.userData.info.indice].start = infoPunto;
                                obstuccionActual = obstruccion;
                            } else {
                                obstrucciones[obstuccionActual.userData.info.indice].end = infoPunto;
                            }
                        }
                        angle.applyAxisAngle(axisY, Math.PI / 180);
                    }
                    if (obstuccionActual !== null) {
                        if(obstrucciones[obstuccionActual.userData.info.indice].end === undefined){
                            delete obstrucciones[obstuccionActual.userData.info.indice];
                        }
                    }
                    let f1 = 1;
                    let f2 = 0;
                    let indicesBorrar = [];
                    for (let indice of Object.keys(obstrucciones)) {
                        let bOrientacion = orientacion.clone()
                            .applyAxisAngle(axisY, -Math.PI + (Math.PI / 180) * rotacion);
                        let obstruccion = obstrucciones[indice];
                        if(obstruccion.end === undefined){
                            console.log("BUG");
                            console.log(obstruccion.start,obstruccion.end);
                            indicesBorrar.push(indicesBorrar);
                            continue;
                        }
                        let middlePoint = new THREE.Vector3(
                            (obstruccion.start.x + obstruccion.end.x) / 2,
                            2,
                            (obstruccion.start.z + obstruccion.end.z) / 2);
                        obstruccion.bDistance =
                            (Math.abs(bOrientacion.x * middlePoint.x + bOrientacion.z * middlePoint.z)
                                /
                                Math.sqrt(bOrientacion.x * bOrientacion.x + bOrientacion.z * bOrientacion.z)) -
                            origin.length();
                        obstruccion.aDistance = threejsObs[indice].userData.info.altura - pos.y;
                        let a = new THREE.Vector2(origin.x - obstruccion.start.x, origin.z - obstruccion.start.z);
                        let b = new THREE.Vector2(origin.x - obstruccion.end.x, origin.z - obstruccion.end.z);
                        let beta = Math.acos(a.dot(b) / (a.length() * b.length())) * 180 / Math.PI;
                        obstruccion.far = Math.pow(0.2996, (obstruccion.aDistance / obstruccion.bDistance));
                        obstruccion.beta = beta;
                        f1 -= beta / 90;
                        f2 += obstruccion.far * beta / 90;
                    }
                    for(let indice of indicesBorrar){
                        delete obstrucciones[indice];
                    }
                    let farVentana = f1 + f2;
                    farVentanas[ventana.id] = {
                        far: farVentana,
                        obstrucciones: obstrucciones,

                    };
                }
            }
        }
    }
    return farVentanas;

}

export function calcularFARVentana(threejsObs, rotacion, ventana) {
    if (threejsObs.length === 0) {
        return {
            far: 1,
            obstrucciones: [],
        };
    }

    let axisY = new THREE.Vector3(0, 1, 0);
    let raycasterFAR = new THREE.Raycaster();
    let orientacion = new THREE.Vector3(
        ventana.orientacion.x,
        ventana.orientacion.y,
        ventana.orientacion.z
    );
    let angleLeft = orientacion.clone().applyAxisAngle(axisY, -Math.PI / 4 + (Math.PI / 180) * rotacion);
    let angle = angleLeft.clone();
    let posVentana = new THREE.Vector3(
        ventana.posicionReal.x,
        ventana.posicionReal.y,
        ventana.posicionReal.z
    );
    let pos = posVentana.clone();
    pos.applyAxisAngle(axisY, (Math.PI / 180) * rotacion);
    let origin = new THREE.Vector3(pos.x, 0, pos.z);
    let obstrucciones = {};
    let obstuccionActual = null;
    let infoPunto = null;
    for (let x = 0; x < 90; x++) {
        angle = angle.normalize();
        raycasterFAR.set(origin, angle);
        raycasterFAR.far = 100;
        let intersections = raycasterFAR.intersectObjects(threejsObs);
        //Se hace un barrido de izqueirda a derecha, buscando los puntos del angulo beta;
        let razonMaxima = 0;
        let obstruccion = null;
        for (let i = 0; i < intersections.length; i++) {
            let intersected = intersections[i];
            let altura = intersected.object.userData.info.altura;
            let razon = altura / intersected.distance;
            if (razon > razonMaxima) {
                obstruccion = intersected.object;
                infoPunto = intersected.point;
                razonMaxima = razon;
            }
        }
        if (obstruccion === null) {
            //NUNCA EXISTIO O PUDO HABER TERMINADO ALGO
            if (obstuccionActual !== null) {
                obstrucciones[obstuccionActual.userData.info.indice].end = infoPunto;
                obstuccionActual = null;
            }
        } else {
            if (obstruccion !== obstuccionActual) {
                obstrucciones[obstruccion.userData.info.indice] = {};
                obstrucciones[obstruccion.userData.info.indice].start = infoPunto;
                obstuccionActual = obstruccion;
            } else {
                obstrucciones[obstuccionActual.userData.info.indice].end = infoPunto;
            }
        }
        angle.applyAxisAngle(axisY, Math.PI / 180);
    }
    if (obstuccionActual !== null) {
        if(obstrucciones[obstuccionActual.userData.info.indice].end === undefined){
            delete obstrucciones[obstuccionActual.userData.info.indice];
        }
    }
    let f1 = 1;
    let f2 = 0;
    let indicesBorrar = [];
    for (let indice of Object.keys(obstrucciones)) {
        let bOrientacion = orientacion.clone()
            .applyAxisAngle(axisY, -Math.PI + (Math.PI / 180) * rotacion);
        let obstruccion = obstrucciones[indice];
        if(obstruccion.end === undefined){
            console.log("BUG");
            console.log(obstruccion.start,obstruccion.end);
            indicesBorrar.push(indicesBorrar);
            continue;
        }
        let middlePoint = new THREE.Vector3(
            (obstruccion.start.x + obstruccion.end.x) / 2,
            2,
            (obstruccion.start.z + obstruccion.end.z) / 2);
        obstruccion.bDistance =
            (Math.abs(bOrientacion.x * middlePoint.x + bOrientacion.z * middlePoint.z)
                /
                Math.sqrt(bOrientacion.x * bOrientacion.x + bOrientacion.z * bOrientacion.z)) -
            origin.length();
        obstruccion.aDistance = threejsObs[indice].userData.info.altura - pos.y;
        let a = new THREE.Vector2(origin.x - obstruccion.start.x, origin.z - obstruccion.start.z);
        let b = new THREE.Vector2(origin.x - obstruccion.end.x, origin.z - obstruccion.end.z);
        let beta = Math.acos(a.dot(b) / (a.length() * b.length())) * 180 / Math.PI;
        obstruccion.far = Math.pow(0.2996, (obstruccion.aDistance / obstruccion.bDistance));
        obstruccion.beta = beta;
        f1 -= beta / 90;
        f2 += obstruccion.far * beta / 90;
    }
    for(let indice of indicesBorrar){
        delete obstrucciones[indice];
    }
    let farVentana = f1 + f2;
    return {
        far: farVentana,
        obstrucciones: obstrucciones,
    };

}


function calcularAngulos(periodo, beta, latitud) {
    let now = new Date().getFullYear();
    let angulos = [];
    for (let date = new Date(now, periodo[0], 15); date <= new Date(now, periodo[1], 15); date.setMonth(date.getMonth() + 1)) {
        //
        let phi = latitud;
        let delta = 23.45 * Math.sin(toRadians(360 * (284 + getDayOfYear(date)) / 365));
        let w2 = toDegrees(Math.acos(-Math.tan(toRadians(phi)) * Math.tan(toRadians(delta))));
        angulos.push({
            date: new Date(date),
            phi: phi,
            delta: delta,
            w2: w2,
            w1: -w2
        });
    }

    //let theta = toDegrees(Math.acos(Math.sin(toRadians(delta)) * Math.sin(toRadians(phi)) * Math.cos(toRadians(beta))
    //    - Math.sin(toRadians(delta)) * Math.cos(toRadians(phi)) * Math.sin(toRadians(beta)) * Math.cos(toRadians(gamma))
    //    + Math.cos(toRadians(delta)) * Math.cos(toRadians(phi)) * Math.cos(toRadians(beta)) * Math.cos(toRadians(omega))
    //    + Math.cos(toRadians(delta)) * Math.sin(toRadians(phi)) * Math.sin(toRadians(beta)) * Math.cos(toRadians(gamma)) * Math.cos(toRadians(omega))
    //    + Math.cos(toRadians(delta)) * Math.sin(toRadians(beta)) * Math.sin(toRadians(gamma)) * Math.sin(toRadians(omega))));
    //let costhetaz = Math.cos(toRadians(phi)) * Math.cos(toRadians(delta)) * Math.cos(toRadians(omega))
    //    + Math.sin(toRadians(phi)) * Math.sin(toRadians(delta));
    //let thetaz = toDegrees(Math.acos(costhetaz));
    //let alfa_solar = toDegrees(Math.asin(costhetaz));
    //let gamma_solar = sign(omega) * Math.abs(toDegrees(Math.acos((Math.cos(toRadians(thetaz)) * Math.sin(toRadians(phi))
    //    - Math.sin(toRadians(delta))) / (Math.sin(toRadians(thetaz)) * Math.cos(toRadians(phi))))));
    return angulos;
}

function calcularGammasPared(gamma) {
    let gammas = {
        gamma1: 0,
        gamma2: 0
    };
    if (90 < gamma && gamma <= 180) {       // Cuadrante 1
        gammas.gamma1 = -270 + gamma;
        gammas.gamma2 = gamma - 90;
    }
    if (-180 < gamma && gamma <= -90) { // Cuadrante 2
        gammas.gamma1 = gamma + 90;
        gammas.gamma2 = 270 + gamma;
    }
    if (0 < gamma && gamma <= 90) { // Cuadrante 3
        gammas.gamma1 = -90 + gamma;
        gammas.gamma2 = 90 + gamma;
    }
    if (-90 < gamma && gamma <= 0) { // Cuadrante 4
        gammas.gamma1 = -90 + gamma;
        gammas.gamma2 = 90 + gamma;
    }
    return gammas;
}

function calcularOmegaPared(date, delta, gamma, latitud, longitud) {
    let dif = 100;
    let omega_m = -180.07;
    let gamma_sol = 0;
    while (Math.abs(dif) > 0.1 && omega_m < 180) {
        dif = gamma - gamma_sol;
        //let solardate = (omega_m / 15) * 36e5 + solarNoon.getTime();
        // let costhetaz = Math.cos(this.toRadians(phi)) * Math.cos(this.toRadians(delta)) * Math.cos(this.toRadians(omega_m))
        //                 + Math.sin(this.toRadians(phi)) * Math.sin(this.toRadians(delta));
        // let thetaz = Math.acos(costhetaz);
        // gamma_sol = this.sign(omega_m) * Math.abs( this.toDegrees(Math.acos((Math.cos(this.toRadians(thetaz)) * Math.sin(this.toRadians(phi))
        //               - Math.sin(this.toRadians(delta))) / (Math.sin(this.toRadians(thetaz)) * Math.cos(this.toRadians(phi))))));
        //let sun = SunCalc.getPosition(new Date(solardate),latitud,longitud);
        omega_m += 0.02;
        let sun = SunCalc.getPosition(hourAngleToDate(date, omega_m, latitud, longitud), latitud, longitud);
        gamma_sol = sun.azimuth * 180 / Math.PI;
    }
    return omega_m;
}

function calcularHoraIncidencia(gamma, w1, w2, omega_m, omega_t) {
    let wm = [0, 0]; // hora de incidencia en la mañana
    let wt = [0, 0]; // hora de incidencia en la tarde
    if ((90 < gamma && gamma <= 180) || (-180 < gamma && gamma <= -90)) {  //primer y segundo cuadrante
        wm = [Math.max(w1, omega_m)];
        wt = [Math.min(w2, omega_t)];
    } else { // tercer y cuarto cuadrante
        if (omega_m > w1) {
            wm[0] = w1;
            wt[0] = omega_m;
        } else {
            wm[0] = 180;
            wt[0] = 180;
        }
        if (omega_t < w2) {
            wm[1] = omega_t;
            wt[1] = w2;
        } else {
            wm[1] = 180;
            wt[1] = 180;
        }
    }

    return {wm: wm, wt: wt}
}

function calcularRB(angulo, gamma, omegas) {
    let a_Rb = [];
    let b_Rb = [];
    let R_ave = [];
    for (let i = 0; i < omegas.wm.length; i++) {
        let w1 = omegas.wm[i];
        let w2 = omegas.wt[i];
        a_Rb.push((Math.sin(toRadians(angulo.delta)) * Math.sin(toRadians(angulo.phi))
            * Math.cos(toRadians(90)) - Math.sin(toRadians(angulo.delta))
            * Math.cos(toRadians(angulo.phi)) * Math.sin(toRadians(90))
            * Math.cos(toRadians(gamma))) * (w2 - w1) * (Math.PI / 180)
            + (Math.cos(toRadians(angulo.delta)) * Math.cos(toRadians(angulo.phi))
                * Math.cos(toRadians(90)) + Math.cos(toRadians(angulo.delta))
                * Math.sin(toRadians(angulo.phi)) * Math.sin(toRadians(90))
                * Math.cos(toRadians(gamma))) * (Math.sin(toRadians(w2)) - Math.sin(toRadians(w1)))
            - Math.cos(toRadians(angulo.delta)) * Math.sin(toRadians(90))
            * Math.sin(toRadians(gamma)) * (Math.cos(toRadians(w2)) - Math.cos(toRadians(w1))));
        b_Rb.push(Math.cos(toRadians(angulo.phi)) * Math.cos(toRadians(angulo.delta))
            * (Math.sin(toRadians(w2)) - Math.sin(toRadians(w1)))
            + Math.sin(toRadians(angulo.delta)) * Math.sin(toRadians(angulo.phi))
            * (w2 - w1) * (Math.PI / 180));
        R_ave.push(b_Rb[i] !== 0 ? a_Rb[i] / b_Rb[i] : 0);
    }
    if (R_ave.length === 2) {
        if (R_ave[0] === 0) return Math.abs(R_ave[1]);
        if (R_ave[1] === 0) return Math.abs(R_ave[0]);
        return (R_ave[0] + R_ave[1]) / 2;
    } else {
        return Math.abs(R_ave[0]);
    }

}

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}

function calcularRbParedes(latitud, longitud, periodo, anguloRotado) {
    //console.log("periodo en calcularrbparedes", periodo);
    let angulos = calcularAngulos(periodo, 90, latitud);
    //se determina el gamma de cuatro orientaciones y se le suma el angulo rotado.
    let rbParedes = [];
    let gamma = -90 + anguloRotado;
    if (gamma > 180) {
        gamma -= 360;
    }
    for (let i = 0; i < 4; i++) {
        let rb = [];
        let gammas = calcularGammasPared(gamma);
        console.log("VALOR GAMMA", gamma);
        for (let angulo of angulos) {
            let omega_mna = calcularOmegaPared(angulo.date, angulo.delta, gammas.gamma1, latitud, longitud);
            let omega_tde = calcularOmegaPared(angulo.date, angulo.delta, gammas.gamma2, latitud, longitud);
            let omegas = calcularHoraIncidencia(gamma, angulo.w1, angulo.w2, omega_mna, omega_tde);
            let Rb = calcularRB(angulo, gamma, omegas);
            let omegasDate = {
                wm: {
                    desde: omegas.wm[0] >= angulo.w1 && omegas.wm[0] <= angulo.w2 ?
                        hourAngleToDate(angulo.date, omegas.wm[0], latitud, longitud) : null,
                    //new Date((omegas.wm[0] / 15) * 36e5) : null,
                    hasta: omegas.wt[0] >= angulo.w1 && omegas.wt[0] <= angulo.w2 ?
                        hourAngleToDate(angulo.date, omegas.wt[0], latitud, longitud) : null,
                    //new Date((omegas.wt[0] / 15) * 36e5) : null
                },
                wt: {
                    desde: omegas.wm[1] >= angulo.w1 && omegas.wm[1] <= angulo.w2 ?
                        hourAngleToDate(angulo.date, omegas.wm[1], latitud, longitud) : null,
                    //new Date((omegas.wm[1] / 15) * 36e5): null,
                    hasta: omegas.wt[1] >= angulo.w1 && omegas.wt[1] <= angulo.w2 ?
                        hourAngleToDate(angulo.date, omegas.wt[1], latitud, longitud) : null,
                    //new Date((omegas.wt[1] / 15) * 36e5): null
                },
                rb: Rb.toFixed(3)
            };
            rb.push({
                gamma: gamma,
                gammas: gammas,
                date: angulo.date,
                omegasDate: omegasDate,
                omega_mna: omega_mna,
                omega_tde: omega_tde,
            });
        }
        rbParedes.push(rb);
        gamma += 90;
        if (gamma > 180) {
            gamma -= 360;
        }
    }
    return rbParedes;
    /*for (let [index, pared] of paredes.entries()) {
        if (pared.userData.separacion === Morfologia.separacion.EXTERIOR) {
            let rbPared = [];
            //console.log(pared.userData.gamma);
            let gammas = calcularGammasPared(pared.userData.gamma);
            pared.userData.gammas = gammas;
            for (let angulo of angulos) {
                let omega_mna = calcularOmegaPared(angulo.date, angulo.delta, gammas.gamma1, latitud, longitud);
                let omega_tde = calcularOmegaPared(angulo.date, angulo.delta, gammas.gamma2, latitud, longitud);
                let omegas = calcularHoraIncidencia(pared.userData.gamma, angulo.w1, angulo.w2, omega_mna, omega_tde);
                let Rb = calcularRB(angulo, pared.userData.gamma, omegas);
                rbPared.push(Rb.toFixed(3));
                if (angulo.date.getMonth() === new Date().getMonth()) {
                    let omegasDate = {
                        wm: {
                            desde: omegas.wm[0] >= angulo.w1 && omegas.wm[0] <= angulo.w2 ?
                                hourAngleToDate(angulo.date, omegas.wm[0], latitud, longitud) : null,
                            //new Date((omegas.wm[0] / 15) * 36e5) : null,
                            hasta: omegas.wt[0] >= angulo.w1 && omegas.wt[0] <= angulo.w2 ?
                                hourAngleToDate(angulo.date, omegas.wt[0], latitud, longitud) : null,
                            //new Date((omegas.wt[0] / 15) * 36e5) : null
                        },
                        wt: {
                            desde: omegas.wm[1] >= angulo.w1 && omegas.wm[1] <= angulo.w2 ?
                                hourAngleToDate(angulo.date, omegas.wm[1], latitud, longitud) : null,
                            //new Date((omegas.wm[1] / 15) * 36e5): null,
                            hasta: omegas.wt[1] >= angulo.w1 && omegas.wt[1] <= angulo.w2 ?
                                hourAngleToDate(angulo.date, omegas.wt[1], latitud, longitud) : null,
                            //new Date((omegas.wt[1] / 15) * 36e5): null
                        },
                        rb: Rb.toFixed(3)
                    };
                    pared.userData.omegas = omegasDate;
                    pared.userData.omega_mna = omega_mna;
                    pared.userData.omega_tde = omega_tde;
                }
            }
            pared.userData.rb = rbPared;
        }
    }*/
    return rbParedes;
}

function calcularAporteSolar(periodo, farVentanas, ventanas, difusa, directa,info_material,marco,rb) {
    let aporte_solar = 0;
    let aporte_solar_objetivo = 0;
    let index;
    for (let id of Object.keys(farVentanas)) {
        let ventana = ventanas[id];

        let f = calcularF(ventana,info_material,marco,farVentanas);
        index = ventana.orientacion.z !== 0 ? ventana.orientacion.z === 1 ? 1 : 3 : ventana.orientacion.x === 1 ? 0 : 2;
        let Igb = 0;
        for (let i = 0; i < (periodo[1] - periodo[0]) + 1; i++) {
            //console.log("Igb", difusa[i].valor,directa[i].valor, pared.userData.rb[i], pared.userData.rb.length, (periodo[1]-periodo[0])+1);
            Igb += calcularIgb(difusa[i].valor, directa[i].valor, parseFloat(rb[0][i].omegasDate.rb));
        }
        let area_ventana = ventana.superficie;
        aporte_solar += Igb * area_ventana * f.normal;
        //console.log("aporte_solar", Igb, area_ventana, f.normal);
        aporte_solar_objetivo += Igb * area_ventana * f.objetivo;
    }
    return {normal: aporte_solar, objetivo: aporte_solar_objetivo}
}

function calcularF(ventana,info_material,info_marco,farVentanas) {
    const material = ventana.material.material;
    const tipo = ventana.material.tipo;
    const fs = info_material[material].tipos[tipo].propiedad.FS;
    const marco = ventana.marco.material;
    const tipo_marco = ventana.marco.tipo;
    const far = farVentanas[ventana.id].far;

    let fm,um;
    if(!info_marco[marco].hasOwnProperty('tipos')){
        um = info_marco[marco].propiedades[0].U;
        fm = info_marco[marco].propiedades[0].FS;
    }else{
        um = info_marco[marco].tipos[tipo_marco].propiedad.U;
        fm = info_marco[marco].tipos[tipo_marco].propiedad.FS;
    }
    let fmObjetivo = 0.8;
    let fsObjetivo = 0.87;
    let umObjetivo = 5.8;
    return {
        normal: far * ((1 - fm) * fs + (fm * 0.04 * um * 0.35)),
        objetivo: ((1 - fmObjetivo) * fsObjetivo + (fmObjetivo * 0.04 * umObjetivo * 0.35)),
    }
}

function calcularIgb(difusa, directa, rb) {
    return difusa * ((1 + Math.cos(toRadians(90))) / 2) + directa * rb;
}

export {
    perdidasConduccion,
    puenteTermico,
    aporteInterno,
    gradosDias,
    perdidasVentilacion,
    calcularF,
    calcularIgb,
    calcularAngulos,
    calcularHoraIncidencia,
    calcularOmegaPared,
    calcularRB,
    calcularGammasPared,
    hourAngleToDate,
    getHourAngle,
    calcularAporteSolar,
    calcularRbParedes,
    calcularGammaParedes,
    calcularFAR
};