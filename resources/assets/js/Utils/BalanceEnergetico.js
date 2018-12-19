import * as THREE from 'three'
import Morfologia from "../components/Morfologia";
import {AISLADO, CORRIENTE, MEDIO, PARED, PISO, PUERTA, TECHO, VENTANA,} from "../constants/morofologia-types";


var SunCalc = require('suncalc');

var periodo = [];
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
        if ((temperaturaConfort - temperaturasMes[i]) > 0) {
            if (periodo.length === 0) {
                periodo.push(i);
            }
            gd = gd + (temperaturaConfort - temperaturasMes[i]) * diasMeses[i];
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

function transmitanciaSuperficieRedux(elemento, zona) {
    let transmitancia = 0, u, res;
    switch (elemento.tipo) {
        case PARED:
            for (let capa of elemento.capas) {
                transmitancia += capa.espesor / capa.conductividad;
            }
            transmitancia += resistenciasTermicasSuperficie[elemento.tipo][elemento.separacion];
            u = 1 / transmitancia;
            return {
                transmitancia: u,
                transmitanciaObjetivo: uObjetivoMuro[zona - 1],
                transSup: u * elemento.superficie,
                transSupObjetivo: uObjetivoMuro[zona - 1] * elemento.superficie,
            };
        case PISO:
            for (let capa of elemento.capas) {
                transmitancia += capa.espesor / capa.conductividad;
            }
            transmitancia += resistenciasTermicasSuperficie[elemento.tipo][elemento.separacion];
            u = 1 / transmitancia;

            res = {
                transmitancia: u,
                transmitanciaObjetivo: uObjetivoPiso[zona - 1],
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
                transmitancia += capa.espesor / capa.conductividad;
            }
            transmitancia += resistenciasTermicasSuperficie[elemento.tipo][elemento.separacion];
            u = 1 / transmitancia;
            return {
                transmitancia: u,
                transmitanciaObjetivo: uObjetivoTecho[zona - 1],
                transSup: u * elemento.superficie,
                transSupObjetivo: uObjetivoTecho[zona - 1] * elemento.superficie,
            };
        case VENTANA:
            return {
                transSupObjetivo: 5.8 * elemento.superficie,
                transSup: elemento.material.u * elemento.superficie,
            };
        case PUERTA:
            transmitancia += elemento.material.espesor / elemento.conductividad;
            transmitancia += resistenciasTermicasSuperficie[elemento.tipo][elemento.separacion];

            u = 1 / transmitancia;

            return {
                transmitancia: u,
                transmitanciaObjetivo: uObjetivoMuro[zona - 1],
                transSup: u * elemento.superficie,
                transSupObjetivo: uObjetivoMuro[zona - 1] * elemento.superficie,
            };
    }
}

function puenteTermicoRedux(piso, zona) {
    let aislacionObjetivo = CORRIENTE;
    if (rtObjetivoPiso[zona - 1] > 0.6) aislacionObjetivo = AISLADO;
    else if (rtObjetivoPiso[zona - 1] < 0.6 && rtObjetivoPiso[zona - 1] > 0.26) aislacionObjetivo = MEDIO;
    return {
        puenteTermico: piso.perimetro * transmitanciaLineal[piso.aislacion],
        puenteTermicoObjetivo: piso.perimetro * transmitanciaLineal[aislacionObjetivo],
    }
}


function transmitanciaSuperficie(elemento, zona) {
    let transmitancia = 0, u;
    switch (elemento.userData.tipo) {
        case Morfologia.tipos.PARED:
            for (let capa of elemento.userData.capas) {
                transmitancia += capa.espesor / capa.conductividad;
            }
            transmitancia += resistenciasTermicasSuperficie[elemento.userData.tipo][elemento.userData.separacion];
            u = 1 / transmitancia;
            elemento.userData.transmitancia = u;
            elemento.userData.transmitanciaObjetivo = uObjetivoMuro[zona - 1];
            elemento.userData.transSup = u * elemento.userData.superficie;
            elemento.userData.transSupObjetivo = uObjetivoMuro[zona - 1] * elemento.userData.superficie;
            //console.log("elemento transsupobjetivo", elemento.userData.transSupObjetivo, uObjetivoMuro[zona-1], zona ,elemento.userData.superficie);
            break;
        case Morfologia.tipos.TECHO:
            for (let capa of elemento.userData.capas) {
                transmitancia += capa.espesor / capa.conductividad;
            }
            transmitancia += resistenciasTermicasSuperficie[elemento.userData.tipo][elemento.userData.separacion];
            u = 1 / transmitancia;
            elemento.userData.transmitancia = u;
            elemento.userData.transmitanciaObjetivo = uObjetivoTecho[zona - 1];
            elemento.userData.transSup = u * elemento.userData.superficie;
            elemento.userData.transSupObjetivo = uObjetivoTecho[zona - 1] * elemento.userData.superficie;
            //console.log("techo",elemento);
            break;
        case Morfologia.tipos.PISO:
            for (let capa of elemento.userData.capas) {
                transmitancia += capa.espesor / capa.conductividad;
            }
            transmitancia += resistenciasTermicasSuperficie[elemento.userData.tipo][elemento.userData.separacion];
            u = 1 / transmitancia;

            //console.log('resistencias',resistenciasTermicasSuperficie[elemento.userData.tipo][elemento.userData.separacion]);
            elemento.userData.transmitancia = u;
            elemento.userData.transmitanciaObjetivo = uObjetivoPiso[zona - 1];
            elemento.userData.transSup = u * elemento.userData.superficie;
            elemento.userData.transSupObjetivo = uObjetivoPiso[zona - 1] * elemento.userData.superficie;

            if (elemento.userData.transSup >= 0.15 && elemento.userData.transSup <= 0.25) {
                elemento.userData.aislacion = Morfologia.aislacionPiso.CORRIENTE;
            } else if (elemento.userData.transSup >= 0.26 && elemento.userData.transSup <= 0.60) {
                elemento.userData.aislacion = Morfologia.aislacionPiso.MEDIO;
            } else {
                elemento.userData.aislacion = Morfologia.aislacionPiso.AISLADO;
            }
            break;
        case Morfologia.tipos.VENTANA:
            elemento.userData.transSupObjetivo = 5.8 * elemento.userData.superficie;
            elemento.userData.transSup = elemento.userData.info_material.u * elemento.userData.superficie;
            break;

        case Morfologia.tipos.PUERTA:
            transmitancia += elemento.userData.info_material.espesor / elemento.userData.info_material.conductividad;
            transmitancia += resistenciasTermicasSuperficie[elemento.userData.tipo][elemento.parent.userData.separacion];

            u = 1 / transmitancia;

            elemento.userData.transmitancia = u;
            elemento.userData.transmitanciaObjetivo = uObjetivoMuro[zona - 1];
            elemento.userData.transSup = u * elemento.userData.superficie;
            elemento.userData.transSupObjetivo = uObjetivoMuro[zona - 1] * elemento.userData.superficie;
            break;
    }

}

function cambioTransmitanciaSuperficie(tramitanciaSuperficie, elementoCambio) {
    tramitanciaSuperficie -= elementoCambio.userData.tramitancia;
    return tramitanciaSuperficie(tramitanciaSuperficie, elementoCambio);

}

function puenteTermico(piso, zona) {
    let aislacionObjetivo = Morfologia.aislacionPiso.CORRIENTE;
    if (rtObjetivoPiso[zona - 1] > 0.6) aislacionObjetivo = Morfologia.aislacionPiso.AISLADO;
    else if (rtObjetivoPiso[zona - 1] < 0.6 && rtObjetivoPiso[zona - 1] > 0.26) aislacionObjetivo = Morfologia.aislacionPiso.MEDIO;
    piso.userData.puenteTermico = piso.userData.perimetro * transmitanciaLineal[piso.userData.aislacion];
    piso.userData.puenteTermicoObjetivo = piso.userData.perimetro * transmitanciaLineal[aislacionObjetivo];
}

function perdidasVentilacion(volumenInterno, volmenAire, gradosDias) {
    return 24 * (0.34 * volmenAire * gradosDias * volumenInterno);
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

function transformGammaToDegree(gamma) {
    if (gamma < -90) gamma += 450;
    else gamma += 90;
    return gamma;
}

function getDayOfYear(date) {
    var now = date;
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    var oneDay = 1000 * 60 * 60 * 24;
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

function calcularFAR(threejsObs, estadoCasa) {
    console.log("EMPEZANDO");
    console.log(threejsObs);
    if(threejsObs.length === 0){
        return;
        console.log(threejsObs[0]);
    }
    let escena = threejsObs[0].parent.parent;
    console.log(escena);
    let ventanas = [];
    let indexNivel, indexBloque, indexPared, indexVentana;
    for (let nivel of estadoCasa) {
        indexNivel = estadoCasa.indexOf(nivel);
        for (let bloque of nivel.bloques) {
            indexBloque = nivel.bloques.indexOf(bloque);
            for (let pared of bloque.paredes) {
                indexPared = bloque.paredes.indexOf(pared);
                for (let ventana of pared.ventanas) {
                    indexVentana = bloque.paredes.indexOf(pared);
                    console.log('VENTANA');
                    /*let indices =  {
                        indexNivel: indexNivel,
                            indexPared: indexPared,
                            indexBloque: indexBloque,
                            indexVentana: indexVentana,
                    };*/
                    /*ventanas.push({
                        /!*ventana : ventana,*!/
                        indices: {
                            indexNivel: indexNivel,
                            indexPared: indexPared,
                            indexBloque: indexBloque,
                            indexVentana: indexVentana,
                        },
                        posicion : ventana.posicionReal,
                        betaAngle : null,
                        betaIndex : null,
                        orientacion: pared.orientacion,
                    })*/
                    /*let betaAngle = null;
                    let betaIndex = null;*/
                    let axisY = new THREE.Vector3(0, 1, 0);
                    let raycasterFAR = new THREE.Raycaster();
                    let orientacion = new THREE.Vector3(
                        pared.orientacion.x,
                        pared.orientacion.y,
                        pared.orientacion.z
                    );
                    let angleLeft = orientacion.clone().applyAxisAngle(axisY, -Math.PI / 4);
                    let angle = angleLeft.clone();
                    console.log(angle);
                    let obstruccionesVentana = {};
                    let currentObstruccion = {};
                    let pos = new THREE.Vector3(
                        ventana.posicionReal.x,
                        ventana.posicionReal.y,
                        ventana.posicionReal.z
                    );
                    let alturaVentana = pos.y;
                    let infoObstrucciones = {};
                    let alturaActual = 0;
                    let obstruccionLejos = false;
                    let obstrucciones = {};
                    let obstuccionActual = null;
                    console.log("posuicion ventana",pos);
                    console.log("orientacion",orientacion);
                    for (let x = 0; x < 90; x++) {
                        angle = angle.normalize();
                        var dir = new THREE.Vector3( 1, 2, 0 );

                        //normalize the direction vector (convert to vector of length 1)
                        dir.normalize();

                        var length = 10;
                        var hex = 0xffff00;

                        var arrowHelper = new THREE.ArrowHelper( angle, new THREE.Vector3(pos.x, 0, pos.z), length, hex );
                        escena .add( arrowHelper );

                        raycasterFAR.set(new THREE.Vector3(pos.x, 0, pos.z), angle);
                        let intersections = raycasterFAR.intersectObjects(threejsObs);
                        //Se hace un barrido de izqueirda a derecha, buscando los puntos del angulo beta;
                        let alturaMaxima = 0;
                        let obstruccion = null;
                        let infoPunto;
                        for (let i = 0; i < intersections.length; i++) {
                            console.log("SISISIS");
                            let intersected = intersections[i];
                            let altura = intersected.object.userData.info.altura;
                            if (altura > alturaMaxima) {
                                obstruccion = intersected.object;
                                infoPunto = intersected.point;
                            }
                        }

                        if (obstruccion === null) {
                            //NUNCA EXISTIO O PUDO HABER TERMINADO ALGO

                            if (obstuccionActual !== null) {
                                obstrucciones[obstuccionActual.indice].end = infoPunto;
                                obstuccionActual = null;
                            }
                        }else {
                            if (obstruccion !== obstuccionActual) {

                                if (obstuccionActual !== null) {
                                    obstrucciones[obstuccionActual.indice].end = infoPunto;
                                }
                                obstrucciones[obstruccion.indice] = obstruccion;
                                obstrucciones[obstruccion.indice].start = infoPunto;
                                console.log('puntos',obstruccion);

                                obstuccionActual = obstruccion;

                            }
                        }
                        //console.log(angle);
                        angle.applyAxisAngle(axisY, +Math.PI / 180);

                    }

                    console.log(obstrucciones);
                    //HAY OBSTRUCCIOM
                    //SI ALTURA ACTUAL CAMBIA, SIGNIFICA QUE HAY OTRA OBSTRUCCION MAS ALTA (NUEVA) QUE AFECTA A LA VENTANA
                    //O QUE NO HAY NINGUNA, DE AMBAS FORMAS SE MARCA LA OBSTRUCCION Y SE CALCULA SU FAR.


                    /*if(obs)
                    // ne su aDistance y su bDistance, además se almacena el más alto
                    for (let i = 0; i < intersections.length; i++) {

                        //SE BUSCA AL MAS ALTO
                        if (intersections[i].distance > 50) {
                            intersections[i].object.fuera = true
                        }
                        let aDistance = intersections[i].object.userData.info.altura - pos.y;
                        console.log(aDistance);
                        let bDistance = orientacion.clone().dot(intersections[i].point);
                        let far = Math.pow(0.2996, (aDistance / bDistance));
                        let indiceObst = intersections[i].object.userData.info.indice;
                        infoObstrucciones[indiceObst] = {
                            aDistance: aDistance,
                            bDistance: bDistance,
                            far: far,
                        };
                        /!*
                        intersections[i].aDistance = aDistance;
                        let ventanaAgregada = intersections[i].object.ventanas.find(element => element.id === ventanaObstruida.id);
                        if (!ventanaAgregada) intersections[i].object.ventanas.push(ventanaObstruida);
                        else {
                            intersections[i].object.ventanas[intersections[i].object.ventanas.findIndex(elem => elem === ventanaAgregada)].aDistance = aDistance;
                            intersections[i].object.ventanas[intersections[i].object.ventanas.findIndex(elem => elem === ventanaAgregada)].bDistance = bDistance;
                            intersections[i].object.ventanas[intersections[i].object.ventanas.findIndex(elem => elem === ventanaAgregada)].far = far;
                        }*!/
                        if (aDistance > masAlto.aDistance) {
                            masAlto = {indice : indiceObst, aDistance: aDistance, point: intersections[i].point };
                        }
                        if (intersections[i].distance > 50) {
                            masAlto.fuera = true;
                        }
                    }
                    //si no hay obstruccion en el angulo actual entonces pasamos al siguiente
                    if (intersections.length === 0) {
                        angle.applyAxisAngle(axisY, -Math.PI / 180); //angulo + 1
                        continue;
                    }
                    //si cambiamos de obstruccion mas alta entonces se reinicia el start point
                    if (masAlto.indice !== currentObstruccion.indice) {
                        currentObstruccion.startPoint = null;
                        currentObstruccion = masAlto;
                        //el beta index indica si hay un nuevo angulo que agregar a la obstruccion
                        if (betaIndex === null) betaIndex = -1;
                        betaIndex += 1;
                    }
                    //cuando se cambia de obstruccion se reinicia el startpoint,
                    // entonces si ha sido reiniciado y volvemos a la misma obstruccion lo inicializamos de nuevo
                    if (currentObstruccion.startPoint === null) {
                        currentObstruccion.startPoint = masAlto.point;
                    }
                    //se inicializa el arreglo de angulos beta
                    if (betaAngle === null) betaAngle = [];
                    betaAngle[betaIndex] = currentObstruccion.startPoint.angleTo(masAlto.point) * 180 / Math.PI;
                    //se agrega la obstruccion actual a las obstrucciones de la ventana si es que no ha sido agregada antes
                    //además las obstrucciones de una ventana se pintan rojas
                    /!*if (!obstruccionesVentana.includes(currentObstruccion)) {
                        obstruccionesVentana.push(currentObstruccion);
                    }*!/
                    infoObstrucciones[currentObstruccion.indice].obstruccion = currentObstruccion;

                    //pasamos al siguiente angulo
                    angle.applyAxisAngle(axisY, -Math.PI / 180);
                }
                console.log('info',infoObstrucciones);
                //se calcula el far de la ventana en base a la formula
                //ventana.userData.obstrucciones = obstruccionesVentana;
                let f1 = 1;
                let f2 = 0;
                for (let obs of obstruccionesVentana) {
                    // Si la obstrucción está fuera del rango y tiene FAR > 0.95 no se considera
                    if (obs.ventanas.find(element => element.id === ventana.uuid).far > 0.95 && obs.fuera) {
                        ventana.userData.obstrucciones.splice(ventana.userData.obstrucciones.indexOf(obs), 1);
                        obs.startPoint = null;
                        continue;
                    }
                    obs.startPoint = null; //reseteamos el punto de inicio de la obstruccion para futuros cálculos
                    obs.material.color.setHex(0xff0000);
                    obs.currentHex = 0xff0000;
                    // if(ventana.userData.obstrucciones.length === 1 && obs.betaAngle.length > 1){
                    //     console.log("beta angle", obs.betaAngle);
                    //     obs.betaAngle = [obs.betaAngle[0]];
                    // }
                    for (let beta of obs.ventanas.find(element => element.id === ventana.uuid).betaAngle) {
                        f1 -= beta / 90;
                        f2 += obs.ventanas.find(element => element.id === ventana.uuid).far * beta / 90;
                    }
                }
                ventana.userData.far = f1 + f2;*/
                }
            }

        }

    }


    /*for (let obs of obstrucciones) {
        for (let vent of obs.ventanas) {
            vent.betaIndex = null;
            vent.betaAngle = null;
        }
    }*/


}

function calcularFAROBstruccion(obstrucciones) {
    for (let obs of obstrucciones) {
        for (let vent of obs.ventanas) {
            vent.betaIndex = null;
            vent.betaAngle = null;
        }
    }
    for (let ventana of ventanas) {
        let axisY = new THREE.Vector3(0, 1, 0);
        let raycasterFAR = new THREE.Raycaster();
        let angleLeft = ventana.userData.orientacion.clone().applyAxisAngle(axisY, Math.PI / 4);
        let angle = angleLeft.clone();
        let obstruccionesVentana = [];
        let current = {};
        let pos = new THREE.Vector3();
        ventana.getWorldPosition(pos);
        for (let x = 0; x < 90; x++) {
            angle = angle.normalize();
            raycasterFAR.set(new THREE.Vector3(0, pos.y, 0), angle);
            let intersections = raycasterFAR.intersectObjects(obstrucciones);
            let masAlto = {aDistance: 0};
            //para cada obstruccion en el angulo actual se obtiene su aDistance y su bDistance, además se almacena el más alto
            for (let i = 0; i < intersections.length; i++) {
                if (intersections[i].distance > 50) {
                    intersections[i].object.fuera = true
                }
                /*let aDistance = intersections[i].object.userData.altura - pos.y;
                let bDistance = ventana.userData.orientacion.clone().dot(intersections[i].object.position);*/
                /*let far = Math.pow(0.2996, (aDistance / bDistance));*/
                let ventanaObstruida = {
                    id: ventana.uuid,
                    orientacion: ventana.userData.orientacion,
                    aDistance: aDistance,
                    bDistance: bDistance,
                    far: far,
                };
                intersections[i].aDistance = aDistance;
                let ventanaAgregada = intersections[i].object.ventanas.find(element => element.id === ventanaObstruida.id);
                if (!ventanaAgregada) intersections[i].object.ventanas.push(ventanaObstruida);
                else {
                    intersections[i].object.ventanas[intersections[i].object.ventanas.findIndex(elem => elem === ventanaAgregada)].aDistance = aDistance;
                    intersections[i].object.ventanas[intersections[i].object.ventanas.findIndex(elem => elem === ventanaAgregada)].bDistance = bDistance;
                    intersections[i].object.ventanas[intersections[i].object.ventanas.findIndex(elem => elem === ventanaAgregada)].far = far;
                }
                if (aDistance > masAlto.aDistance) {
                    masAlto = intersections[i];
                }
            }
            //si no hay obstruccion en el angulo actual entonces pasamos al siguiente
            if (masAlto.point == null) {
                angle.applyAxisAngle(axisY, -Math.PI / 180); //angulo + 1
                continue;
            }
            //si cambiamos de obstruccion mas alta entonces se reinicia el start point
            if (masAlto.object !== current) {
                current.startPoint = null;
                current = masAlto.object;
                //el beta index indica si hay un nuevo angulo que agregar a la obstruccion
                let betaIndex = current.ventanas.find(ele => ele.id === ventana.uuid).betaIndex;
                if (betaIndex == null) betaIndex = -1;
                betaIndex += 1
                current.ventanas.find(ele => ele.id === ventana.uuid).betaIndex = betaIndex;
            }
            //cuando se cambia de obstruccion se reinicia el startpoint,
            // entonces si ha sido reiniciado y volvemos a la misma obstruccion lo inicializamos de nuevo
            if (current.startPoint == null) {
                current.startPoint = masAlto.point;
            }
            //se inicializa el arreglo de angulos beta
            let betaAngle = current.ventanas.find(ele => ele.id === ventana.uuid).betaAngle;
            let betaIndex = current.ventanas.find(ele => ele.id === ventana.uuid).betaIndex;
            if (betaAngle == null) betaAngle = [];
            betaAngle[betaIndex] = current.startPoint.angleTo(masAlto.point) * 180 / Math.PI;
            current.ventanas.find(ele => ele.id === ventana.uuid).betaAngle = betaAngle;
            //se agrega la obstruccion actual a las obstrucciones de la ventana si es que no ha sido agregada antes
            //además las obstrucciones de una ventana se pintan rojas
            if (!obstruccionesVentana.includes(current)) {
                obstruccionesVentana.push(current);
            }

            //pasamos al siguiente angulo
            angle.applyAxisAngle(axisY, -Math.PI / 180);
        }
        //se calcula el far de la ventana en base a la formula
        ventana.userData.obstrucciones = obstruccionesVentana;
        let f1 = 1;
        let f2 = 0;
        for (let obs of ventana.userData.obstrucciones) {
            // Si la obstrucción está fuera del rango y tiene FAR > 0.95 no se considera
            if (obs.ventanas.find(element => element.id === ventana.uuid).far > 0.95 && obs.fuera) {
                ventana.userData.obstrucciones.splice(ventana.userData.obstrucciones.indexOf(obs), 1);
                obs.startPoint = null;
                continue;
            }
            obs.startPoint = null; //reseteamos el punto de inicio de la obstruccion para futuros cálculos
            obs.material.color.setHex(0xff0000);
            obs.currentHex = 0xff0000;
            // if(ventana.userData.obstrucciones.length === 1 && obs.betaAngle.length > 1){
            //     console.log("beta angle", obs.betaAngle);
            //     obs.betaAngle = [obs.betaAngle[0]];
            // }
            for (let beta of obs.ventanas.find(element => element.id === ventana.uuid).betaAngle) {
                f1 -= beta / 90;
                f2 += obs.ventanas.find(element => element.id === ventana.uuid).far * beta / 90;
            }
        }
        ventana.userData.far = f1 + f2;
    }
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


function calcularRbParedes(paredes, latitud, longitud) {
    let periodo = paredes[0].parent.parent.parent.parent.userData.periodo;
    //console.log("periodo en calcularrbparedes", periodo);
    let angulos = calcularAngulos(periodo, 90, latitud);
    for (let [index, pared] of paredes.entries()) {
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
    }
    return paredes;
}

function calcularAporteSolar(periodo, ventanas, difusa, directa) {
    let aporte_solar = 0;
    let aporte_solar_objetivo = 0;
    for (let ventana of ventanas) {
        let f = calcularF(ventana);
        let pared = ventana.parent;
        let Igb = 0;
        for (let i = 0; i < (periodo[1] - periodo[0]) + 1; i++) {
            //console.log("Igb", difusa[i].valor,directa[i].valor, pared.userData.rb[i], pared.userData.rb.length, (periodo[1]-periodo[0])+1);
            Igb += calcularIgb(difusa[i].valor, directa[i].valor, pared.userData.rb[i]);
        }
        let area_ventana = Math.abs((ventana.geometry.boundingBox.max.x - ventana.geometry.boundingBox.min.x) *
            (ventana.geometry.boundingBox.max.y - ventana.geometry.boundingBox.min.y));
        aporte_solar += Igb * area_ventana * f.normal;
        //console.log("aporte_solar", Igb, area_ventana, f.normal);
        aporte_solar_objetivo += Igb * area_ventana * f.objetivo;
    }
    return {normal: aporte_solar, objetivo: aporte_solar_objetivo}
}

function calcularF(ventana) {
    let fm = ventana.userData.info_marco.fs;
    let fmObjetivo = ventana.userData.info_marco.fsObjetivo;
    let fs = ventana.userData.info_material.fs;
    let fsObjetivo = ventana.userData.info_material.fsObjetivo;
    let um = ventana.userData.info_marco.u;
    let umObjetivo = ventana.userData.info_marco.uObjetivo;
    return {
        normal: ventana.userData.far * ((1 - fm) * fs + (fm * 0.04 * um * 0.35)),
        objetivo: ((1 - fmObjetivo) * fsObjetivo + (fmObjetivo * 0.04 * umObjetivo * 0.35)),
    }
}

function calcularIgb(difusa, directa, rb) {
    return difusa * ((1 + Math.cos(toRadians(90))) / 2) + directa * rb;
}

export {
    perdidasConduccion,
    puenteTermico,
    cambioTransmitanciaSuperficie,
    transmitanciaSuperficie,
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