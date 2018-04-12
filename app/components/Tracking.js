import React, { Component ,PropTypes } from 'react';
import {
    ListView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Text,
    View,
    Image ,
    RefreshControl,
    Modal,
    ActivityIndicator
} from 'react-native';
import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Actions } from 'react-native-router-flux';
import IconBadge from 'react-native-icon-badge';
import Utils from 'app/common/Utils';
import {connect} from "react-redux";
import I18n from 'react-native-i18n';
import api from "app/Api/api";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 22.966425;
const LONGITUDE = 72.615933;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const GOOGLE_MAPS_APIKEY = 'AIzaSyAnZx1Y6CCB6MHO4YC_p04VkWCNjqOrqH8';

class Tracking extends Component {
    constructor(props) {
        super(props);
        this.state={
            loaded: false,
            toggle : false,
            refreshing: false,
            visibleMap: true,
            coordinates: [
              {
                latitude: 22.966425,
                longitude: 72.615933,
              },
              {
                latitude: 22.996170,
                longitude: 72.599584,
              },
            ],
        }
        this.mapView = null;
    }
    onMapPress = (e) => {
      this.setState({
        coordinates: [
          ...this.state.coordinates,
          e.nativeEvent.coordinate,
        ],
      });
    }
    componentDidMount(){
        this.fetchData();
    }
    fetchData(){
        let order_id = "110",
        is_all = "1"
        api.getProductTreckingLatitudeLongitude(order_id, is_all)
        .then((responseData) => {
            console.warn(responseData);
            this.setState({
                coordinates: responseData.response.data,
                loaded: true,
                refreshing: false
            });
        })
        .catch((error) => {
            console.log(error);
        })
        .done();
    }
    render() {
        const {lang} = this.props;
        return (
            <View>
                <Modal
                    animationType="slide"
                    transparent={false}
                    isvisible={true}
                    onRequestClose={() => this.setState({ visibleMap :false})}>
                    <View style={{ position: 'absolute', zIndex: 1,backgroundColor: "transparent", justifyContent: 'center', height: 30, width: "90%", alignSelf: 'center', marginTop: 10}}>
                        <Icon onPress ={()=>this.setState({ visibleMap :false})} name="close" size={25} color="#fff" style={ lang === 'ar'?{alignSelf: 'flex-start'} :{alignSelf: 'flex-end'}} on/>
                    </View>
                    <View style={{ flex : 1, justifyContent: 'center', zIndex: 0}}>
                        <MapView
                            initialRegion={{
                                latitude: LATITUDE,
                                longitude: LONGITUDE,
                                latitudeDelta: LATITUDE_DELTA,
                                longitudeDelta: LONGITUDE_DELTA,
                            }}
                            style={StyleSheet.absoluteFill}
                            ref={c => this.mapView = c}
                            onPress={this.onMapPress}
                            >
                            {this.state.coordinates.map((coordinate, index) =>
                                <MapView.Marker key={`coordinate_${index}`} coordinate={coordinate} >
                                    <FontAwesome name="car" size={15} color="#FFCC7D"/>
                                </MapView.Marker>
                            )}
                            {(this.state.coordinates.length >= 2) && (
                                <MapViewDirections
                                    origin={this.state.coordinates[0]}
                                    waypoints={ (this.state.coordinates.length > 2) ? this.state.coordinates.slice(1, -1): null}
                                    destination={this.state.coordinates[this.state.coordinates.length-1]}
                                    apikey={GOOGLE_MAPS_APIKEY}
                                    strokeWidth={5}
                                    strokeColor="#a9d5d1"
                                    onStart={(params) => {
                                        console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
                                    }}
                                    onError={(errorMessage) => {
                                        console.log('GOT AN ERROR');
                                    }}
                                    />
                            )}
                        </MapView>
                    </View>
                </Modal>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF'
    },
    row: {
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#F6F6F6'
    },
    thumb: {
        width   :50,
        height  :50,
    },
    textQue :{
        flex: 1,
        fontSize: 18,
        fontWeight: '400',
        left : 5
    },
    centering: {
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    heading: {
        paddingTop : 5,
        paddingBottom : 5,
        backgroundColor : '#fff',
        borderBottomWidth : 3,
        borderBottomColor : '#a9a9a9'
    },
    headline: {
        paddingTop : 10,
        paddingBottom : 10,
        marginLeft : 15,
        fontSize    : 15,
        color       : "#000",
        fontWeight  : 'bold'
    },
    detail: {
        padding : 10,
        backgroundColor : '#fff',
        minHeight : 500,
        fontWeight : 'bold'
    }
});
function mapStateToProps(state) {
    return {
        identity: state.identity,
		lang: state.auth.lang,
        country: state.auth.country,
        u_id: state.identity.u_id,
        deviceId: state.auth.deviceId,
    };
}
export default connect(mapStateToProps)(Tracking);
