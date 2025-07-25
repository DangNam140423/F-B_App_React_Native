import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Dimensions, Text, View, Keyboard, TouchableWithoutFeedback, Button, ScrollView, FlatList, Pressable, Alert, Image, Animated, TextInput, ImageBackground, Modal, Easing } from 'react-native';
import axios from 'axios';
import HeaderHome from './HeaderHome';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth, setRoute, setToken } from '../../../store/slices/appSlice';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { RootState } from '../../../store/store';
import TrendFood from './TrendFood';
import { REACT_APP_BACKEND_URL } from '@env';
import { unregisterIndieDevice } from 'native-notify';
import ImageFuFu from '../Booking/ImageFuFu';
import SpaceFuFu from './SpaceFuFu';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import SVG_FuFu from '../../../store/logo/logo_fufu_svg';
import SVG_AI from '../../../store/logo/logo_ai';
import ChatYesil from './ChatYesil';
import { REACT_APP_JWT_SECRET, REACT_APP_IP } from '@env';
const { width, height } = Dimensions.get('window');

interface objectCategory {
    keyMap: string,
    valueVi: string,
    valueEn: string,
    image: string,
    countDish: number
}

interface objectMenu {
    name: string,
    many_sizes: boolean,
    price_S: number,
    price_M: number,
    price_L: number,
    category: string,
    description: string,
    image: string,
    categoryData: {
        keyMap: string,
        valueVi: string,
        valueEn: string,
        image: string
    }
}

async function saveToken(key: string, value: string) {
    await SecureStore.setItemAsync(key, value);
}

