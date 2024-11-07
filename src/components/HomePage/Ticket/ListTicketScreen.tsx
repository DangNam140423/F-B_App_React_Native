import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { AntDesign } from '@expo/vector-icons';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useEffect, useState } from "react";
import axios from "axios";
import { State } from "react-native-gesture-handler";
import saveToken from "../../../store/token/savetoken";
import { setAuth } from "../../../store/slices/appSlice";


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


    const getAllTicket = async () => {
        setLoadingTicket(true);
        await axios.post(`http://192.168.1.77:3000/api/user/get-customer-ticket`,
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

    // console.log(arrTicket);

    return (
        <View style={styles.container}>
            <View style={styles.body}>
                <View style={styles.header}>
                    <Pressable
                        style={[styles.buttonClose]}
                        onPress={closeModal}
                    >
                        <AntDesign name="left" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.textStyle}>Booking History</Text>
                </View>
                <FlatList
                    data={[]}
                    renderItem={({ item }) => (
                        <></>
                    )}
                />
            </View>
        </View>
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
        backgroundColor: 'red'
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
});