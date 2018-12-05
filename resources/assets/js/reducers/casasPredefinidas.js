const ventanaPredefinida = {
    dimensiones: {ancho: 0.5,alto: 1},
    material: {
        material: 0,
        tipo: 0,
        //fs: this.info_ventana[0].tipos[0].propiedad.FS,
        /*fsObjetivo: 0.87,
        //u: this.info_ventana[0].tipos[0].propiedad.U,
        uObjetivo: 5.8*/
    }
};

const puertaPredefinida = {
    dimensiones: {ancho: 0.6,alto: 2,},
    material: {
        material: 15,
        tipo: 4,
        propiedad: 0,
        //conductividad: this.info_material[1].propiedades[0].conductividad,
        espesor: 0.1,
    }
};

const capasPredefinidas = [
    {
        material: 10,
        tipo: null,
        propiedad: 0,
        //conductividad: this.info_material[2].propiedades[0].conductividad,
        espesor: 0.1
    },
    {
        material: 15,
        tipo: 0,
        propiedad: 0,
        //conductividad: this.info_material[11].tipos[2].propiedades[0].conductividad,
        espesor: 0.2
    }
];

const paredPredefinidaFrontal = {
    ventanas: [
        Object.assign({posicion: {x: 1, y: 1}},ventanaPredefinida),
        Object.assign({posicion: {x: 3, y: 1}},ventanaPredefinida),
    ],
    separacion: 0,
    capas: Object.assign([],capasPredefinidas),
};

const paredPredefinidaLateral = {
    ventanas: [
        Object.assign({posicion: {x: 1, y: 1}},ventanaPredefinida),
        Object.assign({posicion: {x: 2, y: 1}},ventanaPredefinida),
        Object.assign({posicion: {x: 5, y: 1}},ventanaPredefinida),
        Object.assign({posicion: {x: 6, y: 1}},ventanaPredefinida),
    ],
    puertas: [],

    separacion: 0,
    capas: Object.assign([],capasPredefinidas),
};

const pisoPredeterminado = {
    capas: Object.assign([],capasPredefinidas),
    separacion: 0,
};

const techoPredeterminado = {
    capas: Object.assign([],capasPredefinidas),
    separacion: 0,
};

const predefinidaSimpleState = {
    niveles:[{
        bloques: [{
            posicion: {x:0,z:0},
            dimensiones: {
                alto: 2.5,
                ancho: 5,
                largo: 8,
            },
            paredes: [
                Object.assign(
                    {},
                    paredPredefinidaFrontal,
                    {puertas: [Object.assign({posicion: {x:2,y:0}},puertaPredefinida)]}),
                Object.assign({},paredPredefinidaLateral),
                Object.assign({},paredPredefinidaFrontal),
                Object.assign({},paredPredefinidaLateral),
            ],
            piso: Object.assign({},pisoPredeterminado),
            techo: Object.assign({},techoPredeterminado)
        }]
    }]
};

const predefinidaSimpleDosPisosState = {
    niveles:[{
        bloques: [{
            posicion: {x:0,z:0},
            dimensiones: {
                alto: 2.5,
                ancho: 5,
                largo: 8,
            },
            paredes: [
                Object.assign(
                    {},
                    paredPredefinidaFrontal,
                    {puertas: [Object.assign({posicion: {x:2,y:0}},puertaPredefinida)]}),
                Object.assign({},paredPredefinidaLateral),
                Object.assign({},paredPredefinidaFrontal),
                Object.assign({},paredPredefinidaLateral),
            ],
            piso: Object.assign({},pisoPredeterminado),
            techo: Object.assign({},techoPredeterminado)
        }]
    },{
        bloques: [{
            posicion: {x:0,z:0},
            dimensiones: {
                alto: 2.5,
                ancho: 5,
                largo: 8,
            },
            paredes: [
                Object.assign({},paredPredefinidaFrontal),
                Object.assign({},paredPredefinidaLateral),
                Object.assign({},paredPredefinidaFrontal),
                Object.assign({},paredPredefinidaLateral),
            ],
            piso: Object.assign({},pisoPredeterminado),
            techo: Object.assign({},techoPredeterminado)
        }]
    }]
};

