const ventanaPredefinida = {
    dimensiones: {ancho: 0.9,alto: 0.6},
    material: {
        material: 0,
        tipo: 0,
        //fs: this.info_ventana[0].tipos[0].propiedad.FS,
        /*fsObjetivo: 0.87,
        //u: this.info_ventana[0].tipos[0].propiedad.U,
        uObjetivo: 5.8*/
    },
    marco: {
        material: 0,
        tipo: 0,
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
        Object.assign({posicion: {x: -1, y: 1}},ventanaPredefinida),
    ],
    puertas: [],
    separacion: 0,
    superficie: 2.5*5,
    orientacion: {x:0,y:0,z:-1},
    posicion: {x:0,y:0,z:8/2},
    dimensiones: {ancho: 5, alto: 2.5},
    capas: Object.assign([],capasPredefinidas),
};

const paredPredefinidaLateral = {
    ventanas: [
        Object.assign({posicion: {x: 1, y: 1}},ventanaPredefinida),
        Object.assign({posicion: {x: 2, y: 1}},ventanaPredefinida),
        Object.assign({posicion: {x: -1, y: 1}},ventanaPredefinida),
        Object.assign({posicion: {x: -2, y: 1}},ventanaPredefinida),
    ],
    puertas: [],
    separacion: 0,
    superficie: 2.5*8,
    orientacion: {x:-1,y:0,z:0},
    posicion: {x:5/2,y:0,z:0},
    dimensiones: {ancho: 8, alto: 2.5},
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
            posicion: {x:0.5,z:0},
            dimensiones: {
                alto: 2.5,
                ancho: 5,
                largo: 8,
            },
            paredes: [
                Object.assign(
                    {},
                    paredPredefinidaFrontal,
                    {puertas: [Object.assign({posicion: {x:0,y:0}},puertaPredefinida)]}),
                Object.assign({},paredPredefinidaLateral),
                Object.assign({},paredPredefinidaFrontal,{
                    orientacion: {x:0,y:0,z:1},
                    posicion: {x:0,y:0,z:-8/2}
                }),
                Object.assign({},paredPredefinidaLateral,{
                    orientacion: {x:1,y:0,z:0},
                    posicion: {x:-5/2,y:0,z:0}
                }),
            ],
            piso: Object.assign({},pisoPredeterminado),
            techo: Object.assign({},techoPredeterminado)
        }],
        altura: 0,
    },{bloques:[],altura: 2.5}]
};

const predefinidaSimpleDosPisosState = {
    niveles:[{
        bloques: [{
            posicion: {x:0.5,z:0},
            dimensiones: {
                alto: 2.5,
                ancho: 5,
                largo: 8,
            },
            paredes: [
                Object.assign(
                    {},
                    paredPredefinidaFrontal,
                    {puertas: [Object.assign({posicion: {x:0,y:0}},puertaPredefinida)]}),
                Object.assign({},paredPredefinidaLateral),
                Object.assign({},paredPredefinidaFrontal,{
                    orientacion: {x:0,y:0,z:1},
                    posicion: {x:0,y:0,z:-8/2}
                }),
                Object.assign({},paredPredefinidaLateral,{
                    orientacion: {x:1,y:0,z:0},
                    posicion: {x:-5/2,y:0,z:0}
                }),
            ],
            piso: Object.assign({},pisoPredeterminado),
        }],
        altura: 0,
    },{
        bloques: [{
            posicion: {x:0.5,z:0},
            dimensiones: {
                alto: 2.5,
                ancho: 5,
                largo: 8,
            },
            paredes: [
                Object.assign({},paredPredefinidaFrontal),
                Object.assign({},paredPredefinidaLateral),
                Object.assign({},paredPredefinidaFrontal,{
                    orientacion: {x:0,y:0,z:1},
                    posicion: {x:0,y:0,z:-8/2}
                }),
                Object.assign({},paredPredefinidaLateral,{
                    orientacion: {x:1,y:0,z:0},
                    posicion: {x:-5/2,y:0,z:0}
                }),
            ],
            piso: Object.assign({},pisoPredeterminado),
            techo: Object.assign({},techoPredeterminado)
        }],
        altura: 2.5,
    },{bloques:[],altura: 5}]
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
                        {puertas: [Object.assign({posicion: {x:0,y:0}},puertaPredefinida)]}),
                    Object.assign({},paredPredefinidaLateral,{separacion: 1,ventanas: []}),
                    Object.assign({},paredPredefinidaFrontal,{
                        orientacion: {x:0,y:0,z:1},
                        posicion: {x:0,y:0,z:-8/2}
                    }),
                    Object.assign({},paredPredefinidaLateral,{
                        orientacion: {x:1,y:0,z:0},
                        posicion: {x:-5/2,y:0,z:0}
                    }),
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
                        {puertas: [Object.assign({posicion: {x:0,y:0}},puertaPredefinida)]}),
                    Object.assign({},paredPredefinidaLateral),
                    Object.assign({},paredPredefinidaFrontal,{
                        orientacion: {x:0,y:0,z:1},
                        posicion: {x:0,y:0,z:-8/2}
                    }),
                ],
                piso: Object.assign({},pisoPredeterminado),
                techo: Object.assign({},techoPredeterminado)

            }
        ],
        altura: 0,
    },{bloques:[],altura: 2.5}]
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
                        {puertas: [Object.assign({posicion: {x:0,y:0}},puertaPredefinida)]}),
                    Object.assign({},paredPredefinidaLateral,{separacion: 1,ventanas: []}),
                    Object.assign({},paredPredefinidaFrontal,{
                        orientacion: {x:0,y:0,z:1},
                        posicion: {x:0,y:0,z:-8/2}
                    }),
                    Object.assign({},paredPredefinidaLateral,{
                        orientacion: {x:1,y:0,z:0},
                        posicion: {x:-5/2,y:0,z:0}
                    }),
                ],
                piso: Object.assign({},pisoPredeterminado),

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
                        {puertas: [Object.assign({posicion: {x:0,y:0}},puertaPredefinida)]}),
                    Object.assign({},paredPredefinidaLateral),
                    Object.assign({},paredPredefinidaFrontal,{
                        orientacion: {x:0,y:0,z:1},
                        posicion: {x:0,y:0,z:-8/2}
                    }),
                ],
                piso: Object.assign({},pisoPredeterminado),

            }
        ],
        altura: 0,
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
                    Object.assign({},paredPredefinidaLateral,{separacion: 1,ventanas: []}),
                    Object.assign({},paredPredefinidaFrontal,{
                        orientacion: {x:0,y:0,z:1},
                        posicion: {x:0,y:0,z:-8/2}
                    }),
                    Object.assign({},paredPredefinidaLateral,{
                        orientacion: {x:1,y:0,z:0},
                        posicion: {x:-5/2,y:0,z:0}
                    }),
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
                    Object.assign({},paredPredefinidaFrontal,{
                        orientacion: {x:0,y:0,z:1},
                        posicion: {x:0,y:0,z:-8/2}
                    }),
                ],
                piso: Object.assign({},pisoPredeterminado),
                techo: Object.assign({},techoPredeterminado)

            }
        ],
        altura: 2.5,
    },{bloques:[],altura: 5}]
};

export {
    predefinidaSimpleState,
    predefinidaDobleState,
    predefinidaSimpleDosPisosState,
    predefinidaDobleDosPisosState
};