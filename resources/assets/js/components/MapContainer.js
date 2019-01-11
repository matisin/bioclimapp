import React, {Component} from 'react';
import {Map, TileLayer, Marker, Popup} from 'react-leaflet';
import SearchBar from './SearchBar';

import { connect } from "react-redux";
import {middleware_set_state_mapa} from "../actions";


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
        middleware_set_state_mapa : (lat,lng) => dispatch(middleware_set_state_mapa(lat,lng)),
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
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        if(this.props.comuna !== prevProps.comuna && this.props.comuna != null){
            this.createMarker(this.props.lat,this.props.lng);
        }
    }

    componentWillMount(){
        this.props.middleware_set_state_mapa(this.props.lat,this.props.lng);

    }

    createMarker(lat, lng) {
        let markers = [];
        markers.push([lat, lng]);
        this.setState({
            markers: markers
        });
    }

    mapClicked(e) {
        this.props.middleware_set_state_mapa(e.latlng.lat,e.latlng.lng);

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
