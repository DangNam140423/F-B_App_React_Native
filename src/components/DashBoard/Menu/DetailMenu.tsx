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

interface objectFilter { label: string, value: string }

export default function DetailMenu({ navigation, route }: any) {
    const valueDish = route.params && route.params.valueDish ? route.params.valueDish : '';

    const dispatch = useDispatch();
    const [imageDish, setImageDish] = useState<string | null>(null);
    const token = useSelector((state: RootState) => state.app.token);
    const [name, setName] = useState<string | undefined>();
    const [description, setDescription] = useState<string | undefined>();
    const [category, setCategory] = useState<string | null>();
    const [arrCategory, setArrCategory] = useState<objectFilter[]>([]);
    const [visible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const refs = useRef<any>({
        'name': createRef<Text>(),
        'description': createRef<Text>(),
        'category': createRef<Text>(),
        'imageDish': createRef<Text>(),
    });
    const inputRefs = useRef<any>({
        'name': createRef<TextInput>(),
        'description': createRef<TextInput>()
    });
    // const inputRefDescription = useRef<TextInput | null>(null);
    // const inputRefName = useRef<TextInput | null>(null);

    const [focusedInput, setFocusedInput] = useState({
        name: false,
        description: false
    });

    useEffect(() => {
        setName(valueDish.name);
        setDescription(valueDish.description);
        setImageDish(valueDish.image);
        setCategory(valueDish.category);
    }, [valueDish])

    const buildArrCatogory = (arrCategoryFirt: any) => {
        const arrBackup: objectFilter[] = arrCategoryFirt.map((item: any) => {
            return (
                {
                    value: item.keyMap,
                    label: item.valueEn
                }
            )
        });
        return arrBackup;
    }

    useEffect(() => {
        const getCategory = async () => {
            await axios.get(`http://192.168.1.84:3000/api/get-all-code?type=DISHES_CATEGORY`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(function (response) {
                    if (response.data.errCode !== 0) {
                        alert(response.data.errMessage);
                    } else {
                        setArrCategory(buildArrCatogory(response.data.data));
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
        getCategory();
    }, [token]);

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
            setImageDish(result.assets[0].uri);
        } else {
            setImageDish(null)
        }
    };



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
            if (!formData[key] && (key === 'name' || key === 'description')) {
                inputRefs.current[key].current?.focus();
                break;
            }
        }
        if (!result) {
            alert(textError);
        }
        return result;
    }

    const checkChangeInput = (objectValue: any) => {
        const objectParam = {
            name: valueDish.name,
            category: valueDish.category,
            imageDish: valueDish.image,
            description: valueDish.description
        }

        const isEqual = JSON.stringify(objectParam) === JSON.stringify(objectValue);

        if (isEqual) {
            Alert.alert(
                "Notification",
                "Save Success",
                [
                    {
                        text: "Ok"
                    }
                ],
                { cancelable: true }
            );
            navigation.navigate('listmenu');
            return false;
        }
        return true;
    }

    const upload = async (dataUpload: any) => {
        setLoading(true);
        Keyboard.dismiss();
        await axios.put(`http://192.168.1.84:3000/api/edit-dish`,
            dataUpload,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(function (response) {
                if (response.data.errCode !== 0) {
                    inputRefs.current['description'].current?.focus();
                } else {
                    navigation.navigate('listmenu', {
                        isGetProps: true
                    })
                }
                Alert.alert(
                    response.data.errCode === 0 ? "Notification" : "Warning",
                    response.data.errMessage,
                    [
                        {
                            text: "Ok"
                        }
                    ],
                    { cancelable: true }
                );
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


    const updateMenu = () => {
        if (
            checkValidInput({ name, category, imageDish, description })
            && checkChangeInput({ name, category, imageDish, description })
        ) {
            const formData = new FormData();
            if (imageDish && imageDish !== valueDish.image) {
                formData.append('image',
                    {
                        uri: imageDish,
                        type: `image/${imageDish?.split('.').pop()}`,
                        name: `image-${name}`,
                    } as unknown as Blob
                );
            }
            formData.append('id', valueDish.id || '');
            formData.append('name', name || '');
            formData.append('description', description || '');
            formData.append('category', category || '');

            upload(formData);
        }
    }

    const DeleteMenu = async (idDish: number) => {
        setLoadingDelete(true);
        await axios.delete(`http://192.168.1.84:3000/api/delete-dish`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: {
                id: idDish
            }
        })
            .then(function (response) {
                if (response.data.errCode === 0) {
                    navigation.navigate('listmenu', {
                        isGetProps: true
                    })
                }
                Alert.alert(
                    response.data.errCode === 0 ? "Notification" : "Warning",
                    response.data.errMessage,
                    [
                        {
                            text: "Ok"
                        }
                    ],
                    { cancelable: true }
                );
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
                setLoadingDelete(false);
            });
    }

    const clearState = () => {
        setImageDish(null);
        setName(undefined);
        setCategory(null);
        setDescription(undefined);
    }

    const changeTextInput = useCallback((value: string, id: string) => {
        if (id === 'fullname') {
            setName(value);
        } else if (id === 'description') {
            setDescription(value);
        }
    }, []);


    return (
        <SafeAreaProvider style={styles.container}>
            <SafeAreaView>
                <TouchableWithoutFeedback
                    onPress={Keyboard.dismiss} accessible={true}>
                    <View style={styles.body}>
                        <View>
                            <View style={styles.viewTextInput}>
                                <View>
                                    <Text ref={refs.current.name} style={styles.label}>Name</Text>
                                    <TextInput
                                        ref={inputRefs.current.name}
                                        style={[styles.textInput, { borderColor: focusedInput.name ? '#02dfa0d3' : 'transparent' }]}
                                        value={name}
                                        onChangeText={(event) => { changeTextInput(event, 'fullname') }}
                                        onSubmitEditing={updateMenu}
                                        placeholder="Enter name"
                                        placeholderTextColor={'#AFAFAF'}
                                        onFocus={() => handleFocus('fullname')}
                                        onBlur={() => handleBlur('fullname')}
                                    />
                                </View>

                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 2 }}>
                                        <Text ref={refs.current.category} style={styles.label}>Category</Text>
                                        <RNPickerSelect
                                            value={category}
                                            onValueChange={(itemValue) => setCategory(itemValue)}
                                            style={pickerSelectStyles}
                                            placeholder={{
                                                label: 'Select category...',
                                                value: null,
                                                color: 'gray',
                                            }}
                                            useNativeAndroidPickerStyle={false}
                                            // activeItemStyle={Platform.OS === 'android' ? styles.picker : Platform.OS === 'ios' && styles.pickerIOS}
                                            items={arrCategory.length > 0 ? arrCategory : []}
                                        />
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text ref={refs.current.imageDish} style={styles.label}>Image</Text>
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
                                    <Text ref={refs.current.description} style={styles.label}>Description</Text>
                                    <TextInput
                                        ref={inputRefs.current.description}
                                        style={[styles.textInput, { height: 100, borderColor: focusedInput.description ? '#02dfa0d3' : 'transparent' }]}
                                        value={description}
                                        multiline
                                        numberOfLines={4}
                                        onChangeText={(event) => { changeTextInput(event, 'description') }}
                                        placeholder="Enter description"
                                        placeholderTextColor={'#AFAFAF'}
                                        onFocus={() => handleFocus('fullname')}
                                        onBlur={() => handleBlur('fullname')}
                                    />
                                </View>

                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <Pressable
                                        onPress={updateMenu}
                                        style={styles.buttonUpdate}
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
                                                }}>Save</Text>
                                                <Ionicons name="create-outline" size={24} color="white" />
                                            </>
                                        }

                                    </Pressable>
                                    <Pressable
                                        onPress={() => DeleteMenu(valueDish.id)}
                                        style={styles.buttonDelete}
                                    >
                                        {loadingDelete
                                            ?
                                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                                                <ActivityIndicator size="large" color="#e23636" />
                                            </View>
                                            :
                                            <Text style={{
                                                color: '#e23636',
                                                fontSize: 17,
                                                fontWeight: '500'
                                            }}>Delete</Text>
                                        }

                                    </Pressable>
                                </View>
                                {imageDish &&
                                    <View style={{ flex: 1, marginTop: 20 }}>
                                        <Pressable
                                            onPress={() => setIsVisible(true)}>
                                            <Image
                                                resizeMode="contain"
                                                source={{ uri: imageDish }}
                                                style={styles.image} />
                                        </Pressable>
                                        <View style={{
                                            position: 'absolute',
                                            height: 34,
                                            width: 34,
                                            right: 0,
                                        }}>
                                            <Pressable
                                                onPress={() => { setImageDish(null) }}
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
                                                    uri: imageDish
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


const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        color: 'white',
        backgroundColor: '#40404a',
        width: '100%',
        minHeight: 55,
        borderRadius: 12,
        padding: 10,
        borderWidth: 0,
    },
    inputAndroid: {
        color: 'white',
        backgroundColor: '#40404a',
        width: '100%',
        minHeight: 55,
        borderRadius: 12,
        padding: 10,
        borderWidth: 0,
    },
});


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
        minHeight: 55,
        backgroundColor: '#40404a',
        borderRadius: 12,
        padding: 10,
        paddingRight: 40,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
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
    buttonUpdate: {
        flex: 1,
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1b7f63',
        borderRadius: 12,
        height: 50,
        flexDirection: 'row',
        gap: 10
    },
    buttonDelete: {
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingHorizontal: 20,
        height: 50,
    }
});