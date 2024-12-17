import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native"
import * as SecureStore from 'expo-secure-store';
import Feather from '@expo/vector-icons/Feather';
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setAuth, setInfoUser, setPushToken, setToken } from "../../store/slices/appSlice";
import { REACT_APP_BACKEND_URL } from '@env';
import { registerIndieID } from "native-notify";
import * as Application from 'expo-application';
import { RootState } from "../../store/store";
import saveToken from "../../store/token/savetoken";


const background_App = 'https://i.pinimg.com/originals/ef/2c/59/ef2c59764c7f3f59e53e0ba0129c7f87.jpg';

export default function LoginScreen({ navigation }: any) {
    const dispatch = useDispatch();
    const pushTokenRedux = useSelector((state: RootState) => state.app.pushToken);
    const [textEmail, setTextEmail] = useState<string>("");
    const [textPassword, setTextPassword] = useState<string>("");
    const [hiddenPass, setHiddenPass] = useState(true);
    const emailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const [loadding, setLoading] = useState(false);
    const [idDevice, setIdDevice] = useState<string | null | undefined>('');

    // async function getDeviceId() {
    //     let deviceId;

    //     if (Platform.OS === 'android') {
    //         deviceId = await Application.getAndroidId(); // Lấy ID cho Android
    //     } else if (Platform.OS === 'ios') {
    //         deviceId = await Application.getIosIdForVendorAsync(); // Lấy ID cho iOS
    //     }

    //     return deviceId;
    // }

    // getDeviceId().then((id) => setIdDevice(id));
    // console.log(idDevice);

    // useEffect(() => {
    //     registerForPushNotificationsAsync().then(token => {
    //         if (token) {
    //             setExpoPushToken(token);
    //         }
    //     });

    //     const subscription = Notifications.addNotificationReceivedListener(notification => {
    //         console.log(notification);
    //     });

    //     return () => subscription.remove();
    // }, []);

    const changeTextInput = useCallback((value: string, id: string) => {
        if (id === 'email') {
            setTextEmail(value);
        } else if (id === 'password') {
            setTextPassword(value);
        }
    }, []);


    const cancleFocusInput = () => {
        if (emailRef.current && passwordRef.current) {
            emailRef.current.blur();
            passwordRef.current.blur();
        }
    }

    async function checkToken() {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                dispatch(setAuth(true));
                dispatch(setToken(token));
            } else {
                dispatch(setAuth(false));
                dispatch(setToken(""));
            }
        } catch (error) {
            console.error('Error checking token:', error);
            dispatch(setAuth(false));
            dispatch(setToken(""));
        }
    }

    // async function saveToken(key: string, value: string) {
    //     await SecureStore.setItemAsync(key, value);
    //     await checkToken();
    // }

    const handleLogin = () => {
        Keyboard.dismiss();
        setLoading(true);
        axios.post(`http://192.168.1.24:3000/api/login`,
            {
                email: textEmail,
                password: textPassword,
                tokenDevice: pushTokenRedux
            })
            .then(async function (response) {
                if (response.data.errCode !== 0) {
                    alert(response.data.errMessage)
                } else {
                    const infoUser = response.data.user;
                    await saveToken("token", response.data.jwtData);
                    await dispatch(setAuth(true));
                    await dispatch(setToken(response.data.jwtData));
                    await dispatch(setInfoUser({
                        idUser: infoUser.id,
                        fullName: infoUser.fullName,
                        email: infoUser.email,
                        phoneNumber: infoUser.phone,
                        roleId: infoUser.roleId,
                        image: infoUser.image
                    }))
                    // Sau khi đăng nhập thành công, cần lưu tokenDevice vào bảng tokenDevice

                    // if (['R0', 'R1', 'R2'].includes(infoUser.roleId)) {
                    //     await registerIndieID('R0', 23684, 'Wuaq0f7zMq3lJxql3cEVrq');
                    // } else if (infoUser.roleId === 'R3') {
                    //     await registerIndieID(infoUser.email, 23684, 'Wuaq0f7zMq3lJxql3cEVrq');
                    // }

                    setTextEmail("");
                    setTextPassword("");
                    navigation.navigate('main');
                }
            })
            .catch(function (error) {
                console.log(error);
            })
            .finally(function () {
                setLoading(false);
            });
    }

    const moveRegisterScreen = () => {
        navigation.navigate('signup');
    }


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={true}>
            <View style={styles.container} >
                <ImageBackground style={{ flex: 2, width: '100%' }} resizeMode='cover' source={{ uri: background_App }}>
                    <LinearGradient
                        colors={['transparent', 'black',]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.inner}
                    >
                        <Text style={{ color: 'white', fontSize: 40, fontWeight: 'bold', width: '100%' }}>
                            Sign in to your Account
                        </Text>
                        <Text style={{ color: '#9f9f9f', fontSize: 20, fontWeight: '300', width: '100%' }}>
                            Sign in to your Account
                        </Text>
                    </LinearGradient>

                </ImageBackground>
                <KeyboardAvoidingView
                    style={{
                        flex: 3,
                        width: '100%',
                        backgroundColor: '#F5F4F4',
                        paddingVertical: 20,
                        paddingHorizontal: 20
                    }}
                    behavior={'padding'}
                // behavior={Platform.OS === "ios" ? "padding" : "height"} // "padding" hoặc "height" là các cách để điều chỉnh bố cục
                >
                    <View style={{ flex: 1, gap: 30 }}>
                        <TextInput style={styles.input}
                            value={textEmail}
                            ref={emailRef}
                            inputMode="email"
                            // onFocus={focusInput}
                            // onBlur={cancleInput}
                            onChangeText={(event) => { changeTextInput(event, 'email') }}
                            onSubmitEditing={handleLogin}
                            placeholder="Enter email"
                            placeholderTextColor={'#AFAFAF'}
                        />
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <TextInput style={styles.input}
                                value={textPassword}
                                secureTextEntry={hiddenPass}
                                ref={passwordRef}
                                // onFocus={focusInput}
                                // onBlur={cancleInput}
                                onChangeText={(event) => { changeTextInput(event, 'password') }}
                                onSubmitEditing={handleLogin}
                                placeholder="Enter password"
                                placeholderTextColor={'#AFAFAF'}
                            />
                            <Feather onPress={() => setHiddenPass(!hiddenPass)} style={{
                                position: 'absolute',
                                right: 20,
                            }} name={!hiddenPass ? "eye" : "eye-off"} size={24} color="#AFAFAF" />
                        </View>
                        <Text style={styles.forgotPass}>Forgot Password?</Text>
                        <Pressable onPress={handleLogin}>
                            <LinearGradient
                                colors={['#1b7f63', '#29d297',]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    width: '100%',
                                    height: 70,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 20,
                                    flexDirection: 'row',
                                    gap: 10
                                }}
                            >
                                {loadding &&
                                    <ActivityIndicator size="large" color="white" />
                                }
                                <Text style={{
                                    color: 'white',
                                    fontWeight: '500',
                                    fontSize: 20
                                }}>{loadding ? 'Loading...' : 'Login'}</Text>
                            </LinearGradient>
                        </Pressable>
                        <View style={{
                            flex: 1,
                            alignItems: 'flex-end',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            paddingBottom: 30
                        }}>
                            <Text style={styles.dontHaveAcc}>
                                Don't have an account?
                            </Text>
                            <Pressable onPress={moveRegisterScreen}>
                                <Text style={styles.register}>  Register</Text>
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    inner: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: 20,
    },
    input: {
        height: 60,
        width: '100%',
        backgroundColor: 'white',
        borderColor: '#AFAFAF',
        borderWidth: 1,
        borderRadius: 20,
        paddingLeft: 20,
        paddingRight: 50,
        color: 'black',
        fontSize: 17
    },
    forgotPass: {
        width: '100%',
        textAlign: 'right',
        color: '#1b7f63',
        fontSize: 17,
        fontWeight: '500'
    },
    dontHaveAcc: {
        fontSize: 17,
    },
    register: {
        fontSize: 17,
        fontWeight: '500',
        color: '#1b7f63',
    }
})