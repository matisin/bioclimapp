import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import * as Tipos from '../constants/morofologia-types';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from '@material-ui/core/FormControl'
import Grid from "@material-ui/core/Grid";
import * as BalanceEnergetico from '../Utils/BalanceEnergetico';
import TextField from "@material-ui/core/TextField/TextField";
import CalendarToday from "@material-ui/icons/CalendarToday";
import {connect} from "react-redux";
import {
    middleware_aplicar_marco_ventanas,
    middleware_aplicar_material_ventanas,
    middleware_modificar_dimensiones_ventana,
    middleware_modificar_marco_ventana,
    middleware_modificar_material_ventana, middleware_modificar_posicion_ventana
} from "../actions";
import Button from "@material-ui/core/es/Button";

const ITEM_HEIGHT = 48;

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    root: {
        width: '100%',
    },
    titulo:{
        margin: theme.spacing.unit*2,
    },
    formControl: {
        width: '100%',
        'box-sizing': 'border-box',
    },
    textField: {
        width: 100,
    },
    form: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },

});

const mapStateToProps = state => {
    return{
        morfologia: state.morfologia,
        seleccionados: state.app.seleccion_morfologia,
        info_material_ventana: state.app.materiales_ventanas,
        info_material_marco: state.app.materiales_marcos,
        farVentanas: state.balance.farVentanas,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        middleware_modificar_material_ventana: (nivel, bloque, pared, ventana, material) =>
            dispatch(middleware_modificar_material_ventana(nivel, bloque, pared, ventana, material)),
        middleware_modificar_marco_ventana: (nivel, bloque, pared, ventana, marco) =>
            dispatch(middleware_modificar_marco_ventana(nivel, bloque, pared, ventana, marco)),
        middleware_modificar_dimensiones_ventana: (nivel,bloque,pared,ventana, dimensiones) =>
            dispatch(middleware_modificar_dimensiones_ventana(nivel,bloque,pared,ventana,dimensiones)),
        middleware_modificar_posicion_ventana: (nivel,bloque,pared,ventana, posicion) =>
            dispatch(middleware_modificar_posicion_ventana(nivel,bloque,pared,ventana,posicion)),
        middleware_aplicar_material_ventanas: (nivel,bloque,pared,ventana,indices) =>
            dispatch(middleware_aplicar_material_ventanas(nivel,bloque,pared,ventana,indices)),
        middleware_aplicar_marco_ventanas: (nivel,bloque,pared,ventana,indices) =>
            dispatch(middleware_aplicar_marco_ventanas(nivel,bloque,pared,ventana,indices)),
    }
};
class InformacionVentana extends Component {