const predefinidaDobleState = {
    niveles:[{
        bloques: [
            {
                posicion: {x:-2.5,z:0},
                dimensiones: {
                    alto: 2.5,
                    ancho: 5,
                    largo: 8,
                },
                paredes: [
                    Object.assign(
                        {},
                        paredPredefinidaFrontal,
                        {puertas: [Object.assign({posicion: {x:2,y:0}},puertaPredefinida)]}),
                    Object.assign({},paredPredefinidaLateral,{separacion: 1}),
                    Object.assign({},paredPredefinidaFrontal),
                    Object.assign({},paredPredefinidaLateral),
                ],
                piso: Object.assign({},pisoPredeterminado),
                techo: Object.assign({},techoPredeterminado)

            },
            {
                posicion: {x:2.5,z:0},
                dimensiones: {
                    alto: 2.5,
                    ancho: 5,
                    largo: 8,
                },
                paredes: [
                    Object.assign(
                        {},
                        paredPredefinidaFrontal,
                        {puertas: [Object.assign({posicion: {x:2,y:0}},puertaPredefinida)]}),
                    Object.assign({},paredPredefinidaLateral),
                    Object.assign({},paredPredefinidaFrontal),
                ],
                piso: Object.assign({},pisoPredeterminado),
                techo: Object.assign({},techoPredeterminado)

            }
        ]
    }]
};

const predefinidaDobleDosPisosState = {
    niveles:[{
        bloques: [
            {
                posicion: {x:-2.5,z:0},
                dimensiones: {
                    alto: 2.5,
                    ancho: 5,
                    largo: 8,
                },
                paredes: [
                    Object.assign(
                        {},
                        paredPredefinidaFrontal,
                        {puertas: [Object.assign({posicion: {x:2,y:0}},puertaPredefinida)]}),
                    Object.assign({},paredPredefinidaLateral,{separacion: 1}),
                    Object.assign({},paredPredefinidaFrontal),
                    Object.assign({},paredPredefinidaLateral),
                ],
                piso: Object.assign({},pisoPredeterminado),
                techo: Object.assign({},techoPredeterminado)

            },
            {
                posicion: {x:2.5,z:0},
                dimensiones: {
                    alto: 2.5,
                    ancho: 5,
                    largo: 8,
                },
                paredes: [
                    Object.assign(
                        {},
                        paredPredefinidaFrontal,
                        {puertas: [Object.assign({posicion: {x:2,y:0}},puertaPredefinida)]}),
                    Object.assign({},paredPredefinidaLateral),
                    Object.assign({},paredPredefinidaFrontal),
                ],
                piso: Object.assign({},pisoPredeterminado),
                techo: Object.assign({},techoPredeterminado)

            }
        ]
    },{
        bloques: [
            {
                posicion: {x:-2.5,z:0},
                dimensiones: {
                    alto: 2.5,
                    ancho: 5,
                    largo: 8,
                },
                paredes: [
                    Object.assign({},paredPredefinidaFrontal),
                    Object.assign({},paredPredefinidaLateral,{separacion: 1}),
                    Object.assign({},paredPredefinidaFrontal),
                    Object.assign({},paredPredefinidaLateral),
                ],
                piso: Object.assign({},pisoPredeterminado),
                techo: Object.assign({},techoPredeterminado)

            },
            {
                posicion: {x:2.5,z:0},
                dimensiones: {
                    alto: 2.5,
                    ancho: 5,
                    largo: 8,
                },
                paredes: [
                    Object.assign({},paredPredefinidaFrontal),
                    Object.assign({},paredPredefinidaLateral),
                    Object.assign({},paredPredefinidaFrontal),
                ],
                piso: Object.assign({},pisoPredeterminado),
                techo: Object.assign({},techoPredeterminado)

            }
        ]
    }]
};

export {
    predefinidaSimpleState,
    predefinidaDobleState,
    predefinidaSimpleDosPisosState,
    predefinidaDobleDosPisosState
};