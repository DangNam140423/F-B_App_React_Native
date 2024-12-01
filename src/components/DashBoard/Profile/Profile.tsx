import axios from 'axios';
import { BlurView } from 'expo-blur';
import { useEffect, useRef, useState } from 'react';
import { Feather, Fontisto } from '@expo/vector-icons';
import { StyleSheet, Dimensions, View, Keyboard, TouchableWithoutFeedback, ScrollView, TextInput, FlatList, Text, Animated, Button, Image, Pressable, ImageBackground, Alert, Modal } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth, setRoute, setToken } from '../../../store/slices/appSlice';
import { unregisterIndieDevice } from 'native-notify';
import { RootState } from '../../../store/store';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import ImageView from "react-native-image-viewing";
import avatarDefault from '../../../store/avatar/avatarUser';

const { width, height } = Dimensions.get('window');



export default function Profile({ navigation }: any) {
    const dispatch = useDispatch();
    const infoUser = useSelector((state: RootState) => state.app.inforUser);
    const pushTokenRedux = useSelector((state: RootState) => state.app.pushToken);
    const zIndexAnim = useRef(new Animated.Value(-1)).current;
    const [visible, setIsVisible] = useState(false);
    const image = [
        {
            uri: infoUser.image ? infoUser.image : avatarDefault
        }
    ];


    async function save(key: string, value: string) {
        await SecureStore.setItemAsync(key, value);
    }

    const moveHome = () => {
        navigation.navigate('home');
        dispatch(setRoute('home'));
    }

    const openAvatar = () => {
        // Animated.timing(zIndexAnim, {
        //     toValue: 1,
        //     duration: 50,
        //     useNativeDriver: true,
        // }).start();
        setIsVisible(true);
    }

    const closeAvatar = () => {
        // Animated.timing(zIndexAnim, {
        //     toValue: -1,
        //     duration: 50,
        //     useNativeDriver: true,
        // }).start();
        setIsVisible(false);
    }

    return (
        <View style={styles.container}>

            <View style={{
                alignItems: 'center',
            }}>
                <View>
                    <Pressable
                        onPress={openAvatar}
                        style={{
                            borderRadius: 100,
                            borderColor: '#1b7f63',
                            borderWidth: 2,
                            padding: 3
                        }}>
                        <Image
                            // capInsets={{
                            //     bottom: 20,
                            //     left: 0,
                            //     right: 0,
                            //     top: 50
                            // }}
                            blurRadius={0}
                            style={{ height: 100, width: 100, borderRadius: 50, backgroundColor: 'white' }}
                            source={{ uri: infoUser.image ? infoUser.image : avatarDefault }}
                        />
                    </Pressable>
                    <Pressable
                        style={{
                            position: 'absolute',
                            right: -5,
                            top: -5,
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            borderRadius: 12,
                            padding: 5,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                        <Text style={{ color: 'white', fontSize: 17 }}>
                            <AntDesign name="edit" size={24} color="white" />
                        </Text>
                    </Pressable>
                </View>
                <Text style={{ fontWeight: '600', fontSize: 30, color: 'white', letterSpacing: 1.2 }}>{infoUser.fullName}</Text>
                <Text style={{ fontWeight: '300', fontSize: 17, color: 'white', letterSpacing: 1.2, marginBottom: 10 }}>{infoUser.email}</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 30, }}>
                    <Pressable style={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        paddingVertical: 10,
                        width: 150,
                        borderRadius: 12,
                        flexDirection: 'row',
                        justifyContent: 'space-evenly'
                    }}>
                        <Text style={{ color: 'white' }}> Edit Profile</Text>
                        <AntDesign name="edit" size={20} color="white" />
                    </Pressable>
                    <View
                        style={{
                            justifyContent: 'center',
                            backgroundColor: '#1b7f63',
                            padding: 10,
                            borderRadius: 12,
                            gap: 5,
                            flexDirection: 'row'
                        }}>
                        <Text>
                            {infoUser.roleId === 'R0' && 'Boss'}
                            {infoUser.roleId === 'R1' && 'Manager'}
                            {infoUser.roleId === 'R2' && 'Staff'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={{
                width: '100%',
                flexDirection: 'row',
                gap: 10,
                flexWrap: 'wrap'
            }}>
                <Pressable style={styles.itemInfo}>
                    <Text style={{ color: 'white', fontSize: 13, fontWeight: '300' }}>Name</Text>
                    <Text style={{ color: 'white', fontSize: 17 }}>{infoUser.fullName}</Text>
                </Pressable>
                <Pressable style={styles.itemInfo}>
                    <Text style={{ color: 'white', fontSize: 13, fontWeight: '300' }}>Email</Text>
                    <Text style={{ color: 'white', fontSize: 17 }}>{infoUser.email}</Text>
                </Pressable>
                <Pressable style={styles.itemInfo}>
                    {/* <AntDesign name="edit" size={20} color="white" style={styles.iconEdit} /> */}
                    <Text style={{ color: 'white', fontSize: 13, fontWeight: '300' }}>Phone</Text>
                    <Text style={{ color: infoUser.phoneNumber ? 'white' : 'grey', fontSize: 17 }}>{infoUser.phoneNumber ? infoUser.phoneNumber : 'Update'}</Text>
                </Pressable>
                <Pressable style={styles.itemInfo}>
                    <Text style={{ color: 'white', fontSize: 13, fontWeight: '300' }}>Favorite Dish</Text>
                    <Text style={{ color: 'white', fontSize: 17 }}>10</Text>
                </Pressable>
                <Pressable style={styles.itemInfo}>
                    <Text style={{ color: 'white', fontSize: 13, fontWeight: '300' }}>Age</Text>
                    <Text style={{ color: 'white', fontSize: 17 }}>21</Text>
                </Pressable>
            </View>

            <View style={styles.aboutUser}>
                <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.6)', 'white', 'rgba(255, 255, 255, 0.6)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: 4 }}
                />
                <Text style={{
                    fontSize: 30,
                    color: 'white',
                    fontWeight: '200',
                    textAlign: 'center',
                    letterSpacing: 0.5,
                    marginVertical: 10
                }}>
                    Experience unique cuisine with us
                </Text>
                <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.6)', 'white', 'rgba(255, 255, 255, 0.6)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: 4 }}
                />
            </View>

            <Animated.View
                style={[{
                    height: height,
                    width: width,
                    position: 'absolute',
                    backgroundColor: 'white',
                    zIndex: zIndexAnim,
                }]}>
            </Animated.View>
            <ImageView
                images={image}
                imageIndex={0}
                visible={visible}
                onRequestClose={closeAvatar}
                backgroundColor={infoUser.image ? 'black' : 'white'}
            />

        </View >
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: height,
        padding: 10
    },
    infoUser: {
        paddingTop: 70,
        padding: 20,
        width: width,
        height: '100%',
        position: 'absolute',
        zIndex: 2,
        gap: 30,
    },
    aboutUser: {
        width: '100%',
        position: 'absolute',
        bottom: 100
    },
    itemInfo: {
        padding: 20,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        // height: 80,
        justifyContent: 'center'
    },
    iconEdit: {
        position: 'absolute',
        right: 0,
        top: -5
    }
});
