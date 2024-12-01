import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Dimensions, FlatList, Image, Modal, Platform, Pressable, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
import { Entypo, FontAwesome, Fontisto, Octicons } from "@expo/vector-icons";
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
    const botttomAnim = useRef(new Animated.Value(-170)).current;
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.app.token);
    const [arrFreeStaff, setArrFreeStaff] = useState<FreeStaff[]>([]);
    const [arrFreeStaff2, setArrFreeStaff2] = useState<FreeStaff[]>([]);
    const [loading, setLoading] = useState(false);
    const [arrStaffSelect, setArrStaffSelect] = useState<FreeStaff[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [textSearch, setTextSearch] = useState('');


    const getFreeStaff = async () => {
        setLoading(true);
        await axios.get(`http://192.168.1.84:3000/api/get-free-staff?date=${date.setUTCHours(0, 0, 0, 0)}&timeType=${timeType}`, {
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


    const toggleSelectContact = (staff: FreeStaff) => {
        setArrStaffSelect((prevSelected: any) =>
            prevSelected.includes(staff)
                ? prevSelected.filter((c: any) => c !== staff)
                : [...prevSelected, staff]
        );
    };

    const changeTextSeach = (value: string) => {
        setTextSearch(value);
    }

    useEffect(() => {
        let result = arrFreeStaff.filter(item =>
            item.fullName.toLowerCase().includes(textSearch.toLowerCase())
            // && !arrStaffSelect.includes(item)
        );
        if (result.length > 0 && textSearch) {
            setArrFreeStaff2(result);
        } else {
            setArrFreeStaff2([])
        }
    }, [textSearch, arrStaffSelect, arrFreeStaff]);

    useEffect(() => {
        Animated.timing(botttomAnim, {
            toValue: arrStaffSelect.length > 0 ? 0 : -170,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [arrStaffSelect])


    const createWorkSchedule = async () => {
        let arrStaff = arrStaffSelect.map((item: FreeStaff) => item.id);
        const dataCreate = {
            date: date.setUTCHours(0, 0, 0, 0),
            timeType: timeType,
            arrStaff
        };
        await axios.post(`http://192.168.1.84:3000/api/create-work-schedule`,
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

    const onRefresh = async () => {
        setIsRefreshing(true);
        await getFreeStaff();
        setIsRefreshing(false);
    };

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
                    <Pressable
                        disabled={arrStaffSelect.length > 0 ? false : true}
                        onPress={createWorkSchedule}
                    >
                        <Entypo name="save" size={30} color={arrStaffSelect.length > 0 ? "#1b7f63" : 'grey'} />
                    </Pressable>
                </View>

                <TextInput style={[styles.iputSearch]}
                    value={textSearch}
                    onChangeText={(value) => changeTextSeach(value)}
                    placeholder="Search..."
                    placeholderTextColor={'grey'}
                />

                <View style={styles.body}>
                    {loading && !isRefreshing
                        &&
                        <View style={[{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }]}>
                            <ActivityIndicator size="large" color="white" />
                            <Text style={{ color: 'white', fontSize: 20 }}>Loading...</Text>
                        </View>
                    }
                    {
                        arrFreeStaff && arrFreeStaff.length === 0 &&
                        <View style={{ flexDirection: 'row', marginTop: 50, justifyContent: 'center', alignItems: 'center' }}>
                            <AntDesign name="deleteuser" size={24} color="grey" />
                            <Text style={{ color: 'grey', fontSize: 20 }}> All staffs have work schedules.</Text>
                        </View>

                    }

                    {
                        arrFreeStaff2.length > 0
                            ?
                            <FlatList
                                data={arrFreeStaff2}
                                style={{
                                    marginBottom: arrStaffSelect.length > 0 ? 300 : 150
                                }}
                                keyExtractor={(item, index) => index.toString()}
                                keyboardShouldPersistTaps="never"

                                renderItem={({ item }) => (
                                    !arrStaffSelect.includes(item)
                                        ?
                                        <TouchableOpacity
                                            onPress={() => toggleSelectContact(item)}
                                            style={styles.contactItem}
                                        >
                                            <Image source={{ uri: item.image }} style={styles.contactImage} />
                                            <View style={{
                                                paddingLeft: 10,
                                            }}>
                                                <Text style={styles.contactName}>{item.fullName}</Text>
                                                <Text style={styles.contactEmail}>{item.email}</Text>
                                            </View>

                                        </TouchableOpacity>
                                        :
                                        <></>
                                )}
                            />
                            :
                            <FlatList
                                data={arrFreeStaff}
                                style={{
                                    marginBottom: arrStaffSelect.length > 0 ? 300 : 150
                                }}
                                keyExtractor={(item, index) => index.toString()}
                                keyboardShouldPersistTaps="never"

                                refreshControl={
                                    <RefreshControl
                                        colors={['black']}
                                        tintColor={'white'}
                                        refreshing={isRefreshing}
                                        onRefresh={onRefresh}
                                    />
                                }

                                renderItem={({ item }) => (
                                    !arrStaffSelect.includes(item)
                                        ?
                                        <TouchableOpacity
                                            onPress={() => toggleSelectContact(item)}
                                            style={styles.contactItem}
                                        >
                                            <Image source={{ uri: item.image }} style={styles.contactImage} />
                                            <View style={{
                                                paddingLeft: 10,
                                            }}>
                                                <Text style={styles.contactName}>{item.fullName}</Text>
                                                <Text style={styles.contactEmail}>{item.email}</Text>
                                            </View>

                                        </TouchableOpacity>
                                        :
                                        <></>
                                )}
                            />
                    }


                </View>
            </View>
            <Animated.View
                style={[styles.selectedContactsList, {
                    bottom: botttomAnim,
                }]}>
                <Text style={{ color: 'white', fontSize: 20 }}>Selected Staff</Text>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={arrStaffSelect}
                    keyExtractor={(item: any) => item.id}
                    style={{ paddingVertical: 20 }}
                    renderItem={({ item }) => (
                        <View style={styles.selectedContact}>
                            <Image source={{ uri: item.image }} style={styles.contactSelectedImage} />
                            <TouchableOpacity
                                onPress={() => toggleSelectContact(item)}
                                style={styles.removeIcon}
                            >
                                <AntDesign name="closecircle" size={20} color="grey" />
                            </TouchableOpacity>
                        </View>
                    )}

                />
            </Animated.View>
        </View >
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
        backgroundColor: '#181a20',
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
        justifyContent: 'space-between',
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
        width: '100%',
        height: '100%'
    },
    iputSearch: {
        height: 50,
        width: '100%',
        backgroundColor: '#333',
        borderRadius: 50,
        paddingRight: 60,
        color: 'white',
        fontSize: 17,
        paddingLeft: 20,
        marginVertical: 20
    },
    selectedContactsList: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        position: 'absolute',
        width: '100%',
        height: 170,
        padding: 20
    },
    selectedContact: {
        marginRight: 10,
    },
    contactSelectedImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 1,
        borderColor: 'green'
    },
    contactImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    removeIcon: {
        position: "absolute",
        top: -5,
        right: 0,
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        // backgroundColor: "#333",
        marginBottom: 10,
        // borderRadius: 12,
    },
    contactName: {
        color: "#fff",
        fontSize: 17,
    },
    contactEmail: {
        color: "#cccbcb",
        fontSize: 15,
    },
});