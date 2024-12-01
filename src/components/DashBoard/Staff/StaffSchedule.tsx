import { memo, useEffect, useRef, useState } from "react";
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
import ListFreeStaff from "./ListFreeStaff";
import { REACT_APP_BACKEND_URL } from "@env";


const { width, height } = Dimensions.get('window');

interface InfoUser {
    idUser: number,
    fullName: string,
    phoneNumber: string,
    email: string,
    roleId: string,
    image: string
}


interface WorkSchedule {
    date: string,
    timeType: string,
    userData: InfoUser[],
    allCodeData: {
        valueEn: string
    }
}

interface FreeStaff {
    email: string;
    fullName: string;
    id: number;
    image: string;
    phone: string;
    roleId: string;
}


const StaffSchedule = () => {
    const dispatch = useDispatch();
    const [arrWorkSchedule, setArrWorkSchedule] = useState<WorkSchedule[]>([]);
    const token = useSelector((state: RootState) => state.app.token);
    const [date, setDate] = useState(new Date());
    const [timeType, setTimeType] = useState("");
    const [show, setShow] = useState(false);
    const [showName, setShowName] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);


    const getDataWorkSchedule = async () => {
        await axios.get(`http://192.168.1.84:3000/api/get-work-schedule?date=${date.setUTCHours(0, 0, 0, 0)}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(function (response) {
                if (response.data.errCode === 0) {
                    setArrWorkSchedule(response.data.workSchedule);
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
            });
    }



    useEffect(() => {
        getDataWorkSchedule();
    }, [token, date]);

    const onChangeDate = async (event: any, selectedDate: any) => {
        setShow(false);
        if (event.type === 'set') {
            setDate(selectedDate || date);
        }
    };

    const showMode = () => {
        setShow(true);
    };
    const closeModal = () => {
        setModalVisible(false);
    }
    const openListStaff = async (timeType: string) => {
        if (date >= new Date(new Date().setUTCHours(0, 0, 0, 0))) {
            setTimeType(timeType);
            setModalVisible(true);
        } else {
            Alert.alert(
                "Warning",
                "Can't create work schedule on this day",
                [
                    {
                        text: "Ok",
                        style: 'default'
                    }

                ]
            )
        }
    }

    const onRefresh = async () => {
        setIsRefreshing(true);
        await getDataWorkSchedule();
        setIsRefreshing(false);
    };


    return (
        <FlatList
            data={[]}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            // keyExtractor={(item, index) => index.toString()}
            renderItem={() => (<></>)}
            refreshControl={
                <RefreshControl
                    colors={['black']}
                    tintColor={'white'}
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                />
            }

            ListFooterComponent={() => (
                <View style={styles.viewStaff}>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {
                            Alert.alert('Modal has been closed.');
                            setModalVisible(!modalVisible);
                        }}>
                        <ListFreeStaff date={date} timeType={timeType} closeModal={closeModal} getDataWorkSchedule={getDataWorkSchedule}
                        />
                        {/* <ListStaffShift date={date} timeType={timeType} closeModal={closeModal} getDataWorkSchedule={getDataWorkSchedule} /> */}
                    </Modal>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{
                            color: 'white',
                            fontSize: 25,
                            fontWeight: '500'
                        }}>Staff Schedule</Text>
                        <Pressable
                            onPress={() => setShowName(!showName)}
                            style={{ justifyContent: 'center' }}>
                            <Octicons name={showName ? 'eye' : 'eye-closed'} size={28} color="#1b7f63" />
                        </Pressable>
                    </View>
                    <Text style={{
                        fontSize: 17,
                        fontWeight: '400',
                        color: 'grey'
                    }}>
                        Work schedule off staff
                    </Text>
                    {
                        Platform.OS === 'android' &&
                        <View style={styles.valueInput}>
                            <Fontisto name="date" size={30} color="white" />

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
                                />
                            }
                        </View>
                    }
                    {
                        Platform.OS === 'ios'
                        &&
                        <View style={styles.valueInput}>
                            <Fontisto name="date" size={30} color="white" />

                            <RNDateTimePicker
                                testID="dateTimePicker"
                                value={date}
                                mode={'date'}
                                //is24Hour={true}
                                display="default"
                                onChange={onChangeDate}
                                themeVariant="dark"
                            />
                        </View>
                    }

                    <View style={styles.viewWorkSchedule}>
                        {
                            arrWorkSchedule.length > 0 &&
                            arrWorkSchedule.map((workschedule, indexp) => {
                                return (
                                    <View style={styles.viewRow} key={indexp}>
                                        <View style={styles.viewTextTitle}>
                                            <FontAwesome name="circle" size={17}
                                                color={workschedule.timeType === 'SS1' ? "#64B5F6" :
                                                    workschedule.timeType === 'SS2' ? '#FFF176' :
                                                        workschedule.timeType === 'SS3' ? '#5E35B1' : ''
                                                }
                                            />
                                            <Text style={styles.textTitle}>{workschedule.allCodeData.valueEn}</Text>
                                        </View>
                                        <View style={styles.viewListStaff}>
                                            {
                                                <View style={styles.viewItemStaff}>
                                                    {
                                                        workschedule.userData.length > 0 && workschedule.userData.map((staff, index) => {
                                                            return (
                                                                <View style={styles.itemStaff} key={index}>
                                                                    <Image style={styles.imageStaff} source={{ uri: staff.image ? staff.image : avatarDefault }} />
                                                                    {
                                                                        showName &&
                                                                        <Text
                                                                            numberOfLines={2}
                                                                            style={styles.nameStaff}>{staff.fullName}</Text>
                                                                    }
                                                                </View>
                                                            )
                                                        })
                                                    }
                                                    <Pressable onPress={() => openListStaff(workschedule.timeType)} style={styles.itemStaff}>
                                                        <View style={{ height: 60, width: 60, justifyContent: 'center', alignItems: 'center' }}>
                                                            <AntDesign name="plus" size={40} color="#1b7f63" />
                                                        </View>
                                                    </Pressable>
                                                </View>
                                            }
                                        </View>
                                    </View>
                                )
                            })

                        }
                    </View>
                </View>
            )}
        />
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
    viewStaff: {
        backgroundColor: '#23252c',
        borderRadius: 24,
        padding: 10,
        paddingHorizontal: 20,
    },
    valueInput: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    viewWorkSchedule: {
        marginTop: 40,
        width: '100%',
        marginBottom: 20,
        gap: 20,
    },
    viewRow: {
        width: '100%',
        height: 'auto',
        gap: 5,
        flexDirection: 'row',
    },
    viewTextTitle: {
        height: 30,
        width: 110,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    textTitle: {
        color: 'white',
        fontSize: 17,
    },
    viewListStaff: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'grey',
        flex: 1,
    },
    viewItemStaff: {
        flexDirection: 'row',
        flexWrap: "wrap",
        gap: 5,
        paddingTop: 20
    },
    itemStaff: {
        gap: 2,
        alignItems: 'center',
        width: 100,
        // height: 120,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    imageStaff: {
        height: 60,
        width: 60,
        borderRadius: 30,
        backgroundColor: 'white'
    },
    nameStaff: {
        fontSize: 17,
        textAlign: 'center',
        color: 'white'
    }
});

export default memo(StaffSchedule);