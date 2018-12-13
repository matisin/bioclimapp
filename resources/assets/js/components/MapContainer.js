import React, {Component} from 'react';
import {Map, TileLayer, Marker, Popup} from 'react-leaflet';
import SearchBar from './SearchBar';

var SunCalc = require('suncalc');
import axios from 'axios'
import { connect } from "react-redux";
import {thunk_set_state_mapa} from "../actions";


const mapStateToProps = state => {
    return {
        lat: state.variables.mapa.lat,
        lng: state.variables.mapa.lng,
        comuna: state.variables.mapa.comuna,
        sunPosition: state.variables.mapa.sunPosition,
        sunPath: state.variables.mapa.sunPath,

    }
};

const mapDispatchToProps = dispatch => {
    return {
        thunk_set_state_mapa : (lat,lng) => dispatch(thunk_set_state_mapa(lat,lng)),
    }
};
class MapContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            zoom: this.props.zoom,
            markers: this.props.markers,
        };
        this.mapClicked = this.mapClicked.bind(this);
        this.getSunPosition = this.getSunPosition.bind(this);
    }

    componentDidUpdate(prevProps){
        if(this.props.fecha != prevProps.fecha){
            this.setState((state) => ({sunPosition: this.getSunPosition(state.lat,state.lng,this.props.fecha)}), () => {this.props.onComunaChanged(this.state)});
        }
        if(this.props.comuna !== prevProps.comuna && this.props.comuna != null){
            this.createMarker(this.props.lat,this.props.lng);
        }
    }

    componentWillMount(){
        let comuna, sunPosition, sunPath;
        this.props.thunk_set_state_mapa(this.props.lat,this.props.lng);

    }


    getSunPosition(lat, lng, date = new Date()) {
        let sun = SunCalc.getPosition(/*Date*/ date, /*Number*/ lat, /*Number*/ lng);
        let altitude = sun.altitude * 180 / Math.PI;
        let azimuth = sun.azimuth * 180 / Math.PI;
        return {
            altitude: altitude,
            azimuth: azimuth
        }
    }

    createMarker(lat, lng) {
        let markers = [];
        markers.push([lat, lng]);
        this.setState({
            markers: markers
        });
    }

    mapClicked(e) {
        this.props.thunk_set_state_mapa(e.latlng.lat,e.latlng.lng);

        /*this.props.setLoading(false);
        axios.get("https://bioclimapp.host/api/comuna/" + e.latlng.lat + "/" + e.latlng.lng)
            .then(response => {
                    if(response.data.length > 0) {
                        this.createMarker(e.latlng.lat, e.latlng.lng);
                        this.setState({
                            lat: e.latlng.lat,
                            lng: e.latlng.lng,
                            comuna: response.data[0],
                            sunPosition: this.getSunPosition(e.latlng.lat, e.latlng.lng),
                            sunPath: this.getSunPath(e.latlng.lat, e.latlng.lng),
                        }, function () {
                            this.props.onComunaChanged(this.state);
                        });
                    }
                    else{
                        this.props.setLoading(true);
                        alert("No se encuentra comuna en la base de datos");
                    }
                }
            );*/

    }


    render() {
        const position = [this.props.lat, this.props.lng];
        const style = {
            width: '100%',
            height: '35vh'
        };
        return (
            <div>
                <Map
                    center={position}
                    zoom={this.state.zoom}
                    style={style}
                    onDblclick={this.mapClicked}
                    doubleClickZoom={false}
                >
                    <TileLayer
                        attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {this.state.markers.map((position) =>
                            <Marker key={position} position={position}>
                                <Popup>
                                    <span>
                                      {this.props.comuna ? this.props.comuna.nombre : ""}
                                    </span>
                                </Popup>
                            </Marker>
                    )}
                    <SearchBar
                    />
                </Map>


            </div>
        )
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(MapContainer);
