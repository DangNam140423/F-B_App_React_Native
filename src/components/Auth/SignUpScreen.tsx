import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useRef, useState } from "react";
import { Dimensions, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Feather from '@expo/vector-icons/Feather';
import axios from "axios";
import { REACT_APP_BACKEND_URL } from '@env';


const { width, height } = Dimensions.get('window');
const background_App = 'https://i.pinimg.com/originals/ef/2c/59/ef2c59764c7f3f59e53e0ba0129c7f87.jpg';

export default function SignUpScreen({ navigation }: any) {
    // fullName: data.fullname,
    // email: data.email,
    // password: hashPasswordFromBcrypt,
    // roleId: data.roleid,
    const [textFullName, setTextFullName] = useState<string>("");
    const [textEmail, setTextEmail] = useState<string>("");
    const [textPassword, setTextPassword] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [focused, setFocused] = useState(false);
    const [hiddenPass, setHiddenPass] = useState(true);
    const emailRef = useRef<TextInput>(null);
    const fullNameRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const phoneNumberRef = useRef<TextInput>(null);


    // const focusInput = () => {
    //     if (emailRef.current) {
    //         emailRef.current.focus(); // Làm cho TextInput nhận tiêu điểm
    //     }
    // }

    const changeTextInput = useCallback((value: string, id: string) => {
        if (id === 'email') {
            setTextEmail(value);
        } else if (id === 'password') {
            setTextPassword(value);
        } else if (id === 'fullname') {
            setTextFullName(value);
        } else if (id === 'phonenumber') {
            setPhoneNumber(value);
        }
    }, []);

    const cancleFocusInput = () => {
        emailRef.current?.blur();
        fullNameRef.current?.blur();
        passwordRef.current?.blur();
        phoneNumberRef.current?.blur();
    }

    const handleRegister = () => {
        axios.post(`http://192.168.1.77:3000/api/user/register`,
            {
                fullname: textFullName,
                email: textEmail,
                password: textPassword,
                phonenumber: phoneNumber,
                roleid: 'R3'
            })
            .then(function (response) {
                if (response.data.errCode !== 0) {
                    alert(response.data.errMessage)
                } else {
                    alert("Account registration successful");
                    setTextEmail("");
                    setTextFullName("");
                    setTextPassword("");
                    setPhoneNumber("");
                    cancleFocusInput();
                }
            })
            .catch(function (error) {
                console.log(error);
            })
            .finally(function () {
            });
    }

    const moveLoginScreen = () => {
        navigation.navigate('login');
    }


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={true}>
            <View style={styles.container} >
                <ImageBackground style={{ flex: 1, width: '100%' }} resizeMode='cover' source={{ uri: background_App }}>
                    <LinearGradient
                        colors={['transparent', 'black',]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.inner}
                    >
                        <Text style={{ color: 'white', fontSize: 40, fontWeight: 'bold', width: '100%' }}>
                            Register
                        </Text>
                        <Text style={{ color: '#9f9f9f', fontSize: 20, fontWeight: '300', width: '100%' }}>
                            Create your Account
                        </Text>
                    </LinearGradient>

                </ImageBackground>
                <KeyboardAvoidingView
                    style={{
                        flex: 2,
                        width: '100%',
                        backgroundColor: '#F5F4F4',
                        paddingTop: 20,
                        paddingHorizontal: 20
                    }}
                    behavior={'padding'}
                //behavior={Platform.OS === "ios" ? "padding" : "padding"} // "padding" hoặc "height" là các cách để điều chỉnh bố cục
                >
                    <View style={{ height: '100%', gap: 30 }}>
                        <TextInput style={styles.input}
                            value={textFullName}
                            ref={fullNameRef}
                            // onFocus={focusInput}
                            // onBlur={cancleInput}
                            onChangeText={(event) => { changeTextInput(event, 'fullname') }}
                            onSubmitEditing={handleRegister}
                            placeholder="Enter fullname"
                            placeholderTextColor={'#AFAFAF'}
                        />
                        <TextInput style={styles.input}
                            value={phoneNumber}
                            ref={phoneNumberRef}
                            // inputMode="numeric"
                            // keyboardType='numeric'
                            // onFocus={focusInput}
                            // onBlur={cancleInput}
                            onChangeText={(event) => { changeTextInput(event, 'phonenumber') }}
                            onSubmitEditing={handleRegister}
                            placeholder="Enter phone"
                            placeholderTextColor={'#AFAFAF'}
                        />
                        <TextInput style={styles.input}
                            value={textEmail}
                            ref={emailRef}
                            inputMode="email"
                            // onFocus={focusInput}
                            // onBlur={cancleInput}
                            onChangeText={(event) => { changeTextInput(event, 'email') }}
                            onSubmitEditing={handleRegister}
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
                                onSubmitEditing={handleRegister}
                                placeholder="Enter password"
                                placeholderTextColor={'#AFAFAF'}
                            />
                            <Feather onPress={() => setHiddenPass(!hiddenPass)} style={{
                                position: 'absolute',
                                right: 20,
                            }} name={!hiddenPass ? "eye" : "eye-off"} size={24} color="#AFAFAF" />
                        </View>
                        <Pressable onPress={handleRegister}>
                            <LinearGradient
                                colors={['#1b7f63', '#29d297',]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    width: '100%',
                                    height: 70,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 20
                                }}
                            >
                                <Text style={{
                                    color: 'white',
                                    fontWeight: '500',
                                    fontSize: 20
                                }}>Register</Text>
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
                                I have an account?
                            </Text>
                            <Pressable onPress={moveLoginScreen}>
                                <Text style={styles.register}>  Login</Text>
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
        gap: 10,
        paddingLeft: 20,
        paddingBottom: 40,
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
        fontSize: 17,
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