import axios from 'axios';
import { BlurView } from 'expo-blur';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Dimensions, View, Keyboard, TouchableWithoutFeedback, ScrollView, TextInput, FlatList, Text, Image, Pressable, Animated, Button, Platform, ActivityIndicator, Alert, KeyboardAvoidingView, Modal } from 'react-native';
import Fontisto from '@expo/vector-icons/Fontisto';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { createStackNavigator } from '@react-navigation/stack';
import SearchScreen from './SearchScreen';
import MyHeader from '../CustomTabBar/CustomHeader';
import BoxFriend from '../BoxFriend/BoxFriend';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { setAuth, setToken } from '../../../store/slices/appSlice';
import { REACT_APP_BACKEND_URL } from '@env';
import * as SecureStore from 'expo-secure-store';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import RNPickerSelect from 'react-native-picker-select';
import { LinearGradient } from 'expo-linear-gradient';
import ImageFuFu from './ImageFuFu';
import DetailTicketScreen from '../Ticket/DetailTicketScreen';

const SubStack = createStackNavigator();
const { width, height } = Dimensions.get('window');

interface objectUser {
    id: number;
    username: string;
    email: string;
    address: string;
    phone: string;
}

interface objectSchedule {
    timeType: string,
    allCodeData: {
        valueEn: string,
        valueVi: string
    },
    groupData: {
        id: string,
        nameGroup: string
    },
    value: string,
    label: string
}

interface objectTable {
    id: number,
    tableNumber: number,
    maxPeople: number,
    isEmpty: boolean,
    status: boolean,
    idGroup: number,
    isChooose: boolean
}

interface objectFilter { label: string, value: string }

interface StaffData {
    id: number | null;
    fullName: string | null;
}

interface ScheduleData {
    id: string;
    date: string;
    timeType: string;
}

interface TimeSlot {
    valueVi: string;
    valueEn: string;
}

interface Ticket {
    id: number;
    idSchedule: string;
    numberPeople: number;
    phoneCustomer: string;
    nameCustomer: string;
    emailCustomer: string;
    ticketType: string;
    numberAdult: number;
    numberKid: number;
    numberAdultBest: number;
    numberKidBest: number;
    idStaff: number;
    bill: number;
    dishOrder: string;
    priceOrder: number;
    payStatus: boolean;
    payToken: string | null;
    receiveStatus: boolean;
    createdAt: string;
    updatedAt: string;
    staffData: StaffData;
    scheduleData: ScheduleData;
    timeSlot: TimeSlot;
    tableString: string;
}


