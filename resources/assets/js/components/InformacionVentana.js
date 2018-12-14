import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import * as Tipos from '../constants/morofologia-types';
import axios from 'axios';
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
    thunk_aplicar_marco_ventanas,
    thunk_aplicar_material_ventanas,
    thunk_modificar_dimensiones_ventana,
    thunk_modificar_marco_ventana,
    thunk_modificar_material_ventana, thunk_modificar_posicion_ventana
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
    }
};

const mapDispatchToProps = dispatch => {
    return {
        thunk_modificar_material_ventana: (nivel, bloque, pared, ventana, material) =>
            dispatch(thunk_modificar_material_ventana(nivel, bloque, pared, ventana, material)),
        thunk_modificar_marco_ventana: (nivel, bloque, pared, ventana, marco) =>
            dispatch(thunk_modificar_marco_ventana(nivel, bloque, pared, ventana, marco)),
        thunk_modificar_dimensiones_ventana: (nivel,bloque,pared,ventana, dimensiones) =>
            dispatch(thunk_modificar_dimensiones_ventana(nivel,bloque,pared,ventana,dimensiones)),
        thunk_modificar_posicion_ventana: (nivel,bloque,pared,ventana, posicion) =>
            dispatch(thunk_modificar_posicion_ventana(nivel,bloque,pared,ventana,posicion)),
        thunk_aplicar_material_ventanas: (nivel,bloque,pared,ventana,indices) =>
            dispatch(thunk_aplicar_material_ventanas(nivel,bloque,pared,ventana,indices)),
        thunk_aplicar_marco_ventanas: (nivel,bloque,pared,ventana,indices) =>
            dispatch(thunk_aplicar_marco_ventanas(nivel,bloque,pared,ventana,indices)),
    }
};
class InformacionVentana extends Component {

    constructor(props) {
        super(props);
        this.state = {/*
            info_material_ventana: {},
            info_material_marco: {},*/
            /*material: 0,
            tipo: 0,
            U: 0,
            FS: 0,
            marco: 0,
            tipo_marco: 0,
            U_marco: 0,
            FM: 0,
            height: 0,
            width: 0,*/

        };
        this.handleClickAplicarMaterial = this.handleClickAplicarMaterial.bind(this);
        this.handleClickAplicarMarco = this.handleClickAplicarMarco.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeDimension = this.handleChangeDimension.bind(this);
        this.handleChangeAlturaPiso = this.handleChangeAlturaPiso.bind(this);
        this.handleClickAgregar = this.handleClickAgregar.bind(this);
        this.handleChangeMarco = this.handleChangeMarco.bind(this);
        this.handleChangeMaterial = this.handleChangeMaterial.bind(this);
    }

    componentDidUpdate(prevProps,prevState,snapShot){
        /*if (this.props.seleccion !== prevProps.seleccion) {
            if (this.props.seleccion !== null  && this.props.seleccion.userData.tipo === Morfologia.tipos.VENTANA) {

                let info_material_ventana = this.props.seleccion.userData.info_material;
                let info_material_marco = this.props.seleccion.userData.info_marco;

                this.setState({
                    info_material_ventana: info_material_ventana,
                    info_material_marco: info_material_marco,
                    /!*height: this.props.seleccion.userData.height,
                    width: this.props.seleccion.userData.width,*!/
                });


            }
        }*/
    }

    /*getJson(response) {
        this.info_material = response.data.slice();
        for(let i = 0; i < this.info_material.length; i++){
            this.info_material[i].index = i;
            for(let j = 0; j < this.info_material[i].tipos.length ; j++){
                this.info_material[i].tipos[j].index = j;
                //PARA cuando las ventanas tengan mas propiedades
                /!*for (let k = 0; k < this.info_material[i].tipos[j].propiedad.length; k++) {
                    this.info_material[i].tipos[j].propiedad[k].index = k;
                }*!/
            }
        }
    }
    getJsonMarcos(response){
        this.info_marcos = response.data.slice();
        for(let i = 0; i < this.info_marcos.length; i++){
            this.info_marcos[i].index = i;
            if(this.info_marcos[i].hasOwnProperty('tipos')){
                for(let j = 0; j < this.info_marcos[i].tipos.length ; j++){
                    this.info_marcos[i].tipos[j].index = j;
                    //PARA cuando las ventanas tengan mas propiedades
                    /!*for (let k = 0; k < this.info_material[i].tipos[j].propiedad.length; k++) {
                        this.info_material[i].tipos[j].propiedad[k].index = k;
                    }*!/
                }
            }
        }
    }*/

