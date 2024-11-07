import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, View, StyleSheet, Dimensions, ScrollView, Text, Pressable, Platform, Alert, RefreshControl } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import axios from 'axios';
import { setAuth } from '../../../store/slices/appSlice';
import saveToken from '../../../store/token/savetoken';
import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { REACT_APP_BACKEND_URL } from '@env';


const { width, height } = Dimensions.get('window');

interface objectAllCode {
    keyMap: string,
    valueEn: string,
    isChoose: boolean
}


interface objectSchedule {
    timeType: string
}

interface objectScheduleSendServer {
    date: number,
    timeType: string,
    idGroup: number
}

const ScheduleManage = () => {
    const dispatch = useDispatch();
    // const arraySchedule = useMemo<objectAllCode[]>(() =>
    //     [
    //         { timeType: 'T1', label: '11:00 - 12:30' },
    //         { timeType: 'T2', label: '11:30 - 13:00' }
    //     ],
    //     []
    // );
    const [arraySchedule, setArrSchedule] = useState<objectAllCode[]>([]);
    const token = useSelector((state: RootState) => state.app.token);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [show, setShow] = useState(false);
    const [date, setDate] = useState(new Date());
    const [timeStamp, setTimeStamp] = useState(new Date().getTime());
    const [arrScheduleSelected, setArrScheduleSelected] = useState<objectSchedule[]>([]);
    const [arrScheduleSendServer, setArrScheduleSendServer] = useState<objectScheduleSendServer[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);


    useEffect(() => {
        setLoadingSchedule(true);
        const getSchedule = async () => {
            await axios.get(`http://192.168.1.77:3000/api/get-all-code?type=TIME`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(function (response) {
                    if (response.data.errCode !== 0) {
                        alert(response.data.errMessage);
                    } else {
                        setArrSchedule(buildSchedule(response.data.data));
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

    const getScheduleActive = async () => {
        await axios.post(`http://192.168.1.77:3000/api/get-schedule`,
            {
                date: timeStamp
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(function (response) {
                setArrScheduleSelected(response.data.dataSchedule);
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

    useEffect(() => {
        getScheduleActive();
    }, [token, timeStamp, date]);

    useEffect(() => {
        let arrBackup: string[] = arrScheduleSelected.map((item) => {
            return item.timeType;
        });

        let arrSup: objectAllCode[] = [];
        arrSup = arraySchedule.map((item) => {
            if (arrBackup.includes(item.keyMap)) {
                item.isChoose = true
            } else {
                item.isChoose = false
            }
            return item;
        })
        setArrSchedule(arrSup);
    }, [arrScheduleSelected]);

    const checkSelectAll = () => {
        let result = true;
        arraySchedule.filter(item => {
            if (!item.isChoose) {
                result = false;
            }
        })
        return result;
    }

    useEffect(() => {
        let arrBackup: objectScheduleSendServer[] = [];
        arraySchedule.filter((item) => {
            if (item.isChoose) {
                arrBackup.push({
                    date: new Date(timeStamp).setUTCHours(0, 0, 0, 0),
                    timeType: item.keyMap,
                    idGroup: 1
                })
            }
        });
        setArrScheduleSendServer(arrBackup);
        setSelectAll(checkSelectAll());
    }, [arraySchedule]);


    const buildSchedule = (arraySchedule: objectAllCode[]) => {
        arraySchedule.map((item, index) =>
            item.isChoose = false
        )
        return arraySchedule;
    }

    const handleChooseTime = (timeType: objectAllCode) => {
        const newArrCSchedule = arraySchedule.map((item) => {
            if (item.keyMap === timeType.keyMap) {
                item.isChoose = !item.isChoose;
            }
            return item;
        })
        setArrSchedule(newArrCSchedule);
    }

    const handleSelectAll = () => {
        setSelectAll(!selectAll);
        const newArrCSchedule = arraySchedule.map((item) => {
            item.isChoose = !selectAll;
            return item;
        })
        setArrSchedule(newArrCSchedule);
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


    const createSchedule = () => {
        axios.post(`http://192.168.1.77:3000/api/bulk-create-schedule`,
            {
                arrDataSchedule: arrScheduleSendServer,
                numberDateToSave: 1
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(function (response) {
                if (response.data.errCode !== 0) {
                    getScheduleActive();
                }
                Alert.alert(
                    response.data.errCode !== 0 ? "Warning" : "",
                    response.data.errMessage,
                    [
                        {
                            text: "Ok"
                        }
                    ],
                    { cancelable: true }
                );
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

    const onRefresh = async () => {
        setIsRefreshing(true);
        await getScheduleActive();
        setIsRefreshing(false);
    };

    return (
        <SafeAreaProvider style={styles.container}>
            <SafeAreaView>
                <View style={styles.body}>
                    <FlatList
                        data={[]}
                        renderItem={() => (<></>)}
                        showsHorizontalScrollIndicator={false}
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
                            <View style={{ gap: 20 }}>
                                <View style={styles.viewSchedule}>
                                    <View style={{
                                        height: 70,
                                        gap: 5,
                                        marginBottom: 20
                                    }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <Text style={{
                                                color: 'white',
                                                fontSize: 25,
                                                fontWeight: '500'
                                            }}>Schedule Management</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{
                                                fontSize: 17,
                                                fontWeight: '400',
                                                color: 'grey'
                                            }}>
                                                Ticket booking hours
                                            </Text>


                                        </View>
                                    </View>
                                    <Text style={styles.label}>Select Date</Text>
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                        <View style={styles.iconInput}>
                                            <Fontisto name="date" size={30} color="white" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            {
                                                Platform.OS === 'android' &&
                                                <View style={styles.valueInput}>
                                                    <Pressable
                                                        style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: 5, borderRadius: 10 }}
                                                        onPress={showMode}>
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
                                    </View>
                                </View>

                                <View style={styles.viewSchedule}>
                                    <Text style={[styles.label, {
                                        marginBottom: 10
                                    }]}>Select Time slot</Text>
                                    <View style={styles.viewArrTime}>
                                        {arraySchedule.length > 0 &&
                                            arraySchedule.map((item, index) => {
                                                return (
                                                    <Pressable
                                                        onPress={() => handleChooseTime(item)}
                                                        style={[styles.itemTime, {
                                                            backgroundColor: item.isChoose ? '#1b7f63' : 'transparent',
                                                            borderColor: item.isChoose ? 'transparent' : 'grey'
                                                        }]}
                                                        key={index}>
                                                        <Text style={{
                                                            color: item.isChoose ? 'white' : 'grey',
                                                            fontSize: 14,
                                                        }}>{item.valueEn}</Text>
                                                    </Pressable>
                                                )
                                            })}
                                    </View>

                                    <View style={{
                                        flexDirection: 'row',
                                        gap: 20,
                                        alignItems: 'center',
                                    }}>
                                        <Pressable
                                            onPress={createSchedule}
                                            style={styles.buttonSave}>
                                            <Text style={{
                                                color: 'white',
                                                fontSize: 20,
                                                fontWeight: '600'
                                            }}>
                                                Save
                                            </Text>
                                        </Pressable>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            gap: 10
                                        }}>
                                            <Pressable
                                                style={{
                                                    height: 25,
                                                    width: 25,
                                                    borderRadius: 5,
                                                    backgroundColor: selectAll ? '#1b7f63' : 'transparent',
                                                    borderWidth: 1,
                                                    borderColor: 'white',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                                onPress={handleSelectAll}>
                                                {selectAll && <AntDesign name="check" size={20} color="white" />}
                                            </Pressable>
                                            <Text style={{ color: selectAll ? 'white' : 'grey', fontSize: 17 }}>Select All</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}
                        ListFooterComponent={() => (
                            <View>

                            </View>
                        )}
                    />
                </View>
            </SafeAreaView>
        </SafeAreaProvider >
    );
};

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
    viewSchedule: {
        backgroundColor: '#23252c',
        borderRadius: 24,
        padding: 20,
        gap: 10
    },
    viewArrTime: {
        gap: 15,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20
    },
    itemTime: {
        height: 50,
        width: 100,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,

    },
    valueInput: {
        backgroundColor: '#40404a',
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
        margin: 20,
        zIndex: 1
    },
    buttonSave: {
        flex: 1,
        backgroundColor: '#1b7f63',
        height: 60,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center'
    },
    label: {
        color: 'white',
        fontSize: 17,
        fontWeight: '400',
        letterSpacing: 1
    }
});

export default ScheduleManage;
