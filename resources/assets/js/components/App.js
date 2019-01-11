import React, {Component} from 'react';
import { connect } from "react-redux";
import Sound from 'react-sound';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import SwipeableViews from 'react-swipeable-views';
import Context from './Context';
import BarraHerramientasMorfologia from './BarraHerramientasMorfologia';
import BarraHerramientasContexto from './BarraHerramientasContexto';
import Paper from '@material-ui/core/Paper';
import Drawer from "@material-ui/core/Drawer";
import InformacionEstructura from './InformacionEstructura'
import DetalleBalance from "./DetalleBalance";
import GeoInfoPanel from "./GeoInfoPanel";
import MapContainer from "./MapContainer";
import IconButton from '@material-ui/core/IconButton';
import PieChart from '@material-ui/icons/PieChart';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import Toolbar from "@material-ui/core/Toolbar/Toolbar";
import InfoVariablesInternas from "./InfoVariablesInternas";
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import MorfologiaRedux from "./MorfologiaRedux";
import { middleware_set_materiales,
} from "../actions";

function TabContainer(props) {
    return (
        <Typography component="div" style={{padding: 0}}>
            {props.children}
        </Typography>
    );
}

const drawerWidth = 500;
const drawerRightWidth = 400;
const heightBar = 80;
const heightBarra = 70;

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};
const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    appBar: {
        height: heightBar+'px',
        position: 'absolute',
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    appBarShiftLeft: {
        marginLeft: drawerWidth,
    },
    appBarShiftRight: {
        marginRight: drawerWidth,
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 20,
    },
    drawerPaper: {
        position: 'relative',
        height: '100vh',
        width: drawerWidth,
    },
    drawerRightPaper:{
        display: 'flex',
        overflow: 'auto',
        position: 'relative',
        height: 0,
        minHeight: `calc(100% - ${heightBarra}px)`,
        width: drawerRightWidth,
    },
    contentBarra: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    content: {
        overflow: 'hidden',
        backgroundColor: theme.palette.background.default,
        height: `calc(100% - ${heightBar}px)`,
        marginTop: heightBar,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    contentInside: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    contentLeft: {
        marginLeft: -drawerWidth,
    },
    contentRight: {
        marginRight: -drawerRightWidth,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    contentShiftLeft: {
        marginLeft: 0,
    },
    contentShiftRight: {
        marginRight: 0,
    },
    appFrame: {
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100vh'
    },
    frameTabs: {
        zIndex: 1,
        display: 'flex',
        width: '100%',
    },
    hide: {
        display: 'none',
    },
    paper: {
        height: heightBarra,
        textAlign: 'center',
        color: theme.palette.text.secondary,
        background: '#fdfdfd',
    },
    visible: {
        display: 'visible',
    },
    hidden: {
        display: 'none',
    },
    grow: {
        flexGrow: 1,
    },
    progress: {
        marginRight: 'auto',
        marginLeft: 'auto',
        display: 'block',
        width: '100%'
    }
});

const mapStateToProps = state => {
    return {
        mostrar_mapa: state.barra_herramientas_contexto.mostrar_mapa,
        cargando: state.app.cargando,
        calculando: state.app.calculando,
        seleccion_morfologia: state.app.seleccion_morfologia,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        middleware_set_materiales: () => dispatch(middleware_set_materiales()),
    }
};

function AlertDialog(props){
    const {classes, open, text} = props;

    return (
        <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            maxWidth="xs"
            aria-labelledby="confirmation-dialog-title"
            open={open}
        >
            <DialogTitle id="confirmation-dialog-title">{text}</DialogTitle>
            <DialogContent>
                <CircularProgress className={classes.progress} size={50} />
            </DialogContent>
        </Dialog>
    );
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 0,
            openDashboard: false,
        };
        this.props.middleware_set_materiales();
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeIndex = this.handleChangeIndex.bind(this);
        this.handleDashboardOpen = this.handleDashboardOpen.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.onRef = this.onRef.bind(this);

    }

    handleDashboardOpen(){
        if(this.state.openDashboard){
            let width = this.state.width;
            this.setState({width: width + drawerWidth });
        }
        else {
            let width = this.state.width;
            this.setState({width: width - drawerWidth });
        }
        this.setState({openDashboard: !this.state.openDashboard});
    }

    componentDidMount() {
        this.setState({
            height: this.tab.clientHeight,
            width: this.tab.clientWidth,
        });

        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    handleChange(event, value) {
        this.setState({
            value
        })
    }

    handleChangeIndex(index) {
        this.setState({value: index});
    };

    onDrawingChanged(drawing) {
        this.setState({dibujo: drawing})
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    onRef(ref){
        this.contexto = ref;
    }



    render() {
        const {classes, theme, mostrar_mapa, cargando, calculando ,seleccion_morfologia} = this.props;
        let showAlert = Object.keys(cargando).length > 0;
        let showCalculando = Object.keys(calculando).length > 0;
        const mostrar_seleccion = seleccion_morfologia[0] !== null;
        const {value, width, height} = this.state;
        return (

            <div className={classes.appFrame} ref={(tab) => {
                this.tab = tab
            }} style={{margin:0, padding:0}}>
                <Sound
                    url="https://bioclimapp.host/music/jazz.mp3"
                    playStatus={Sound.status.PLAYING}
                    loop={true}
                />
                <AlertDialog
                            open={showAlert}
                            classes={{
                                 paper: classes.paper,
                                 progress : classes.progress,
                             }}
                            text={"Cargando"}
                />
                <AlertDialog
                    open={showCalculando}
                    classes={{
                        paper: classes.paper,
                        progress : classes.progress,
                    }}
                    text={"Calculando"}
                />
                <AppBar  className={classNames(classes.appBar, {
                    [classes.appBarShift]: this.state.openDashboard ,
                    [classes.appBarShiftLeft]: this.state.openDashboard,
                })}

                >
                    <Toolbar className={classes.toolbar}>
                        <IconButton
                            color="inherit"
                            aria-label="Dashboard"
                            onClick={this.handleDashboardOpen}
                            className={classNames(classes.menuButton)}
                        >

                            {this.state.openDashboard ?
                                <KeyboardArrowLeft/> : <KeyboardArrowRight/>
                            }
                            <PieChart />

                        </IconButton>
                        <Tabs value={value} onChange={this.handleChange}  centered>
                            <Tab label="Morfología"/>
                            <Tab label="Emplazamiento"/>
                            <Tab label="Variables Internas"/>
                        </Tabs>
                        <div style={{
                            marginLeft: 'auto',}}>
                            <Typography variant="button" color="inherit"  >
                                Proyecto FIPI,
                            </Typography>
                            <Typography style={{
                                fontSize: 'x-small',}}align={'center'} variant="button" color="inherit"  >
                                Facultad de Ingeniería - UdeC
                            </Typography>

                        </div>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="persistent"
                    anchor={'left'}
                    open={this.state.openDashboard}
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                >
                    <DetalleBalance
                    />
                </Drawer>
                <SwipeableViews
                    axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                    index={this.state.value}
                    onChangeIndex={this.handleChangeIndex}
                    className={classNames(classes.content, classes.contentLeft, {
                        [classes.contentShift]: this.state.openDashboard,
                        [classes.contentShiftLeft]: this.state.openDashboard,
                    })}
                >
                    <div className={classes.frameTabs}>
                        <div className={classNames(classes.contentInside, classes.contentRight, {
                            [classes.contentShift]: !mostrar_seleccion,
                            [classes.contentShiftRight]: !mostrar_seleccion,
                        })}>
                            <TabContainer dir={theme.direction}>
                                {this.state.width ?
                                    <div>
                                        <MorfologiaRedux
                                            width={width}
                                            height={height - (heightBar+heightBarra)}
                                        />
                                    </div>
                                    :
                                    <div/>
                                }
                                <Paper className={classes.paper} >
                                    <BarraHerramientasMorfologia
                                        width={this.state.width}
                                    />
                                </Paper>
                            </TabContainer>
                        </div>
                        <Drawer
                            variant='persistent'
                            anchor='right'
                            open={mostrar_seleccion}

                            style={{visibility: mostrar_seleccion ? 'visible' : 'hidden'}}
                            classes={{
                                paper: classes.drawerRightPaper,
                            }}
                        >
                            <InformacionEstructura
                            />
                        </Drawer>
                    </div>
                    <div className={classes.frameTabs}>
                        <div className={classNames(classes.contentInside, classes.contentRight, {
                            [classes.contentShift]: !mostrar_mapa ,
                            [classes.contentShiftRight]: !mostrar_mapa ,

                        })}>
                            <TabContainer dir={theme.direction}>
                                {this.state.width ?
                                    <Context
                                        width={this.state.width}
                                        height={height - (heightBar+heightBarra)}
                                        onRef={this.onRef}
                                    /> :
                                    <div/>
                                }
                                <Paper className={classes.paper}>
                                    <BarraHerramientasContexto
                                        width={this.state.width}
                                    />
                                </Paper>
                            </TabContainer>
                        </div>
                        <Drawer
                            variant="persistent"
                            anchor={'right'}
                            open={mostrar_mapa}
                            style={{visibility: mostrar_mapa ? 'visible' : 'hidden'}}

                            classes={{
                                paper: classes.drawerRightPaper,
                            }}
                        >
                            <MapContainer
                                zoom={12}
                                markers={[]}
                            />
                            <GeoInfoPanel
                            />
                        </Drawer>
                    </div>


                    <TabContainer  dir={theme.direction}>
                        <InfoVariablesInternas
                        />
                    </TabContainer>
                </SwipeableViews>

            </div>
        );
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles, {withTheme: true})(App));