    constructor(props) {
        super(props);
        this.handleClickAplicarMaterial = this.handleClickAplicarMaterial.bind(this);
        this.handleClickAplicarMarco = this.handleClickAplicarMarco.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeDimension = this.handleChangeDimension.bind(this);
        this.handleChangeAlturaPiso = this.handleChangeAlturaPiso.bind(this);
        this.handleChangeMarco = this.handleChangeMarco.bind(this);
        this.handleChangeMaterial = this.handleChangeMaterial.bind(this);
    }


    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value,
        });
    }

    handleChangeMaterial(event){
        const indices = this.props.seleccionados[0].indices;

        let material = this.props.morfologia.present
            .niveles[indices.nivel]
            .bloques[indices.bloque]
            .paredes[indices.pared]
            .ventanas[indices.ventana]
            .material;

        let materialNuevo = {
            material: material.material,
            tipo: material.tipo,
        };

        materialNuevo[event.target.name] = event.target.value;

        if(event.target.name === 'material'){
            materialNuevo.tipo = 0;
        }

        this.props.middleware_modificar_material_ventana(
            indices.nivel,
            indices.bloque,
            indices.pared,
            indices.ventana,
            materialNuevo
        );
    }

    handleChangeMarco(event){
        const indices = this.props.seleccionados[0].indices;

        let marco = this.props.morfologia.present
            .niveles[indices.nivel]
            .bloques[indices.bloque]
            .paredes[indices.pared]
            .ventanas[indices.ventana]
            .marco;

        let marcoNuevo = {
            material: marco.material,
            tipo: marco.tipo,
        };

        marcoNuevo[event.target.name] = event.target.value;

        if(event.target.name === 'material'){
            marcoNuevo.tipo = 0;
        }

        this.props.middleware_modificar_marco_ventana(
            indices.nivel,
            indices.bloque,
            indices.pared,
            indices.ventana,
            marcoNuevo
        );

    }
    handleChangeDimension(event) {
        const indices = this.props.seleccionados[0].indices;

        let dimensiones = this.props.morfologia.present
            .niveles[indices.nivel]
            .bloques[indices.bloque]
            .paredes[indices.pared]
            .ventanas[indices.ventana]
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

        this.props.middleware_modificar_dimensiones_ventana(
            indices.nivel,
            indices.bloque,
            indices.pared,
            indices.ventana,
            nuevasDimensiones
        );
    }

    handleClickAplicarMaterial() {
        const indiceSel = this.props.seleccionados[0].indices;
        const seleccionados = this.props.seleccionados;
        let indices = [];
        for(let seleccionado of seleccionados){
            indices.push(seleccionado.indices);
        }
        this.props.middleware_aplicar_material_ventanas(
            indiceSel.nivel,
            indiceSel.bloque,
            indiceSel.pared,
            indiceSel.ventana,
            indices)
        ;
    }

    handleClickAplicarMarco() {
        const indiceSel = this.props.seleccionados[0].indices;
        const seleccionados = this.props.seleccionados;
        let indices = [];
        for(let seleccionado of seleccionados){
            indices.push(seleccionado.indices);
        }
        this.props.middleware_aplicar_marco_ventanas(
            indiceSel.nivel,
            indiceSel.bloque,
            indiceSel.pared,
            indiceSel.ventana,
            indices)
        ;

    }

    handleChangeAlturaPiso(event){
        const indices = this.props.seleccionados[0].indices;

        let posicion = this.props.morfologia.present
            .niveles[indices.nivel]
            .bloques[indices.bloque]
            .paredes[indices.pared]
            .ventanas[indices.ventana]
            .posicion;

        let nuevaPosicion = {
            x: posicion.x,
            y: posicion.y,
        };
        nuevaPosicion[event.target.name] =  parseFloat(event.target.value);

        this.props.middleware_modificar_posicion_ventana(
            indices.nivel,
            indices.bloque,
            indices.pared,
            indices.ventana,
            nuevaPosicion
        );
    }



    render() {
        const {classes, seleccionados,info_material_marco,info_material_ventana, farVentanas} = this.props;


        let height, width, alturaPiso, posicion;
        let marco,tipo_marco,u_marco,fm;
        let material,tipo,fs,u;

        const esVentana = seleccionados[0] !== null && seleccionados[0].tipo === Tipos.VENTANA;
        let id = null;
        if(esVentana){
            const indices = seleccionados[0].indices;
            const ventana = this.props.morfologia.present
                .niveles[indices.nivel]
                .bloques[indices.bloque]
                .paredes[indices.pared]
                .ventanas[indices.ventana];

            id = ventana.id;

            height = ventana.dimensiones.alto;
            width = ventana.dimensiones.ancho;
            alturaPiso = Math.round(ventana.posicion.y*10)/10;
            posicion = Math.round(ventana.posicion.x*10)/10;

            material = ventana.material.material;
            tipo = ventana.material.tipo;
            fs = info_material_ventana[material].tipos[tipo].propiedad.FS;
            u = info_material_ventana[material].tipos[tipo].propiedad.U;



            marco = ventana.marco.material;
            tipo_marco = ventana.marco.tipo;

            if(!info_material_marco[marco].hasOwnProperty('tipos')){
                u_marco = info_material_marco[marco].propiedades[0].U;
                fm = info_material_marco[marco].propiedades[0].FS;
            }else{
                u_marco = info_material_marco[marco].tipos[tipo_marco].propiedad.U;
                fm = info_material_marco[marco].tipos[tipo_marco].propiedad.FS;
            }

        }

        return (
            <div>
                {esVentana ?
                    <div className={classes.root}>
                        <Typography
                            variant={"title"}
                            align={"center"}
                            className={classes.titulo}
                        >
                            {'Configuración Ventana' }
                        </Typography>

                         <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Información Solar</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8} justify="center" style={{textAlign:"center"}}>
                                    <Grid item xs={12}>
                                        <Typography variant="body1">
                                            FAR de la ventana: {Object.keys(farVentanas).length > 0 ?
                                            farVentanas[id].far.toFixed(3) : 1.000}

                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        {Object.keys(farVentanas).length > 0 ? Object.values(farVentanas[id].obstrucciones).map((obstruccion,index) => (
                                                <ExpansionPanel key={index}>
                                                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                                        <Typography className={classes.heading}>Obstruccion: {index}</Typography>
                                                    </ExpansionPanelSummary>
                                                    <ExpansionPanelDetails>
                                                        <Grid container spacing={40}>
                                                            <Grid item xs>
                                                                <Typography>FAR obstruccion: {obstruccion.far.toFixed(3)}</Typography>
                                                            </Grid>
                                                            <Grid item xs>
                                                                <Typography>Altura respecto a la ventana: {obstruccion.aDistance.toFixed(1)}m</Typography>
                                                            </Grid>
                                                            <Grid item xs>
                                                                <Typography>Distancia respecto a la ventana: {obstruccion.bDistance.toFixed(1)}m</Typography>
                                                            </Grid>
                                                            <Grid item xs>
                                                                <Typography>Ángulo que obstruye: {obstruccion.beta.toFixed(1)}°</Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </ExpansionPanelDetails>
                                                </ExpansionPanel>

                                        )) : <div/>}
                                    </Grid>
                                </Grid>

                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Material ventana</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>
                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <InputLabel htmlFor="material-ventana">Nombre material</InputLabel>
                                            <Select
                                                value={material}
                                                onChange={this.handleChangeMaterial}
                                                input={<Input name="material" id="material-ventana"/>}
                                            >
                                                {info_material_ventana.map( (material,index) => (
                                                    <MenuItem value={material.index} key={index}>
                                                        {material.material}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <InputLabel htmlFor="tipo-ventana">Tipo</InputLabel>
                                            <Select
                                                value={tipo}
                                                onChange={this.handleChangeMaterial}
                                                input={<Input name="tipo" id="tipo-ventana"/>}
                                            >
                                                {info_material_ventana[material].tipos.map((tipo,index) => (
                                                    <MenuItem value={tipo.index} key={index}>
                                                        {tipo.nombre}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                disabled
                                                label={"Transmitancia Térmica"}
                                                value={u}
                                            />
                                            {/*<InputLabel htmlFor="U-ventana">Transmitancia térmica</InputLabel>
                                            <Select
                                                value={u}
                                                onChange={this.handleChangeMaterial}
                                                input={<Input name="u" id="U-ventana"/>}
                                            >
                                                <MenuItem value={0}>
                                                    {this.info_material[material].tipos[tipo].propiedad.U}
                                                </MenuItem>
                                            </Select>*/}
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                disabled
                                                label={"Factor Solar"}
                                                value={fs}
                                            />
                                            {/*<InputLabel htmlFor="FS-ventana">Factor solar</InputLabel>
                                            <Select
                                                value={fs}
                                                onChange={this.handleChangeMaterial}
                                                input={<Input name="fs" id="FS-ventana"/>}
                                            >
                                                <MenuItem value={0}>
                                                    {this.info_material[material].tipos[tipo].propiedad.FS}
                                                </MenuItem>
                                            </Select>*/}
                                        </FormControl>
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
                                                            onClick={this.handleClickAplicarMaterial}>
                                                            IGUALAR MATERIALES DE VENTANAS SELECCIONADAS
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
                                <Typography className={classes.heading}>Material Marco</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                {info_material_marco[marco].hasOwnProperty('tipos') ?
                                    <Grid container spacing={8}>
                                        <Grid item xs={6}>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel htmlFor="material-marco">Nombre material</InputLabel>
                                                <Select
                                                    value={marco}
                                                    onChange={this.handleChangeMarco}
                                                    input={<Input name="material" id="material-marco"/>}
                                                >
                                                    {info_material_marco.map((marco, index) => (
                                                        <MenuItem value={marco.index} key={index}>
                                                            {marco.material}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel htmlFor="tipo-marco">Tipo de material</InputLabel>
                                                <Select
                                                    value={tipo_marco}
                                                    onChange={this.handleChangeMarco}
                                                    input={<Input name="tipo" id="tipo-marco"/>}
                                                >
                                                    {info_material_marco[marco].tipos.map((tipo, index) => (
                                                        <MenuItem value={tipo.index} key={index}>
                                                            {tipo.nombre}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl className={classes.formControl}>
                                                <TextField
                                                    disabled
                                                    label={"Transmitancia Térmica"}
                                                    value={u_marco}
                                                />
                                                {/*<InputLabel htmlFor="U-marco">Transmitancia térmica</InputLabel>
                                                <Select
                                                    value={u_marco}
                                                    onChange={this.handleChangeMarco}
                                                    input={<Input name="u" id="U-marco"/>}
                                                >
                                                    <MenuItem value={0}>
                                                        {this.info_marcos[marco].tipos[tipo_marco].propiedad.U}
                                                    </MenuItem>
                                                </Select>*/}
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl className={classes.formControl}>

                                                <TextField
                                                    disabled
                                                    label={"Factor Solar"}
                                                    value={fm}
                                                />

                                                {/*<InputLabel htmlFor="FM-marco">Factor solar</InputLabel>
                                                <Select
                                                    value={fm}
                                                    onChange={this.handleChangeMarco}
                                                    input={<Input name="fm" id="FM-marco"/>}
                                                >
                                                    <MenuItem value={0}>
                                                        {this.info_marcos[marco].tipos[tipo_marco].propiedad.FS}
                                                    </MenuItem>
                                                </Select>*/}
                                            </FormControl>
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
                                                                onClick={this.handleClickAplicarMarco}>
                                                                IGUALAR MARCOS DE VENTANAS SELECCIONADAS
                                                            </Button>
                                                        </FormControl>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            : <div/>
                                        }
                                    </Grid>
                                    :
                                    <Grid container spacing={8}>
                                        <Grid item xs={12}>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel htmlFor="material-marco">Nombre material</InputLabel>
                                                <Select
                                                    value={marco}
                                                    onChange={this.handleChangeMarco}
                                                    input={<Input name="material" id="material-marco"/>}
                                                >
                                                    {info_material_marco.map((marco,index) => (
                                                        <MenuItem value={marco.index} key={index}>
                                                            {marco.material}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl className={classes.formControl}>
                                                <TextField
                                                    disabled
                                                    label={"Transmitancia Térmica"}
                                                    value={u_marco}
                                                />
                                                {/*<InputLabel htmlFor="U-marco">Transmitancia térmica</InputLabel>
                                                <Select
                                                    value={U_marco}
                                                    onChange={this.handleChangeMarco}
                                                    input={<Input name="u" id="U-marco"/>}
                                                >
                                                    {this.info_marcos[marco].propiedades.map(propiedad => (
                                                        <MenuItem value={0}>
                                                            {propiedad.U}
                                                        </MenuItem>
                                                    ))}
                                                </Select>*/}
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl className={classes.formControl}>
                                                <TextField
                                                    disabled
                                                    label={"Factor solar"}
                                                    value={fm}
                                                />
                                                {/*<InputLabel htmlFor="FM-marco">Factor solar</InputLabel>
                                                <Select
                                                    value={FM}
                                                    onChange={this.handleChangeMarco}
                                                    input={<Input name="fm" id="FM-marco"/>}
                                                >
                                                    {this.info_marcos[marco].propiedades.map(propiedad => (
                                                        <MenuItem value={0}>
                                                            {propiedad.FS}
                                                        </MenuItem>
                                                    ))}
                                                </Select>*/}
                                            </FormControl>
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
                                                                onClick={this.handleClickAplicarMarco}>
                                                                IGUALAR MARCOS DE VENTANAS SELECCIONADAS
                                                            </Button>
                                                        </FormControl>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            : <div/>
                                        }
                                    </Grid>
                                }
                            </ExpansionPanelDetails>
                        </ExpansionPanel>


                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Configuración dimensiones</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8}>

                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                label="Altura (m)"
                                                name="altura"
                                                value={height}
                                                type="number"
                                                inputProps={
                                                    { step: 0.01}
                                                }
                                                onChange={this.handleChangeDimension}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                label="Ancho (m)"
                                                name="ancho"
                                                value={width}
                                                type="number"
                                                inputProps={
                                                    { step: 0.01}
                                                }
                                                onChange={this.handleChangeDimension}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                label="Altura al Piso (m)"
                                                value={alturaPiso}
                                                name="y"
                                                type="number"
                                                inputProps={
                                                    { step: 0.1}
                                                }
                                                onChange={this.handleChangeAlturaPiso}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl className={classes.formControl}>
                                            <TextField
                                                label="Posicion en pared (m)"
                                                value={posicion}
                                                type="number"
                                                name="x"
                                                inputProps={
                                                    { step: 0.1}
                                                }
                                                onChange={this.handleChangeAlturaPiso}
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

InformacionVentana.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(InformacionVentana));