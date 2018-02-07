import React, {Component, PropTypes} from "react";
import {View, Text, StyleSheet, TouchableOpacity, AsyncStorage ,NetInfo} from "react-native";
import { Actions} from "react-native-router-flux";
import { MessageBar, MessageBarManager } from 'react-native-message-bar';

import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Utils from 'app/common/Utils';
import Marketing from '../../Vendor/marketing'
class Profile extends Component {
	constructor(props) {
        super(props);
        this.getKey = this.getKey.bind(this);        
        this.state={
        	dataSource: [],
        	status : false,
            u_id: null,
            address : [],
            country : null,
            email : null,
            phone_no : null
        };
    }
    componentwillMount(){
        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange); 

        NetInfo.isConnected.fetch().done(
            (isConnected) => { this.setState({ netStatus: isConnected }); }
            );

        NetInfo.isConnected.fetch().done((isConnected) => { 
            if (isConnected)
            {
            	console.warn('hello')
            }else{
                console.log(`is connected: ${this.state.netStatus}`);
            }
        });
    }
    componentDidMount(){
    	this.getKey()
	    .then(()=>this.getAddress())
	    .done()

        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
        NetInfo.isConnected.fetch().done((isConnected) => { 
            this.setState({ 
                netStatus: isConnected 
            }); 
        });
    }
    
    handleConnectionChange = (isConnected) => { 
        this.setState({ netStatus: isConnected }); 
        {this.state.netStatus ?  MessageBarManager.showAlert({ 
                message: `Internet connection is available`,
                alertType: 'alert',
            }) : MessageBarManager.showAlert({ 
                message: `Internet connection not available`,
                alertType: 'error',
            })
        }          
    }
    async getKey() {
        try { 
            const value = await AsyncStorage.getItem('data'); 
            var response = JSON.parse(value);

            this.setState({ 
                u_id: response.userdetail.u_id ,
                email: response.userdetail.email,
                phone_no: response.userdetail.phone_no,
                country: response.userdetail.country 
            }); 
        } catch (error) {
            console.log("Error retrieving data" + error);
        }
    }
    getAddress(){
    	const { u_id, country } = this.state;
    	let formData = new FormData();
    	formData.append('u_id', String(u_id));
    	formData.append('country', String(country)); 
    		const config = { 
               	method: 'POST', 
               	headers: { 
               		'Accept': 'application/json', 
                    'Content-Type': 'multipart/form-data;' 
                },
            	body: formData,
            }
        fetch(Utils.gurl('MyProfile'), config)  
        .then((response) => response.json())
        .then((responseData) => {
        	if(responseData.response.status){ 
        	    this.setState({ 
        	       	status : responseData.response.status,
        	       	dataSource : responseData.response.data,
        	       	address : responseData.response.address
        	        });
        	}else{
        	    this.setState({ 
        	       	status : responseData.response.status
        	    })
        	}
        })
        .done();
    }
    signOut(){
    const {identity, logout} = this.props;
// ( Utils.logout()),logout
    }

	render() {
		const {identity, logout} = this.props;
		const {data, u_id, address, dataSource} = this.state;

		return (
			<View style={{flex: 1, flexDirection: 'column'}} testID="Profile">
				<View style={[styles.content, {flexDirection : 'row', justifyContent: 'space-between' ,padding : 0}]}>
					<View style={{ flexDirection : 'row', }}>
						<View style={{ width :60, height:60, justifyContent: 'center', alignItems : 'center'}}>
							<Entypo 
							name="user" 
							size={25} 
							style={{ 
								padding :5, 
								width: 35,
								height :35,
								backgroundColor : '#ccc',
								alignItems : 'center', 
								borderRadius : 17 ,
							}}/>
						</View>

						<View style={{flexDirection : 'column'}}>
                            <Text style={[styles.label, { color : '#696969'}]}>{dataSource.fullname}</Text>
                            <Text style={[styles.label, { color : '#a9d5d1'}]}>Product Manager</Text>
                            <View style={{flexDirection:'row'}}>
                            <Text style={[styles.label, { color : '#fbcdc5'}]}> E: </Text>
                            <Text style={[styles.label, { color : '#696969'}]}>{this.state.email}</Text>
							</View>
                            <View style={{flexDirection:'row'}}>
                            <Text style={[styles.label, { color : '#fbcdc5'}]}> P: </Text>
                            <Text style={[styles.label, { color : '#a9d5d1'}]}>{dataSource.mobile}</Text>
                            </View>
						</View>
					</View>
				</View>
				
				<Marketing/>
				<TouchableOpacity 
                onPress={()=>( Utils.logout()),logout}
                style={styles.setings}>
					<Text>Logout</Text>
				</TouchableOpacity>

			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1, 
        flexDirection: 'row',
        flexWrap: 'wrap'
	},
	content: {
		borderWidth : 1,
		borderColor :'#ccc',
	},
	setings : { 
		top : 5, 
		backgroundColor : '#ccc', 
		padding : 10, 
		flexDirection: "row", 
		justifyContent: "center",
	},
	label: {
		color: '#ccc',
		fontSize: 12,
		fontStyle: 'italic'
	}
});
export default Profile;