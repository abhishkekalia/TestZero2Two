import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableHighlight,
    StyleSheet,
    ListView,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    TextInput,
    AsyncStorage,
    Image,
    Picker,
    Platform,
} from 'react-native';
import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

import Utils from 'app/common/Utils';
import {connect} from 'react-redux';
import I18n from 'react-native-i18n'
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MessageBarManager } from 'react-native-message-bar';
import  Countmanager  from './Countmanager';
import {Actions as routes} from "react-native-router-flux";
import { SinglePickerMaterialDialog, MaterialDialog } from 'react-native-material-dialog';
import { material } from 'react-native-typography';
import EventEmitter from "react-native-eventemitter";
import Drawer from 'react-native-drawer';
import Menu from '../menu/MenuContainer';
import api from "app/Api/api";
import Modal from 'react-native-modal';
import Tracking from '../Tracking.js'
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 22.966425;
const LONGITUDE = 72.615933;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const GOOGLE_MAPS_APIKEY = 'AIzaSyAnZx1Y6CCB6MHO4YC_p04VkWCNjqOrqH8';

class Shopingcart extends Component {
    constructor(props) {
        super(props);
        // this.getKey = this.getKey.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.state = {
            dataSource : new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
            dataSource2 : new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }),
            orderHistory_list : new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }),
            arr_Item: [],
            ShopingItems : null,
            SetToList : null,
            itemcount : '',
            totalamount : '',
            subtotalamount : '',
            Quentity : 0,
            color: 'blue',
            // u_id: null,
            product_id : '',
            user_type : null,
            selectSize : false,
            // country : null,
            status : false,
            cartIdList:[],
            nologin: false,
            order_detail: {},
            fleetCompanyList: [],
            showFleetCompanydetail : false,
            showOrderHistry : false,
            ShowMapTracking : false,
            coordinates: [
              {
                latitude: 22.966425,
                longitude: 72.615933,
              },
              {
                latitude: 22.996170,
                longitude: 72.599584,
              },
              {
                 latitude: 23.036734,
                 longitude: 72.516371,
               },
               {
                  latitude: 23.012777,
                  longitude: 72.506084,
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
        this.fetchData()
        this.orderHistory()
        EventEmitter.removeAllListeners("reloadCartlist");
        EventEmitter.on("reloadCartlist", (value)=>{
            this.fetchData()
        });
        EventEmitter.removeAllListeners("redirectToFaturah");
        EventEmitter.on("redirectToFaturah", (value)=>{
            this.saveOrderDetails(value);
            // routes.myfaturah({ uri : value.uri, order_id : value.order_id, callback: this.callBackFitura, cartIdList:this.state.cartIdList})
        });
    }
    callBackFitura() {
        console.log("Callback from faturah")
    }
    componentWillMount() {
        routes.refresh({ left: this._renderLeftButton, right: this._renderRightButton,});
    }
    getProductTreckingLatitudeLongitude(order_id){
        let is_all = "1"
        api.getProductTreckingLatitudeLongitude(order_id, is_all)
        .then((responseData) => {
            var arrCoor = responseData.response.data
            var arrcoorNew = []
            for (i = 0; i < arrCoor.length; i++) {
                var dict = {}
                dict.latitude = parseFloat(arrCoor[i].latitude)
                dict.longitude = parseFloat(arrCoor[i].longitude)
                arrcoorNew.push(dict)
            }
            // console.log("arrcoorNew:",arrcoorNew);
            this.setState({
                coordinates : arrcoorNew,
                ShowMapTracking: true,
                refreshing: false
            });
        })
        .catch((error) => {
            console.log(error);
        })
        .done();
    }

    saveOrderDetails(value){
        // console.log("myfaturah respo", value);
        const { arr_Item }= this.state;
        var today = new Date();
        var nextDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        currentdate= today.getFullYear() +'-'+ parseInt(today.getMonth()+1) + '-'+ today.getDate() + ' '+  today.toLocaleTimeString() ;
        nextdate= nextDay.getFullYear() +'-'+ parseInt(nextDay.getMonth()+1) + '-'+ nextDay.getDate() ;

        let email_id = "zeroTotwo@gmail.com",
        product_name = arr_Item[0].product_name,
        // product_name = "ashvin test dfddfdf",
        product_size = arr_Item[0].size,
        // product_size = "Small",
        tempreture = "Cold",
        extra_handling_request = "Heavy",
        charges = "2000",
        pickUp_area = "29 Khalid Ibn Al Waleed St, Kuwait City, Kuwait",
        pickUp_latitude = "22.966425",
        pickUp_longitude = "72.615933",
        delivery_date = nextdate,
        delivery_time = "12:30:32",
        dropOff_latitude = "23.215635",
        dropOff_longitude = "72.636941",
        dropOff_area = "29 Khalid Ibn Al Waleed St, Kuwait City, Kuwait",
        dropOff_city = "Bayan",
        pickUp_city = "Bidea";
        // console.log("product_name",arr_Item[0].product_name);
        // console.log("product_size",arr_Item[0].size);
        // console.log("nextdate",nextdate);
        api.saveOrderDetails(email_id, product_name, product_size, tempreture, extra_handling_request,
            charges, pickUp_area, pickUp_latitude, pickUp_longitude, delivery_date, delivery_time,
            dropOff_latitude, dropOff_longitude, dropOff_area, dropOff_city, pickUp_city)
        .then((responseData)=> {
            console.log("saveOrderDetails respo", responseData);
            if(responseData.response.status === "200"){
                AsyncStorage.setItem('order_detail', JSON.stringify(responseData.response.data));
                this.setState({
                    order_detail : responseData.response.data,
                });
                let order_id = responseData.response.data.order_id;
                console.log("order_id", order_id);
                this.fleetCompanyFilter(order_id)

            }
        })
        .catch((error) => {
            console.warn("hello", error);
            console.log(error);
        })
        .done();
    }
    fleetCompanyFilter(order_id){
        let pickUp_latitude = "22.966425",
        pickUp_longitude = "72.615933",
        min_price = "0",
        max_price = "5000";

        api.fleetCompanyFilter(order_id, pickUp_latitude, pickUp_longitude, min_price, max_price)
        .then((responseData)=> {
            if(responseData.response.status === "200"){
                AsyncStorage.setItem('fleetCompanydetail', JSON.stringify(responseData.response.data));
                this.setState({
                    dataSource2 : this.state.dataSource2.cloneWithRows(responseData.response.data),
                    fleetCompanyList : responseData.response.data,
                    showFleetCompanydetail : true,
                });
                // console.log("fleetCompanydetail", responseData);
            }
        })
        .catch((error) => {
            console.log(error);
        })
        .done();
    }
    _renderLeftButton = () => {
         return(
             <Feather name="menu" size={20} onPress={()=>this.openControlPanel()} color="#fff" style={{ padding : 10,paddingTop: Platform.OS === 'ios' ? 20 : 10}}/>
         );
     };
     _renderRightButton = () => {
        return(
            <Text style={{color : '#fff'}}></Text>
        );
    };
    fetchData(){
        const {u_id, country, lang ,deviceId } = this.props;
        // deviceId = "fc898d3fb74399eb";
        // console.warn("deviceId", deviceId);
        // console.warn("country", country);
        let formData = new FormData();
        // formData.append('u_id', String(u_id));
        formData.append('country', String(country));
        formData.append('device_uid', String(deviceId));
        console.log(formData);

        const config = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data;',
            },
            body: formData,
        }
        fetch(Utils.gurl('cartList'), config)
        .then((response) => response.json())
        .then((responseData) => {
            // console.warn(responseData);
            var Items = responseData.data,
                length = Items.length,
                organization,
                Select =[],
                user,
                i;
            var today = new Date();
            var nextDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
            currentdate= today.getFullYear() +'-'+ parseInt(today.getMonth()+1) + '-'+ today.getDate() + ' '+  today.toLocaleTimeString() ;
            nextdate= nextDay.getFullYear() +'-'+ parseInt(nextDay.getMonth()+1) + '-'+ nextDay.getDate() + ' '+  nextDay.toLocaleTimeString() ;
            for (i = 0; i < length; i++) {
                organization = Items[i];
                Select.push ({
                    "product_id": organization.product_id,
                    "size": organization.size,
                    "quantity": organization.quantity,
                    "cart_id" : organization.cart_id,
                    "price":organization.price,
                    "delivery_datetime": currentdate,
                    "order_date": nextdate
                })
            }
            if(responseData.status){
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(responseData.data),
                    arr_Item : responseData.data,
                    ShopingItems : Select,
                    SetToList : responseData.data,
                    itemcount : responseData.itemcount,
                    totalamount : responseData.totalamount,
                    subtotalamount : responseData.subtotalamount,
                    refreshing : false,
                    status : responseData.status
                });
                let res = responseData.data;
                let cartIdList = [];
                for (var i = 0; i < res.length; i++) {
                    cartIdList.push(res[i].cart_id);
                }

                this.setState({
                    cartIdList:cartIdList
                });
            }else {
                this.setState({
                    status : responseData.status
                })
            }
        })
        .catch((error) => {
            console.log(error);
        })
        .done();
    }
    validate(){
        const { ShopingItems} = this.state;
        const { lang, country, u_id, deviceId } = this.props,
        align = (lang === 'ar') ?  'right': 'left';

        if (!ShopingItems.length)
        {
            MessageBarManager.showAlert({
                message: I18n.t('cart.pleaseselectitems', { locale: lang }),
                title:'',
                alertType: 'extra',
                titleStyle: {color: 'white', fontSize: 18, fontWeight: 'bold' },
                messageStyle: { color: 'white', fontSize: 16 , textAlign:align},
            })
            return false
        }
            return true;
    }
    getSize(size){
        this.setState({size});
    }
    getColor(color){
        this.setState({color});
    }
    procedToCheckout(){
        let {lang, u_id} = this.props
        if (u_id === undefined ){
            this.setState({
                nologin: true
            })
        }else{
            if (this.validate()) {
                routes.AddressLists({
                    order_detail : this.state.ShopingItems,
                    SetToList :this.state.SetToList,
                    totalAmount : this.state.subtotalamount,
                    cartIdList:this.state.cartIdList
                })
            }
        }
    }
    renderFooter(itemcount, totalamount, subtotalamount){
        let {lang} = this.props,
        direction = (lang === 'ar') ? 'row-reverse' :'row',
        align = (lang === 'ar') ?  'right': 'left',
        position = (lang === 'ar') ?  'left': 'right';
        return(
            <View style={{ flexDirection : "column"}}>
                <View style={{
                        flexDirection : direction,
                        justifyContent: "space-between",
                        alignItems:'center',
                        padding : 5,
                        flex : 0}
                    }>
                    <Text style={{ textAlign: align}}>{I18n.t('cart.items', { locale: lang })}({itemcount})</Text>
                <Text style={{textAlign: align}} onPress={()=> this.setState({
                        showOrderHistry : true
                    })}> Show Order History</Text>
                </View>
                <View style={{
                        flexDirection : direction,
                        justifyContent: "space-between",
                        alignItems:'center',
                        padding : 5,
                        flex : 0}
                    }>
                    <Text style={{ color : "#87cefa", textAlign: align}} >{I18n.t('cart.crtsubtotal', { locale: lang })}</Text>
                    <Text style={{ color : "#87cefa", textAlign: align}}> KWD {subtotalamount}</Text>
                </View>
                <MaterialDialog
                    title="You are not login Now"
                    visible={this.state.nologin}
                    onOk={() => this.setState({ nologin: false },()=>routes.loginPage())}
                    onCancel={() => this.setState({ nologin: false })}>
                    <Text style={styles.dialogText}>
                        To checkout your cart please Login or SignUp
                    </Text>
                </MaterialDialog>

            </View>
        )
    }
    noItemFound(){
        const {lang} = this.props;
        let side = lang === "ar" ? "right" : "left";
        return (
            <Drawer
                ref={(ref) => this._drawer = ref}
                type="overlay"
                content={<Menu closeDrawer={()=> this.closeControlPanel()} />}
                tapToClose={true}
                openDrawerOffset={0.2}
                panCloseMask={0.2}
                closedDrawerOffset={0}
                styles={drawerStyles}
                tweenHandler={(ratio) => ({
                    main: { opacity:(2-ratio)/2 }
                })}
                side= {side}
                >
                <View style={{flex: 1}}>
                    <View style={{height: Platform.OS === 'ios' ? 60 : 54,alignItems: 'center', backgroundColor: "#a9d5d1", justifyContent: 'space-between', flexDirection: lang === "ar" ? "row-reverse" : "row"}}>
                        {this._renderLeftButton()}
                        <Text style={{ color: "#fff", fontWeight: 'bold', fontSize: 15, paddingTop: Platform.OS === 'ios' ? 10 : 0, marginLeft: Platform.OS === 'ios' ? -35 : 0}}>{I18n.t('cart.carttitle', { locale: lang })}</Text>
                        {this._renderRightButton()}
                    </View>
                    <View style={{ flexDirection:'column', justifyContent:'center', alignItems:'center', flex:1}}>
                        <Text> {I18n.t('cart.noitem', { locale: lang })} </Text>
                    </View>
                </View>
            </Drawer>
        );
    }
    closeControlPanel = () => {
        this._drawer.close()
    };
    openControlPanel = () => {
        this._drawer.open()
    };
    render() {
        const { itemcount, totalamount, subtotalamount} = this.state;
        const { lang } = this.props;
        let side = lang === "ar" ? "right" : "left";
        let listView = (<View></View>);
            listView = (
                <ListView
                contentContainerStyle={styles.container}
                dataSource={this.state.dataSource}
                renderRow={this.renderData.bind(this)}
                enableEmptySections={true}
                automaticallyAdjustContentInsets={false}
                showsVerticalScrollIndicator={false}
                />
            );

            let fleetlistView = (<View></View>);
            fleetlistView = (
                <ListView
                    contentContainerStyle={styles.container}
                    dataSource={this.state.dataSource2}
                    renderRow={this.renderfleet.bind(this)}
                    enableEmptySections={true}
                    automaticallyAdjustContentInsets={false}
                    showsVerticalScrollIndicator={false}
                    />
            );
            let orderHistory_listView = (<View></View>);
            orderHistory_listView = (
                <ListView
                    contentContainerStyle={styles.container}
                    dataSource={this.state.orderHistory_list}
                    renderRow={this.renderOrderHistry.bind(this)}
                    enableEmptySections={true}
                    automaticallyAdjustContentInsets={false}
                    showsVerticalScrollIndicator={false}
                    />
            );

        if (!this.state.status) {
            return this.noItemFound();
        }
        return (
                <View style={{flex: 1, flexDirection: 'column'}}>
                    <Drawer
                        ref={(ref) => this._drawer = ref}
                        type="overlay"
                        content={<Menu closeDrawer={()=> this.closeControlPanel()} />}
                        tapToClose={true}
                        openDrawerOffset={0.2}
                        panCloseMask={0.2}
                        closedDrawerOffset={0}
                        styles={drawerStyles}
                        tweenHandler={(ratio) => ({
                            main: { opacity:(2-ratio)/2 }
                        })}
                        side={side}
                        >
                        <View style={{height: Platform.OS === 'ios' ? 60 : 54,alignItems: 'center', backgroundColor: "#a9d5d1", justifyContent: 'space-between', flexDirection: lang === "ar" ? "row-reverse" : "row"}}>
                            {this._renderLeftButton()}
                            <Text style={{ color: "#fff", fontWeight: 'bold', fontSize: 15, paddingTop: Platform.OS === 'ios' ? 10 : 0, marginLeft: Platform.OS === 'ios' ? -35 : 0}}>{I18n.t('cart.carttitle', { locale: lang })}</Text>
                            {this._renderRightButton()}
                        </View>
                        {listView}
                        {this.renderFooter(itemcount, totalamount, subtotalamount)}
                        <View style={{ flexDirection : (lang == 'ar')? "row-reverse" :"row", justifyContent : 'space-around'}}>
                            <TouchableHighlight
                                underlayColor ={"#fff"}
                                style={[styles.shoping]}
                                onPress={()=>routes.homePage()}>
                                <Text style={{ color :'#fff'}}>{I18n.t('cart.shoping', { locale: lang })}</Text>
                            </TouchableHighlight>
                            <TouchableHighlight
                                underlayColor ={"#fff"}
                                style={[styles.checkout]}
                                onPress={()=> this.procedToCheckout()}>
                                <Text style={{ color : '#fff'}}>{I18n.t('cart.checkout', { locale: lang })}</Text>
                            </TouchableHighlight>
                        </View>
                </Drawer>
                <Modal
                    animationType="slide"
                    transparent={false}
                    isVisible={this.state.showFleetCompanydetail}
                    onRequestClose={() => this.setState({ showFleetCompanydetail :false})}>
                    <View style={{
                            // flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: "transparent"}
                        }>
                            {fleetlistView}
                    </View>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={false}
                    isVisible={this.state.showOrderHistry}
                    onRequestClose={() => this.setState({ showOrderHistry :false})}>
                    <View style={{
                            // flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: "transparent"}
                        }>
                            {orderHistory_listView}
                            <Text style={{ height: 20, width: 100, textAlign: 'center'}} onPress={()=>this.setState({
                                showOrderHistry : false
                                })
                            }>Close</Text>
                    </View>

                </Modal>
                <Modal
                    animationType="slide"
                    transparent={false}
                    isVisible={this.state.ShowMapTracking}
                    onRequestClose={() => this.setState({ ShowMapTracking :false})}>
                    <View style={{ position: 'absolute', zIndex: 1,backgroundColor: "transparent", justifyContent: 'center', height: 30, width: "90%", alignSelf: 'center', marginTop: 10}}>
                        <Icon onPress ={()=>this.setState({ ShowMapTracking :false})} name="close" size={25} color="#fff" style={ lang === 'ar'?{alignSelf: 'flex-start'} :{alignSelf: 'flex-end'}} on/>
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
                                    strokeColor="#191970"
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
    orderHistory(){
        let email_id = "zeroTotwo@gmail.com";
        api.orderHistory(email_id)
        .then((responseData)=> {
            console.log("orderHistory respo", responseData);
            if(responseData.response.status === "200"){
                this.setState({
                    orderHistory_list : this.state.orderHistory_list.cloneWithRows(responseData.response.data),
                });
            }
        })
        .catch((error) => {
            console.warn("hello", error);
            console.log(error);
        })
        .done();

    }
    conformOrder(){
        let order_id = this.state.order_detail.order_id,
        price = this.state.fleetCompanyList[0].price,
        u_id = this.state.order_detail.u_id,
        fleetCompanyId = this.state.fleetCompanyList[0].fleetCompanyId,
        user_wise_product_id = this.state.order_detail.user_wise_product_id ;

        api.conformOrder(order_id, price, u_id, fleetCompanyId, user_wise_product_id)
        .then((responseData)=> {
            console.log("conformOrder respo", responseData);
            if(responseData.response.status === "200"){
                AsyncStorage.setItem('conformOrderDetail', JSON.stringify(responseData.response.data));
                this.setState({
                    conformOrderDetail : responseData.response.data,
                    showFleetCompanydetail :false
                });
                this.orderHistory()
                MessageBarManager.showAlert({
                    message: responseData.response.data.message,
                    title:'',
                    alertType: 'extra',
                    titleStyle: {color: 'white', fontSize: 18, fontWeight: 'bold' },
                    messageStyle: { color: 'white', fontSize: 16 , textAlign: "left"},
                })

            }
        })
        .catch((error) => {
            console.warn("hello", error);
            console.log(error);
        })
        .done();
    }
    renderOrderHistry( data, rowData: string, sectionID: number, rowID: number, index) {
        return (
            <View style={{
                    flexDirection: 'column',
                    marginTop : 2,
                    backgroundColor: "#fff",
                    borderWidth : StyleSheet.hairlineWidth,
                    borderColor : "#ccc",
                    borderRadius : 5}
                }>
                <Text onPress={()=> this.getProductTreckingLatitudeLongitude(data.order_id)} style={{ fontSize:15, color:'#696969', marginBottom:5}}> {JSON.stringify(data)}</Text>
                </View>
        );
    }
        renderfleet( data, rowData: string, sectionID: number, rowID: number, index) {
        console.log("data", data);
        return (
            <View style={{
                    flexDirection: 'column',
                    marginTop : 2,
                    backgroundColor: "#fff",
                    borderWidth : StyleSheet.hairlineWidth,
                    borderColor : "#ccc",
                    borderRadius : 5}
                }>
                <Text onPress={()=> this.conformOrder()} style={{ fontSize:15, color:'#696969', marginBottom:5}}> {JSON.stringify(data)}</Text>
                </View>
        );
    }

    renderData( data, rowData: string, sectionID: number, rowID: number, index) {
        const { lang, country, u_id, deviceId } = this.props;
        let direction = (lang === 'ar') ? 'row-reverse' :'row',
        align = (lang === 'ar') ?  'right': 'left',
        product_name = (lang == 'ar')? data.product_name_in_arabic : data.product_name,
        short_description = (lang == 'ar')? data.short_description_in_arabic : data.short_description,
        size = (lang == 'ar')? data.size_in_arabic : data.size,
        price = (lang == 'ar')? data.price_in_arabic : data.price,
        special_price = (lang == 'ar')? data.special_price_in_arabic : data.special_price;

        let color = data.special_price ? '#a9d5d1' : '#000';
        let textDecorationLine = data.special_price ? 'line-through' : 'none';
        return (
            <View style={{
                    flexDirection: 'column',
                    marginTop : 2,
                    borderWidth : StyleSheet.hairlineWidth,
                    borderColor : "#ccc",
                    borderRadius : 5}
                }>
                <View style={{
                        flexDirection: direction,
                        backgroundColor : "transparent"}
                    }>
                    <View style={{flexDirection: 'column', justifyContent : 'space-between'}}>
                        <View style={{ flexDirection:direction , backgroundColor : "#fff", justifyContent : 'space-between', alignItems : 'center'}}>
                            <Image style={[styles.thumb, {margin: 10}]}
                                source={{ uri : data.productImages[0] ? data.productImages[0].image : null}}/>
                            <View style={{flexDirection : 'column'}}>
                                <Text style={{ fontSize:15, color:'#696969', marginBottom:5, textAlign: align}}> {product_name} </Text>
                                <Text style={{ fontSize:10, color:'#696969', marginBottom:5, textAlign: align}}> {short_description} </Text>
                                <View style={{ flexDirection :direction,  width:width/1.5}}>
                                    <Text style={{paddingRight : 10, textAlign: align, alignSelf: 'center'}}> {I18n.t('cart.quantity', { locale: lang })} </Text>
                                        <Text style={{paddingRight : 10, textAlign: align, alignSelf: 'center'}}> : </Text>
                                    <Countmanager
                                        quantity={data.quantity}
                                        u_id={u_id}
                                        product_id={data.product_id}
                                        updatetype={"1"}
                                        country={country}
                                        deviceId={deviceId}
                                        callback={this.fetchData.bind(this)}
                                        />
                                </View>
                                <View style={{ flexDirection : direction ,justifyContent: 'flex-start'}}>
                                    <Text style={{ fontSize:13, color:'#696969', marginBottom:5, textAlign: align}}>{I18n.t('cart.size', { locale: lang })}</Text>
                                    <Text style={{ fontSize:13, color:'#696969', marginBottom:5, textAlign: align}}>:</Text>
                                    <Text style={{ fontSize:13, color:'#696969', paddingRight: 5,marginBottom:5, textAlign:align}}>{size}</Text>
                                </View>
                                <View style={{ flexDirection : direction, justifyContent:"space-between"}}>
                                    <Text style={{ fontWeight:"bold", color:'#696969', marginBottom:5, textAlign: align}}> {data.special_price} KWD</Text>
                                    <Text style={{ fontWeight:"bold", fontSize:15, color: color, textDecorationLine: textDecorationLine, textAlign: align}}> {data.price} KWD</Text>
                                </View>
                                <View style={{ flexDirection : direction}}>
                                    <Text style={{ fontSize:13, color:'#696969', marginBottom:5,textAlign: align}}>{I18n.t('cart.subtotal', { locale: lang })}</Text>
                                    <Text style={{ fontSize:13, color:'#696969', marginBottom:5,textAlign: align}}>:</Text>
                                    <Text style={{ fontSize:13, color:'#696969', marginBottom:5, textAlign: align}}>{ data.quantity*data.special_price}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                <Footer  product_id={data.product_id}
                    u_id={u_id}
                    cart_id={data.cart_id}
                    country={country}
                    callback={this.fetchData.bind(this)}
                    size_arr={data.size_arr}
                    lang={lang}
                    cartIdList = {this.state.cartIdList}
                    deviceId={deviceId}/>
            </View>
        )
    }
}
class Footer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            size : '',
            color : 'blue',
            selectSize : false,
            SHORT_LIST : ['0'],
            showFare : false,
            fleatFaresdata : ""
        };
    }
    openDialog(product_id){
        this.setState({
            selectSize : true,
            product_id : product_id
        })
    }
    changeSize(result){
        this.setState({
            selectSize: false,
            size: result.selectedItem.label
        });
        this.editCart(result.selectedItem.label)
    }
    componentDidMount(){
        var data =this.props.size_arr,
        length = data.length,
        sizeList= []
        for(var i=0; i < length; i++) {
            order = data[i];
            // console.warn(order);
            sizeof = order.size;
            sizeList.push(sizeof);
        }
        // console.warn(sizeList);
        this.setState({
            SHORT_LIST: sizeList,
        })
    }
    showPrice = ()=> {
        this.setState({
            showFare: !this.state.showFare
        });
        !this.state.fleatFaresdata ?
        this.fleetCompanyFilter() : undefined
    }
    fleetCompanyFilter(){
        let order_id = "119",
        pickUp_latitude = "23.011863",
        pickUp_longitude = "72.576027",
        min_price = "0",
        max_price = "50000";
        api.fleetCompanyFilter(order_id, pickUp_latitude, pickUp_longitude, min_price, max_price)
        .then((responseData)=> {
            if(responseData.response.status){
                this.setState({
                    fleatFaresdata: responseData.response.data[0].price,
                });
            }
        })
        .catch((error) => {
            console.log(error);
        })
        .done();
    }
    removeFromCart(cart_id, product_id){
        const {u_id, country, user_type ,deviceId, lang} = this.props;
        align = (lang === 'ar') ?  'right': 'left';
        let formData = new FormData();
        // formData.append('u_id', String(u_id));
        formData.append('country', String(country));
        formData.append('product_id', String(product_id));
        formData.append('cart_id', String(cart_id));
        formData.append('device_uid', String(deviceId));
        const config = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data;',
            },
            body: formData,
        }
        fetch(Utils.gurl('removeFromCart'), config)
        .then((response) => response.json())
        .then((responseData) => {
            MessageBarManager.showAlert({
                message: I18n.t('cart.removeitem', { locale: lang }),
                title:'',
                alertType: 'extra',
                titleStyle: {color: 'white', fontSize: 18, fontWeight: 'bold' },
                messageStyle: { color: 'white', fontSize: 16 , textAlign:align},
            })
        })
        .then(()=>this.props.callback())
        .catch((error) => {
            console.log(error);
        })
        .done();
    }
    editCart(size){
        const { color } = this.state;
        const {u_id, country, cart_id , lang} = this.props,
        align = (lang === 'ar') ?  'right': 'left';
        let formData = new FormData();
        // formData.append('u_id', String(u_id));
        formData.append('size', String(size));
        formData.append('color', String(color));
        formData.append('cart_id', String(cart_id));
        const config = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data;',
            },
            body: formData,
        }
        fetch(Utils.gurl('editCart'), config)
        .then((response) => response.json())
        .then((responseData) => {
            if(responseData.status) {
                MessageBarManager.showAlert({
                    message: I18n.t('cart.cartUpdate', { locale: lang }),
                    title:'',
                    alertType: 'extra',
                    titleStyle: {color: 'white', fontSize: 18, fontWeight: 'bold' },
                    messageStyle: { color: 'white', fontSize: 16 , textAlign:align},
                })
            }else{
                MessageBarManager.showAlert({
                    message: I18n.t('cart.somethingwentswrong', { locale: lang }),
                    title:'',
                    alertType: 'extra',
                    titleStyle: {color: 'white', fontSize: 18, fontWeight: 'bold' },
                    messageStyle: { color: 'white', fontSize: 16 , textAlign:align},
                })
            }
        })
        .then(()=>this.props.callback())
        .catch((error) => {
            console.log(error);
        })
        .done();
    }
    render(){
        let {product_id,cart_id , lang} = this.props
        let {SHORT_LIST, showFare , fleatFaresdata} = this.state
        let direction = (lang === 'ar') ? 'row-reverse' :'row',
        align = (lang === 'ar') ?  'right': 'left';
        return(
            <View style={{backgroundColor: "transparent"}}>
            <View style={{ flexDirection : direction, justifyContent: 'space-between'}}>
                <Icon name="local-shipping" size={20} color="#fbcdc5" onPress={()=>this.showPrice()}/>
                {
                    showFare ?
                    <View style={{ flexDirection : direction, justifyContent: 'space-around'}}>
                        <Text style={{ fontSize:13, color:'#696969', marginBottom:5,textAlign: "left"}}>{I18n.t('cart.shipingchage', { locale: lang })}</Text>
                        <Text style={{ fontSize:13, color:'#696969', marginBottom:5,textAlign: "left"}}>:</Text>
                        <Text style={{ fontSize:13, color:'#696969', marginBottom:5,textAlign: "left"}}>{fleatFaresdata}</Text>
                    </View>
                    :
                    <Text/>
                }
            </View>
            <View style={[styles.bottom, {flexDirection: direction}]}>
                <TouchableOpacity
                    onPress={()=> this.removeFromCart( cart_id, product_id)}
                    style={[styles.wishbutton, {flexDirection : direction, justifyContent: "center"}]}>
                    <Entypo name="cross" size={20} color="#a9d5d1"/>
                    <Text style={{ left : 5}}>{I18n.t('cart.remove', { locale: lang })}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.wishbutton, {flexDirection : direction, justifyContent: "center"}]}
                    onPress={()=>this.openDialog(product_id)}>
                    <Entypo name="edit" size={20} color="#a9d5d1"/>
                    <Text style={{ left :5}}>{I18n.t('cart.edit', { locale: lang })}</Text>
                </TouchableOpacity>
                <SinglePickerMaterialDialog
                    title={I18n.t('cart.selectsize', { locale: lang })}
                    items={SHORT_LIST.map((row, index) => ({ value: index, label: row }))}
                    visible={this.state.selectSize}
                    selectedItem={this.state.singlePickerSelectedItem}
                    onCancel={() => this.setState({ selectSize: false })}
                    onOk={result => this.changeSize(result)}
                    cancelLabel={I18n.t('cart.cancel', { locale: lang })}
                    okLabel={I18n.t('cart.ok', { locale: lang })}
                    />
            </View>
        </View>

        )
    }
}
const styles = StyleSheet.create ({
    container: {
        flexDirection: 'column',
        padding : 10
    },
    row: {
        flexDirection: 'row',
        marginTop : 1
    },
    qtybutton: {
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: 'center',
        borderWidth : StyleSheet.hairlineWidth,
        borderColor : "#ccc",
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    wishbutton :{
        alignItems : 'center',
        width : width/2-10,
        borderWidth : StyleSheet.hairlineWidth,
        borderColor : "#ccc",
        padding : 5
    },
    thumb: {
        width   : '20%',
        height  :'50%' ,
        resizeMode: 'center'
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
    bottom : {
        borderBottomLeftRadius : 10,
        borderBottomRightRadius : 10,
        justifyContent : 'space-around',
        backgroundColor : "#fff"
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
    },
    shoping : {
        width : width/2,
        backgroundColor : "#fbcdc5",
        alignItems : 'center',
        padding : 10
    },
    checkout : {
        width : width/2,
        backgroundColor : "#a9d5d1",
        alignItems : 'center',
        padding : 10
     }
})
const drawerStyles = {
    drawer: {
        backgroundColor:'#fff',
        shadowColor: '#000000',
        shadowOpacity: 0.8,
        shadowRadius: 3
    },
    main: {
        // paddingLeft: 3,
        backgroundColor:'transparent'
    },
}

function mapStateToProps(state) {
    return {
        lang: state.auth.lang,
        country: state.auth.country,
        u_id: state.identity.u_id,
        deviceId: state.auth.deviceId,
    }
}
export default connect(mapStateToProps)(Shopingcart);
