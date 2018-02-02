import React, {Component, PropTypes} from "react";
import {View, Text, StyleSheet, TouchableOpacity, AsyncStorage } from "react-native";
import { Actions} from "react-native-router-flux";

import Entypo from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Utils from 'app/common/Utils';

class Profile extends Component {
	constructor(props) {
        super(props);
        this.getKey = this.getKey.bind(this);        
        this.state={
        	data: '',
            u_id: null,
            address : [],
            country : null,
            email : null,
            phone_no : null
        };
    }

    componentDidMount(){
	    this.getKey()
	    .then(this.getAddress())
	    .done()
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
            this.setState({ 
            	data: responseData.response.data,
            	address : responseData.response.address
            });
        })
        .done();
    }

	render() {
		const {identity, logout} = this.props;
		const {data, u_id, address} = this.state;
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
								width: 30,
								height :30,
								backgroundColor : '#ccc',
								alignItems : 'center', 
								borderRadius : 30 ,
								// borderWidth:1
							}}/>
						</View>

						<View style={{flexDirection : 'column'}}>
							<Text style={[styles.label, { color : '#ccc'}]}>{identity.username}</Text>
							<Text style={[styles.label, { color : '#ccc'}]}>{this.state.email}</Text>
							<Text style={[styles.label, { color : '#ff6347'}]}>Contact: {this.state.phone_no}</Text>
						</View>
					</View>

					<TouchableOpacity style={{width :60, height:60, justifyContent: 'center', alignItems : 'center' }} onPress={()=> Actions.newaddress()} >
						<Entypo name="edit" size={25} color="#87cefa"/>
					</TouchableOpacity >
				</View>
				
				<View style={[styles.content, {flexDirection : 'row', justifyContent: 'space-between' ,padding : 0}]}>

					<View style={{ padding : 20, backgroundColor : '#fff', flex : 1}}>
						<TouchableOpacity style={{ flexDirection : 'row', justifyContent: 'space-between', paddingRight:10, paddingLeft:10,  }}  onPress={()=>Actions.getmyaddress()} >
							<Text style={{ fontSize : 10, color:"#900"}}>My Address Book</Text>
								<TouchableOpacity style={{ justifyContent: 'center', alignItems : 'center' }} 
								>
									<Ionicons name="ios-arrow-forward" size={25} color="#ccc"/>
								</TouchableOpacity >
						</TouchableOpacity>
					
					<Text style={{ fontSize: 15}}>
					{address.full_name}
					</Text>
					<Text style={{ fontSize : 10}}>
					M:{address.mobile_number}
					</Text>
					<Text style={{fontSize:12}}>
					{[address.address_line1, ' ', address.address_line2, ' ', address.landmark ,' ', address.town,' ',address.city, ' ', address.state, '(', address.pincode, ')']}
					</Text>
				</View>
				</View>
				<TouchableOpacity onPress={()=>Actions.settings()} style={styles.setings}>
					<Text>Settings</Text>
					<Ionicons name="ios-arrow-forward" size={25} color="#ccc"/>
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
		backgroundColor : '#fff', 
		padding : 10, 
		flexDirection: "row", 
		justifyContent: "space-between"
	},
	label: {
		color: '#ccc',
		fontSize: 12,
		fontStyle: 'italic'
	}
});
export default Profile;