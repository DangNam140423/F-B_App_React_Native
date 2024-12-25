import { Animated, Dimensions, Easing, FlatList, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AntDesign, Entypo, Feather, FontAwesome, Octicons } from '@expo/vector-icons';
import { barcodeToSvg } from '@adrianso/react-native-barcode-builder';
import Svg, { SvgXml } from 'react-native-svg';
import formatCurrency from "../../../store/format/formatPrice";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { REACT_APP_JWT_SECRET, REACT_APP_IP } from '@env';
const { width, height } = Dimensions.get('window');


interface ChatYesilProps {
    closeModal: () => void;
}

interface mess {
    id: string,
    text: string,
    own: string,
    data: any
}


export default function ChatYesil({ closeModal }: ChatYesilProps) {
    const token = useSelector((state: RootState) => state.app.token);
    const infoUser = useSelector((state: RootState) => state.app.inforUser)
    const [textChat, setTextChat] = useState<string>("");
    const [messages, setMessages] = useState<mess[]>([
        { id: '', text: '', own: '', data: null }
    ]);
    const [loadingMess, setLoadingMess] = useState(false);
    const [dots, setDots] = useState('');
    const circleChatBot = useRef(new Animated.Value(0)).current;
    const spin = circleChatBot.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const flatListRef = useRef<FlatList<any>>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const textInputRef = useRef<TextInput>(null);
    // const handleLayout = (event: any) => {
    //     const { width, height } = event.nativeEvent.layout;
    // };

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
        const interval = setInterval(() => {
            setDots(prevDots => (prevDots.length < 3 ? prevDots + '.' : ''));
        }, 500); // Thay đổi dấu chấm mỗi 500ms

        return () => clearInterval(interval);
    }, [loadingMess]);

    useEffect(() => {
        sendMess(`Chào`);
    }, []);

    useEffect(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
    }, [textChat]);


    const changeTextChat = (value: string) => {
        // if (value.split('\n').length <= 4) {
        //     setTextChat(value);
        // }
        setTextChat(value);
    }

    const addMessage = () => {
        if (textChat) {
            const newMessage = { id: (messages.length + 1).toString(), text: textChat, own: 'me', data: null };
            setMessages(prevMessages => [...prevMessages, newMessage]);
            setTextChat("");
            sendMess(textChat);
        }
    };

    const sendMess = async (textChat: string) => {
        setLoadingMess(true);
        await axios.post(`http://192.168.142.61:3000/chat-with-yesil`,
            {
                textChat
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(function (response) {
                if (response.data?.param) {
                    const newMessage = { id: (messages.length + 1).toString(), text: response.data.textOfYesil, own: 'yesil', data: response.data.param };
                    setMessages(prevMessages => [...prevMessages, newMessage]);
                } else {
                    const newMessage = { id: (messages.length + 1).toString(), text: response.data.textOfYesil, own: 'yesil', data: null };
                    setMessages(prevMessages => [...prevMessages, newMessage]);
                }
            })
            .catch(async function (error) {
                console.log(error);
            })
            .finally(function () {
                setLoadingMess(false);
            });
    }

    const cancleInput = () => {
        if (textInputRef.current) {
            textInputRef.current.blur();
        }
    }

    const handleBooking = () => {
        const newMessage = { id: (messages.length + 1).toString(), text: 'Xác nhận', own: 'me', data: null };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        sendMess('Xác nhận');
    }

    const handleCancleBooking = () => {
        const newMessage = { id: (messages.length + 1).toString(), text: 'Hủy', own: 'me', data: null };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        sendMess('Hủy');
    }

    return (
        <SafeAreaProvider style={styles.container}>
            <SafeAreaView style={styles.safeAre}>
                <View style={styles.centeredView}>
                    <View style={[styles.modalView]}>
                        <View style={styles.header}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10
                            }}>
                                <Animated.View
                                    style={{
                                        transform: [{ rotate: spin }]
                                    }}>
                                    <View
                                        style={styles.circle_out}>
                                        <LinearGradient
                                            colors={['#ff0000', '#00ff00', '#0000ff', '#ffff00']}
                                            style={styles.circle}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <LinearGradient
                                                colors={['#343434', '#343434']}
                                                style={styles.circle_in}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                            />
                                        </LinearGradient>
                                    </View>
                                </Animated.View>
                                <View>
                                    <Text style={{
                                        color: 'white',
                                        fontSize: 17,
                                        fontWeight: 'bold'
                                    }}>Yesil AI</Text>
                                    <Text style={{
                                        color: 'grey',
                                        fontSize: 13,
                                        fontWeight: 400
                                    }}>Chat bot</Text>
                                </View>

                            </View>
                            <Pressable
                                style={[styles.buttonClose]}
                                onPress={closeModal}
                            >
                                <Feather name="x" size={30} color="white" />
                            </Pressable>
                        </View>
                        <View style={styles.body}>
                            <FlatList
                                ref={flatListRef}
                                style={{ paddingHorizontal: 10 }}
                                keyExtractor={(item, index) => index.toString()}
                                data={messages}
                                keyboardShouldPersistTaps="handled"
                                renderItem={({ item }) => {
                                    return (
                                        item?.id &&
                                        <View style={{
                                            alignItems: item.own === 'me' ? 'flex-end' : 'flex-start',
                                        }}>
                                            <View style={item.own === 'me' ? styles.messMe : styles.messAI}>
                                                <Text style={item.own === 'me' ? styles.textMe : styles.textAI}>
                                                    {item.text}
                                                </Text>
                                                {
                                                    item.data && item.own === 'yesil' &&
                                                    <View>
                                                        <Text style={styles.textAI}>
                                                            {'\n'}
                                                            - Tên khách hàng: {infoUser.fullName + '\n \n'}
                                                            - Email: {infoUser.email + '\n \n'}
                                                            - Số điện thoại: {infoUser.phoneNumber || 'chưa cập nhật' + '\n \n'}
                                                        </Text>
                                                        <Pressable
                                                            onPress={() => {
                                                                handleBooking();
                                                                cancleInput();
                                                            }}
                                                            style={{
                                                                marginTop: 20,
                                                                backgroundColor: '#1b7f63',
                                                                padding: 10,
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                borderRadius: 25
                                                            }}>
                                                            <Text style={{
                                                                color: 'white',
                                                                fontSize: 17
                                                            }}>Xác nhận</Text>
                                                        </Pressable>
                                                        <Pressable
                                                            onPress={() => {
                                                                handleCancleBooking();
                                                                cancleInput();
                                                            }}
                                                            style={{
                                                                marginTop: 20,
                                                                backgroundColor: 'grey',
                                                                padding: 10,
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                borderRadius: 25
                                                            }}>
                                                            <Text style={{
                                                                color: 'white',
                                                                fontSize: 17
                                                            }}>Hủy</Text>
                                                        </Pressable>
                                                    </View>
                                                }
                                            </View>
                                        </View>
                                    )
                                }
                                }
                                onContentSizeChange={() => {
                                    // Đảm bảo cuộn đến cuối mỗi khi nội dung thay đổi
                                    flatListRef.current?.scrollToEnd({ animated: true });
                                }}
                            />
                            {
                                loadingMess &&
                                <View style={{
                                    marginHorizontal: 10,
                                    alignItems: 'flex-start',
                                }}>
                                    <View style={styles.messAI}>
                                        <Text style={{
                                            color: 'white',
                                            fontSize: 25
                                        }}>{dots}</Text>
                                    </View>
                                </View>
                            }
                        </View>
                        <KeyboardAvoidingView
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                minHeight: 50,
                                paddingHorizontal: 10,
                                marginBottom: Platform.OS === 'android'
                                    ? 10 : 0

                            }}
                            keyboardVerticalOffset={50}
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                        >
                            {Platform.OS === 'android' &&
                                <View>
                                    <TextInput
                                        ref={textInputRef}
                                        style={styles.inputChatAndroid}
                                        value={textChat}
                                        // onFocus={focusInput}
                                        // onBlur={cancleInput}
                                        onChangeText={(event) => { changeTextChat(event) }}
                                        // onSubmitEditing={addMessage}
                                        multiline
                                        numberOfLines={4}
                                        placeholder="Nhập tin nhắn..."
                                        placeholderTextColor={'#d3d0d0'}
                                        textAlignVertical="bottom"
                                    />
                                    <Pressable
                                        onPress={addMessage}
                                        disabled={loadingMess}
                                        style={{
                                            position: 'absolute',
                                            right: 0,
                                            backgroundColor: !loadingMess ? '#1b7f63' : 'grey',
                                            height: 50,
                                            width: 50,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: 25
                                        }}
                                    >
                                        <Feather name="send" size={24} color="white" />
                                    </Pressable>
                                </View>
                            }
                            {
                                Platform.OS === 'ios' &&
                                <View style={{
                                    justifyContent: 'center',
                                    height: 'auto'
                                }}>

                                    <ScrollView
                                        style={styles.scrollContainer}
                                        ref={scrollViewRef}
                                        keyboardShouldPersistTaps="handled"
                                    >
                                        <View style={{
                                            minHeight: 50,
                                            justifyContent: 'center',
                                        }}>
                                            <TextInput
                                                ref={textInputRef}
                                                style={styles.inputChatIOS}
                                                value={textChat}
                                                onChangeText={(value) => changeTextChat(value)}
                                                multiline={true}
                                                numberOfLines={4}
                                                placeholder="Nhập tin nhắn..."
                                                placeholderTextColor="#999"
                                            />
                                        </View>
                                    </ScrollView>

                                    <Pressable
                                        onPress={addMessage}
                                        disabled={loadingMess}
                                        style={{
                                            position: 'absolute',
                                            right: 0,
                                            backgroundColor: !loadingMess ? '#1b7f63' : 'grey',
                                            height: 50,
                                            width: 50,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: 25
                                        }}
                                    >
                                        <Feather name="send" size={24} color="white" />
                                    </Pressable>
                                </View>
                            }
                        </KeyboardAvoidingView>
                    </View>
                </View >
            </SafeAreaView >
        </SafeAreaProvider >

    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#343434',
    },
    safeAre: {
        flex: 1,
        width: '100%',
    },
    centeredView: {
    },
    modalView: {
        height: '100%',
        width: '100%',
        backgroundColor: '#343434',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    circle_out: {
        width: 35,
        height: 35,
        borderRadius: 35 / 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#505050',
        borderWidth: 0.5
    },
    circle: {
        width: 25,
        height: 25,
        borderRadius: 25 / 2,
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
    buttonClose: {
        borderRadius: 20,
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20
    },
    body: {
        flex: 1,
        width: '100%',
        // paddingHorizontal: 20,
    },
    messAI: {
        backgroundColor: '#1b1b1b',
        borderRadius: 12,
        width: '80%',
        marginVertical: 10,
        padding: 12
    },
    textAI: {
        color: 'white',
        fontSize: 17
    },
    messMe: {
        backgroundColor: '#eeecec',
        borderRadius: 12,
        width: '80%',
        marginVertical: 10,
        padding: 12
    },
    textMe: {
        color: 'black',
        fontSize: 17
    },
    scrollContainer: {
        maxHeight: 80,
        width: '100%',
        backgroundColor: '#262626',
        borderRadius: 25,
        color: '#d3d0d0',
        fontSize: 17,
    },
    inputChatIOS: {
        color: '#d3d0d0',
        fontSize: 17,
        padding: 0,
        paddingLeft: 15,
        paddingRight: 60,
    },
    inputChatAndroid: {
        minHeight: 50,
        backgroundColor: '#262626',
        borderRadius: 25,
        color: '#d3d0d0',
        fontSize: 17,
        paddingLeft: 15,
        paddingRight: 60,
    }
});