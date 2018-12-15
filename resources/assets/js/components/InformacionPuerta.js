import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Morfologia from "./Morfologia";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import * as Tipos from '../constants/morofologia-types';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from '@material-ui/core/FormControl';
import Grid from "@material-ui/core/Grid";
import {
    thunk_aplicar_material_puertas ,
    thunk_modificar_dimensiones_puerta,
    thunk_modificar_material_puerta,
    thunk_modificar_posicion_puerta,
} from "../actions";
import {connect} from "react-redux";
import Button from "@material-ui/core/es/Button";

const ITEM_HEIGHT = 48;

const styles = theme => ({
    titulo: {
        margin: theme.spacing.unit * 2,
    },
    root: {
        width: '100%',
    },
    formControl: {
        width: '100%',
        'box-sizing': 'border-box',
    },
    textField: {
        width: 100,
    },
    textRotation: {
        marginLeft: '75%',
        '-mozTransform': 'rotate(90deg)',
        '-webkitTransform': 'rotate(90deg)',
        '-msTransform': 'rotate(90deg)',
        '-oTransform:': 'rotate(90deg)',
        'transform:': 'rotate(90deg)',
        '-msFilter': 'progid:DXImageTransform.Microsoft.BasicImage(rotation=1)',
        whiteSpace: 'nowrap',
        left: '50%',
        height: 0,
        width: 0,
        '-webkitUserSelect': 'none',
        '-khtmlUserSelect': 'none',
        '-mozUserSelect': 'none',
        '-msUserSelect': 'none',
        '-userSelect': 'none',

    },
    form: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
    paper: {
        height: 250,
        flexDirection: 'column',
        textAlign: 'center',
        overflow: 'hidden',
        elevation: 24
    },
    paperAdd: {
        height: 250,
        overflow: 'hidden',
        elevation: 24
    },

});

const mapStateToProps = state => {
    return {
        morfologia: state.morfologia,
        seleccionados: state.app.seleccion_morfologia,
        info_material: state.app.materiales,
    }
};

//Las acciones se mapean a props.
const mapDispatchToProps = dispatch => {
    return {
        thunk_modificar_material_puerta: (nivel, bloque, pared, puerta, material) =>
            dispatch(thunk_modificar_material_puerta(nivel, bloque, pared, puerta, material)),
        thunk_modificar_dimensiones_puerta: (nivel, bloque, pared, puerta, dimensiones) =>
            dispatch(thunk_modificar_dimensiones_puerta(nivel, bloque, pared, puerta, dimensiones)),
        thunk_modificar_posicion_puerta: (nivel, bloque, pared, puerta, posicion) =>
            dispatch(thunk_modificar_posicion_puerta(nivel, bloque, pared, puerta, posicion)),
        thunk_aplicar_material_puertas: (nivel, bloque, pared, puerta, indices) =>
            dispatch(thunk_aplicar_material_puertas(nivel, bloque, pared, puerta, indices)),
    }
};

class InformacionPuerta extends Component {

    constructor(props) {
        super(props);

        this.state = {
            capa: {},

        };
        this.handleChangeDimension = this.handleChangeDimension.bind(this);
        this.handleChangeMaterial = this.handleChangeMaterial.bind(this);
        this.handleChangePosicion = this.handleChangePosicion.bind(this);
        this.handleClickAplicar = this.handleClickAplicar.bind(this);
    }

    handleChangeMaterial(event) {
        const indices = this.props.seleccionados[0].indices;

        let material = this.props.morfologia.present
            .niveles[indices.nivel]
            .bloques[indices.bloque]
            .paredes[indices.pared]
            .puertas[indices.puerta]
            .material;

        let materialNuevo = {
            material: material.material,
            propiedad: material.propiedad,
            tipo: material.tipo,
            espesor: material.espesor,
        };

        materialNuevo[event.target.name] = event.target.value;

        if(event.target.name === 'material'){
            if(this.props.info_material[event.target.value].hasOwnProperty('tipos')){
                materialNuevo.tipo = 0;
                materialNuevo.propiedad = 0;
            }else{
                materialNuevo.propiedad = 0;
            }
        }
        if(event.target.name === 'espesor'){
            materialNuevo.espesor = event.target.value/1000;
        }

        console.log(materialNuevo,material);

        this.props.thunk_modificar_material_puerta(
            indices.nivel,
            indices.bloque,
            indices.pared,
            indices.puerta,
            materialNuevo
        );
    }

