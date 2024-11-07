import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Dimensions, FlatList, Image, Modal, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import RNPickerSelect from 'react-native-picker-select';
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { setAuth } from "../../../store/slices/appSlice";
import { PanGestureHandler } from "react-native-gesture-handler";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import saveToken from "../../../store/token/savetoken";
import avatarDefault from "../../../store/avatar/avatarUser";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesome, Fontisto, Octicons } from "@expo/vector-icons";
import { REACT_APP_BACKEND_URL } from "@env";

const { width, height } = Dimensions.get('window');


interface FreeStaff {
    email: string;
    fullName: string;
    id: number;
    image: string;
    phone: string;
    roleId: string;
}


interface FreeStaffProps {
    // updateStatus: (item: Ticket) => void;
    // updatePayStatus: (item: Ticket) => void;
    closeModal: () => void;
    getDataWorkSchedule: () => Promise<void>;
    timeType: string;
    date: Date
}


export default function ListFreeStaff({ date, timeType, closeModal, getDataWorkSchedule }: FreeStaffProps) {
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.app.token);
    const [arrFreeStaff, setArrFreeStaff] = useState<FreeStaff[]>([]);
    const [loading, setLoading] = useState(false);
    const [arrStaffSelect, setArrStaffSelect] = useState<FreeStaff[]>([]);

    const getFreeStaff = async () => {
        setLoading(true);
        await axios.get(`http://192.168.1.77:3000/api/get-free-staff?date=${date.setUTCHours(0, 0, 0, 0)}&timeType=${timeType}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(function (response) {
                if (response.data.errCode === 0) {
                    setArrFreeStaff(response.data.arrFreeStaff);
                } else {
                    alert(response.data.errMessage)
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

    useEffect(() => {
        getFreeStaff();
    }, []);

    const addStaff = (staff: FreeStaff) => {
        let staffOld: FreeStaff[] = arrStaffSelect;
        staffOld.push(staff);
        setArrStaffSelect(staffOld);
    }


    const createWorkSchedule = async () => {
        let arrStaff = arrStaffSelect.map((item: FreeStaff) => item.id);
        const dataCreate = {
            date: date.setUTCHours(0, 0, 0, 0),
            timeType: timeType,
            arrStaff
        };
        await axios.post(`http://192.168.1.77:3000/api/create-work-schedule`,
            dataCreate,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(function (response) {
                if (response.data.errCode === 0) {
                    closeModal();
                    getDataWorkSchedule()
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
            });
    }

    return (
        <View style={styles.centeredView}>
            <View style={styles.modalView}>
                <View style={styles.header}>
                    <Pressable
                        style={[styles.buttonClose]}
                        onPress={closeModal}
                    >
                        <AntDesign name="close" size={30} color="white" />
                    </Pressable>
                </View>
                <View style={styles.body}>
                    {loading
                        ?
                        <View style={[{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }]}>
                            <ActivityIndicator size="large" color="white" />
                            <Text style={{ color: 'white', fontSize: 20 }}>Loading...</Text>
                        </View>
                        :
                        arrFreeStaff && arrFreeStaff.length > 0
                            ?
                            arrFreeStaff.map((item, index) => {
                                return (
                                    <View key={index}>
                                        <Pressable
                                            style={styles.itemStaff}
                                            onPress={() => addStaff(item)}>
                                            <Text>{item.fullName}</Text>
                                        </Pressable>
                                    </View>
                                )
                            })
                            :
                            <Text>All staffs have work schedules.</Text>
                    }
                    <Pressable onPress={createWorkSchedule}>
                        <Text>CRETAE</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        paddingTop: 60,
        paddingHorizontal: 20,
        height: height,
        width: width,
        backgroundColor: '#1b7f63',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%'
    },
    buttonClose: {
        borderRadius: 20,
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    body: {
        flex: 1,
        width: '100%',
        backgroundColor: 'red',
        gap: 20
    },
    itemStaff: {
        height: 50,
        backgroundColor: 'pink'
    }
});