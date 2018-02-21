import React, {Component, PropTypes} from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Button,
	Switch,
	ScrollView,
	Platform,
	Keyboard,
	Dimensions,
	Image,
	// Picker,
	StyleSheet
} from "react-native";
import {Loader} from "app/common/components";
import commonStyles from "app/common/styles";
import {Actions as routes} from "react-native-router-flux";
import Ionicons from 'react-native-vector-icons/MaterialCommunityIcons';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SegmentedControls } from 'react-native-radio-buttons';
import Utils from 'app/common/Utils';
import { MessageBar, MessageBarManager } from 'react-native-message-bar';
import { Picker } from 'react-native-picker-dropdown';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ActionSheet from 'react-native-actionsheet';
const CANCEL_INDEX = 0;
const DESTRUCTIVE_INDEX = 0

const countryTitle = 'Select Country'

const { width, height } = Dimensions.get('window')

const INITIAL_STATE = {
	fullname: '',
	email: '',
	password: '',
	gender : '',
	contact: '',
	country: '',
	address: ''
};
const options = [
	{ label:'Male', value: 'male' },
    { label:'Female', value: 'female'},
    { label:'Other', value: 'other' }];

class Register extends Component {

	constructor(props) {
		super(props);
		this.toggleSwitch = this.toggleSwitch.bind(this);
	    this.focusNextField = this.focusNextField.bind(this);
    	this.state = {
            userTypes: [],
            termsandcondition_title:'',
			termsandcondition_description:'',
            selectCountry: '',
			fullname: '',
			email: '',
			password: '',
			gender : '',
			contact: '',
			country: '',
			address: '',
			gender : '',
			hidden : true,
			userType : null,
			type : '2',
			os : (Platform.OS === 'ios') ? 2 : 1,
			countries: ["0"],
		};
	    this.inputs = {};
		this.showCountrysheet = this.showCountrysheet.bind(this)
		this.handlePress = this.handlePress.bind(this)
	}
	
	componentDidMount(){
        this.fetchData();
        this.gettermandcondition()

    }

    focusNextField(id) {
    	this.inputs[id].focus();
    }