    handleChangePosicion(event){
        const indices = this.props.seleccionados[0].indices;

        let posicion = this.props.morfologia.present
            .niveles[indices.nivel]
            .bloques[indices.bloque]
            .paredes[indices.pared]
            .puertas[indices.puerta]
            .posicion;

        let nuevaPosicion = {
            x: posicion.x,
            y: posicion.y,
        };
        nuevaPosicion[event.target.name] =  parseFloat(event.target.value);

        this.props.thunk_modificar_posicion_puerta(
            indices.nivel,
            indices.bloque,
            indices.pared,
            indices.puerta,
            nuevaPosicion
        );
    }

    handleChangeDimension(event) {
        const indices = this.props.seleccionados[0].indices;

        let dimensiones = this.props.morfologia.present
            .niveles[indices.nivel]
            .bloques[indices.bloque]
            .paredes[indices.pared]
            .puertas[indices.puerta]
            .dimensiones;

        let nuevasDimensiones = {
            ancho: dimensiones.ancho,
            alto: dimensiones.alto,
        };

        if (event.target.name === 'altura') {
            nuevasDimensiones.alto = parseFloat(event.target.value);
        } else {
            nuevasDimensiones.ancho = parseFloat(event.target.value);
        }

        this.props.thunk_modificar_dimensiones_puerta(
            indices.nivel,
            indices.bloque,
            indices.pared,
            indices.puerta,
            nuevasDimensiones
        );
    }

    handleClickAplicar() {
        const indiceSel = this.props.seleccionados[0].indices;
        const seleccionados = this.props.seleccionados;
        let indices = [];
        for(let seleccionado of seleccionados){
            indices.push(seleccionado.indices);
        }
        this.props.thunk_aplicar_material_puertas(
            indiceSel.nivel,
            indiceSel.bloque,
            indiceSel.pared,
            indiceSel.puerta,
            indices)
        ;
    }

