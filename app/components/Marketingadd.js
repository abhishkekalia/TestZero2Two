import React, { Component } from 'react'
import {
    View,
    Text,
    Picker,
    Platform,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    PixelRatio,
    Button,
    AsyncStorage,
    Image,
    Alert
} from 'react-native';
 const { width, height } = Dimensions.get('window')

import {Actions as routes} from "react-native-router-flux";
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import ImagePicker from 'react-native-image-picker'
import Utils from 'app/common/Utils';
import {CirclesLoader} from 'react-native-indicator';
import Modal from 'react-native-modal';
import RNFetchBlob from 'react-native-fetch-blob';
import { MessageBar, MessageBarManager } from 'react-native-message-bar';
const videoIcon = '../images/videoIcon.png';
const INITIAL_STATE = {avatarSource: ''};
const textstring = "Upload your image into the External Circle \n" +
                    "Upload your 10 sec video into the External Circle \n" +
                    "Price: 1 KD per picture  / 1.5 KD per video"
export default class Marketingadd extends Component { 
    constructor(props) { 
        super(props);
        this.state={
            image: null,
            imageSelect : false,
            videoSelect: false,
            thumbnail_image : null,
            thumblinefiletype : null,
            fileType : null,
            avatarSource: null,
            videoSource: null ,
            thumblinename : null,
            Source : '',
            uploadFileName : '',
            u_id: null,
            ad_category : '',
            user_type : null,
            country : null,
            amount : '0',
            visibleModal: false       
        }
    }
    componentDidMount(){
        this.getKey()
        .done();
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
   
    uploadTocloud(){
        const { 
            image, 
            imageSelect , 
            imageURl , 
            avatarSource, 
            videoSelect, 
            u_id, 
            user_type, 
            country, 
            amount, 
            thumbnail_image,
            thumblinefiletype,
            fileType,
            Source,
            uploadFileName,
            thumblinename,
        } = this.state; 
        var isImage;

        if(image === 'image') { 
            isImage = "1" } else { isImage = "2"}
            
            this.setState({
                visibleModal : true
            })
            
            RNFetchBlob.fetch('POST', Utils.gurl('addMarketingAd'),{ 
                Authorization : "Bearer access-token", 
                'Accept': 'application/json',
                'Content-Type': 'application/octet-stream',
            },
            [
            { name: 'path', filename: uploadFileName, type: fileType,  data: RNFetchBlob.wrap(Source) },
            { name : 'thumbnail_image',  filename : thumblinename,  type : thumblinefiletype, data: RNFetchBlob.wrap(thumbnail_image)},
            { name : 'u_id', data: String(u_id)}, 
            { name : 'country', data: String(country)}, 
            { name : 'user_type', data: String(user_type)}, 
            { name : 'ad_type', data: String(isImage)}, 
            { name : 'ad_category', data: String(4)}, 
            { name : 'amount', data: String(amount)}, 
            ])
            .uploadProgress({ interval : 250 },(written, total) => {
            console.log('uploaded', Math.floor(written/total*100) + '%') 
            })
            .then((responseData)=>{ 
               var getdata = JSON.parse(responseData.data);
               if(getdata.status){
                    routes.myAdfaturah({ uri : getdata.data.url, ad_id : getdata.data.ad_id , amount: amount })
                    this.setState({...INITIAL_STATE,
                        visibleModal : false,
                    })
                }
            })
            .catch((errorMessage, statusCode) => {
                MessageBarManager.showAlert({
                message: "error while opload add",
                alertType: 'warning',
                })
                this.setState({
                        visibleModal : false,
                    })
            })
            .done();
    }

    SelectThumbline() {
        const options = {
            quality: 1.0,
            maxWidth: 500,
            maxHeight: 500,
            storageOptions: {
              skipBackup: true
            }
        }; 

        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response); 
            if (response.didCancel) {
            console.log('User cancelled photo picker');
            }
            else if (response.error) {
              console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
              console.log('User tapped custom button: ', response.customButton);
            }
            else {
              let source = { uri: response.uri }; 
              let path = response.uri
              let name = response.fileName
              tempImg = path.replace(/^file:\/\//, '');

                this.setState({
                    avatarSource: source,
                    thumbnail_image : tempImg,
                    thumblinefiletype : 'image/jpg',
                    imageSelect : true,
                    videoSelect : false,
                    thumblinename : name,

                },()=>this.uploadTocloud());
            }
        });
    }

    selectPhotoTapped() {
        const options = {
            quality: 1.0,
            maxWidth: 500,
            maxHeight: 500,
            storageOptions: {
              skipBackup: true
            }
        }; 

        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response); 
            if (response.didCancel) {
            console.log('User cancelled photo picker');
            }
            else if (response.error) {
              console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
              console.log('User tapped custom button: ', response.customButton);
            }
            else {
              let source = { uri: response.uri }; 
              let path = response.uri;
              let name = response.fileName;

              tempImg = path.replace(/^file:\/\//, '');
                this.setState({
                    avatarSource: source,   
                    thumbnail_image : tempImg,
                    imageSelect : true,
                    videoSelect : false,
                    image : 'image',
                    fileType : 'image/jpg',
                    thumblinefiletype : 'image/jpg',
                    Source: tempImg,
                    uploadFileName : name,
                    thumblinename : name,
                    amount : "1"
                },()=>this.uploadTocloud());
            }
        });
    }

    selectVideoTapped() { 
        const options = {
            title: 'Video Picker',
            takePhotoButtonTitle: 'Take Video...',
            mediaType: 'video',
            videoQuality: 'medium'
        };

        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);
            if (response.didCancel) {
              console.log('User cancelled video picker');
            }
            else if (response.error) {
              console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
              console.log('User tapped custom button: ', response.customButton);
            }
            else {
           
            var filename = Date.now().toString();
            let name = filename + "." + response.uri.split('.')[1];
              let path = response.uri;

                tempvideo = path.replace(/^file:\/\//, '');

              this.setState({
                videoSource: tempvideo ,
                videoSelect : true,
                imageSelect : false,
                image : 'video',
                fileType : 'video/mp4',
                uploadFileName : name ,
                Source: tempvideo,
                amount : "1.5",

              });

        Alert.alert( 
            'Select Thumbline Image', 
            'Please Select Thumbline Image',
            [{text: 'Cancel', onPress: () => this.onCancelPress(), style: 'cancel'},
            {text: 'OK', onPress: () => this.SelectThumbline()},
            ],
            { cancelable: false })
    }});
    }
