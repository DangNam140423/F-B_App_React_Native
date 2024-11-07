import { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Button, Dimensions, FlatList, Image, Keyboard, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import RNPickerSelect from 'react-native-picker-select';
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { setAuth } from "../../../store/slices/appSlice";
import * as ImagePicker from 'expo-image-picker';
import { TextInput } from "react-native-gesture-handler";
import RadioGroup, { RadioButtonProps } from 'react-native-radio-buttons-group';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ImageView from "react-native-image-viewing";
import saveToken from "../../../store/token/savetoken";
import { REACT_APP_BACKEND_URL } from "@env";


const { width, height } = Dimensions.get('window');

// declare global {
//     interface FormData {
//         append(
//             name: string,
//             value: { uri: string; name: string; type: string }
//         ): void;
//     }
// }

export default function CreateStaff({ navigation }: any) {
    const dispatch = useDispatch();
    const [avatar, setAvatar] = useState<string | null>(null);
    const token = useSelector((state: RootState) => state.app.token);
    const [fullname, setFullName] = useState<string | undefined>();
    const [phonenumber, setPhoneNumber] = useState<string | undefined>();
    const [email, setEmail] = useState<string | undefined>();
    const [roleid, setRoleid] = useState<string | undefined>();
    const [password, setPassword] = useState<string | undefined>();
    const [hiddenPass, setHiddenPass] = useState(true);
    const [visible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const refs = useRef<any>({
        'email': createRef<Text>(),
        'fullname': createRef<Text>(),
        'password': createRef<Text>(),
        'roleid': createRef<Text>(),
        'phonenumber': createRef<Text>()
    });

    const [focusedInput, setFocusedInput] = useState({
        fullname: false,
        email: false,
        password: false,
        phonenumber: false
    });

    const handleFocus = (inputName: string) => {
        setFocusedInput((prevState) => ({
            ...prevState,
            [inputName]: true,
        }));
    };

    const handleBlur = (inputName: string) => {
        setFocusedInput((prevState) => ({
            ...prevState,
            [inputName]: false,
        }));
    };


    const radioButtons: RadioButtonProps[] = useMemo(() => ([
        {
            id: 'R1',
            label: 'Manager',
            borderColor: roleid === 'R1' ? '#1b7f63' : '#AFAFAF',
            labelStyle: { color: roleid === 'R1' ? '#1b7f63' : '#AFAFAF' },
            color: '#1b7f63'
        },
        {
            id: 'R2',
            label: 'Staff',
            borderColor: roleid === 'R2' ? '#1b7f63' : '#AFAFAF',
            labelStyle: { color: roleid === 'R2' ? '#1b7f63' : '#AFAFAF' },
            color: '#1b7f63'
        }
    ]), [roleid]);



    const askForPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
        }
    };

    const pickImage = async () => {
        Keyboard.dismiss();
        // Yêu cầu quyền truy cập thư viện ảnh trước
        ImagePicker.requestMediaLibraryPermissionsAsync();
        ImagePicker.requestCameraPermissionsAsync();

        // Mở thư viện ảnh khi quyền đã được cấp
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        // Kiểm tra nếu ảnh đã được chọn
        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
            // formData.append('avatar',
            //     JSON.parse(
            //         JSON.stringify({
            //             uri: result.assets[0].uri,
            //             type: `image/${fileType}`,
            //             name: `avatar-${fullname}`,
            //         })
            //     )
            // );
        } else {
            setAvatar(null)
        }
    };

    const upload = async (dataUpload: any) => {
        setLoading(true);
        await axios.post(`http://192.168.1.77:3000/api/create-new-user`,
            dataUpload,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(function (response) {
                if (response.data.errCode === 0) {
                    clearState();
                    navigation.navigate('liststaff', {
                        getData: true
                    });
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
                setLoading(false);
            });
    }


    const checkValidInput = (objectValue: any) => {
        let result: boolean = true;
        let textError: string = 'Missing parameter: ';
        const formData: any = objectValue
        for (const key in formData) {
            if (!formData[key]) {
                refs.current[key].current?.setNativeProps({
                    style: {
                        color: '#901a1a'
                    }
                })
                textError = textError + key + ' ';
                result = false;
            } else {
                refs.current[key].current?.setNativeProps({
                    style: {
                        color: '#AFAFAF'
                    }
                })
            }
        }
        if (!result) {
            alert(textError);
        }
        return result;
    }

    const checkValidPhone = (phone: string | undefined) => {
        const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/g;
        if (phone && !phone.match(re)) {
            alert('Invalid phone format');
            refs.current['phonenumber'].current?.setNativeProps({
                style: {
                    color: '#901a1a'
                }
            })
            return false;
        }
        return true;
    }

    const checkValidEmail = (email: string | undefined) => {
        const re = /\S+@\S+\.\S+/g;
        if (!re.test(email || '')) {
            alert('Invalid email format');
            refs.current['email'].current?.setNativeProps({
                style: {
                    color: '#901a1a'
                }
            })
            return false;
        }
        return true;
    }

    const checkValidPassword = (password: string | undefined) => {
        const re = /^(?=.*\p{Ll})(?=.*\p{Lu})(?=.*[\d|@#$!%*?&])[\p{L}\d@#$!%*?&]{8,36}$/gmu;
        if (!re.test(password || '')) {
            refs.current['password'].current?.setNativeProps({
                style: {
                    color: '#901a1a'
                }
            })
            alert('Password must be at least 8 characters, including uppercase letters, lowercase letters, numbers and special characters');
            return false;
        }
        return true;
    }


    const createUser = () => {
        if (checkValidInput({ fullname, email, password, roleid, phonenumber })
            && checkValidPhone(phonenumber)
            && checkValidEmail(email)
            && checkValidPassword(password)
        ) {
            const formData = new FormData();
            if (avatar) {
                formData.append('avatar',
                    {
                        uri: avatar,
                        type: `image/${avatar?.split('.').pop()}`,
                        name: `avatar-${fullname}`,
                    } as unknown as Blob
                );
            }
            formData.append('fullname', fullname || '');
            formData.append('phonenumber', phonenumber || '');
            formData.append('email', email || '');
            formData.append('password', password || '');
            formData.append('roleid', roleid || '');

            upload(formData);
        }
    }

    const clearState = () => {
        setAvatar(null);
        setEmail(undefined);
        setPhoneNumber(undefined);
        setFullName(undefined);
        setPassword(undefined);
        setRoleid(undefined);
    }

    const changeTextInput = useCallback((value: string, id: string) => {
        if (id === 'email') {
            setEmail(value);
        } else if (id === 'password') {
            setPassword(value);
        } else if (id === 'fullname') {
            setFullName(value);
        } else if (id === 'phonenumber') {
            setPhoneNumber(value);
        }
    }, []);


    // const pickImage = async () => {
    //     // No permissions request is necessary for launching the image library
    //     let result = await ImagePicker.launchImageLibraryAsync({
    //         mediaTypes: ImagePicker.MediaTypeOptions.All,
    //         allowsEditing: true,
    //         aspect: [4, 3],
    //         quality: 1,
    //     });

    //     console.log(result);

    //     if (!result.canceled) {
    //         setImage(result.assets[0].uri);
    //     }
    // };
    return (
        <SafeAreaProvider style={styles.container}>
            <SafeAreaView>
                <TouchableWithoutFeedback
                    onPress={Keyboard.dismiss} accessible={true}>
                    <View style={styles.body}>
                        <View>
                            <View style={styles.viewTextInput}>
                                <View>
                                    <Text ref={refs.current.fullname} style={styles.label}>Name</Text>
                                    <TextInput
                                        style={[styles.textInput, { borderColor: focusedInput.fullname ? '#02dfa0d3' : 'transparent' }]}
                                        value={fullname}
                                        onChangeText={(event) => { changeTextInput(event, 'fullname') }}
                                        onSubmitEditing={createUser}
                                        placeholder="Enter name"
                                        placeholderTextColor={'#AFAFAF'}
                                        onFocus={() => handleFocus('fullname')}
                                        onBlur={() => handleBlur('fullname')}
                                    />
                                </View>

                                <View>
                                    <Text ref={refs.current.phonenumber} style={styles.label}>Phone</Text>
                                    <TextInput
                                        style={[styles.textInput, { borderColor: focusedInput.phonenumber ? '#02dfa0d3' : 'transparent' }]}
                                        value={phonenumber}
                                        inputMode="numeric"
                                        keyboardType="numeric"
                                        onChangeText={(event) => { changeTextInput(event, 'phonenumber') }}
                                        onSubmitEditing={createUser}
                                        placeholder="Enter phone"
                                        placeholderTextColor={'#AFAFAF'}
                                        onFocus={() => handleFocus('phonenumber')}
                                        onBlur={() => handleBlur('phonenumber')}
                                    />
                                </View>

                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 2 }}>
                                        <Text ref={refs.current.email} style={styles.label}>Email</Text>
                                        <TextInput
                                            style={[styles.textInput, { borderColor: focusedInput.email ? '#02dfa0d3' : 'transparent' }]}
                                            value={email}
                                            onChangeText={(event) => { changeTextInput(event, 'email') }}
                                            onSubmitEditing={createUser}
                                            placeholder="Enter email"
                                            placeholderTextColor={'#AFAFAF'}
                                            onFocus={() => handleFocus('email')}
                                            onBlur={() => handleBlur('email')}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            ref={refs.current.roleid}
                                            style={styles.label}>
                                            Role
                                        </Text>
                                        <RadioGroup
                                            radioButtons={radioButtons}
                                            onPress={setRoleid}
                                            selectedId={roleid}
                                            layout='column'
                                            containerStyle={styles.roleInput}
                                            accessibilityLabel="#279315"
                                        />
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 2 }}>
                                        <Text style={styles.label}
                                            ref={refs.current.password}>Pasword</Text>
                                        <View style={{
                                            justifyContent: 'center'
                                        }}>
                                            <TextInput
                                                style={[styles.textInput, { borderColor: focusedInput.password ? '#02dfa0d3' : 'transparent' }]}
                                                value={password}
                                                secureTextEntry={hiddenPass}
                                                onChangeText={(event) => { changeTextInput(event, 'password') }}
                                                onSubmitEditing={createUser}
                                                placeholder="Enter password"
                                                placeholderTextColor={'#AFAFAF'}
                                                onFocus={() => handleFocus('password')}
                                                onBlur={() => handleBlur('password')}
                                            />
                                            <Feather onPress={() => setHiddenPass(!hiddenPass)}
                                                style={{
                                                    position: 'absolute',
                                                    right: 10,
                                                    zIndex: 0
                                                }} name={!hiddenPass ? "eye" : "eye-off"} size={24} color="#AFAFAF" />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>Avatar</Text>
                                        <Pressable
                                            onPress={pickImage}
                                            style={styles.imageInput}
                                        >
                                            {/* <Text style={{
                                                color: 'white',
                                                fontSize: 17,
                                                fontWeight: '500'
                                            }}>Pick image</Text> */}
                                            <Ionicons name="image-outline" size={30} color="#AFAFAF" />
                                        </Pressable>
                                    </View>
                                </View>
                                <View>
                                    <Pressable
                                        onPress={createUser}
                                        style={styles.buttonCreate}
                                    >
                                        {loading
                                            ?
                                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                                                <ActivityIndicator size="large" color="white" />
                                                <Text style={{ color: 'white', fontSize: 20 }}>Loading...</Text>
                                            </View>
                                            :
                                            <>
                                                <Text style={{
                                                    color: 'white',
                                                    fontSize: 17,
                                                    fontWeight: '500'
                                                }}>Create User</Text>
                                                <Ionicons name="create-outline" size={24} color="white" /></>
                                        }

                                    </Pressable>
                                </View>
                                {avatar &&
                                    <View style={{ flex: 1, marginTop: 20 }}>
                                        <Pressable
                                            onPress={() => setIsVisible(true)}>
                                            <Image
                                                resizeMode="contain"
                                                source={{ uri: avatar }}
                                                style={styles.image} />
                                        </Pressable>
                                        <View style={{
                                            position: 'absolute',
                                            height: 34,
                                            width: 34,
                                            right: 0,
                                        }}>
                                            <Pressable
                                                onPress={() => { setAvatar(null) }}
                                                style={{
                                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                    borderRadius: 20,
                                                    padding: 2,
                                                    position: 'absolute',
                                                    right: '-50%',
                                                    top: '-50%',
                                                    // transform: [{ translateX: 0 }, { translateY: 0 }]
                                                }}>
                                                <AntDesign name="close" size={30} color="grey" />
                                            </Pressable>
                                        </View>
                                        <ImageView
                                            images={[
                                                {
                                                    uri: avatar
                                                }
                                            ]}
                                            imageIndex={0}
                                            visible={visible}
                                            onRequestClose={() => setIsVisible(false)}
                                        />
                                    </View>
                                }
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </SafeAreaView >
        </SafeAreaProvider >
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        alignItems: 'flex-start',
    },
    body: {
        flex: 1,
        width: width,
        height: height,
        paddingHorizontal: 10,
        paddingVertical: 20
    },
    viewTextInput: {
        height: '100%',
        gap: 10,
        backgroundColor: '#23252c',
        borderRadius: 24,
        padding: 20,
    },
    label: {
        color: '#AFAFAF',
        fontSize: 15,
        fontWeight: '400',
        marginBottom: 5
    },
    textInput: {
        width: '100%',
        height: 'auto',
        minHeight: 55,
        backgroundColor: '#40404a',
        borderRadius: 12,
        padding: 10,
        paddingRight: 40,
        alignItems: 'flex-start',
        color: 'white',
        borderWidth: 2,
    },
    roleInput: {
        width: '100%',
        height: 'auto',
        alignItems: 'flex-start',
        color: 'white',
    },
    imageInput: {
        width: '100%',
        minHeight: 55,
        backgroundColor: '#40404a',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    radioButton: {
        color: '#AFAFAF'
    },
    image: {
        height: '100%',
        borderRadius: 10,
        backgroundColor: '#181a20'
    },
    buttonCreate: {
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1b7f63',
        borderRadius: 12,
        height: 50,
        flexDirection: 'row',
        gap: 10
    },
});