async function saveToken(key: string, value: string) {
    await SecureStore.setItemAsync(key, value);
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

const BookingScreen = ({ navigation }: any) => {
    const topAnim = useRef(new Animated.Value(0)).current;
    const botttomAnim = useRef(new Animated.Value(-150)).current;

    const dispatch = useDispatch();
    const [date, setDate] = useState(new Date());
    const token = useSelector((state: RootState) => state.app.token);
    const infoUser = useSelector((state: RootState) => state.app.inforUser);
    const [show, setShow] = useState(false);
    const [numberKid, setNumberKid] = useState<number>(0);
    const [numberAdult, setNumberAdult] = useState<number>(0);
    const [timeStamp, setTimeStamp] = useState(new Date().setUTCHours(0, 0, 0, 0));
    const [timeType, setTimeType] = useState(null);
    const [arrSchedule, setArrSchedule] = useState<objectFilter[]>([]);
    const [arrTable, setArrTable] = useState<objectTable[]>([]);
    const [isBooking, setIsBooking] = useState(false);
    const [loadingBooking, setLoadingBooking] = useState(false);

    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [valueTicket, setValueTicket] = useState<Ticket>();


    const buildArraySchedule = (arrSchedule: [objectSchedule]) => {
        const filter = arrSchedule.map((item) => ({
            value: item.timeType,
            label: item.allCodeData.valueEn
        }));

        return filter;
    }

    const buildArrayTable = (arrTable: [objectTable]) => {
        arrTable.map(item => {
            item.isChooose = false;
            return item;
        })

        return arrTable;
    }



    const onChangeDate = async (event: any, selectedDate: any) => {
        setShow(false);
        if (event.type === 'set') {
            await setDate(selectedDate || date);
            await setTimeStamp(event.nativeEvent.timestamp || timeStamp);
            setTimeType(null);
        }
    };

    useEffect(() => {
        setLoadingSchedule(true);
        const getSchedule = async () => {
            await axios.post(`http://192.168.1.77:3000/api/user/get-schedule2`,
                {
                    date: timeStamp
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            )
                .then(async function (response) {
                    await setArrSchedule(buildArraySchedule(response.data.dataSchedule));
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
                    setLoadingSchedule(false);
                });
        }

        getSchedule();

    }, [timeStamp])

    const showMode = () => {
        setShow(true);
    };

    const nextStep = () => {
        if (!timeStamp || !timeType) {
            Alert.alert(
                "Warning",
                "Time can't be empty",
                [
                    {
                        text: "Ok"
                    }
                ],
                { cancelable: true }
            );
            return;
        }
        if ((numberKid + numberAdult) <= 0) {
            Alert.alert(
                "Warning",
                "Number of people must be greater than 0",
                [
                    {
                        text: "Ok"
                    }
                ],
                { cancelable: true }
            );
            return;
        }
        if ((numberKid + numberAdult) > 66) {
            Alert.alert(
                "Warning",
                "The number of people is too large. The restaurant only has enough seating for 66 people.",
                [
                    {
                        text: "Ok"
                    }
                ],
                { cancelable: true }
            );
            return;
        }
        Keyboard.dismiss();
        Animated.timing(topAnim, {
            toValue: 100,
            duration: 500,
            useNativeDriver: false, // Không dùng native driver vì chúng ta đang thay đổi width
        }).start();
        getArrTable();
    }

    const backStep = () => {
        Animated.timing(botttomAnim, {
            toValue: -150,
            duration: 300,
            useNativeDriver: false,
        }).start();
        Animated.timing(topAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false, // Không dùng native driver vì chúng ta đang thay đổi width
        }).start();
    }

    const getArrTable = async () => {
        await axios.post(`http://192.168.1.77:3000/api/user/get-table-empty`,
            {
                date: timeStamp,
                timeType: timeType
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        )
            .then(function (response) {
                setArrTable(buildArrayTable(response.data.dataTable));
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

    // const handleNumberChange = async (value: any, type: string) => {
    //     if (/^\d*$/.test(value) && Number(value) <= 66) {
    //         if (type === 'adult') {
    //             await setNumberAdult(value);
    //         } else if (type === 'kid') {
    //             await setNumberKid(value);
    //         }
    //     }
    // };

    const handleNumberChange = async (type: string, id: string) => {
        if (id === 'kid' && type === 'minu') {
            setNumberKid(numberKid - 1 >= 0 ? numberKid - 1 : 0);
        } else if (id === 'kid' && type === 'plus') {
            setNumberKid(numberKid + 1)
        } else if (id === 'adult' && type === 'minu') {
            setNumberAdult(numberAdult - 1 >= 0 ? numberAdult - 1 : 0);
        } else if (id === 'adult' && type === 'plus') {
            setNumberAdult(numberAdult + 1)
        }
    }

    const handleChooseTable = async (item: objectTable) => {
        if (item.isEmpty) {
            if (!item.isChooose) {
                // Tính tổng số chỗ đã được chọn trước khi cập nhật
                const totalChosenSeats = arrTable.reduce((count, table) =>
                    table.isChooose ? count + 2 : count, 0
                );

                // Tính tổng số người (trẻ em và người lớn)
                const totalPeople = numberKid + numberAdult;

                // Kiểm tra nếu vượt quá số người
                if (totalChosenSeats >= totalPeople) {
                    Alert.alert(
                        "Warning",
                        "No more choose",
                        [
                            {
                                text: "Ok"
                            }
                        ],
                        { cancelable: true } // Có thể hủy bằng cách nhấn ra ngoài Alert
                    );
                    return;
                }
            }
            // Cập nhật bàn đã chọn
            await setArrTable(prevArr =>
                prevArr.map((table) =>
                    table.id === item.id ? { ...table, isChooose: !table.isChooose } : table
                )
            );
        } else {
            return
        }
    }

    useEffect(() => {
        const updatedChosenSeats = arrTable.reduce((count, table) =>
            table.isChooose ? count + 2 : count, 0
        );

        if (updatedChosenSeats >= numberAdult + numberKid) {
            setIsBooking(true);
        } else {
            setIsBooking(false);
        }

        if (numberAdult + numberKid > 0) {
            Animated.timing(botttomAnim, {
                toValue: updatedChosenSeats > 0 ? 0 : -150,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }
    }, [arrTable]);

    const handleBooking = async () => {
        setLoadingBooking(true);
        const arrTableChoose: number[] = [];
        await Promise.all(arrTable.map(async (item) => {
            if (item.isChooose) {
                arrTableChoose.push(item.id);
            }
        }));
        if (arrTableChoose.length > 0) {
            await axios.post(`http://192.168.1.77:3000/api/user/create-ticket`,
                {
                    timeType: timeType,
                    date: timeStamp,
                    phoneCustomer: "0963872727",
                    nameCustomer: infoUser.fullName,
                    email: infoUser.email,
                    numberTicketType: {
                        numberAdultBest: numberAdult,
                        numberKidBest: numberKid
                    },
                    arrIdTable: arrTableChoose
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(function (response) {
                    if (response.data.errCode === 0) {
                        setTimeType(null);
                        setNumberAdult(0);
                        setNumberKid(0);
                        // setDate(new Date());
                        // setTimeStamp(new Date().setUTCHours(0, 0, 0, 0));
                        backStep();
                        setValueTicket(response.data.ticketNew);
                        setModalVisible(true);
                    } else if (response.data.errCode === 4) {
                        alert(response.data.errMessage);
                        nextStep();
                    } else {
                        alert(response.data.errMessage);
                    }
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
                    setLoadingBooking(false);
                });
        } else {
            alert("Chưa chọn bàn")
        }
    }

    const closeModal = () => {
        setModalVisible(false);
    }

    return (
        <SafeAreaProvider style={styles.container}>
            <SafeAreaView style={styles.safeAre}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        Alert.alert('Modal has been closed.');
                        setModalVisible(!modalVisible);
                    }}>
                    <DetailTicketScreen closeModal={closeModal} valueTicket={valueTicket as Ticket} />
                </Modal>
                <MyHeader title={'Booking'} />
                <View style={styles.body}>
                    <Animated.View
                        style={{
                            width: width,
                            flex: 1,
                            paddingHorizontal: 10,
                            top: topAnim.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '-100%'],
                            }),
                        }}>

                        {/* SELECT TIME */}
                        <Pressable onPress={Keyboard.dismiss} style={{ height: '100%' }}>
                            <Text style={{
                                fontSize: 30,
                                fontWeight: '500',
                                marginBottom: 10,
                                color: '#c4c1c1',
                                letterSpacing: 1
                            }}>
                                When are you eating ?
                            </Text>

                            <TouchableWithoutFeedback
                                onPress={Keyboard.dismiss} accessible={true}>
                                <View>
                                    <View style={styles.formInput}>
                                        <View style={styles.input}>
                                            <View style={styles.iconInput}>
                                                <Fontisto name="date" size={30} color="white" />
                                            </View>
                                            {
                                                Platform.OS === 'android' &&
                                                <View style={styles.valueInput}>
                                                    <Pressable onPress={showMode}>
                                                        <Text style={{ fontSize: 17, fontWeight: '400', color: 'white' }}> {date.toLocaleDateString()}</Text>
                                                    </Pressable>
                                                    {show &&
                                                        <DateTimePicker
                                                            testID="dateTimePicker"
                                                            value={date}
                                                            mode={'date'}
                                                            //is24Hour={true}
                                                            display="default"
                                                            onChange={onChangeDate}
                                                            minimumDate={new Date()}
                                                        />
                                                    }
                                                </View>
                                            }
                                            {
                                                Platform.OS === 'ios'
                                                &&
                                                <View style={styles.valueInput}>
                                                    <RNDateTimePicker
                                                        testID="dateTimePicker"
                                                        value={date}
                                                        mode={'date'}
                                                        //is24Hour={true}
                                                        display="default"
                                                        onChange={onChangeDate}
                                                        minimumDate={new Date()}
                                                        themeVariant="dark"
                                                    />
                                                </View>
                                            }
                                        </View>
                                        <View style={styles.input}>
                                            <View style={styles.iconInput}>
                                                <AntDesign name="clockcircleo" size={30} color="white" />
                                            </View>
                                            <View style={styles.valueInput}>
                                                {!loadingSchedule
                                                    ?
                                                    <RNPickerSelect
                                                        value={timeType}
                                                        onValueChange={(itemValue) => setTimeType(itemValue)}
                                                        style={pickerSelectStyles}
                                                        placeholder={{
                                                            label: 'Select time...',
                                                            value: null,
                                                            color: 'gray',
                                                        }}
                                                        useNativeAndroidPickerStyle={false}
                                                        // activeItemStyle={Platform.OS === 'android' ? styles.picker : Platform.OS === 'ios' && styles.pickerIOS}
                                                        items={arrSchedule.length > 0 ? arrSchedule : []}
                                                    />
                                                    :
                                                    <Text style={{ color: 'grey', fontSize: 17 }}>Loading...</Text>}
                                            </View>
                                        </View>
                                        <View style={styles.input}>
                                            <Pressable onPress={() => handleNumberChange('minu', 'adult')}>
                                                <AntDesign name="minuscircleo" size={30} color="#b62525" />
                                            </Pressable>
                                            <View>
                                                <Text style={{ color: 'white', fontSize: 17 }}>Adult</Text>
                                                <Text style={{ color: 'grey', fontSize: 14 }}>Above 12 years old</Text>
                                            </View>
                                            <Text style={{ color: 'white', fontSize: 20 }}>{numberAdult}</Text>
                                            <Pressable onPress={() => handleNumberChange('plus', 'adult')}>
                                                <AntDesign name="pluscircleo" size={30} color='#1b7f63' />
                                            </Pressable>
                                        </View>
                                        <View style={styles.input}>
                                            <Pressable onPress={() => handleNumberChange('minu', 'kid')}>
                                                <AntDesign name="minuscircleo" size={30} color="#b62525" />
                                            </Pressable>
                                            <View>
                                                <Text style={{ color: 'white', fontSize: 17 }}>Kid</Text>
                                                <Text style={{ color: 'grey', fontSize: 14 }}>Below 12 years old</Text>
                                            </View>
                                            <Text style={{ color: 'white', fontSize: 20 }}>{numberKid}</Text>
                                            <Pressable onPress={() => handleNumberChange('plus', 'kid')}>
                                                <AntDesign name="pluscircleo" size={30} color='#1b7f63' />
                                            </Pressable>
                                        </View>

                                        {/* <View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
                                            <View style={styles.input}>
                                                <View style={styles.iconInput}>
                                                    <Feather name="user" size={30} color="white" />
                                                </View>
                                                <View style={styles.valueInput}>
                                                    <Text style={{ color: 'white', fontSize: 17 }}>Adult</Text>
                                                    <TextInput
                                                        value={numberAdult}
                                                        onSubmitEditing={nextStep}
                                                        onChangeText={(value) => { handleNumberChange(value, 'adult') }}
                                                        style={{ paddingRight: 55, textAlign: 'right', width: '100%', height: '100%', position: 'absolute', color: 'white', fontSize: 17 }}
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                            </View>
                                            <View style={styles.input}>
                                                <View style={styles.iconInput}>
                                                    <Feather name="user" size={30} color="white" />
                                                </View>
                                                <View style={styles.valueInput}>
                                                    <Text style={{ color: 'white', fontSize: 17 }}>Kid</Text>
                                                    <TextInput
                                                        onSubmitEditing={nextStep}
                                                        value={numberKid}
                                                        onChangeText={(value) => { handleNumberChange(value, 'kid') }}
                                                        style={{ paddingRight: 40, textAlign: 'right', width: '100%', height: '100%', position: 'absolute', color: 'white', fontSize: 17 }}
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                            </View>
                                        </View> */}
                                    </View>
                                    <Pressable onPress={nextStep}>
                                        <LinearGradient
                                            colors={['#1b7f63', '#29d297',]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{
                                                width: '100%',
                                                height: 60,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                borderRadius: 15,
                                                gap: 2
                                            }}
                                        >
                                            <Text style={{
                                                color: 'white',
                                                fontWeight: '500',
                                                fontSize: 20
                                            }}>Next Step</Text>
                                            <AntDesign name="down" size={24} color="white" />
                                        </LinearGradient>
                                    </Pressable>
                                </View>
                            </TouchableWithoutFeedback>

                            <Text style={{
                                marginTop: 10,
                                fontSize: 20,
                                fontWeight: '500',
                                color: '#c4c1c1'
                            }}>Ticket</Text>

                            <View
                                style={{
                                    marginVertical: 10,
                                    flex: 1,
                                    width: '100%',
                                    borderStyle: 'dashed',
                                    borderWidth: 1,
                                    padding: 5,
                                    borderColor: 'white',
                                }}>
                                <Image style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 10,
                                }}
                                    resizeMode="cover"
                                    source={{ uri: 'https://res.cloudinary.com/dtjdfh2ly/image/upload/v1726895720/F_and_B_Pro_App/ticketImage_4_xc9rmz.jpg' }} />

                            </View>

                            <View
                                style={{
                                    marginVertical: 10,
                                    flex: 1,
                                    width: '100%',
                                    borderStyle: 'dashed',
                                    borderWidth: 1,
                                    padding: 5,
                                    borderColor: 'white',
                                }}>
                                <Image style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 10,
                                }}
                                    resizeMode="cover"
                                    source={{ uri: 'https://res.cloudinary.com/dtjdfh2ly/image/upload/v1728018431/F_and_B_Pro_App/ba6f00f7-97ee-40bd-9c2e-288962daf2a2.png' }} />

                            </View>
                        </Pressable>

                        {/* SELECT TABLE */}
                        <View style={{ height: '100%' }}>
                            <Text style={{
                                color: '#c4c1c1',
                                fontSize: 30,
                                fontWeight: '500',
                                letterSpacing: 1,
                            }}>
                                Select Seats
                            </Text>
                            <Text style={{ color: 'grey', fontSize: 17 }}>Each table has 2 seats</Text>


                            <View style={styles.viewArrTable}>

                                {arrTable.length > 0
                                    ?
                                    arrTable.map((item: objectTable, index) => {
                                        return (
                                            <Pressable
                                                onPress={() => { handleChooseTable(item) }}
                                                style={[styles.itemTable, {
                                                    backgroundColor: !item.isEmpty
                                                        ? '#343434'
                                                        : (item.isChooose && item.isEmpty)
                                                            ? '#1b7f63'
                                                            : '#adb1b8'
                                                }]} key={index}>
                                                {item.isChooose
                                                    ?
                                                    <>
                                                        <Text style={{
                                                            color: 'white',
                                                            fontSize: 10
                                                        }}>{item.tableNumber}</Text>
                                                        <AntDesign name="check" size={24} color="white" />
                                                    </>
                                                    : <Text style={{
                                                        color: 'white',
                                                        fontSize: 17
                                                    }}>{item.tableNumber}</Text>
                                                }

                                            </Pressable>
                                        )
                                    })
                                    :
                                    <View style={{ height: '100%', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 17, color: '#c4c1c1' }}>
                                            Hiện tại nhà hàng chúng tôi không còn bàn trống cho khung giờ này. Quý khách thông cảm.
                                        </Text>
                                    </View>
                                }

                            </View>

                            <View style={{ height: 60, flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                                <Pressable onPress={backStep} style={{ flex: 1, height: 70 }}>
                                    <LinearGradient
                                        colors={['transparent', 'transparent',]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{
                                            height: '100%',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: 12,
                                            backgroundColor: '#1b7f63',
                                            gap: 2
                                        }}
                                    >
                                        <Ionicons name="chevron-up" size={24} color="white" />
                                        <Text style={{
                                            color: 'white',
                                            fontWeight: '400',
                                            fontSize: 20
                                        }}>Back</Text>
                                    </LinearGradient>
                                </Pressable>
                                <View style={{
                                    flex: 2,
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    gap: 10,
                                    backgroundColor: '#F5F4F4',
                                    borderRadius: 10,
                                    padding: 5,
                                    height: 70
                                }}>
                                    <View style={styles.typeSeat}>
                                        <View style={[styles.textSeat, { backgroundColor: '#adb1b8' }]}></View>
                                        <Text style={{ fontWeight: '500' }}>Available</Text>
                                    </View>
                                    <View style={styles.typeSeat}>
                                        <View style={[styles.textSeat, { backgroundColor: '#343434' }]}></View>
                                        <Text style={{ fontWeight: '500' }}>Unavailable</Text>
                                    </View>
                                    <View style={styles.typeSeat}>
                                        <View style={[styles.textSeat, { backgroundColor: '#1b7f63' }]}></View>
                                        <Text style={{ fontWeight: '500' }}>Chosen</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* BOX BOOKING */}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            backgroundColor: '#e7fff8',
                            bottom: botttomAnim,
                            height: 150,
                            width: width,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 20,
                            borderTopWidth: 1,
                            borderLeftWidth: 1,
                            borderRightWidth: 1,
                            borderColor: 'green'
                        }}
                    >
                        <View style={{ flex: 1, gap: 10, width: '100%', flexDirection: 'row', justifyContent: 'space-around' }}>
                            <View style={{ width: '20%' }}>
                                <Text style={{ color: 'grey', fontWeight: '500' }}>Seat</Text>
                                <Text style={{ fontWeight: '500', fontSize: 17 }}>
                                    {arrTable.reduce((count, table) =>
                                        table.isChooose ? count + 2 : count, 0)}
                                    /{numberAdult + numberKid}
                                </Text>
                            </View>
                            <View>
                                <Text style={{ color: 'grey', fontWeight: '500' }}>Ticket</Text>
                                <Text style={{ fontWeight: '500', fontSize: 17 }}>
                                    {numberAdult} Adult, {numberKid} Kid
                                </Text>
                            </View>
                            <View>
                                <Text style={{ color: 'grey', fontWeight: '500' }}>Cost</Text>
                                <Text style={{ fontWeight: '500', fontSize: 17 }}>{formatCurrency(numberAdult * 200000 + numberKid * 150000)}</Text>
                            </View>
                        </View>

                        <Pressable disabled={!isBooking} onPress={handleBooking} style={{ flex: 1, width: '100%' }}>
                            <LinearGradient
                                colors={isBooking ? ['#1b7f63', '#29d297'] : ['#747373', '#cdcdcd']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    height: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    gap: 10
                                }}
                            >
                                {loadingBooking ?
                                    <>
                                        <ActivityIndicator size="large" color="white" />
                                        <Text style={{
                                            color: 'white',
                                            fontWeight: '500',
                                            fontSize: 20
                                        }}>Loading..</Text>
                                    </>
                                    :
                                    <>
                                        <Text style={{
                                            color: 'white',
                                            fontWeight: '400',
                                            fontSize: 20
                                        }}>Booking</Text>
                                        <FontAwesome name="ticket" size={30} color="white" />
                                    </>}

                            </LinearGradient>
                        </Pressable>
                    </Animated.View>
                </View >
            </SafeAreaView >
        </SafeAreaProvider >
    )
}



