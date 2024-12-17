import { Alert, Dimensions, Keyboard, Modal, Platform, Pressable, RefreshControl, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useEffect, useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import axios from "axios";
import saveToken from "../../../store/token/savetoken";
import { setArrTicket, setAuth } from "../../../store/slices/appSlice";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import RNDateTimePicker from "@react-native-community/datetimepicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Fontisto, MaterialIcons } from "@expo/vector-icons";
import DetailTicket from "./DetailTicket";
import { StatusBar } from "expo-status-bar";
import formatCurrency from "../../../store/format/formatPrice";
import { REACT_APP_BACKEND_URL } from "@env";

const { width, height } = Dimensions.get('window');

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


interface objectAllCode {
    keyMap: string,
    valueEn: string,
    isChoose: boolean
}

interface numberTicket {
    totalOnline: number,
    totalBasic: number
}



export default function ListTicket({ navigation, route }: any) {
    const parameter = route.params && route.params ? route.params : undefined;


    const dispatch = useDispatch();
    const arrTicketRedux = useSelector((state: RootState) => state.app.arrTicket);
    const [arraySchedule, setArrSchedule] = useState<objectAllCode[]>([]);
    const [arrTicket, setArrTicketState] = useState<Ticket[]>([]);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const token = useSelector((state: RootState) => state.app.token);
    const [show, setShow] = useState(false);
    const [date, setDate] = useState(new Date());
    const [timeStamp, setTimeStamp] = useState(new Date().setUTCHours(0, 0, 0, 0));
    const [numberTicket, setNumberTicket] = useState<numberTicket>();
    const [modalVisible, setModalVisible] = useState(false);
    const [valueTicket, setValueTicket] = useState<Ticket>();

    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        setLoadingSchedule(true);
        const getSchedule = async () => {
            await axios.get(`http://192.168.1.24:3000/api/get-all-code?type=TIME`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(function (response) {
                    if (response.data.errCode !== 0) {
                        alert(response.data.errMessage);
                    } else {
                        setArrSchedule(response.data.data);
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
                    setLoadingSchedule(false);
                });
        }
        getSchedule();
    }, [token]);

    const getTicket = async () => {
        await axios.post(`http://192.168.1.24:3000/api/get-all-ticket`,
            {
                date: timeStamp,
                dataSearch: ""
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(function (response) {
                if (response.data.errCode === 0) {
                    setNumberTicket(response.data.summaryTicket[0]);
                    setArrTicketState(response.data.dataTicket);
                    dispatch(setArrTicket(response.data.dataTicket));
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

    useEffect(() => {
        getTicket();
    }, [timeStamp]);

    useEffect(() => {
        if (parameter && parameter.getTicket && parameter.idTicket) {
            axios.post(`http://192.168.1.24:3000/api/get-ticket-by-id`,
                {
                    id: parameter.idTicket
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(function (response) {
                    if (response.data.errCode === 0) {
                        openModal(response.data.ticket);
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
                });
        }
    }, [parameter]);


    const moveCreateTicket = () => {
        navigation.navigate('createticket');
    }

    const moveScannerTicket = () => {
        navigation.navigate('scannerticket');
    }

    const showMode = () => {
        setShow(true);
    };

    const onChangeDate = async (event: any, selectedDate: any) => {
        setShow(false);
        if (event.type === 'set') {
            await setDate(selectedDate || date);
            await setTimeStamp(event.nativeEvent.timestamp || timeStamp);
        }
    };

    const openModal = async (item: any) => {
        await setValueTicket(item);
        setModalVisible(true);
    }

    const closeModal = () => {
        setModalVisible(!modalVisible);
    }

    const updateStatus = (item: Ticket) => {
        Alert.alert(
            "Confirm",
            "Do you want to activate or delete the ticket?",
            [
                {
                    text: "Delete",
                    style: 'destructive',
                    onPress: () => {
                        axios.delete(`http://192.168.1.24:3000/api/delete-ticket`,
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                data: {
                                    id: item.id
                                }
                            })
                            .then(function (response) {
                                if (response.data.errCode === 0) {
                                    getTicket();
                                    closeModal();
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
                            });
                    }
                },
                {
                    text: "Activate",
                    onPress: () => {
                        axios.put(`http://192.168.1.24:3000/api/update-ticket`,
                            {
                                dataTicket: item,
                                type: 'active'
                            },
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                }
                            })
                            .then(function (response) {
                                if (response.data.errCode === 0) {
                                    getTicket();
                                    closeModal();
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
                            });
                    }
                },
                {
                    text: "Cancle",
                    style: "cancel"
                },
            ],
            { cancelable: true }
        );
    };

    const updatePayStatus = (item: Ticket) => {
        Alert.alert(
            "Confirm",
            "Do you want to update the payment status for this ticket?",
            [
                {
                    text: "Pay",
                    style: 'default',
                    onPress: () => {
                        axios.put(`http://192.168.1.24:3000/api/update-ticket`,
                            {
                                dataTicket: item,
                                type: 'pay'
                            },
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                }
                            })
                            .then(function (response) {
                                if (response.data.errCode === 0) {
                                    getTicket();
                                    closeModal();
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
                            });
                    }
                },
                {
                    text: "Cancle",
                    style: "cancel"
                },
            ],
            { cancelable: true }
        );
    }

    const onRefresh = async () => {
        setIsRefreshing(true);
        await getTicket();
        setIsRefreshing(false);
    };


    return (
        <SafeAreaProvider style={styles.container}>
            <StatusBar style={!modalVisible ? 'light' : 'dark'} />
            <SafeAreaView>
                <View style={styles.body}>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {
                            Alert.alert('Modal has been closed.');
                            setModalVisible(!modalVisible);
                        }}>
                        <DetailTicket closeModal={closeModal} valueTicket={valueTicket as Ticket} updateStatus={updateStatus} updatePayStatus={updatePayStatus} />
                    </Modal>
                    <FlatList
                        data={[]}
                        style={{ height: 'auto' }}
                        refreshControl={
                            <RefreshControl
                                colors={['black']}
                                tintColor={'white'}
                                refreshing={isRefreshing}
                                onRefresh={onRefresh}
                            />
                        }
                        ListHeaderComponent={() => (
                            <View style={{
                                backgroundColor: '#23252c',
                                borderRadius: 24,
                                padding: 10,
                                marginBottom: 20,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                gap: 20
                            }}>
                                <Pressable style={{ flexDirection: 'row', paddingHorizontal: 10, gap: 5, backgroundColor: 'transparent', borderRadius: 10 }}
                                    onPress={showMode}
                                >
                                    <View style={styles.iconInput}>
                                        <Fontisto name="date" size={30} color="white" />
                                    </View>
                                    <View>
                                        {
                                            Platform.OS === 'android' &&
                                            <View style={styles.valueInput}>
                                                <Text style={{ fontSize: 17, fontWeight: '400', color: 'white' }}> {date.toLocaleDateString()}</Text>
                                                {show &&
                                                    <DateTimePicker
                                                        testID="dateTimePicker"
                                                        value={date}
                                                        mode={'date'}
                                                        //is24Hour={true}
                                                        display="default"
                                                        onChange={onChangeDate}
                                                    // minimumDate={new Date()}
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
                                                    // minimumDate={new Date()}
                                                    themeVariant="dark"
                                                />
                                            </View>
                                        }
                                    </View>
                                </Pressable>
                                <Pressable
                                    onPress={moveScannerTicket}
                                    style={{
                                        // backgroundColor: '#1b7f63',
                                        borderRadius: 35,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                    <AntDesign name="scan1" size={30} color="#1b7f63" />
                                </Pressable>
                            </View>
                        )}

                        renderItem={({ item }) => (<></>)}

                        ListFooterComponent={() => (
                            <FlatList
                                data={arraySchedule}
                                keyExtractor={(item, index) => index.toString()}
                                showsHorizontalScrollIndicator={false}
                                showsVerticalScrollIndicator={false}
                                style={{
                                    backgroundColor: '#23252c',
                                    borderRadius: 24,
                                    padding: 20
                                }}
                                ListHeaderComponent={() => (
                                    <View style={{
                                        marginBottom: 20,
                                        gap: 15
                                    }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{
                                                    color: 'white',
                                                    fontSize: 25,
                                                    fontWeight: '500'
                                                }}>List Ticket</Text>
                                                <Text style={{
                                                    color: 'grey',
                                                    fontSize: 15,
                                                    fontWeight: '500'
                                                }}>Ticket list for {date.toLocaleDateString()}</Text>
                                            </View>
                                            <Pressable
                                                onPress={moveCreateTicket}
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    backgroundColor: '#1b7f63',
                                                    borderRadius: 35,
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                <AntDesign name="plus" size={24} color="white" />
                                            </Pressable>
                                        </View>
                                        <View style={{ flexDirection: 'column', gap: 3 }}>
                                            <View style={styles.viewTypeTicket}>
                                                <View style={[styles.textTicket, { backgroundColor: 'white' }]}></View>
                                                <Text style={{ fontWeight: '400', color: 'grey' }}>T-Ticket : {numberTicket?.totalBasic}</Text>
                                            </View>
                                            <View style={styles.viewTypeTicket}>
                                                <View style={[styles.textTicket, { backgroundColor: '#cff8d4' }]}></View>
                                                <Text style={{ fontWeight: '400', color: 'grey' }}>E-Ticket : {numberTicket?.totalOnline}</Text>
                                            </View>
                                        </View>
                                    </View>
                                )}

                                renderItem={({ item }) => (
                                    <View style={styles.itemTimeType}>
                                        <Text style={styles.textSchedule}>{item.valueEn}</Text>
                                        <View style={styles.viewTime}>
                                            <View style={styles.hr} >
                                                {arrTicket.length > 0 &&
                                                    arrTicket.map((ticket, index) => {
                                                        if (ticket.scheduleData.timeType === item.keyMap) {
                                                            return (
                                                                <Pressable
                                                                    onPress={() => openModal(ticket)}
                                                                    style={[styles.itemTicket, {
                                                                        backgroundColor: ticket.emailCustomer ? '#cff8d4' : 'white'
                                                                    }]} key={index}>
                                                                    <FontAwesome name="ticket" size={24} color="grey" />
                                                                    <Text style={styles.priceTicket}>{formatCurrency(ticket.bill)}</Text>
                                                                    <View>
                                                                        <View style={[styles.typeTicket, {
                                                                            backgroundColor: !ticket.payToken ? '#1b7f63' : '#b68125'
                                                                        }]}>
                                                                            <Text style={{ color: 'white' }}>{!ticket.payToken ? 'Active' : 'Inactive'}</Text>
                                                                        </View>
                                                                        {!ticket.payStatus &&
                                                                            <Text style={{ textAlign: 'right', fontSize: 12, color: '#7d1616' }}>Unpaid</Text>
                                                                        }
                                                                    </View>
                                                                </Pressable>
                                                            )
                                                        }
                                                    })
                                                }
                                            </View>
                                        </View>
                                    </View>
                                )}
                            />
                        )}
                    />
                </View>
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
        padding: 10,
    },
    iconInput: {
        justifyContent: 'center',
    },
    valueInput: {
        borderRadius: 10,
        justifyContent: 'flex-end',
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
    },
    itemTimeType: {
        width: '100%',
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 5,
    },
    textSchedule: {
        color: 'white'
    },
    viewTime: {
        minHeight: 50,
        flex: 1,
        justifyContent: 'flex-end',
    },
    hr: {
        width: '100%',
        minHeight: 50,
        height: 'auto',
        borderTopWidth: 1,
        borderTopColor: 'grey',
        paddingTop: 5,
        marginTop: 10,
    },
    itemTicket: {
        height: 50,
        padding: 10,
        width: '100%',
        marginBottom: 10,
        borderRadius: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
    },
    typeTicket: {
        height: 20,
        width: 75,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    priceTicket: {
        fontSize: 16,
        fontWeight: '400',
        letterSpacing: 0.6
    },
    viewTypeTicket: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center'
    },
    textTicket: {
        height: 10,
        width: 50,
        borderRadius: 2,
        paddingLeft: 5,
        justifyContent: 'center',
        alignItems: 'flex-start'
    }
});