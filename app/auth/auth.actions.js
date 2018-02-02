import {Actions as routes} from "react-native-router-flux";
import { MessageBarManager } from 'react-native-message-bar';
import Utils from 'app/common/Utils'
import { AsyncStorage } from 'react-native';

export const AUTH_LOGIN_START = 'AUTH_LOGIN_START';
export const AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS';
export const AUTH_LOGIN_FAIL = 'AUTH_LOGIN_FAIL';
export const AUTH_LOGOUT = 'AUTH_LOGOUT';

// export const login = (username, password, os) => {
// 	return dispatch => {

// 		setTimeout(() => {
// 			if (username.length && password.length) {
// 				return dispatch(loginSuccess(username, password, os));
// 			}
// 			return dispatch(loginFail(new Error('username and password fields are required')));
// 		}, Math.random() * 1000 + 500)
// 	};
// };

const loginStart = () => {
	return {
		type: AUTH_LOGIN_START
	}
};

export const login = (username, password, os) => {
		return dispatch => {
		dispatch(loginStart());

	let formData = new FormData();
	formData.append('email', String(username));
	formData.append('password', String(password)); 
	formData.append('device_type', String(os)); 
	formData.append('device_token', Math.random().toString()); 

	const config = { 
                method: 'POST', 
                headers: { 
                    'Accept': 'application/json', 
                    'Content-Type': 'multipart/form-data;',
                },
                body: formData,
            }
    fetch(Utils.gurl('login'), config) 
    .then((response) => response.json()) 
    .then((responseData) => {

    	 if (responseData.response.status) { 
    	 	AsyncStorage.setItem('data', JSON.stringify({ 
    	   		"userdetail" : { 
	           		"u_id" : responseData.response.data.u_id , 
	           		"fullname" : responseData.response.data.fullname , 
	           		"email" : responseData.response.data.email ,
	           		"phone_no" : responseData.response.data.phone_no ,
	           		"country" : responseData.response.data.country ,
	           		"address" : responseData.response.data.address ,
	           		"u_name" : responseData.response.data.is_active ,
	           		"user_type" : responseData.response.data.user_type 
            	}
        	}));
        	let usr_type = responseData.response.data.user_type
    	 	dispatch(successHome(username, password, usr_type));

         } else {
            MessageBarManager.showAlert({
            message: "invalid username and password",
            alertType: 'error',
            })
            dispatch(loginFail(new Error('Username and Password Does not matched')));
    	}
    }) 
    .catch(err => { 
    	console.log(err); 
    }) 
    .done();
	
	
};
};

const successHome = (username, password ,usr_type) => {
 	if(usr_type === "3"){
 	routes.vendortab()
 	}else{
 	 	routes.homePage();
 	 }	return {
		type: AUTH_LOGIN_SUCCESS,
		payload: {
			token: Math.random().toString(),
			user_type : usr_type,
			username,
			password
		}
	}
};

const loginFail = error => {
	return {
		type: AUTH_LOGIN_FAIL,
		payload: error,
		error: true
	}
};

export const logout = () => {
	return dispatch => {
		routes.loginPage();
		dispatch({
			type: AUTH_LOGOUT
		});
	};
};