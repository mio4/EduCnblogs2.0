import Config from '../config';
import api from '../api/api.js';
import {authData,err_info,UI} from '../config'
import * as Service from '../request/request.js'
import MyAdapter from './MyAdapter.js';
import HeaderNoBackComponent from './HeaderNoBackComponent.js';
import React, { Component} from 'react';
import {StorageKey} from '../config';
import {flatStyles} from '../styles/styles';


import {
    StyleSheet,
    Text,
    View,
    ToastAndroid,
    TouchableOpacity,
    Image,
    TextInput,
    Dimensions,
    Button,
    FlatList,
    TouchableHighlight
} from 'react-native';
import {
    StackNavigator,
    TabNavigator,
} from 'react-navigation';
const screenWidth= MyAdapter.screenWidth;
const screenHeight= MyAdapter.screenHeight;
const titleFontSize= MyAdapter.titleFontSize;
const abstractFontSize= MyAdapter.abstractFontSize;
const informationFontSize= MyAdapter.informationFontSize;
const btnFontSize= MyAdapter.btnFontSize;
export default class ClassLists extends Component{
    constructor(props){
        super(props);
        this.state={
            classes: [],
            imgs: [],
            isEmpty: true,//初始认为请求未成功，不进行渲染，以防App崩溃
        }
    }

    _isMounted;
    componentWillUnmount = ()=>{
        this._isMounted=false;
    }
	
    UpdateData = ()=>{
        this.setState({
            classes:[],
            imgs:[],
            isEmpty: true
        })
        this.componentWillMount();
    }
	
    componentWillMount=()=>{
        this._isMounted=true;
        let url = Config.ClassList;
        Service.Get(url).then((jsonData)=>{
            if(this._isMounted){
                this.setState({
                    classes: jsonData,
                })
                if(jsonData!=='rejected')
                {
                    this.setState({
                        isEmpty: false,
                    })
                }
            }
        }).then(()=>{
			global.storage.save({key : StorageKey.CLASS_EMPTY,data : this.state.isEmpty});
		})
		.then(()=>{
            let classIndexes = [];
            for(var i in this.state.classes)
            {
                classIndexes.push(i);
            }
            return promises = classIndexes.map((classIndex)=>{
				return Service.Get(Config.ClassInfo + this.state.classes[classIndex].schoolClassId)
            })
        })
        .then((promises)=>{
            Promise.all(promises).then((posts)=>{
                for(var i in posts)
                {
                    if(this._isMounted){
                    this.setState({
                        imgs: this.state.imgs.concat(posts[i].icon),
                    })}
                }
            })
        })
		.then(()=>{
			global.storage.save({key : StorageKey.CLASS_LIST,data : this.state.classes});
		})
		.then(()=>{
			global.storage.save({key : StorageKey.CLASS_LIST_IMG,data : this.state.imgs});
		})
		.catch((error) => {
            //ToastAndroid.show(err_info.NO_INTERNET,ToastAndroid.SHORT);
			
			global.storage.load({key:StorageKey.CLASS_EMPTY})
			.then((ret)=>{
				if(ret === false){
					ToastAndroid.show("have class",ToastAndroid.SHORT);
				}
				this.setState({	
					isEmpty : ret,
				})
			}).then(()=>{
				global.storage.load({key:StorageKey.CLASS_LIST_IMG})
				.then((ret)=>{
					this.setState({
						imgs : ret,
					})
				})
				.catch((err)=>{
					ToastAndroid.show("Class_IMG",ToastAndroid.SHORT);
				})
			}).then(()=>{
				global.storage.load({key:StorageKey.CLASS_LIST})
				.then((ret)=>{
					this.setState({
						classes : ret,
					})
				}).catch((err)=>{
					ToastAndroid.show("Class List",ToastAndroid.SHORT);
				})
			})
			.catch((err)=>{
				ToastAndroid.show(err_info.TIME_OUT,ToastAndroid.SHORT);
				this.props.navigation.navigate('Loginer');
			})
        });
    }
	
    render(){
		var data= [];
		if(this.state.isEmpty===false){
		for(var i in this.state.classes)
		{
			data.push({
				key: this.state.classes[i].schoolClassId,
				nameCn: this.state.classes[i].nameCn,
				universityNameCn: this.state.classes[i].universityNameCn,
				imgurl: this.state.imgs[i],
			})
		}}
		
		return (
			<View
				style= {{
					flexDirection: 'column',
					flex: 1,
					backgroundColor: 'white'
				}}
			>
			<View style= {{        
				flexDirection: 'row',  
				justifyContent:'flex-start',
				alignItems: 'center',
				backgroundColor: UI.TOP_COLOR,
				height: screenHeight/12,
				paddingLeft: 0.05*screenWidth,
			}}>
				<Text style = {{fontSize: 18, fontWeight: 'bold', color:'white'}}>班级列表</Text>
			</View>
				<View 
					style= {{        
						alignSelf: 'stretch',
						flex:1,
					}}>
					<FlatList
						onRefresh = {this.UpdateData}
						refreshing= {false}
						data={data}
						renderItem={
							({item}) =>
								<TouchableOpacity style= {flatStyles.cell}
									onPress={()=>this.props.navigation.navigate('ClassHome',{classId:item.key})}
								>
								<Image style= {{
									width: 0.1*screenHeight,
									height: 0.1*screenHeight
								}}
									source={{uri: item.imgurl}}
								/>
								<View style= {{        
									flexDirection: 'column',  
									justifyContent:'center',
									alignItems: 'flex-start',  
									alignSelf: 'stretch',                                
									marginLeft: 0.02*screenWidth,
									paddingLeft: 0.01*screenWidth,
									height: 0.1*screenHeight,
									flex:1,
								}}>
									<View
										style= {{
											flexDirection: 'row',
											justifyContent:'flex-start',
											alignItems: 'flex-start',
										}}             
									>
										<Text style= {{
											fontSize: titleFontSize-5,  
											color: 'rgb(51,51,51)',  
										}}>
											{item.universityNameCn}
										</Text>                 
									</View>
									<View style= {{        
										flexDirection: 'row',
										justifyContent:'flex-start',
										alignItems: 'flex-start',
									}}>
										<Text style= {{
											fontSize: btnFontSize+2,
											color: 'rgb(51,51,51)',  
											marginRight: 0.02*screenWidth,   
										}}>
											{item.nameCn}
										</Text>                             
									</View>
								</View>
								</TouchableOpacity>
						}
					/>
				</View>
			</View>
		);  
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
});