// export default function BookingScreen() {
//     return (
//         <SubStack.Navigator
//             initialRouteName='main'
//             screenOptions={{
//                 headerShown: false,
//                 header: (props) => (
//                     <MyHeader {...props} />
//                 ),
//             }}
//         >
//             <SubStack.Screen
//                 name="main"
//                 component={MainScreen}
//                 options={{ title: 'Booking' }}
//             />
//             <SubStack.Screen
//                 name="search"
//                 component={SearchScreen}
//                 options={{ title: 'Search' }}
//             />
//         </SubStack.Navigator>
//     )
// }

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        color: 'white',
        fontSize: 17,
        height: '100%'
    },
    inputAndroid: {
        color: 'white',
        fontSize: 17,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    safeAre: {
        flex: 1,
        width: '100%',
    },
    body: {
        flex: 1,
        overflow: 'hidden'
    },
    formInput: {
        height: 280,
        gap: 10,
        marginBottom: 10
    },
    input: {
        flex: 1,
        borderRadius: 15,
        backgroundColor: '#343434',
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        gap: 5,
        overflow: 'hidden'
    },
    valueInput: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        height: 60,
        borderRadius: 10,
        paddingHorizontal: 10,
        justifyContent: 'flex-end',
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row'
    },
    iconInput: {
        position: 'absolute',
        margin: 20
    },
    picker: {
        width: 170,
        color: 'white'
    },
    pickerIOS: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    timeType: {
        fontSize: 16,
    },


    viewArrTable: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginVertical: 20,
        justifyContent: 'center',
        minHeight: 300,
        // marginTop: 30
    },
    itemTable: {
        width: 50,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },

    typeSeat: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center'
    },
    textSeat: { height: 25, width: 25, borderRadius: 5 }

});

export default BookingScreen;
