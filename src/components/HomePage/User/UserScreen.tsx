import axios from 'axios';
import { BlurView } from 'expo-blur';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Entypo, Feather, Fontisto } from '@expo/vector-icons';
import { StyleSheet, Dimensions, View, Keyboard, TouchableWithoutFeedback, ScrollView, TextInput, FlatList, Text, Animated, Button, Image, Pressable, ImageBackground, Alert, Modal, Platform } from 'react-native';
import BoxFriend from '../BoxFriend/BoxFriend';
import * as SecureStore from 'expo-secure-store';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth, setInfoUser, setRoute, setToken } from '../../../store/slices/appSlice';
import { unregisterIndieDevice } from 'native-notify';
import { RootState } from '../../../store/store';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurGradientDemo } from './BlurGradientDemo1';
import { StatusBar } from 'expo-status-bar';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import ImageView from "react-native-image-viewing";
import ListTicketScreen from '../Ticket/ListTicketScreen';
import avatarDefault from '../../../store/avatar/avatarUser';
import saveToken from '../../../store/token/savetoken';

const { width, height } = Dimensions.get('window');



export default function UserScreen({ navigation }: any) {
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.app.token);
    const infoUser = useSelector((state: RootState) => state.app.inforUser);
    const pushTokenRedux = useSelector((state: RootState) => state.app.pushToken);
    const zIndexAnim = useRef(new Animated.Value(-1)).current;
    const zIndexAnim2 = useRef(new Animated.Value(-1)).current;
    const [visible, setIsVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const [isUpdateProfile, setIsUpdateProfile] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const [fullname, setFullname] = useState("");
    const [phonenumber, setPhonenumber] = useState("");
    const [avatar, setAvatar] = useState<any>(null);

    const image = [
        {
            uri: infoUser.image ? infoUser.image : avatarDefault
        }
    ];

    useEffect(() => {
        setFullname(infoUser.fullName);
        setPhonenumber(infoUser.phoneNumber);
    }, [isUpdateProfile]);

    async function save(key: string, value: string) {
        await SecureStore.setItemAsync(key, value);
    }

    const handleLogout = async () => {
        // Hiển thị Alert để xác nhận người dùng có chắc chắn muốn đăng xuất không
        Alert.alert(
            "Confirm Logout", // Tiêu đề của Alert
            "Are you sure you want to log out?", // Nội dung câu hỏi
            [
                {
                    text: "Cancel", // Nút hủy bỏ
                    // onPress: () => console.log("Logout Cancelled"), // Hành động khi chọn hủy
                    style: "cancel"
                },
                {
                    text: "Logout", // Nút đăng xuất
                    onPress: async () => {
                        await axios.post(`http://192.168.1.84:3000/api/logout`,
                            {
                                idUser: infoUser.idUser,
                                tokenDevice: pushTokenRedux
                            });

                        await save("token", "");
                        // if (infoUser.roleId === 'R3') {
                        //     await unregisterIndieDevice(infoUser.email, 23684, 'Wuaq0f7zMq3lJxql3cEVrq');
                        // } else if (['R0', 'R1', 'R2'].includes(infoUser.roleId)) {
                        //     await unregisterIndieDevice('R0', 23684, 'Wuaq0f7zMq3lJxql3cEVrq');
                        // }
                        dispatch(setRoute("home"));
                        dispatch(setAuth(false));
                        dispatch(setToken(""));
                    }
                }
            ],
            { cancelable: true } // Có thể hủy bằng cách nhấn ra ngoài Alert
        );
    };

    const moveHome = () => {
        navigation.navigate('home');
        dispatch(setRoute('home'));
    }

    const openAvatar = () => {
        setIsVisible(true);
    }

    const closeAvatar = () => {
        setIsVisible(false);
    }

    const closeModal = () => {
        setModalVisible(false);
    }

    // useEffect(() => {
    //     if (inputRef.current && isUpdateProfile) {
    //         inputRef.current.focus();
    //     } else {
    //         inputRef.current?.blur();
    //     }
    // }, [isUpdateProfile]);

    // console.log("cehck", inputRef.current?.isFocused());

    const changeTextInput = async (value: string, id: string) => {
        if (id === 'fullname') {
            setFullname(value);
        } else if (id === 'phonenumber') {
            setPhonenumber(value);
        }
    };

    const handleUpdateProfile = async () => {
        if (fullname !== infoUser.fullName || phonenumber !== infoUser.phoneNumber) {
            await axios.put(`http://192.168.1.84:3000/api/user/update-profile`,
                {
                    id: infoUser.idUser,
                    fullname: fullname,
                    phonenumber: phonenumber
                },
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(function (response) {
                    if (response.data.errCode === 0) {
                        dispatch(setInfoUser(
                            {
                                idUser: infoUser.idUser,
                                fullName: fullname,
                                phoneNumber: phonenumber,
                                email: infoUser.email,
                                roleId: infoUser.roleId,
                                image: infoUser.image,
                            }
                        ))
                    } else {
                        alert(response.data.errMessage);
                    }
                })
                .catch(async function (error) {
                    console.log(error);
                    if (error.response && [401, 403].includes(error.response.status)) {
                        await saveToken("token", "");
                        dispatch(setAuth(false));
                    } else {
                        console.log(error);
                    }
                })
                .finally(function () {
                });
        }
        setIsUpdateProfile(false);
    }



    return (
        <View style={styles.container}>
            <BlurGradientDemo />
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    setModalVisible(!modalVisible);
                }}>
                <ListTicketScreen closeModal={closeModal} />
            </Modal>
            <TouchableWithoutFeedback
                onPress={() => Keyboard.dismiss()}>
                <LinearGradient
                    colors={['transparent', 'transparent',]}
                    start={{ x: 0, y: 0.4 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.infoUser}
                >
                    <View style={{
                        width: width,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        position: 'absolute',
                        top: 50,
                        paddingHorizontal: 10,
                    }}>
                        <Pressable
                            onPress={moveHome}
                            style={{
                                borderRadius: 12,
                                flexDirection: 'row',
                                justifyContent: 'space-evenly'
                            }}>
                            <Ionicons name="chevron-back" size={30} color="white" />
                        </Pressable>

                        <Pressable
                            style={{
                                justifyContent: 'center',
                                borderRadius: 12,
                                gap: 5,
                                flexDirection: 'row'
                            }}>
                            <Feather name="settings" size={30} color="white" />
                        </Pressable>
                    </View>
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
                                    style={{ height: 100, width: 100, borderRadius: 50 }}
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
                            <Pressable
                                onPress={() => setIsUpdateProfile(!isUpdateProfile)}
                                style={{
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    paddingVertical: 10,
                                    width: 150,
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    justifyContent: 'space-evenly'
                                }}>
                                <Text style={{ color: 'white' }}>{isUpdateProfile ? 'Close Edit' : 'Edit Profile'}</Text>
                                <AntDesign name={isUpdateProfile ? "close" : "edit"} size={20} color="white" />
                            </Pressable>

                            {isUpdateProfile &&
                                <Pressable
                                    style={{
                                        justifyContent: 'center',
                                        backgroundColor: '#1b7f63',
                                        padding: 10,
                                        borderRadius: 12,
                                        gap: 5,
                                        flexDirection: 'row'
                                    }}
                                    onPress={handleUpdateProfile}>
                                    <Entypo name="save" size={24} color="white" />
                                </Pressable>
                            }

                            <Pressable
                                style={{
                                    justifyContent: 'center',
                                    backgroundColor: '#1b7f63',
                                    padding: 10,
                                    borderRadius: 12,
                                    gap: 5,
                                    flexDirection: 'row'
                                }}
                                onPress={handleLogout}>
                                <AntDesign name="logout" size={20} color="white" />
                            </Pressable>
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
                            <TextInput editable={isUpdateProfile} value={fullname}
                                ref={inputRef}
                                onChangeText={(event) => { changeTextInput(event, 'fullname') }}
                                style={{
                                    color: 'white',
                                    fontSize: 17,
                                    paddingVertical: 5, paddingRight: 5,
                                    borderWidth: 1,
                                    borderColor: 'transparent',
                                    borderBottomColor: isUpdateProfile ? 'white' : 'transparent'
                                }}
                            />
                        </Pressable>
                        <Pressable style={styles.itemInfo}>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: '300' }}>Email</Text>
                            <Text style={{ color: 'white', fontSize: 17 }}>{infoUser.email}</Text>
                        </Pressable>
                        <Pressable style={styles.itemInfo}>
                            {/* <AntDesign name="edit" size={20} color="white" style={styles.iconEdit} /> */}
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: '300' }}>Phone</Text>
                            {infoUser.phoneNumber
                                ?
                                <TextInput editable={isUpdateProfile}
                                    value={phonenumber}
                                    inputMode="numeric"
                                    onChangeText={(event) => { changeTextInput(event, 'phonenumber') }}
                                    style={{
                                        color: 'white',
                                        fontSize: 17,
                                        paddingVertical: 5, paddingRight: 5,
                                        borderWidth: 1,
                                        borderColor: 'transparent',
                                        borderBottomColor: isUpdateProfile ? 'white' : 'transparent'
                                    }}
                                />
                                :
                                <Text style={{ color: 'grey', fontSize: 17 }}>Update</Text>
                            }
                        </Pressable>
                        <Pressable style={styles.itemInfo}>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: '300' }}>Favorite Dish</Text>
                            <Text style={{ color: 'white', fontSize: 17 }}>10</Text>
                        </Pressable>
                        <Pressable style={styles.itemInfo}>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: '300' }}>Age</Text>
                            <Text style={{ color: 'white', fontSize: 17 }}>21</Text>
                        </Pressable>
                        <Pressable style={[styles.itemInfo, { flexDirection: 'row', gap: 7, alignItems: 'center' }]} onPress={() => {
                            setModalVisible(true);
                        }}>
                            <Fontisto name="ticket-alt" size={20} color="#1b7f63" />
                            <Text style={{ color: '#1b7f63', fontSize: 17, fontWeight: '500' }}>My Ticket</Text>
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
                </LinearGradient>
            </TouchableWithoutFeedback>


            {/* <Animated.View
                style={[StyleSheet.absoluteFill, {
                    zIndex: zIndexAnim,
                    backgroundColor: 'black'
                }]}>
            </Animated.View>
            <Animated.View
                style={[StyleSheet.absoluteFill, {
                    zIndex: zIndexAnim2,
                    backgroundColor: '#1b7f63'
                }]}>
            </Animated.View> */}
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
        height: height
    },
    infoUser: {
        paddingTop: 70,
        padding: 20,
        width: width,
        height: '100%',
        position: 'absolute',
        zIndex: 2,
        gap: 30
    },
    aboutUser: {
        width: '100%'
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
