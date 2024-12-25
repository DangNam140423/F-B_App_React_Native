import { Alert, FlatList, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AntDesign, FontAwesome, Fontisto, Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useEffect, useState } from "react";
import axios from "axios";
import { State } from "react-native-gesture-handler";
import saveToken from "../../../store/token/savetoken";
import { setAuth } from "../../../store/slices/appSlice";
import formatCurrency from "../../../store/format/formatPrice";
import { StatusBar } from "expo-status-bar";
import DetailTicketScreen from "./DetailTicketScreen";
import { REACT_APP_JWT_SECRET, REACT_APP_IP } from '@env';

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

interface DetailTicketProps {
    closeModal: () => void;
}

export default function ListTicketScreen({ closeModal }: DetailTicketProps) {
    const dispatch = useDispatch();
    const inforUser = useSelector((state: RootState) => state.app.inforUser);
    const token = useSelector((state: RootState) => state.app.token);
    const [arrTicket, setArrTicket] = useState<Ticket[]>([]);
    const [loadingTicket, setLoadingTicket] = useState(false);
    const [modalVisible2, setModalVisible2] = useState(false);
    const [valueTicket2, setValueTicket2] = useState<Ticket>();

    const [isRefreshing, setIsRefreshing] = useState(false);

    const getAllTicket = async () => {
        setLoadingTicket(true);
        await axios.post(`http://192.168.142.61:3000/api/user/get-customer-ticket`,
            {
                emailCustomer: inforUser.email
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(function (response) {
                if (response.data.errCode === 0) {
                    setArrTicket(response.data.arrTicket);
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
                setLoadingTicket(false);
            });
    }

    useEffect(() => {
        getAllTicket();
    }, []);

    const onRefresh = async () => {
        setIsRefreshing(true);
        await getAllTicket();
        setIsRefreshing(false);
    };

    const closeModal2 = () => {
        setModalVisible2(false);
    }

    // console.log(arrTicket);

    const openDetailTicket = (ticket: Ticket) => {
        setValueTicket2(ticket);
        setModalVisible2(true);
    }

    return (
        <View style={styles.container}>
            <StatusBar style={'dark'} />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible2}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    setModalVisible2(!modalVisible2);
                }}>
                <DetailTicketScreen closeModal={closeModal2} valueTicket={valueTicket2 as Ticket} />
            </Modal>
            <View style={styles.body}>
                <View style={styles.header}>
                    <Pressable
                        style={[styles.buttonClose]}
                        onPress={closeModal}
                    >
                        <AntDesign name="left" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.textStyle}>My Ticket</Text>
                </View>
                <FlatList
                    data={arrTicket}
                    style={styles.viewListTicket}
                    keyExtractor={(item, index) => index.toString()}
                    refreshControl={
                        <RefreshControl
                            colors={['black']}
                            tintColor={'white'}
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    renderItem={({ item }) =>
                    (
                        <Pressable onPress={() => openDetailTicket(item)} style={styles.ticketCard}>
                            <Fontisto name="ticket-alt" size={30} color="white"
                                style={{
                                    position: 'absolute',
                                    top: 10,
                                    left: 10
                                }} />

                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
                                <Text style={[styles.status, { color: item.payToken ? "#FFC107" : '#4CAF50' }]}>
                                    {item.payToken ? 'Pending Confirmation' : 'Confirmed'}
                                </Text>
                                <Octicons name="dot-fill" size={24} color={item.payToken ? "#FFC107" : '#4CAF50'} />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
                                <Text style={[styles.status, { color: item.payStatus ? "#2196F3" : '#F44336' }]}>
                                    {item.payStatus ? 'Paid' : 'Unpaid'}
                                </Text>
                                <Octicons name="dot-fill" size={24} color={item.payStatus ? "#2196F3" : '#F44336'} />
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.label1}>Time:</Text>
                                <Text style={styles.text}>{item.timeSlot.valueEn}  -  {new Date(item.scheduleData.date).toLocaleDateString()}</Text>
                            </View>
                            <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                                <View style={styles.seatCostItem}>
                                    <Text style={styles.label1}>Cost:</Text>
                                    <Text style={styles.text2}>{formatCurrency(item.bill)}</Text>
                                </View>
                            </View>
                        </Pressable>
                    )}
                />
            </View>
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    body: {
        flex: 1,
        padding: 10,
        overflow: 'hidden',
        backgroundColor: '#1b7f63'
    },
    header: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        width: '100%',
        paddingTop: 40
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
    viewListTicket: {
        paddingTop: 20
    },
    backIcon: {
        fontSize: 24,
        color: 'white',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
    },
    menuIconPlaceholder: {
        width: 24,
    },
    ticketCard: {
        backgroundColor: '#181a20',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
        gap: 10
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 10,
    },
    seatCostItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    icon: {
        marginLeft: 12,
        marginRight: 24,
        fontSize: 18,
    },
    text: {
        fontSize: 17,
        color: 'white',
    },
    text1: {
        marginLeft: 4,
        fontSize: 17,
        color: 'white',
    },
    text2: {
        fontSize: 17,
        color: 'white',
        fontWeight: 'bold'
    },
    label: {
        marginLeft: 12,
        fontSize: 17,
        color: 'white',
        fontWeight: 'bold',
        marginRight: 8,
    },
    label1: {
        fontSize: 17,
        color: 'white',
        fontWeight: 'bold',
    },
    status: {
        fontSize: 17,
    },
});