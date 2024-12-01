import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Dimensions, Text, View, Keyboard, TouchableWithoutFeedback, Button, ScrollView, FlatList, Pressable, Alert, Image, RefreshControl, Platform } from 'react-native';
import axios from 'axios';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { setArrWorkScheduleStore, setAuth, setRoute, setToken } from '../../store/slices/appSlice';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { REACT_APP_BACKEND_URL } from '@env';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryGroup, VictoryLine, VictoryPolarAxis, VictoryScatter, VictoryTheme } from "victory-native";
import { RootState } from '../../store/store';
import * as SecureStore from 'expo-secure-store';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import RNPickerSelect from 'react-native-picker-select';
import avatarDefault from '../../store/avatar/avatarUser';
import saveToken from '../../store/token/savetoken';


const { width, height } = Dimensions.get('window');

interface objectMenu {
    name: string,
    many_sizes: boolean,
    price_S: number,
    price_M: number,
    price_L: number,
    category: string,
    description: string,
    image: string
}

interface objectDataChart {
    month: string,
    total_price: number,
    year: number
}

interface dataChartObject {
    x: string,
    y: number
}

interface dataDashBoard {
    numberCustomers: number,
    numberDishs: number,
    numberManager: number,
    numberStaffs: number,
    sales: number
}

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
    allCodeData: string
}



