import axios from 'axios';
import { BlurView } from 'expo-blur';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Dimensions, View, Keyboard, TouchableWithoutFeedback, ScrollView, TextInput, FlatList, Text, Image, Pressable, Animated, Button, Platform, ActivityIndicator, Alert, KeyboardAvoidingView } from 'react-native';
import Fontisto from '@expo/vector-icons/Fontisto';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { createStackNavigator } from '@react-navigation/stack';
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
import { FontAwesome5 } from '@expo/vector-icons';

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
    const [timeType, setTimeType] = useState<string | null>(null);
    const [arrSchedule, setArrSchedule] = useState<objectFilter[]>([]);
    const [arrTable, setArrTable] = useState<objectTable[]>([]);
    const [isBooking, setIsBooking] = useState(false);
    const [loadingBooking, setLoadingBooking] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [countDown, setcountDown] = useState<string | null>(null);
    const pickerRef = useRef<any>(null);

    // useEffect(() => {
    //     const targetTime = new Date();
    //     targetTime.setHours(20);
    //     targetTime.setMinutes(30);
    //     targetTime.setSeconds(0);

    //     const updateCountdown = () => {
    //         const now = new Date();
    //         const distance = targetTime.getTime() - now.getTime();

    //         if (distance <= 0) {
    //             setcountDown('Countdown Finished');
    //             clearInterval(timer);
    //             return;
    //         }

    //         const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    //         const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    //         const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    //         setcountDown(`${hours}:${minutes}:${seconds}`);
    //     };

    //     const timer = setInterval(updateCountdown, 1000);

    //     return () => clearInterval(timer);
    // }, []);



    const buildArraySchedule = (arrSchedule: [objectSchedule]) => {
        const filter = arrSchedule.map((item) => ({
            value: item.timeType,
            label: item.allCodeData.valueEn,
            color: 'black'
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
            await axios.post(`http://192.168.1.24:3000/api/get-schedule2`,
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

    }, [timeStamp]);

    const getArrTable = async () => {
        setLoadingTable(true);
        await axios.post(`http://192.168.1.24:3000/api/get-table-empty`,
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
                setLoadingTable(false);
            });
    };

    const showMode = () => {
        setShow(true);
    };

    useEffect(() => {
        if (timeType !== null) {
            getArrTable();
        }
    }, [timeType]);

    // const handleNumberChange = async (value: any, type: string) => {
    //     // Chỉ cho phép nhập số
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


    const chooseSeat = () => {
        if (checkParameter()) {
            Keyboard.dismiss();
            getArrTable();
        }
    };

    const checkParameter = () => {
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
            return false;
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
            return false;
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
            return false;
        }
        return true;
    }

    const handleChooseTable = async (item: objectTable) => {
        if (item.isEmpty && checkParameter()) {
            if (!item.isChooose) {
                const totalChosenSeats = arrTable.reduce((count, table) =>
                    table.isChooose ? count + 2 : count, 0
                );

                const totalPeople = numberKid + numberAdult;

                if (totalChosenSeats >= totalPeople) {
                    Alert.alert(
                        "Warning",
                        "No more choose",
                        [
                            {
                                text: "Ok"
                            }
                        ],
                        { cancelable: true }
                    );
                    return;
                }
            }
            // Cập nhật bàn đã press
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
    }, [arrTable, numberAdult, numberKid]);

    const clearState = () => {
        // setDate(new Date());
        // setTimeStamp(new Date().setUTCHours(0, 0, 0, 0));
        // setTimeType(null);
        chooseSeat();
        setNumberAdult(0);
        setNumberKid(0);
        setArrTable([]);
        setIsBooking(false);
        Animated.timing(botttomAnim, {
            toValue: -150,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    const handleBooking = async () => {
        setLoadingBooking(true);
        const arrTableChoose: number[] = [];
        await Promise.all(arrTable.map(async (item) => {
            if (item.isChooose) {
                arrTableChoose.push(item.id);
            }
        }));
        if (arrTableChoose.length > 0) {
            await axios.post(`http://192.168.1.24:3000/api/create-ticket`,
                {
                    timeType: timeType,
                    date: timeStamp,
                    phoneCustomer: "0963872727",
                    nameCustomer: "Khachle",
                    idStaff: infoUser.idUser,
                    numberTicketType: {
                        numberAdult: numberAdult,
                        numberKid: numberKid
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
                        clearState();
                    } else if (response.data.errCode === 4) {
                        alert(response.data.errMessage);
                        chooseSeat();
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

    return (
        <SafeAreaProvider style={styles.container}>
            <SafeAreaView style={styles.safeAre}>
                <View style={styles.body}>
                    {/* <TouchableWithoutFeedback
                        onPress={Keyboard.dismiss} accessible={true}> */}

                    <ScrollView>
                        {/* SELECT TIME */}
                        <View>
                            <View style={{ width: '100%', padding: 10 }}>
                                <Text style={{ color: 'white', fontSize: 20, letterSpacing: 1 }}>Select Time & Passenger</Text>
                            </View>
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
                                    <Pressable
                                        onPress={() => pickerRef.current.togglePicker()}
                                        style={styles.valueInput}>
                                        {!loadingSchedule
                                            ?
                                            <RNPickerSelect
                                                ref={pickerRef}
                                                value={timeType}
                                                onValueChange={(itemValue) => { setTimeType(itemValue) }}
                                                style={pickerSelectStyles}
                                                placeholder={{
                                                    label: 'Select time...',
                                                    value: null,
                                                    color: 'gray',
                                                }}
                                                useNativeAndroidPickerStyle={false}
                                                items={arrSchedule.length > 0 ? arrSchedule : []}
                                            />
                                            :
                                            <Text style={{ color: 'grey', fontSize: 17 }}>Loading...</Text>}
                                    </Pressable>
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
                            </View>
                        </View>
                        {/* SELECT TABLE  */}
                        <View style={{ alignItems: 'center' }}>
                            {!loadingTable
                                ?
                                arrTable.length > 0 && timeType !== null
                                    ?
                                    <>
                                        <View style={{ width: '100%', padding: 10, marginBottom: 10 }}>
                                            <Text style={{ color: 'white', fontSize: 20, letterSpacing: 1 }}>Select Seats</Text>
                                            <Text style={{ color: 'grey', fontSize: 15 }}>Each table has 2 seats</Text>
                                        </View>

                                        <View style={styles.viewArrTable}>
                                            {
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
                                                            {!item.isEmpty && countDown &&
                                                                <Text style={{
                                                                    color: 'white',
                                                                    fontSize: 13
                                                                }}>
                                                                    {countDown}
                                                                </Text>}
                                                        </Pressable>
                                                    )
                                                })
                                            }
                                            <View style={{ height: 60, width: '100%' }}>
                                                <View style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    gap: 10,
                                                    backgroundColor: '#F5F4F4',
                                                    borderRadius: 10,
                                                    padding: 5,
                                                    height: 60,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
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
                                    </>
                                    :
                                    <View style={{ marginTop: 40 }}>
                                        <Text style={{ fontSize: 17, color: '#c4c1c1' }}>
                                            Select a time slot to see seats
                                        </Text>
                                    </View>
                                :
                                <>
                                    <ActivityIndicator size="large" color="white" />
                                    <Text style={{
                                        color: 'white',
                                        fontWeight: '500',
                                        fontSize: 20
                                    }}>Loading..</Text>
                                </>
                            }
                        </View>
                    </ScrollView>

                    {/* </TouchableWithoutFeedback> */}

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
        height: '100%',
        position: 'absolute',
        right: 0
    },
    inputAndroid: {
        color: 'white',
        fontSize: 17
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
        overflow: 'hidden',
        paddingHorizontal: 10,
        paddingVertical: 20
    },
    viewTicket: {
        backgroundColor: '#23252c',
        borderRadius: 24,
        padding: 10,
    },
    formInput: {
        height: 280,
        gap: 10,
        marginBottom: 10
    },
    input: {
        flex: 1,
        borderRadius: 15,
        backgroundColor: '#40404a',
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        gap: 5,
        overflow: 'hidden'
    },
    valueInput: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        height: '100%',
        borderRadius: 10,
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'flex-end',
        flex: 1,
        position: 'relative'
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
        justifyContent: 'center',
        minHeight: 430,
        height: 570,
        // marginTop: 30
    },
    itemTable: {
        width: 60,
        height: 60,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },

    typeSeat: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center'
    },
    textSeat: {
        height: 25,
        width: 25,
        borderRadius: 5
    }

});

export default BookingScreen;