export default function HomeScreen({ navigation }: any) {
    const boxCall = useRef(new Animated.Value(0)).current;
    const iconCall = useRef(new Animated.Value(100)).current;
    const circleChatBot = useRef(new Animated.Value(0)).current;
    const spin = circleChatBot.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });


    const dispatch = useDispatch();
    const [category, setCategory] = useState<objectCategory[]>([]);
    const token = useSelector((state: RootState) => state.app.token);
    const [arrMenu, setArrMenu] = useState<objectMenu[]>([]);
    const infoUser = useSelector((state: RootState) => state.app.inforUser);
    const [loaded, setLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    useEffect(() => {
        Animated.loop(
            Animated.timing(
                circleChatBot,
                {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.linear,
                    useNativeDriver: true
                }
            )
        ).start();
    }, []);

    useEffect(() => {
        const getCategory = async () => {
            await axios.get(`http://192.168.142.61:3000/api/get-all-code?type=DISHES_CATEGORY`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(function (response) {
                    setCategory(response.data.data);
                })
                .catch(async function (error) {
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
        getCategory();
    }, [token]);

    useEffect(() => {
        const getMenu = async () => {
            await axios.get(`http://192.168.142.61:3000/api/user/get-all-menu?category=ALL`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(function (response) {
                    setArrMenu(response.data.menus);
                })
                .catch(async function (error) {
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
        getMenu();
    }, [token]);

    useEffect(() => {
        if (category.length > 0) {
            category.map(item => {
                const countDish = arrMenu.filter(menu => menu.category === item.keyMap).length; // Đếm số món trong category
                item.countDish = countDish;
                return item;
            })
            setCategory(category);
        }
    });

    const moveMenu = (item: objectCategory) => {
        navigation.navigate('menu', {
            categoryProps: item,
        });
        dispatch(setRoute('menu'));
    }

    const openPhone = () => {
        Linking.openURL(`tel:${'0934528450'}`);
    }

    const moveBox = () => {
        Animated.timing(boxCall, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
        Animated.timing(iconCall, {
            toValue: 100,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }


    const moveIcon = () => {
        Animated.timing(boxCall, {
            toValue: 100,
            duration: 300,
            useNativeDriver: false,
        }).start();
        Animated.timing(iconCall, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    if (!loaded) {
        return null;
    }

    const openChatYesil = () => {
        setModalVisible(true);
    }

    const closeModal = () => {
        setModalVisible(false);
    }


    return (
        // <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}> </TouchableWithoutFeedback>
        <SafeAreaProvider style={styles.container}>
            <SafeAreaView style={styles.safeAre}>
                <HeaderHome />
                <View style={styles.body}>
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {
                            Alert.alert('Modal has been closed.');
                            setModalVisible(!modalVisible);
                        }}>
                        <ChatYesil closeModal={closeModal} />
                    </Modal>
                    <Pressable
                        onPress={() => openChatYesil()}
                        style={styles.viewChatBot}>
                        <Animated.View
                            style={{
                                transform: [{ rotate: spin }]
                            }}>
                            <LinearGradient
                                colors={['#ff0000', '#00ff00', '#0000ff', '#ffff00']} // Các màu gradient
                                style={styles.circle}
                                start={{ x: 0, y: 0 }} // Điểm bắt đầu gradient
                                end={{ x: 1, y: 1 }}   // Điểm kết thúc gradient
                            >
                                <LinearGradient
                                    colors={['#343434', '#343434']} // Các màu gradient
                                    style={styles.circle_in}
                                    start={{ x: 0, y: 0 }} // Điểm bắt đầu gradient
                                    end={{ x: 1, y: 1 }}   // Điểm kết thúc gradient
                                />
                            </LinearGradient>
                        </Animated.View>
                        <Text style={styles.textChat}>Chat với Yesil AI</Text>
                        <SVG_AI style={styles.logoAI} />
                    </Pressable>
                    <FlatList
                        data={category}
                        keyExtractor={(item, index) => index.toString()} // Ensure each item has a unique key
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        style={{
                            padding: 10,
                        }}
                        ListHeaderComponent={() => (
                            <View>


                                {arrMenu.length > 0 ? <TrendFood arrMenu={arrMenu} navigation={navigation} /> : <Text>No Menu Available</Text>}
                            </View>
                        )}

                        renderItem={({ item }) =>
                            <Pressable
                                onPress={() => moveMenu(item)}
                                style={{
                                    flexDirection: 'row',
                                    marginBottom: 25,
                                    gap: 10,
                                }}>
                                <View style={{
                                    width: 90,
                                    height: 90,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderColor: 'white',
                                    borderWidth: 2,
                                    borderRadius: 20
                                }}>
                                    <Image source={{ uri: item.image }}
                                        style={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: 20
                                        }}
                                    />
                                </View>
                                <View style={{ paddingVertical: 5 }}>
                                    <Text style={{
                                        fontSize: 20,
                                        fontWeight: 'bold',
                                        marginBottom: 5,
                                        color: 'white'
                                    }}>
                                        {item.valueEn}
                                    </Text>
                                    <Text style={{ fontSize: 15, color: '#a9a8a8' }}>
                                        {item.countDish} món
                                    </Text>
                                </View>
                            </Pressable>
                        }
                        ListFooterComponent={() => (
                            <View style={{
                                width: '100%',
                                height: 500,
                                marginBottom: 150
                            }}>
                                <SpaceFuFu />
                            </View>

                        )}
                    />

                    <Animated.View style={{
                        position: 'absolute',
                        bottom: 150,
                        right: boxCall.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '-100%'],
                        }),
                        width: width,
                        paddingHorizontal: 20,
                    }}>
                        <View style={{
                            backgroundColor: 'rgb(245, 244, 244)',
                            borderWidth: 1,
                            borderColor: 'green',
                            height: 180,
                            borderRadius: 30,
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            gap: 10
                        }}>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 5
                                }}>
                                    <Image
                                        style={{
                                            width: 80,
                                            height: 80,
                                            // transform: [{ scaleX: -1 }], 
                                        }}
                                        source={{ uri: 'https://res.cloudinary.com/dtjdfh2ly/image/upload/v1712118344/bcjsfex3bxzgrxqouvtc.png' }}
                                    />
                                    <View>
                                        <Text style={{ fontWeight: '600', fontSize: 17 }}>FuFu's Space</Text>
                                        <Text style={{ color: 'grey' }}>fufuspace@gmail.com</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 4 }}>
                                    <AntDesign name="star" size={24} color="#1b7f63" />
                                    <Text style={{ fontWeight: '400', fontSize: 17 }}>4.8</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 20 }}>
                                <Pressable style={{
                                    flex: 1,
                                    backgroundColor: '#1b7f63',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: 60,
                                    gap: 10,
                                    borderRadius: 20
                                }} onPress={openPhone}>
                                    <Text style={{
                                        color: 'white',
                                        fontSize: 20,
                                        fontWeight: '400'
                                    }}>Call me</Text>
                                    <Feather name="phone-call" size={24} color="white" />
                                </Pressable>
                                <Pressable style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: 60,
                                    borderRadius: 20
                                }} onPress={moveIcon}>
                                    <Text style={{
                                        color: 'grey',
                                        fontSize: 20,
                                        fontWeight: '500'
                                    }}>Close</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Animated.View>

                    <Animated.View
                        style={{
                            position: 'absolute',
                            bottom: 150,
                            right: iconCall.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '-100%'],
                            }),
                            paddingRight: 10,
                            alignItems: 'flex-end'
                        }}>
                        <Pressable
                            onPress={moveBox}
                            style={{
                                width: 70,
                                height: 70,
                                backgroundColor: '#1b7f63',
                                borderRadius: 35,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Feather name="phone-call" size={30} color="white" />
                        </Pressable>
                    </Animated.View>

                </View>
            </SafeAreaView >
        </SafeAreaProvider >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    safeAre: {
        flex: 1,
        width: '100%',
    },
    body: {
        // padding: 20,
    },
    viewChatBot: {
        height: 'auto',
        padding: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: '#343434',
        borderRadius: 50,
        marginBottom: 10
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    circle_in: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textChat: {
        color: 'grey',
        fontSize: 17
    },
    logoAI: {
        position: 'absolute',
        right: 10
    }
});