    getFilteredRadiation(comuna,tipo,mes){
        axios.get("https://bioclimapp.host/api/radiaciones/"+comuna+"/"+tipo+"/"+mes)
            .then(response => {
                tipo === 2 ? this.difusa = response.data.valor : null;
                tipo === 3 ? this.directa = response.data.valor : null;
            });
    }


    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value,
        });
        //
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

        this.props.thunk_modificar_material_ventana(
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

        this.props.thunk_modificar_marco_ventana(
            indices.nivel,
            indices.bloque,
            indices.pared,
            indices.ventana,
            marcoNuevo
        );

    }

    handleClickAgregar() {
        let FM = this.info_marcos[this.state.marco].hasOwnProperty('tipos') ?
            this.info_marcos[this.state.marco].tipos[this.state.tipo_marco].propiedad.FS :
            this.info_marcos[this.state.marco].propiedades[0].FS;
        let FS = this.info_material[this.state.material].tipos[this.state.tipo].propiedad.FS;
        let Um = this.info_marcos[this.state.marco].hasOwnProperty('tipos') ?
            this.info_marcos[this.state.marco].tipos[this.state.tipo_marco].propiedad.U :
            this.info_marcos[this.state.marco].propiedades[0].U;
        this.props.seleccion.fm = FM;
        this.props.seleccion.fs = FS;
        this.props.um = Um;
        let periodo = this.props.ventanas[0].parent.parent.parent.parent.parent.userData.periodo;
        let aporte_solar = BalanceEnergetico.calcularAporteSolar(periodo,this.props.ventanas,this.difusa,this.directa);
        this.props.onAporteSolarChanged(aporte_solar);
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

        this.props.thunk_modificar_dimensiones_ventana(
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
        this.props.thunk_aplicar_material_ventanas(
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
        this.props.thunk_aplicar_marco_ventanas(
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

        this.props.thunk_modificar_posicion_ventana(
            indices.nivel,
            indices.bloque,
            indices.pared,
            indices.ventana,
            nuevaPosicion
        );
    }



    render() {
        const {classes, seleccionados,info_material_marco,info_material_ventana} = this.props;


        let height, width, alturaPiso, posicion;
        let marco,tipo_marco,u_marco,fm;
        let material,tipo,fs,u;

        const esVentana = seleccionados[0] !== null && seleccionados[0].tipo === Tipos.VENTANA;

        if(esVentana){
            const indices = seleccionados[0].indices;
            const ventana = this.props.morfologia.present
                .niveles[indices.nivel]
                .bloques[indices.bloque]
                .paredes[indices.pared]
                .ventanas[indices.ventana];

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

       /* if(seleccionado !== null && seleccionado.userData.tipo === Morfologia.tipos.VENTANA
            && Object.keys(info_material_ventana).length > 0
            && Object.keys(info_material_marco).length){
            height = seleccionado.userData.height;
            width = seleccionado.userData.width;
            alturaPiso = seleccionado.position.y;

            var {material, tipo, fs, u} = info_material_ventana;

            marco = info_material_marco.material;
            tipo_marco = info_material_marco.tipo;
            u_marco = info_material_marco.u;
            fm = info_material_marco.fs;
        }*/

        //seleccion != null ? console.log("seleccion",seleccion.uuid, seleccion.userData) : seleccion;


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

                        {/*CUADNO SE ARREGLE AGREGARLO
                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography className={classes.heading}>Información Solar</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={8} justify="center" style={{textAlign:"center"}}>
                                    <Grid item xs={12}>
                                        <Typography>
                                            FAR de la ventana: {seleccionado.userData.far.toFixed(3)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        {seleccionado.userData.obstrucciones !== null ? seleccionado.userData.obstrucciones.map((obstruccion,index) => (
                                            obstruccion.ventanas.map(ventana => (
                                                ventana.id === seleccionado.uuid ?
                                                <ExpansionPanel key={index}>
                                                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                                        <Typography className={classes.heading}>Obstruccion: {index}</Typography>
                                                    </ExpansionPanelSummary>
                                                    <ExpansionPanelDetails>
                                                        <Grid container spacing={40}>
                                                            <Grid item xs>
                                                                <Typography>FAR obstruccion: {ventana.far.toFixed(3)}</Typography>
                                                            </Grid>
                                                            <Grid item xs>
                                                                <Typography>Altura respecto a la ventana: {ventana.aDistance.toFixed(3)}</Typography>
                                                            </Grid>
                                                            <Grid item xs>
                                                                <Typography>Distancia respecto a la ventana: {ventana.bDistance.toFixed(3)}</Typography>
                                                            </Grid>
                                                            <Grid item xs>
                                                                <Typography>Ángulo(s) que obstruye:</Typography>
                                                                {ventana.betaAngle != null ? ventana.betaAngle.map((angle,index) => (
                                                                        <Typography key={index}>{angle.toFixed(3)}</Typography>
                                                                    )): <div/>
                                                                }
                                                            </Grid>
                                                        </Grid>
                                                    </ExpansionPanelDetails>
                                                </ExpansionPanel>: <div/>
                                            ))
                                        )) : <div/>}
                                    </Grid>
                                </Grid>

                            </ExpansionPanelDetails>
                        </ExpansionPanel>*/}

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
    seleccion: PropTypes.object,
    onAlturaVentanaChanged: PropTypes.func,
    onDimensionChanged: PropTypes.func,
};

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(InformacionVentana));