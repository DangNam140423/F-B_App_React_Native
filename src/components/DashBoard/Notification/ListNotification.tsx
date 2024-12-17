import { ActivityIndicator, Alert, Button, Dimensions, Keyboard, Modal, Platform, Pressable, RefreshControl, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useEffect, useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import axios from "axios";
import saveToken from "../../../store/token/savetoken";
import { setArrNotification, setArrTicket, setAuth } from "../../../store/slices/appSlice";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import RNDateTimePicker from "@react-native-community/datetimepicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Fontisto, MaterialCommunityIcons, MaterialIcons, Octicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import formatCurrency from "../../../store/format/formatPrice";
import { REACT_APP_BACKEND_URL } from "@env";

interface Notification {
    id: number,
    title: string,
    body: string,
    data: any,
    isRead: boolean,
    createdAt: Date
}



export default function ListNotification({ navigation, route }: any) {
    const parameter = route.params && route.params ? route.params : undefined;

    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const inforUser = useSelector((state: RootState) => state.app.inforUser);
    const token = useSelector((state: RootState) => state.app.token);
    const [arrNotifi, setArrNotifi] = useState<Notification[]>([]);
    const [idDelete, setIdDelete] = useState<number>(0);


    const getAllNotification = async () => {
        await axios.post(`http://192.168.1.24:3000/api/get-notification`,
            {
                userId: inforUser.idUser
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(function (response) {
                if (response.data.errCode === 0) {
                    setArrNotifi(response.data.arrNotifi);
                    dispatch(setArrNotification(response.data.arrNotifi));
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
        getAllNotification();
    }, [parameter]);

    const onRefresh = async () => {
        setIsRefreshing(true);
        await getAllNotification();
        setIsRefreshing(false);
    };

    const updateNotification = async (idNotification: number) => {
        await axios.put(`http://192.168.1.24:3000/api/update-notification`,
            {
                idNotification: idNotification
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(function (response) {
                if (response.data.errCode === 0) {
                    getAllNotification();
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

    const openNotification = (idNotifi: number, ticket: any) => {
        updateNotification(idNotifi);
        navigation.navigate('ticket', {
            getTicket: true,
            idTicket: ticket.idTicket
        });
    }

    const deleteNotifi = async (idNotification: number) => {
        await setIdDelete(idNotification);
        setLoading(true);
        await axios.delete(`http://192.168.1.24:3000/api/delete-notification`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                data: {
                    idNotification: idNotification
                }
            })
            .then(function (response) {
                if (response.data.errCode === 0) {
                    getAllNotification();
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
                setLoading(false);
            });
    }


    return (
        <View style={styles.container}>
            <View style={styles.body}>
                <FlatList
                    data={arrNotifi}
                    style={styles.viewListNotifi}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            colors={['black']}
                            tintColor={'white'}
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    ListHeaderComponent={() => (
                        arrNotifi.length === 0 &&
                        <View style={{
                            marginTop: 20,
                            flexDirection: 'row',
                            gap: 10,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <MaterialCommunityIcons name="message-bulleted-off" size={30} color="grey" />
                            <Text style={{
                                color: 'grey',
                                textAlign: 'center',
                                fontSize: 20
                            }}>
                                No notification
                            </Text>
                        </View>

                    )}

                    renderItem={({ item }) => {
                        let date = new Date(new Date(item.createdAt).setUTCHours(0, 0, 0, 0)).toString() == new Date(new Date().setUTCHours(0, 0, 0, 0)).toString()
                            ? 'Today'
                            : new Date(item.createdAt).getDate() + "/" + (new Date(item.createdAt).getMonth() + 1) + "/" + new Date(item.createdAt).getFullYear();

                        let min = (new Date().getHours() * 60 + new Date().getMinutes()) - (new Date(item.createdAt).getHours() * 60 + new Date(item.createdAt).getMinutes());

                        return (
                            <Pressable
                                disabled={item.isRead}
                                onPress={() => openNotification(item.id, item.data)}
                                style={[styles.notificationCard, {
                                    backgroundColor: item.isRead ? 'transparent' : 'rgba(0,0,0,0.4)',
                                }]}>
                                {!item.isRead &&
                                    <Octicons name="dot-fill" size={20} color="#1b7f63" style={{ position: 'absolute', top: 5, right: 10 }} />
                                }
                                <View style={{
                                    flexDirection: 'row', height: 'auto', width: '100%', alignItems: 'center',
                                    gap: 10,
                                }}>
                                    <View
                                        style={{
                                            backgroundColor: item.isRead ? 'grey' : '#1b7f63', height: 45, width: 45, borderRadius: 45 / 2,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                        <MaterialIcons name="message" size={30} color="white" />
                                    </View>
                                    <View style={{ flexDirection: 'column', width: '70%' }}>
                                        <Text style={{ fontSize: 17, fontWeight: '400', color: 'white' }}>
                                            {item.body}
                                        </Text>
                                        <Text style={{
                                            color: '#b2b1b1',
                                            fontSize: 12
                                        }}>

                                            {date} &#x2022; {min < 0 || min > 30 ? new Date(item.createdAt).getHours() + ":" + new Date(item.createdAt).getMinutes() : min + ' min'}
                                        </Text>

                                    </View>
                                </View>
                                <View style={{
                                    flexDirection: 'row', height: 'auto', width: '100%', gap: 10, paddingLeft: 55
                                }}>
                                    {!item.isRead &&
                                        <Pressable
                                            // onPress={() => openNotification(item.data)}
                                            style={{
                                                height: 35,
                                                width: 80,
                                                backgroundColor: '#1b7f63',
                                                borderRadius: 10,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}>
                                            <Text style={{ fontSize: 15 }}>Confirm</Text>
                                        </Pressable>
                                    }
                                    <Pressable
                                        onPress={() => deleteNotifi(item.id)}
                                        style={{
                                            height: 35,
                                            width: 65,
                                            backgroundColor: '#36201e',
                                            borderRadius: 10,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                        {
                                            loading && !isRefreshing && item.id === idDelete
                                                ?
                                                <View style={{
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    <ActivityIndicator size="small" color="green" />
                                                </View>
                                                :
                                                <Text style={{ fontSize: 15, color: 'grey' }}>Delete</Text>

                                        }
                                    </Pressable>

                                </View>
                            </Pressable>
                        )
                    }}

                // ListFooterComponent={() => (

                // )}
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
        // backgroundColor: '#23252c',
    },
    header: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        width: '100%',
        paddingTop: 40
    },
    viewListNotifi: {
        paddingTop: 10,
    },
    notificationCard: {
        borderRadius: 10,
        // height: 100,
        paddingHorizontal: 20,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
        marginBottom: 5,
        gap: 10
    },
});