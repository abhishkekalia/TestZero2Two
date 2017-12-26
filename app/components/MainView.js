import React, { Component ,PropTypes } from 'react';
import {
    ListView,
    TouchableOpacity,
    ScrollView, 
    StyleSheet,
    Dimensions, 
    Text, 
    View,
    TextInput,
    AsyncStorage,
    StatusBar,
    Image ,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import IconBadge from 'react-native-icon-badge';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Utils from 'app/common/Utils';
import GetMarketing from './GetMarketingad';
import ModalPicker from './modalpicker';
import AllItem from './AllItem';
import CheckBox from 'app/common/CheckBox';
import { MessageBar, MessageBarManager } from 'react-native-message-bar';
import Editwish from './wish/Editwish'
import Modal from 'react-native-modal';

const { width, height } = Dimensions.get('window')
let index = 0;

export default class MainView extends Component {
    constructor(props) {
        super(props); 
        this.fetchAllShop = this.fetchAllShop.bind(this); 
        this.fetchData = this.fetchData.bind(this);
        this.getKey= this.getKey.bind(this);
        this.state={ 
            dataSource: new ListView.DataSource({   rowHasChanged: (row1, row2) => row1 !== row2 }), 
            dataSource2: new ListView.DataSource({  rowHasChanged: (row1, row2) => row1 !== row2 }),
            serviceArrayStatus : false,
            status : false, 
            textInputValue: '',
            shoperId : '',
            data : [],
            dataArray: [],
            rows: [],
            serviceArray: [],
            servicerows: [],
            isService: false,
            isModalVisible: false,
            isLoading: true,
            u_id: null,
            user_type : null,
            country : null,
            loaded: false,
            toggle : false,
            refreshing: false,

        }
    }

    componentDidMount(){
        this.getKey()
        .then( ()=>this.fetchData())
        .then( ()=>this.fetchAllShop())
        .then( ()=>this.loadData())
        .then( ()=>this.loadServiceData())

    }

    _onRefresh() {
    this.setState({refreshing: true});
            this.fetchData();
    }


    async getKey() {
        try { 
            const value = await AsyncStorage.getItem('data'); 
            var response = JSON.parse(value);  
            this.setState({ 
                u_id: response.userdetail.u_id ,
                country: response.userdetail.country ,
                user_type: response.userdetail.user_type 
            }); 
        } catch (error) {
            console.log("Error retrieving data" + error);
        }
    }

    modal = () => this.setState({ 
        isModalVisible: !this.state.isModalVisible 
    })

    filterbyShop = () => {
        this.setState({ 
            isModalVisible: !this.state.isModalVisible
        },Actions.filterdBy({ vendor : this.state.rows }) )
    }

    blur() {
        const {dataSource } = this.state;
        dataSource && dataSource.blur();
    }

    focus() {
        const {dataSource } = this.state;
        dataSource && dataSource.focus();
    }

    loadData (){
        const {u_id, country, user_type } = this.state;
        let formData = new FormData();
        formData.append('u_id', String(user_type));
        formData.append('country', String(country));   
        const config = { 
            method: 'POST', 
            headers: { 
                'Accept': 'application/json', 
                'Content-Type': 'multipart/form-data;',
            },
            body: formData,
        }
        fetch(Utils.gurl('listOfAllShop'), config) 
        .then((response) => response.json())
        .then((responseData) => {
            this.setState({
                dataArray: responseData.data,
            });
        })
        .done();
    }

    onClick(data) {
        var newStateArray = this.state.rows.slice(); 
        newStateArray.push(data.u_id); 
        this.setState({
            rows: newStateArray
        });

        data.checked = !data.checked;
        let msg=data.checked? 'you checked ':'you unchecked '
    }
    
    renderView() {
        if (!this.state.dataArray || this.state.dataArray.length === 0)return;
        var len = this.state.dataArray.length;
        var views = [];
        for (var i = 0, l = len - 2; i < l; i += 2) {
            views.push(
                <View key={i}>
                    <View style={styles.item}>
                        {this.renderCheckBox(this.state.dataArray[i])}
                        {this.renderCheckBox(this.state.dataArray[i + 1])}
                    </View>
                </View>
            )
        }
        views.push(
            <View key={len - 1}>
                <View style={styles.item}>
                    {len % 2 === 0 ? this.renderCheckBox(this.state.dataArray[len - 2]) : null}
                    {this.renderCheckBox(this.state.dataArray[len - 1])}
                </View>
            </View>
        )
        return views;
    }

    renderCheckBox(data) {
        var leftText = data.ShopName;
        var icon_name = data.icon_name;
        return (
            <CheckBox
                style={{flex: 1, padding: 5, borderTopWidth : 1, borderColor : '#ccc'}}
                onClick={()=>this.onClick(data)}
                isChecked={data.checked}
                leftText={leftText}
                icon_name={icon_name}
            />);
    }

    sharing(product_id){
        console.warn(product_id);
    }

    addtoWishlist(product_id){
        const {u_id, country, user_type } = this.state;

        let formData = new FormData();
        formData.append('u_id', String(u_id));
        formData.append('country', String(country)); 
        formData.append('product_id', String(product_id)); 
        const config = { 
                method: 'POST', 
                headers: { 
                    'Accept': 'application/json', 
                    'Content-Type': 'multipart/form-data;',
                },
                body: formData,
            }
        fetch(Utils.gurl('addToWishlist'), config) 
        .then((response) => response.json())
        .then((responseData) => {
            MessageBarManager.showAlert({ 
            message: responseData.data.message, 
            alertType: 'alert', 
            })
        })
        .then( this.fetchData())
        .done();
    }
    removeToWishlist(product_id){
        const {u_id, country, user_type } = this.state;

        let formData = new FormData();
        formData.append('u_id', String(u_id));
        formData.append('country', String(country)); 
        formData.append('product_id', String(product_id)); 
        const config = { 
                method: 'POST', 
                headers: { 
                    'Accept': 'application/json', 
                    'Content-Type': 'multipart/form-data;',
                },
                body: formData,
            }
        fetch(Utils.gurl('removeFromWishlist'), config) 
        .then((response) => response.json())
        .then((responseData) => {
            MessageBarManager.showAlert({ 
            message: responseData.data.message, 
            alertType: 'alert', 
            })
        })
        .then( this.fetchData())
        .done();
    }
    fetchAllShop(){
        const {u_id, country, user_type } = this.state;

        let formData = new FormData();
        formData.append('u_id', String(user_type));
        formData.append('country', String(country)); 

    const config = { 
                method: 'POST', 
                headers: { 
                    'Accept': 'application/json', 
                    'Content-Type': 'multipart/form-data;',
                },
                body: formData,
            }

            fetch(Utils.gurl('listOfAllShop'), config) 

        .then((response) => response.json())
        .then((responseData) => {
            this.setState({
            data: responseData.data
        });
        }).done();
    }

    fetchData(){
        const {u_id, country, user_type } = this.state;
        let formData = new FormData();
        formData.append('u_id', String(u_id));
        formData.append('country', String(country));  

        const config = { 
            method: 'POST', 
            headers: { 
                'Accept': 'application/json', 
                'Content-Type': 'multipart/form-data;',
            },
            body: formData,
        } 

        fetch(Utils.gurl('allProductItemList'), config) 
        .then((response) => response.json())
        .then((responseData) => {
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(responseData.data),
                status : responseData.status,
                loaded: true, 
                refreshing: false
            });
        }).done();
    }
    renderLoadingView() {
        return (
            <ActivityIndicator  
            style={[styles.centering]}
            color="#a9d5d1" 
            size="large"/>
            );
    }

    render() {
        this.fetchData = this.fetchData.bind(this);

        if (!this.state.loaded) {
            return this.renderLoadingView();
        }
        if (!this.state.status) {
            return this.noItemFound();
        }

        let listView = (<View></View>);
            listView = (
                <ListView
                refreshControl={ 
                    <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this._onRefresh} />
                }
                contentContainerStyle={styles.list}
                dataSource={this.state.dataSource}
                renderRow={ this.renderData.bind(this)}
                enableEmptySections={true}
                automaticallyAdjustContentInsets={false}
                showsVerticalScrollIndicator={false}
                />
            );

        return (
            <ScrollView 
            contentContainerStyle={styles.contentContainer} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always">
                <StatusBar backgroundColor="#a9d5d1" barStyle="light-content"/>
                <View style={{ flexDirection : 'row'}}>
                    <View style={ styles.button,[{ 
                        width : width/2,
                        height : 40, 
                        justifyContent : "space-around", 
                        backgroundColor : '#fff',
                        padding : 2}]}> 
                        
                        <TouchableOpacity onPress={this.modal} style={styles.allshop}> 
                            <Text>All Shop</Text>
                            <Ionicons 
                            name="md-arrow-dropdown" 
                            size={20} 
                            color="#a9d5d1" 
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={ styles.button,[{ 
                        width : width/2, 
                        height : 40, 
                        justifyContent : "space-around", 
                        backgroundColor : '#fff', 
                        padding : 2}]}> 
                        <TouchableOpacity onPress={this.Service} style={styles.allshop}> 
                            <Text>Services</Text>
                            <Ionicons 
                            name="md-arrow-dropdown" 
                            size={20} 
                            color="#a9d5d1" 
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <GetMarketing/>
                <Text>Featured Item</Text>
                {listView}
                <Text style={{}}>All Item</Text>
                <AllItem/>
                <Modal isVisible={this.state.isModalVisible}>
                <View style={styles.container}>
                    <ScrollView>
                        {this.renderView()}
                    </ScrollView>
                    <View style={{ flexDirection : 'row', justifyContent : 'space-around'}}>
                        <TouchableOpacity 
                        underlayColor ={"#fff"} 
                        style={[styles.footer]} 
                        onPress={()=>this.filterbyShop()}>
                            <Text>Done</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                        underlayColor ={"#fff"} 
                        style={[styles.footer]} 
                        onPress={()=> this.modal()}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal isVisible={this.state.isService}>
                <View style={styles.container}>
                <ScrollView>
                    {this.renderServiceView()}
                </ScrollView>
                 <View style={{ flexDirection : 'row', justifyContent : 'space-around'}}>
                <TouchableOpacity 
                underlayColor ={"#fff"} 
                style={[styles.footer]} 
                onPress={()=>this.Service()}>
                <Text>Done</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                underlayColor ={"#fff"} 
                style={[styles.footer]} 
                onPress={()=> this.cancelService()}>
                <Text>Cancel</Text>
                </TouchableOpacity>
            </View>
                </View>
            </Modal>
            </ScrollView>
        );
    }

       // service  filter

    Service = () => this.setState({ isService: !this.state.isService })
    
    loadServiceData (){
        const {u_id, country, user_type } = this.state;
        let formData = new FormData();
        formData.append('u_id', String(u_id));
        formData.append('country', String(country));   
        formData.append('u_id', String(user_type));   
        const config = { 
            method: 'POST', 
            headers: { 
                'Accept': 'application/json', 
                'Content-Type': 'multipart/form-data;',
            },
            body: formData,
        }
        fetch(Utils.gurl('filterByService'), config) 
        .then((response) => response.json())
        .then((responseData) => {
            this.setState({
                serviceArray: responseData.data,
                serviceArrayStatus : responseData.status
            });
        })
        .done();
    }

    onServiceClick(data) {
        // console.warn(JSON.stringify(this.state.serviceArray))
        // console.warn(JSON.stringify(data.u_id))
        var newStateArray = this.state.servicerows.slice();
        newStateArray.push(data.service_id); 
        this.setState({
            servicerows: newStateArray
        });

        data.checked = !data.checked;
        let msg=data.checked? 'you checked ':'you unchecked '
    }


    cancelService(){
        this.setState({
            isService : !this.state.isService
        })
    }

    renderServiceView() {
        if (!this.state.serviceArray || this.state.serviceArray.length === 0)return;
        var len = this.state.serviceArray.length;
        var views = [];
        for (var i = 0, l = len - 2; i < l; i += 2) {
            views.push(
                <View key={i}>
                    <View style={styles.item}>
                        {this.renderServiceChec(this.state.serviceArray[i])}
                        {this.renderServiceChec(this.state.serviceArray[i + 1])}
                    </View>
                </View>
            )
        }
        views.push(
            <View key={len - 1}>
                <View style={styles.item}>
                    {len % 2 === 0 ? this.renderServiceChec(this.state.serviceArray[len - 2]) : null}
                    {this.renderServiceChec(this.state.serviceArray[len - 1])}
                </View>
            </View>
        )
        return views;

    }
    noServiceFound(){
        return (
            <View style={{ flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                <Text> No Item Found In Your Service</Text>
            </View> 
        );
    }

    renderServiceChec(data) {
        if (!this.state.serviceArrayStatus) {
            return this.noServiceFound();
        }
        
        var leftText = data.service_name;
        return (
            <CheckBox
                style={{flex: 1, padding: 5, borderTopWidth : 1, borderColor : '#ccc'}}
                onClick={()=>this.onServiceClick(data)}
                isChecked={data.checked}
                leftText={leftText}
            />);
    }

    noItemFound(){
        return (
            <View style={{ flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                <Text> No Item Found </Text>
            </View> 
        );
    }

// Service filter complete here

    renderData(data, rowData: string, sectionID: number, rowID: number, index) {
        let color = data.special_price ? '#C5C8C9' : '#000';
        let textDecorationLine = data.special_price ? 'line-through' : 'none';
        
        let heartType

        if (data.is_wishlist === '0') {
            heartType = 'ios-heart-outline'; 
        } else {
            heartType = 'ios-heart' ;
        }
      let toggleWishList  
      if(data.is_wishlist === '0') { toggleWishList = ()=> this.addtoWishlist(data.product_id)} else { toggleWishList = ()=> this.removeToWishlist(data.product_id)}

       return (
            <View style={styles.row} > 
                <View style={{flexDirection: 'row', justifyContent: "center"}}>
                    <IconBadge
                        MainElement={ 
                            <TouchableOpacity 
                            onPress={()=>Actions.deascriptionPage({product_id : data.product_id , is_wishlist : data.is_wishlist, toggleWishList: toggleWishList})}>
                            <Image style={styles.thumb} 
                                source={{ uri : data.productImages[0] ? data.productImages[0].image : null }}/>
                                </TouchableOpacity>
                            }
                        BadgeElement={
                            <Text style={{color:'#FFFFFF', fontSize: 10, position: 'absolute'}}>{data.discount} %off</Text>
                        }
                        IconBadgeStyle={{
                            width:50,
                            height:16,
                            top : width/3-10,
                            left: 0,
                            position : 'absolute',
                            backgroundColor: '#a9d5d1'}}
                    />
                    <EvilIcons style={{ position : 'absolute', left : 0 ,backgroundColor : 'transparent'}} 
                        name="share-google" 
                        size={20} 
                        color="#a9d5d1" 
                        onPress={()=> this.sharing(data.product_id)}/>

                    <TouchableOpacity 
                    onPress={toggleWidhlist }
                    // onPress= { ()=> this.addtoWishlist(data.product_id)}
                    style={{ 
                        left : width/3-35, 
                        position : 'absolute',
                        width : 50,
                        height :50,
                        backgroundColor : 'transparent'
                    }}
                    >
                        <Ionicons  
                        name={heartType} 
                        size={20} 
                        color="#87cefa" 
                        />
                    </TouchableOpacity>
                </View>
                
                <View style={{ padding :5}}>
                <TouchableOpacity  style={styles.name} onPress={()=>Actions.deascriptionPage({ product_id : data.product_id, is_wishlist : data.is_wishlist })}>
                        <Editwish heartType={heartType} toggleWishList={toggleWishList}/>
                </TouchableOpacity>
                </View>
                
                <View style={{ padding :5}}>
                <TouchableOpacity  style={styles.name} 
                // onPress={()=>Actions.deascriptionPage({ product_id : data.product_id, is_wishlist : data.is_wishlist })}
                >

                <Text style={{fontSize : 13, color :'#000'}}>{data.product_name}</Text>
                </TouchableOpacity>
                <Text style={styles.description}>{data.short_description}</Text>
                <View style={{
                    flex: 0, 
                    flexDirection: 'row', 
                    justifyContent: 'space-between',
                    top : 5
                }}> 
                    <Text style={styles.special_price}>{data.special_price} Aed</Text>
                    <Text style={{fontSize:10, color: color, textDecorationLine: textDecorationLine}}>{data.price} Aed</Text>
                </View>
                </View>
            </View>
        );
    }
}

var styles =StyleSheet.create({
    container: {
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF'
    },
    list: {
        // borderWidth: 1, 
        // borderColor: '#CCC',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    centering: {
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    name : {
        top : 5
    },
    description : {
        fontSize : 7,
        top : 5
    },
    special_price : {
        fontSize : 10,
        fontWeight : 'bold'
    },
    footer : {
        width : width/2-20,
        alignItems : 'center',
        padding : 10,
        borderTopWidth : 0.5, 
        borderColor :'#ccc',
        borderLeftWidth : 0.5
    },
    allshop :{ 
        flex:1, 
        justifyContent : "space-around", 
        flexDirection: 'row', 
        borderWidth : 0.5, 
        borderColor: "#ccc", 
        alignItems: 'center'
    },

    row: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        width : width/3 -7,
        // padding: 5,
        margin: 3,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius : 5
    },
    button: {
        width: width/2,
        marginBottom: 10,
        padding: 10,
        alignItems: 'center',
        borderWidth : 0.5,
        borderColor : '#CCC'
    },

    thumb: {
        width: width/3-10,
        height: width/3,
        borderTopLeftRadius : 5,
        borderTopRightRadius : 5
    },

    text: {
        flex: 1,
        marginTop: 5,
        fontWeight: 'bold'
    },
});