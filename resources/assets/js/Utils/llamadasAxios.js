import axios from "axios";

export function getTemperaturesById(id) {
    return axios.get('https://bioclimapp.host/api/temperaturas/' + id);
}

export function getGlobalRadiationById(id) {
    return axios.get('https://bioclimapp.host/api/radiaciones/' + id);
}

export function getDirectRadiationById(id) {
    return axios.get('https://bioclimapp.host/api/radiaciones_directa/' + id);
}

export function getDifuseRadiationById(id) {
    return axios.get('https://bioclimapp.host/api/radiaciones_difusa/' + id);
}

export function getComunas(lat,lng) {
    return axios.get("https://bioclimapp.host/api/comuna/" + lat + "/" + lng);
}

export function getMateriales(){
    return axios.get("https://bioclimapp.host/api/info_materiales");
}

export function getMaterialesVentanas(){
    return axios.get("https://bioclimapp.host/api/info_ventanas");
}

export function getMaterialesMarcos(){
    return axios.get("https://bioclimapp.host/api/info_marcos");
}

export function getFilteredRadiationDifusa(id){
    console.log('difusa',id);
    let month = new Date().getMonth()+1;
    return axios.get("https://bioclimapp.host/api/radiaciones/"+id+"/"+"2"+"/"+month);
}

export function getFilteredRadiationDirecta(id){
    let month = new Date().getMonth()+1;
    return axios.get("https://bioclimapp.host/api/radiaciones/"+id+"/"+"3"+"/"+month);
}