export default function DashBoard({ navigation }: any) {
    const dispatch = useDispatch();
    const infoUser = useSelector((state: RootState) => state.app.inforUser);
    const arrWorkScheduleStore = useSelector((state: RootState) => state.app.arrWorkSchedule);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isShowLabel, setIsShowLabel] = useState(false);
    const [filterChart, setFilterChart] = useState('year');
    const pickerRef = useRef<any>(null);
    const [dataChart, setDataChart] = useState<dataChartObject[]>([
        { x: "Jan", y: 0 },
        { x: "Feb", y: 0 },
        { x: "Mar", y: 0 },
        { x: "Apr", y: 0 },
        { x: "May", y: 0 },
        { x: "Jun", y: 0 },
        { x: "Jul", y: 0 },
        { x: "Aug", y: 0 },
        { x: "Sep", y: 0 },
        { x: "Oct", y: 0 },
        { x: "Nov", y: 0 },
        { x: "Dec", y: 0 }
    ]);
    const [dataChart2, setDataChart2] = useState<dataChartObject[]>([
        { x: "Jan", y: 0 },
        { x: "Feb", y: 0 },
        { x: "Mar", y: 0 },
        { x: "Apr", y: 0 },
        { x: "May", y: 0 },
        { x: "Jun", y: 0 },
        { x: "Jul", y: 0 },
        { x: "Aug", y: 2000000 },
        { x: "Sep", y: 500000 },
        { x: "Oct", y: 600000 },
        { x: "Nov", y: 0 },
        { x: "Dec", y: 0 }
    ]);
    const [dataDashBoard, setdataDashBoard] = useState<dataDashBoard>();
    const [arrWorkSchedule, setArrWorkSchedule] = useState<WorkSchedule[]>([]);
    const token = useSelector((state: RootState) => state.app.token);

    const bulidDataChart = (arrDataChart: [objectDataChart]) => {
        let filterData = dataChart.map((value, index) => {
            arrDataChart.map(async (item) => {
                if (index + 1 === Number(item.month)) {
                    value.y = Number(item.total_price);
                }
            })
            return value;
        });
        return filterData;
    }

    const getDataChart = async () => {
        await axios.get(`http://192.168.1.84:3000/api/get-data-chart`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(function (response) {
                setDataChart(bulidDataChart(response.data.dataChart));
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
        getDataChart();
    }, [token]);


    const getDataHome = async () => {
        await axios.get(`http://192.168.1.84:3000/api/get-data-home`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(function (response) {
                setdataDashBoard(response.data.data);
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
        getDataHome();
    }, [token])

    const maxData = () => {
        let maxValue1 = Number.MIN_VALUE;
        let maxValue2 = Number.MIN_VALUE;
        for (let i = 0; i < dataChart.length; i++) {
            if (dataChart[i].y > maxValue1) {
                maxValue1 = dataChart[i].y;
            }
            if (dataChart2[i].y > maxValue2) {
                maxValue2 = dataChart2[i].y;
            }
        }

        return (maxValue1 > maxValue2 ? maxValue1 : maxValue2);
    }

    const getDataWorkSchedule = async () => {
        await axios.get(`http://192.168.1.84:3000/api/get-work-schedule?date=${new Date().setUTCHours(0, 0, 0, 0)}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(function (response) {
                setArrWorkSchedule(response.data.workSchedule);
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
    }, [token])

    const onRefresh = async () => {
        setIsRefreshing(true);
        await getDataChart();
        await getDataHome();
        await getDataWorkSchedule();
        setIsRefreshing(false);
    };

    return (
        // <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}> </TouchableWithoutFeedback>
        <SafeAreaProvider style={styles.container}>
            <SafeAreaView>
                <View style={styles.body}>
                    <FlatList
                        data={[]}
                        keyExtractor={(item, index) => index.toString()} // Ensure each item has a unique key
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
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
                            }}>
                                <View
                                    style={{
                                        backgroundColor: '#23252c',
                                        height: 70,
                                        width: '100%',
                                        borderRadius: 35,
                                        justifyContent: 'space-between',
                                        padding: 5,
                                        flexDirection: 'row'
                                    }}>
                                    <View style={{
                                        height: 60,
                                        width: 60,
                                        borderRadius: 30,
                                        backgroundColor: 'white',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <FontAwesome5 name="bell" size={25} color="#1b7f63" />
                                    </View>
                                    <View style={{
                                        flexDirection: 'row',
                                        gap: 5
                                    }}>
                                        <View style={{
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                            gap: 5
                                        }}>
                                            <Text style={{ fontSize: 20, fontWeight: '500', color: 'white', letterSpacing: 2 }}>{infoUser.fullName}</Text>
                                            <Text style={{ fontSize: 15, fontWeight: '400', color: '#1b7f63', letterSpacing: 1 }}>
                                                {infoUser.roleId === 'R0' && 'Boss'}
                                                {infoUser.roleId === 'R1' && 'Manager'}
                                                {infoUser.roleId === 'R2' && 'Staff'}
                                            </Text>
                                        </View>
                                        <Image
                                            style={{
                                                height: 60,
                                                width: 60,
                                                borderRadius: 30,
                                                backgroundColor: 'white'
                                            }}
                                            source={{ uri: infoUser.image ? infoUser.image : avatarDefault }} />
                                    </View>
                                </View>
                                {/* <Pressable onPress={handleLogout}>
                                    <Text>Logout</Text>
                                </Pressable> */}
                            </View>
                        )}


                        renderItem={() =>
                            <></>
                        }

                        ListFooterComponent={() => (

                            <View style={styles.viewDash}>

                                <View style={styles.viewInChart}>
                                    <View style={{
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        flexDirection: 'row',
                                        height: 30
                                    }}>
                                        <Text style={{
                                            color: 'white',
                                            fontSize: 25,
                                            fontWeight: '500'
                                        }}>Revenue Chart</Text>

                                        <Pressable
                                            onPress={() => pickerRef.current.togglePicker()}
                                            style={{ gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                                            <FontAwesome5 name="chevron-down" size={20} color="grey" />
                                            <RNPickerSelect
                                                ref={pickerRef}
                                                onValueChange={(value) => setFilterChart(value)}
                                                value={filterChart}
                                                placeholder={{
                                                    label: 'Select filter...',
                                                    value: null,
                                                    color: 'grey',
                                                }}
                                                style={pickerSelectStyles}
                                                useNativeAndroidPickerStyle={false}
                                                items={[
                                                    { label: 'Year', value: 'year' },
                                                    { label: 'Month', value: 'month' }
                                                ]}
                                            />
                                        </Pressable>
                                    </View>
                                    <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'row' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <View style={{
                                                backgroundColor: '#1b7f63',
                                                height: 10,
                                                width: 10,
                                                borderRadius: 5
                                            }} />
                                            <Text style={{ color: 'white' }}>
                                                revenue
                                            </Text>
                                            <View style={{
                                                backgroundColor: '#4f4fe9',
                                                height: 10,
                                                width: 10,
                                                borderRadius: 5
                                            }} />
                                            <Text style={{ color: 'white' }}>
                                                expenditure
                                            </Text>
                                        </View>
                                        <Pressable
                                            onPress={() => pickerRef.current.togglePicker()}
                                        >
                                            <Text style={{
                                                color: 'white',
                                                fontSize: 17,
                                                fontWeight: '400'
                                            }}>{new Date().getFullYear()}</Text>
                                        </Pressable>
                                    </View>
                                    <View style={{ marginTop: 20, alignItems: 'flex-start', width: '100%' }}>
                                        <Text style={{
                                            color: '#1b7f63',
                                            fontSize: 17,
                                            fontWeight: '500'
                                        }}>
                                            VND
                                        </Text>
                                    </View>
                                    <VictoryChart
                                        // theme={VictoryTheme.material}
                                        height={350}
                                        maxDomain={{
                                            y: (maxData() / 1000 >= 1000
                                                ? maxData() + 1000000
                                                : maxData() + 1000),
                                            // x: new Date().getMonth()
                                        }}
                                        minDomain={{
                                            y: 0
                                        }}
                                        animate={{
                                            duration: 500,
                                        }}
                                        padding={
                                            { left: 70, right: 30, top: 30, bottom: 30 }
                                        }
                                    >

                                        <VictoryGroup
                                            categories={{ x: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] }}
                                        >
                                            <VictoryLine
                                                interpolation="linear"
                                                data={dataChart}
                                                style={{
                                                    data: { stroke: "#1b7f63", strokeWidth: 2, },
                                                    labels: { fill: 'white', opacity: isShowLabel ? 1 : 0, fontSize: 10 }
                                                }}
                                                labels={({ datum }) =>
                                                    `${datum.y > 0
                                                        ? (datum.y / 1000) >= 1000
                                                            ? (datum.y / 1000000) + "M"
                                                            : (datum.y / 1000) + " K"
                                                        : ' '}`}
                                            />
                                            <VictoryLine
                                                interpolation="linear"
                                                data={dataChart2}
                                                style={{
                                                    data: { stroke: "#4f4fe9", strokeWidth: 2, },
                                                    labels: { fill: 'white', opacity: isShowLabel ? 1 : 0, fontSize: 10 }
                                                }}
                                                labels={({ datum }) =>
                                                    `${datum.y > 0
                                                        ? (datum.y / 1000) >= 1000
                                                            ? (datum.y / 1000000) + "M"
                                                            : (datum.y / 1000) + " K"
                                                        : ' '}`}
                                            />
                                        </VictoryGroup>
                                        <VictoryAxis
                                            tickValues={["Jan", "Mar", "May", "Jul", "Sep", "Nov",]}
                                            style={{ tickLabels: { fill: 'white' } }}
                                        />
                                        <VictoryAxis
                                            dependentAxis
                                            tickFormat={(y) => (y / 1000) >= 1000 ? (y / 1000000) + "M" : (y / 1000) + " K"}
                                            style={{ tickLabels: { fill: 'white', } }}
                                        />
                                        <VictoryScatter
                                            data={dataChart}
                                            size={5}
                                            style={{ data: { fill: "#1b7f63" } }}
                                            symbol="circle"
                                        />
                                        <VictoryScatter
                                            data={dataChart2}
                                            size={5}
                                            style={{ data: { fill: "#4f4fe9" } }}
                                            symbol="circle"
                                        />
                                    </VictoryChart>
                                </View>

                                <Text style={styles.titleItem}>Statistical</Text>


                                <View style={{ flexDirection: 'row', gap: 20 }}>
                                    <Pressable
                                        onPress={() => navigation.navigate('staff')}
                                        style={[styles.viewStatistical, { flex: 1 }]}>
                                        <Text style={styles.textItem}>Staff</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                            <Text style={styles.valueItem}>{dataDashBoard?.numberStaffs} </Text>
                                            <Text style={styles.unit}> user</Text>
                                        </View>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => navigation.navigate('staff')}
                                        style={[styles.viewStatistical, { flex: 1 }]}>
                                        <Text style={styles.textItem}>Manager</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                            <Text style={styles.valueItem}>{dataDashBoard?.numberManager} </Text>
                                            <Text style={styles.unit}> user</Text>
                                        </View>
                                    </Pressable>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 20 }}>
                                    <Pressable
                                        // onPress={() => navigation.navigate('menu')}
                                        style={[styles.viewStatistical, { flex: 1 }]}>
                                        <Text style={styles.textItem}>Customer</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                            <Text style={styles.valueItem}>{dataDashBoard?.numberCustomers} </Text>
                                            <Text style={styles.unit}> user</Text>
                                        </View>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => navigation.navigate('menu')}
                                        style={[styles.viewStatistical, { flex: 1 }]}>
                                        <Text style={styles.textItem}>Dishs</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                            <Text style={styles.valueItem}>{dataDashBoard?.numberDishs} </Text>
                                            <Text style={styles.unit}> dish</Text>
                                        </View>
                                    </Pressable>
                                </View>

                                <Text style={styles.titleItem}>Work Schedule Today</Text>
                                <View style={styles.viewWorkSchedule}>
                                    <View style={[styles.viewColumn, { backgroundColor: '#64B5F6' }]}>
                                        <View style={styles.viewTextTitle}>
                                            <Text style={styles.textTitle}>6h - 12h</Text>
                                        </View>
                                        {arrWorkSchedule.length > 0 &&
                                            arrWorkSchedule.map((workschedule, indexp) => {
                                                if (workschedule.timeType === 'SS1' && workschedule.userData.length > 0) {
                                                    return (
                                                        <View style={styles.viewItemStaff} key={indexp}>
                                                            {
                                                                workschedule.userData.map((staff, index) => {
                                                                    return (
                                                                        <View style={styles.itemStaff} key={index}>
                                                                            <Image style={[styles.imageStaff, {
                                                                                borderWidth: staff.email === infoUser.email ? 2 : 0
                                                                            }]} source={{ uri: staff.image ? staff.image : avatarDefault }} />
                                                                            <Text style={[styles.nameStaff, {
                                                                                color: staff.email === infoUser.email ? '#1b7f63' : 'black'
                                                                            }]}>{staff.fullName}</Text>
                                                                        </View>
                                                                    )
                                                                })
                                                            }
                                                        </View>
                                                    )
                                                } else {
                                                    return null;
                                                }
                                            })
                                        }
                                    </View>
                                    <View style={[styles.viewColumn, { backgroundColor: '#FFF176' }]}>
                                        <View style={styles.viewTextTitle}>
                                            <Text style={styles.textTitle}>12h - 17h</Text>
                                        </View>
                                        {arrWorkSchedule.length > 0 &&
                                            arrWorkSchedule.map((workschedule, indexp) => {
                                                if (workschedule.timeType === 'SS2' && workschedule.userData.length > 0) {
                                                    return (
                                                        <View style={styles.viewItemStaff} key={indexp}>
                                                            {
                                                                workschedule.userData.map((staff, index) => {
                                                                    return (
                                                                        <View style={styles.itemStaff} key={index}>
                                                                            <Image style={[styles.imageStaff, {
                                                                                borderWidth: staff.email === infoUser.email ? 2 : 0
                                                                            }]} source={{ uri: staff.image ? staff.image : avatarDefault }} />
                                                                            <Text style={[styles.nameStaff, {
                                                                                color: staff.email === infoUser.email ? '#1b7f63' : 'black'
                                                                            }]}>{staff.fullName}</Text>
                                                                        </View>
                                                                    )
                                                                })
                                                            }
                                                        </View>
                                                    )
                                                } else {
                                                    return null;
                                                }
                                            })
                                        }
                                    </View>
                                    <View style={[styles.viewColumn, { backgroundColor: '#5E35B1' }]}>
                                        <View style={styles.viewTextTitle}>
                                            <Text style={styles.textTitle}>17h - 22h</Text>
                                        </View>
                                        {arrWorkSchedule.length > 0 &&
                                            arrWorkSchedule.map((workschedule, indexp) => {
                                                if (workschedule.timeType === 'SS3' && workschedule.userData.length > 0) {
                                                    return (
                                                        <View style={styles.viewItemStaff} key={indexp}>
                                                            {
                                                                workschedule.userData.map((staff, index) => {
                                                                    return (
                                                                        <View style={styles.itemStaff} key={index}>
                                                                            <Image style={[styles.imageStaff, {
                                                                                borderWidth: staff.email === infoUser.email ? 2 : 0
                                                                            }]} source={{ uri: staff.image ? staff.image : avatarDefault }} />
                                                                            <Text style={[styles.nameStaff, {
                                                                                color: staff.email === infoUser.email ? '#1b7f63' : 'black'
                                                                            }]}>{staff.fullName}</Text>
                                                                        </View>
                                                                    )
                                                                })
                                                            }
                                                        </View>
                                                    )
                                                } else {
                                                    return null;
                                                }
                                            })
                                        }
                                    </View>
                                </View>
                            </View>
                        )}
                    />
                </View>
            </SafeAreaView >
        </SafeAreaProvider >
    );
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
    viewDash: {
        marginTop: 20,
        height: 'auto',
        width: '100%',
        justifyContent: 'flex-start',
        gap: 20,
    },
    titleItem: {
        color: 'white',
        fontSize: 25,
        fontWeight: '500',
        marginTop: 20
    },
    viewInChart: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#23252c',
        borderRadius: 24,
        padding: 20,
        // gap: 10
    },
    viewStatistical: {
        width: '100%',
        backgroundColor: '#23252c',
        borderRadius: 24,
        padding: 20,
        gap: 5
    },
    textItem: {
        color: 'grey',
        fontSize: 15,
        fontWeight: '500'
    },
    valueItem: {
        color: 'white',
        fontSize: 25,
        fontWeight: '700'
    },
    unit: {
        color: 'grey',
        fontSize: 15,
        fontWeight: '500',
        marginLeft: -5
    },
    viewWorkSchedule: {
        width: '100%',
        minHeight: 400,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    viewColumn: {
        height: '100%',
        width: '31%',
        alignItems: 'center',
        borderRadius: 24,
        padding: 10,
        gap: 20
    },
    viewTextTitle: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 10,
        width: '100%',
        height: 40,
        justifyContent: 'center',
    },
    textTitle: {
        color: 'white',
        fontSize: 20,
        textAlign: 'center'
    },
    viewItemStaff: {
        rowGap: 20,
        width: '100%'
    },
    itemStaff: {
        gap: 2,
        alignItems: 'center',
        width: '100%',
    },
    imageStaff: {
        height: 60,
        width: 60,
        borderRadius: 30,
        backgroundColor: 'white',
        borderColor: '#1b7f63'
    },
    nameStaff: {
        fontSize: 17,
        textAlign: 'center'
    }
});


const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        color: 'grey',
        fontSize: 17,
        fontWeight: '400',
        height: '100%',
        minWidth: 35,
    },
    inputAndroid: {
        color: 'grey',
        fontSize: 17,
        fontWeight: '400',
        minWidth: 35,
        padding: 0,
    },
});