onCancelPress(){

    this.setState({
        avatarSource: require('../images/videoIcon.png'),
        thumbnail_image : videoIcon,
        thumblinefiletype : 'image/png',
        imageSelect : true,
        videoSelect : false,
        thumblinename : "videoIcon.png",
    });
}
    render() {
        const { imageSelect , videoSelect} = this.state; 
        borderColorImage= imageSelect ? "#a9d5d1" : '#f53d3d'    
        borderColorVideo= videoSelect ? "#a9d5d1" : '#f53d3d'    

        return (
            <View style={[styles.container, { padding : 10}]}>
                <View style={{ 
                    flex:0.8, 
                    borderColor : '#bbb', 
                    borderWidth : StyleSheet.hairlineWidth, 
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                    padding : 10
                }}>
                    <Text style={{ textAlign: 'center'}}>Select files To upload </Text>
                        <View style={{justifyContent : "space-around",flexDirection: 'row',}}>
                        { this.state.avatarSource === null ? <Feather name="upload-cloud" size= {30} style={{padding :20 }} /> :
                            <Image style={styles.avatar} source={this.state.avatarSource} />
                        }
                        </View>
                    <Text style={{ width: width-50 ,textAlign: 'center', fontSize: 10, }}>
                    {textstring}
                    </Text>

                    <View style={{justifyContent : "space-around",flexDirection: 'row',}}>
                        <Entypo  
                            name="image" 
                            size= {30}
                            color={borderColorImage}
                            onPress={this.selectPhotoTapped.bind(this)}
                            style={{padding :20 , borderColor : "#bbb", borderWidth : StyleSheet.hairlineWidth, borderRadius : 35}} /> 
                        <Feather 
                        name="play-circle" onPress={this.selectVideoTapped.bind(this)}
                        color={borderColorVideo}
                        size= {30} 
                        style={{padding :20 , borderColor : '#bbb', borderWidth : StyleSheet.hairlineWidth, borderRadius : 35}} />
                    </View>

                </View>

                <View style={styles.cost}>
                <Text >Cost Per Advertisement</Text>
                <Text style={{color : '#a9d5d1',}}>{this.state.amount} KWD</Text>
                </View>
                <Modal isVisible={this.state.visibleModal}>
                    <View style={{alignItems : 'center', padding:10}}>
                    <CirclesLoader />
                    
                </View>
            </Modal>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        backgroundColor: 'transparent',
    },
    avatarContainer: {
        borderColor: '#9B9B9B',
        borderWidth: 1 / PixelRatio.get(),
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatar: {
        width: 70,
        height: 70
    },
    cost : {
        alignItems : 'center',
        borderColor : '#ccc',
        borderTopWidth : 1,
        borderBottomWidth : 1,
        padding : 10
    }

})