    render() {
        const {classes, seleccionados, info_material} = this.props;

        let height, width, posicion,material, tipo, espesor, propiedad, materialPuerta;
        const esPuerta = seleccionados[0] !== null && seleccionados[0].tipo === Tipos.PUERTA;
        if (esPuerta) {
            const indices = this.props.seleccionados[0].indices;
            const puerta = this.props.morfologia.present
                .niveles[indices.nivel]
                .bloques[indices.bloque]
                .paredes[indices.pared]
                .puertas[indices.puerta];
            materialPuerta = puerta.material;

            material = materialPuerta.material;
            tipo = materialPuerta.tipo;
            espesor = materialPuerta.espesor;
            propiedad = materialPuerta.propiedad;

            height = puerta.dimensiones.alto;
            width = puerta.dimensiones.ancho;
            posicion = Math.round(puerta.posicion.x * 10) / 10;

        }
        let hasTipos;

        if (esPuerta) {
            hasTipos = info_material[material].hasOwnProperty('tipos');
        } else {
            hasTipos = null;
        }
        return (
            <div>
                {esPuerta ?
                    <div className={classes.root}>
                        <Typography
                            variant={"title"}
                            align={"center"}
                            className={classes.titulo}
                        >
                            {'Configuración Puerta'}
                        </Typography>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Materiales</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>
                                    <Grid container spacing={8}>
                                        {hasTipos ?
                                            <Grid container spacing={0} style={{
                                                marginBottom: 4,
                                                marginLeft: 4,
                                                marginRight: 4,
                                            }}>
                                                <Grid item xs={6}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="material-simple">Material
                                                            puerta</InputLabel>
                                                        <Select
                                                            value={material}
                                                            onChange={this.handleChangeMaterial}
                                                            input={<Input name="material" id="material-simple"/>}
                                                        >
                                                            {info_material.map(material => (
                                                                <MenuItem value={material.index}>
                                                                    {material.material}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <FormControl className={classes.formControl}>
                                                        <InputLabel htmlFor="tipo-simple">Tipo</InputLabel>
                                                        <Select
                                                            value={tipo}
                                                            onChange={this.handleChangeMaterial}
                                                            input={<Input name="tipo" id="tipo-simple"/>}
                                                        >
                                                            {info_material[material].tipos.map(tipo => (
                                                                <MenuItem value={tipo.index}>
                                                                    {tipo.nombre}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>
                                            : <Grid item xs={12} style={{
                                                marginBottom: 4,
                                                marginLeft: 4,
                                                marginRight: 4,
                                            }}>
                                                <FormControl className={classes.formControl}>
                                                    <InputLabel htmlFor="material-simple">Material</InputLabel>
                                                    <Select
                                                        value={material}
                                                        onChange={this.handleChangeMaterial}
                                                        input={<Input name="material" id="material-simple"/>}
                                                    >
                                                        {info_material.map(material => (
                                                            <MenuItem value={material.index}>
                                                                {material.material}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        }
                                        {hasTipos ?
                                            <Grid item xs={4}>
                                                <FormControl className={classes.formControl}>
                                                    <InputLabel htmlFor="conductividad-simple">Densidad</InputLabel>
                                                    <Select
                                                        value={propiedad}
                                                        onChange={this.handleChangeMaterial}
                                                        input={<Input name="propiedad" id="conductividad-simple"/>}
                                                    >
                                                        {info_material[material].tipos[tipo].propiedades.map(propiedades => (
                                                            <MenuItem value={propiedades.index}>
                                                                {propiedades.densidad !== -1 ? propiedades.densidad
                                                                    : "No tiene"}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid> : <div/>
                                        }

                                        {hasTipos ?
                                            <Grid item xs={4}>
                                                <FormControl className={classes.formControl}>
                                                    <InputLabel
                                                        htmlFor="conductividad-simple">Conductividad</InputLabel>
                                                    <Select
                                                        value={propiedad}
                                                        onChange={this.handleChangeMaterial}
                                                        input={<Input name="propiedad" id="conductividad-simple"/>}
                                                    >
                                                        {info_material[material].tipos[tipo].propiedades.map(propiedades => (
                                                            <MenuItem value={propiedades.index}>
                                                                {propiedades.conductividad}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid> : <div/>
                                        }
                                        {!hasTipos ?
                                            <Grid item xs={4}>
                                                <FormControl className={classes.formControl}>
                                                    <InputLabel htmlFor="conductividad-simple">Densidad</InputLabel>
                                                    <Select
                                                        value={propiedad}
                                                        onChange={this.handleChangeMaterial}
                                                        input={<Input name="propiedad" id="conductividad-simple"/>}
                                                    >
                                                        {info_material[material].propiedades.map(propiedades => (
                                                            <MenuItem value={propiedades.index}>
                                                                {propiedades.densidad !== -1 ? propiedades.densidad
                                                                    : "No tiene"}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid> : <div/>
                                        }

                                        {!hasTipos ?
                                            <Grid item xs={4}>
                                                <FormControl className={classes.formControl}>
                                                    <InputLabel
                                                        htmlFor="conductividad-simple">Conductividad</InputLabel>
                                                    <Select
                                                        value={propiedad}
                                                        onChange={this.handleChangeMaterial}
                                                        input={<Input name="propiedad" id="conductividad-simple"/>}
                                                    >
                                                        {info_material[material].propiedades.map(propiedades => (
                                                            <MenuItem value={propiedades.index}>
                                                                {propiedades.conductividad}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid> : <div/>
                                        }
                                        <Grid item xs={4}>
                                            <FormControl className={classes.formControl}>
                                                <TextField
                                                    label="Espesor (mm)"
                                                    name="espesor"
                                                    value={1000 * espesor}
                                                    onChange={this.handleChangeMaterial}
                                                    type="number"
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                            </FormControl>
                                        </Grid>

                                    </Grid>
                                    {seleccionados.length > 1 ?
                                        <Grid container spacing={8}>
                                            <Grid container spacing={0} style={{
                                                marginTop : 12,
                                                marginBottom : 4,
                                                marginLeft : 4,
                                                marginRight : 4,}}>
                                                <Grid item xs={12}>
                                                    <FormControl className={classes.formControl}>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            className={classes.button}
                                                            onClick={this.handleClickAplicar}>
                                                            IGUALAR MATERIALES DE PUERTAS SELECCIONADAS
                                                        </Button>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        : <div/>
                                    }
                                </Grid>

                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Dimensiones</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>

                                    <Grid item xs={4}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                label="Altura (m)"
                                                name="altura"
                                                value={height}
                                                type="number"
                                                inputProps={
                                                    {step: 0.1}
                                                }
                                                onChange={this.handleChangeDimension}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                label="Ancho (m)"
                                                name="ancho"
                                                value={width}
                                                type="number"
                                                inputProps={
                                                    {step: 0.1}
                                                }
                                                onChange={this.handleChangeDimension}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                label="Posicion en pared (m)"
                                                value={posicion}
                                                type="number"
                                                name="x"
                                                inputProps={
                                                    { step: 0.1}
                                                }
                                                onChange={this.handleChangePosicion}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                    </div>
                    :
                    <div/>
                }
            </div>
        );
    }
}

InformacionPuerta.propTypes = {
    classes: PropTypes.object.isRequired,
    seleccion: PropTypes.object,
    onDimensionChanged: PropTypes.func,
}

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(InformacionPuerta));