    eye() {
    	this.setState({
    		hidden : !this.state.hidden
    	})
    }
    gettermandcondition(){
        fetch(Utils.gurl('gettermandcondition'),{
             method: "GET", headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then((response) => response.json())
        .then((responseData) => {
        	if (responseData.status) {
            	this.setState({
            	    termsandcondition_title: responseData.data.termsandcondition_title,
            	    termsandcondition_description: responseData.data.termsandcondition_description,
            	     loaded: true
        		});
        	}
		})
		.catch((error) => {
            console.log(error);
        }).done();
    }


    fetchData(){
        fetch(Utils.gurl('countryList'),{
             method: "GET", headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then((response) => response.json())
        .then((responseData) => {
			console.log("CountryList:=-",responseData.response.data)
			var data = responseData.response.data,
                    length = data.length,
                    optionsList= []
                    optionsList.push('Cancel');

                    for(var i=0; i < length; i++) {
                        order = data[i];
                        // console.warn(order);
                        country_name = order.country_name;
                        optionsList.push(country_name);
                    }
            this.setState({
                userTypes: responseData.response.data,
				 loaded: true,
				 countries: optionsList
        });
		})
		.catch((error) => {
            console.log(error);
        }).done();
    }

	toggleSwitch() {
	 	this.setState({ showPassword: !this.state.showPassword });
	 }
	 setSelectedOption(option){
     	this.setState({
        	gender: option,
      	});
    }
    loadUserTypes() {
        return this.state.userTypes.map(user => (
            <Picker.Item key={user.country_id} label={user.country_name} value={user.country_id} />
        ))
	}
	showCountrysheet() {
		this.countrySheet.show()
	  }
	handlePress(i) {
		console.log('handlePress:=',i)
		// const { userTypes , countries} = this.state;
		// this.handlePress[]
		
		if(i === 0){
			this.setState({
				selectCountry: '',
				// deliveryareas: ["cancel","Select Country First"],
		})
		}else{
			console.log("userTypes:=",this.state.userTypes[i-1].country_id)
		// console.log("countries:=",countries[i])
		  this.setState({
			selectCountry: this.state.userTypes[i-1].country_id.toString()
		  })
	
		//   data = userTypes.filter((item)=>{
		// 	return item.country_name == countries[i];
		//   }).map((item)=>{
		// 	// delete item.country_name;
		// 	return item;
		//   });
		}
	
		//   var source_data = data[0].city,
		// 		length = data[0].city.length,
		// 		city_list= []
	
		// 		city_list.push('Cancel');
		// 		for(var i=0; i < length; i++) {
		// 			order = source_data[i];
		// 			// console.warn(order);
		// 			city_name = order.city_name;
		// 			city_list.push(city_name);
		// 		}
	
		// 		this.setState({
		// 		  deliveryareas: city_list
		// 		})}
	
	  }
	render() {
		        let icon = this.state.hidden ? 'checkbox-blank-outline' : 'checkbox-marked' ;
				// let icon = this.state.hidden ? 'ios-eye' : 'ios-eye-off';
				
				var selCountryObj = null
				for (let index = 0; index < this.state.userTypes.length; index++) {
					let element = this.state.userTypes[index];
					if (element.country_id == this.state.selectCountry) {
						selCountryObj = element
					}
				}

		const {errorStatus, loading} = this.props;
		const resizeMode = 'center';
		return (
			<ScrollView style={[ commonStyles.content,{marginTop:0,marginBottom:0,paddingTop:20,paddingBottom:20}]} testID="Login" keyboardShouldPersistTaps={'handled'}>
				<View style ={[commonStyles.registerContent, {marginBottom : 10, borderColor:'#fbcdc5'}]}>
					<View style ={commonStyles.iconusername}>

						<TextInput
							style={[commonStyles.inputusername, { borderTopLeftRadius : 10, borderTopRightRadius:10, height:40}]}
							value={this.state.fullname}
							underlineColorAndroid = 'transparent'
							autoCorrect={false}
							placeholder="Fullname"
							maxLength={140}
          					onSubmitEditing={() => {
          						this.focusNextField('two');
          					}}
          					returnKeyType={ "next" }
 					        ref={ input => {
 					        	this.inputs['one'] = input;
 					        }}

							onChangeText={(fullname) => this.setState({fullname})}
						/>
					</View>

					<View style ={commonStyles.iconusername}>

						<TextInput
							style={[commonStyles.inputpassword,{ height:40}]}
							value={this.state.email}
							underlineColorAndroid = 'transparent'
							autoCorrect={false}
							placeholder="Email Address"
							maxLength={140}
          					onSubmitEditing={() => {
          						this.focusNextField('three');
          					}}
          					returnKeyType={ "next" }
 					        ref={ input => {
 					        	this.inputs['two'] = input;
							 }}
							 keyboardType = {"email-address"}
							onChangeText={(email) => this.setState({email})}
						/>
					</View>
					<View style ={[commonStyles.iconusername, { alignItems: 'center'}]}>

						<TextInput
							style={[commonStyles.inputpassword,{height:40}]}
                           	secureTextEntry={this.state.hidden}
                           	value={this.state.password}
							underlineColorAndroid = 'transparent'
							autoCorrect={false}
							placeholder="Password"
							maxLength={140}
          					onSubmitEditing={() => {
          						this.focusNextField('four');
          					}}
          					returnKeyType={ "next" }
 					        ref={ input => {
 					        	this.inputs['three'] = input;
 					        }}
 					        onChangeText={ (password) => this.setState({ password }) }
						/>

					</View>
					<TouchableOpacity style ={[commonStyles.show, { flexDirection: 'row', alignItems: 'center',borderBottomColor:'#fbcdc5'}]} onPress={()=> this.eye()}>
							<Icon name= {icon} size={25} style={{ right : 20}}/>
							<Text>Show Password </Text>
					</TouchableOpacity>

 				<View style={{borderBottomWidth: 0.5, borderColor: '#fbcdc5'}}>
 				        			<Text/>

        			<SegmentedControls
        			  	tint= {'#a9d5d1'}
        			  	selectedTint= {'white'}
        			  	backTint= {'#fff'}
        			  	optionStyle= {{
        			    fontSize: 12,
        			    fontWeight: 'bold',
        			    fontFamily: 'Snell Roundhand'
        			  }}
        			  containerStyle= {{
        			    marginLeft: 10,
        			    marginRight: 10,
        			  }}
        			  options={ options }
        			  onSelection={ this.setSelectedOption.bind(this) }
        			  selectedOption={ this.state.gender }
        			  extractText={ (option) => option.label }
        			  testOptionEqual={ (a, b) => {
        			    if (!a || !b) {
        			      return false;
        			    }
        			    return a.label === b.label
        			  }}
        			/>
        			<Text/>
     			</View>

				<View style ={commonStyles.iconusername}>

						<TextInput
							style={[commonStyles.inputusername,{height:40}]}
							value={this.state.contact}
							underlineColorAndroid = 'transparent'
							autoCorrect={false}
							placeholder="Mobile Number For (Order Update)"
							maxLength={140}
							keyboardType={'numeric'}
          					onSubmitEditing={() => {
          						this.focusNextField('five');
          					}}
          					returnKeyType={ "next" }
 					        ref={ input => {
 					        	this.inputs['four'] = input;
 					        }}
 					        onChangeText={(contact) => this.setState({contact})}
						/>
					</View>

					<TouchableOpacity onPress={this.showCountrysheet} style={[commonStyles.iconusername, {
					        				flexDirection: 'row',
					        				justifyContent: 'space-between',
					        				alignItems: 'center' ,
											marginBottom : 5,
											paddingLeft:5,
											height:40,
											overflow:'hidden'
					        					}]}>
					{/* <View style={{flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center' ,
		marginLeft: 5,
	}}
		>					 */}

						
						
						{!this.state.selectCountry? undefined: <Image style={{height:40, width:40}}
						resizeMode = 'center'
						resizeMethod = 'resize'
						source={{uri : selCountryObj ? selCountryObj.flag : "" }}
						onLoadEnd={() => {  }}
						/>
						}
						<Text style={{ }} >{this.state.selectCountry? selCountryObj.country_name  : this.state.selectCountry }</Text>
						<FontAwesome
                            name="chevron-down"
                            size={20}
                            color="#000"
                            style={{padding:5, marginRight:5}}/>
						{/* <Picker
							style=
							{{
								width: !this.state.selectCountry? width-50 : width-100, // width-50, 
								height: 40, 
								position:'relative', 
								zIndex:999
							}}
                            mode="dropdown"
                            selectedValue={this.state.selectCountry}
							onValueChange={(itemValue, itemIndex) =>
							// console.log("(itemValue, itemIndex):=",itemValue,itemIndex)
							this.setState({
								selectCountry: itemValue
							})
						}
						>
							
							{this.loadUserTypes()}

                            </Picker> */}

							{!this.state.selectCountry? <Text style={{position:'absolute', marginLeft:10, fontSize:12}} onPress={()=>console.log("echo")}>Select Country</Text>: undefined}

						</TouchableOpacity>
						{/* </View> */}

						{/* <TouchableOpacity onPress={this.showCountrysheet} style={[commonStyles.iconusername, {
					        				flexDirection: 'row',
					        				justifyContent: 'space-between',
					        				alignItems: 'center' ,
											marginBottom : 5,
											paddingLeft:5
					        					}]}>
                        <View style={styles.countryIcon}>
                        <Image
                        style={{
                            resizeMode,
                            width : 25,
                            height : 25,
                        }}
                        resizeMode = 'cover'
                        source={require('../images/country_icon.png')} />
                        </View>
                        <Text style={{width: width/2, color: "#a9d5d1"}}>{ this.state.selectCountry ? this.state.countries[this.state.selectCountry] : countryTitle}</Text>
                        <FontAwesome
                            name="chevron-down"
                            size={20}
                            color="#FFCC7D"
                            style={{padding:5}}/>

                        </TouchableOpacity> */}

							<ActionSheet
                        ref={o => this.countrySheet = o}
                        // title={!this.state.selectCountry? this.state.selectCountry : selCountryObj.country_name  }
                        options={this.state.countries}
                        cancelButtonIndex={CANCEL_INDEX}
                        // destructiveButtonIndex={DESTRUCTIVE_INDEX}
                        onPress={this.handlePress}/>

					<View style={[{
					flexDirection: 'row',
					// justifyContent: 'center',
					// alignItems: 'center' ,
						}]}>
						<TextInput
    						style={[commonStyles.inputpassword,{height:40}] }
							value={this.state.address}
							underlineColorAndroid = 'transparent'
							autoCorrect={false}
							placeholder="Address"
							maxLength={140}
          					returnKeyType={ "done" }
 					        ref={ input => {
 					        	this.inputs['five'] = input;
 					        }}
							onChangeText={(address) => this.setState({address})}
						/>
					</View>

				</View>
				{/* <Button
				onPress = {this.onSubmit.bind(this)}
  				title="Create Acount"
  				color="orange"
  				/> */}
				  <TouchableOpacity style ={{justifyContent: 'center', alignItems: 'center', padding: 10, borderColor: '#ccc', flexDirection: 'row', alignItems: 'center', padding:0}} onPress={this.onSubmit.bind(this)}>
					<View style={{backgroundColor:"#FFCC7D", width:'100%', height:40, alignItems: 'center', justifyContent:'center', borderRadius:5}}>
							 <Text style = {{color:"#FFFFFF"}}>Create An Acount</Text>
					</View>
				</TouchableOpacity>

  				<View style={{flexDirection : 'column', alignItems : 'center', flex: 1}}>
  					<TouchableOpacity style={{padding :20}}
  					onPress={()=> routes.registerVendor()}>
  					<Text >If you are vendor ? Register Here</Text>
  					</TouchableOpacity>
  					{/* <Text style={{ padding : 20}}>By Signing in You are agreeing to Our </Text>

  					<TouchableOpacity
  					onPress={()=> routes.terms({
  						title: this.state.termsandcondition_title,
  						description: this.state.termsandcondition_description
  					})}>
  					<Text> Terms and
  					Conditions of Use and Privacy Policy</Text>
					  </TouchableOpacity> */}

					<View style={{
						flex: 1,
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						marginTop:20
					}}>
						<Text style={{ fontSize : 12, width : '80%',}}>
						By Signing in you are agreeing to our
						</Text>
						<View style={{flexDirection:'row'}}>
						<TouchableOpacity
						onPress={()=> routes.terms({
							title: this.state.termsandcondition_title,
							description: this.state.termsandcondition_description
						})}>
						<Text style={{color :'#a9d5d1', fontSize : 12, }}>
						terms and conditions
						</Text>
						</TouchableOpacity>
						<Text style={{color :'black', fontSize : 12, }}> of use and </Text>
						<TouchableOpacity
						onPress={()=> routes.terms({
							title: this.state.termsandcondition_title,
							description: this.state.termsandcondition_description
						})}>
						<Text style={{color :'#fbcdc5', fontSize : 12, }}>
						Privacy Policy
						</Text>
						</TouchableOpacity>
					</View>
			</View>
			<View style={{height:40,width:'100%'}}></View>
  			</View>

			<KeyboardSpacer/>
			</ScrollView>
		);
	}

validate(){
	const {fullname, email, password, gender, contact, selectCountry, os, address, type } = this.state;
	if (!fullname.length){
		MessageBarManager.showAlert({
            message: "Plese Enter Your Fullname",
			alertType: 'alert',
			title:''
        	})
		return false
	}

	let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
	if(reg.test(email) === false)
		{
		MessageBarManager.showAlert({
           message: "Plese Enter Valid Email",
		   alertType: 'alert',
		   title:''
         })
		return false;
	}

	if (!password.length){
		MessageBarManager.showAlert({
            message: "Plese Enter Your Password",
			alertType: 'alert',
			title:''
        	})
		return false
	}
	if( gender.value === undefined){
		MessageBarManager.showAlert({
           message: "Plese Select Gender",
		   alertType: 'alert',
		   title:''
         })
		return false;
	}
	if (!contact.length){
		MessageBarManager.showAlert({
            message: "Plese Enter Your Contact Number",
            alertType: 'alert',
        	})
		return false
	}
	if (!selectCountry.length){
		MessageBarManager.showAlert({
            message: "Plese Select Country",
			alertType: 'alert',
			title:''
        	})
		return false
	}
	if (!address.length){
		MessageBarManager.showAlert({
            message: "Plese Enter Address",
			alertType: 'alert',
			title:''
        	})
		return false
	}
	if (!type.length){
		MessageBarManager.showAlert({
            message: "Plese Select User Type",
			alertType: 'alert',
			title:''
        	})
		return false;
	}
		return true;
}

onSubmit() {
		Keyboard.dismiss();

		const {fullname, email, password, gender, contact, selectCountry, os, address, type } = this.state;

			let formData = new FormData();
			formData.append('fullname', String(fullname));
			formData.append('email', String(email));
			formData.append('password', String(password));
			formData.append('gender', String(gender.value));
			formData.append('country', String(selectCountry));
			formData.append('user_type', String(type));
			formData.append('device_type', String(os));
			formData.append('device_token', String('ADFCVNGWRETUOP'));
			formData.append('phone_no', String(contact));
			formData.append('address', String(address));
			formData.append('representative_name', String('Ankita'));
			formData.append('facebook_id', String('sdfs'));
			formData.append('twitter_id', String('fsdfsd'));
			formData.append('instagram_id', String('sdfsdf'));
			formData.append('snapchat_id', String('dfdsf'));
			// formData.append('card_number', String('343454645664'));
			// formData.append('expiry_month', String('3'));
			// formData.append('expiry_year', String('20'));
			// formData.append('cvv', String('456'));
		if(this.validate()) {
		this.setState({...INITIAL_STATE, loading: true});

			const config = {
	                method: 'POST',
	                headers: {
	                    'Accept': 'application/json',
	                    'Content-Type': 'multipart/form-data;',
	                },
	                body: formData,
	            }

		fetch(Utils.gurl('register'), config)
	    .then((response) => response.json())
	    .then((responseData) => {
	        console.warn(JSON.stringify(responseData));

	    	routes.loginPage()
	    	MessageBarManager.showAlert({
            message: "Congratulations You Are Successfully Registered ",
            alertType: 'alert',
        	})
	    })
	    .catch(err => {
	    	console.log(err);
	    })
	    .done();

		}
	}
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        // justifyContent : 'center',
        alignItems:'center',
        backgroundColor:'transparent',
        paddingTop:20
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#fbcdc5',
        // justifyContent: 'center',
        alignItems: 'center' ,
        backgroundColor: '#F6F6F6',
        marginBottom : 10
    },

    countryIcon: {
        borderRightWidth: 1,
        borderColor: '#fbcdc5',
        width : 40,
        height:40,
        marginLeft :10,
        marginRight :10,
        paddingTop :5,
        justifyContent :'center',
        alignItems : 'center'
    },
    centering : {
        flex : 1,
        justifyContent  :'center',
        alignItems : 'center'
    }
});

export default Register;
