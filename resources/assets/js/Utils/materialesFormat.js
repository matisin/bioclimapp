import {createMuiTheme} from "@material-ui/core";

export function getJsonMateriales(response) {

    let info_material = response.data.slice();
    for (let i = 0; i < info_material.length; i++) {
        info_material[i].index = i;

        var theme = createMuiTheme({
            palette: {
                primary: {
                    main: info_material[i].color,
                },
            },
        });
        info_material[i].textColor = theme.palette.primary.contrastText;


        if (info_material[i].hasOwnProperty('tipos')) {
            for (let j = 0; j < info_material[i].tipos.length; j++) {
                info_material[i].tipos[j].index = j;
                for (let k = 0; k < info_material[i].tipos[j].propiedades.length; k++) {
                    info_material[i].tipos[j].propiedades[k].index = k;
                }
            }
        } else {
            for (let k = 0; k < info_material[i].propiedades.length; k++) {
                info_material[i].propiedades[k].index = k;
            }
        }
    }
    return info_material;
}

export function getJsonVentanas(response) {
    let info_material = response.data.slice();
    for(let i = 0; i < info_material.length; i++){
        info_material[i].index = i;
        for(let j = 0; j < info_material[i].tipos.length ; j++){
            info_material[i].tipos[j].index = j;
            //PARA cuando las ventanas tengan mas propiedades
            /*for (let k = 0; k < info_material[i].tipos[j].propiedad.length; k++) {
                info_material[i].tipos[j].propiedad[k].index = k;
            }*/
        }
    }
    return info_material;
}

export function getJsonMarcos(response){
    let info_marcos = response.data.slice();
    for(let i = 0; i < info_marcos.length; i++){
        info_marcos[i].index = i;
        if(info_marcos[i].hasOwnProperty('tipos')){
            for(let j = 0; j < info_marcos[i].tipos.length ; j++){
                info_marcos[i].tipos[j].index = j;
                //PARA cuando las ventanas tengan mas propiedades
                /*for (let k = 0; k < info_material[i].tipos[j].propiedad.length; k++) {
                    info_material[i].tipos[j].propiedad[k].index = k;
                }*/
            }
        }
    }
    return info_marcos;
}