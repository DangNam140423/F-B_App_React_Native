import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, FlatList, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
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
import StaffSchedule from "./StaffSchedule";
import { REACT_APP_BACKEND_URL } from "@env";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import StaffTabBar from "./StaffTabBar";

const Tab = createMaterialTopTabNavigator();

const { width, height } = Dimensions.get('window');

interface objectUser {
    id: number,
    fullName: string,
    email: string,
    roleId: string,
    status: boolean,
    image: string
}

function ListStaff(props: any) {
    const { navigation } = props;
    const params = props.route && props.route.params;

    const dispatch = useDispatch();
    const infoUser = useSelector((state: RootState) => state.app.inforUser);
    const token = useSelector((state: RootState) => state.app.token);
    const [limitStaff, setLimitStaff] = useState('5');
    const [arrStaff, setArrStaff] = useState<objectUser[]>([]);

    const [rightAnim, setRightAnim] = useState<Animated.Value[]>([]);
    const [heightAnim, setHeightAnim] = useState<Animated.Value[]>([]);

    const [loadingStaff, setLoadingStaff] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const getStaff = async () => {
        setLoadingStaff(true);
        await axios.get(`http://192.168.1.77:3000/api/get-all-user?id=ALL&limit=${limitStaff}&page=1`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(function (response) {
                setArrStaff(response.data.users.dataUser);
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
                setLoadingStaff(false);
            });
    }

    useEffect(() => {
        getStaff();
    }, [token, limitStaff, params]);

    useEffect(() => {
        // // Làm trống mảng hiện tại
        // rightAnims.splice(0, rightAnims.length);
        let arrSup: Animated.Value[] = [];
        let arrSupHeight: Animated.Value[] = [];

        arrStaff.forEach(async () => {
            arrSup.push(new Animated.Value(0));
            arrSupHeight.push(new Animated.Value(100));
        });

        setRightAnim(arrSup);
        setHeightAnim(arrSupHeight);
    }, [arrStaff]);


    const handleFilter = (value: string) => {
        if (value !== 'null' && value !== null) {
            setLimitStaff(value)
        } else {
            alert("Choose filter");
            return;
        }
    }

    const moveInsertStaff = () => {
        navigation.navigate('createstaff');
    }

    const onSwipe = (event: any, index: number) => {
        const { translationX, translationY } = event.nativeEvent;
        // if (translationY > 50) {
        //     Alert.alert('Vuốt xuống!');
        // } else if (translationY < -50) {
        //     Alert.alert('Vuốt lên!');
        // }
        if (translationX < -50) {
            Animated.timing(rightAnim[index], {
                toValue: 100,
                duration: 50,
                useNativeDriver: false,
            }).start();
        } else if (translationX > 50) {
            Animated.timing(rightAnim[index], {
                toValue: 0,
                duration: 50,
                useNativeDriver: false,
            }).start()
        }

        // console.log(rightAnims)
    };

    const handleDestroy = async (user: objectUser, index: number) => {
        if (user.email === infoUser.email) {
            alert('You are logged into this account!');
            cancaleAnimationDestroy(index);
            return;
        }
        await axios.delete(`http://192.168.1.77:3000/api/delete-user`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: {
                id: user.id
            }
        })
            .then(function (response) {
                if (response.data.errCode !== 0) {
                    alert(response.data.errMessage);
                    cancaleAnimationDestroy(index);
                } else {
                    animationDestroy(index);
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
                setLoadingStaff(false);
            });
    }

    const animationDestroy = (index: number) => {
        Animated.timing(rightAnim[index], {
            toValue: 200,
            duration: 200,
            useNativeDriver: false,
        }).start(() => {
            Animated.timing(heightAnim[index], {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        });
    }


    const cancaleAnimationDestroy = (index: number) => {
        Animated.timing(rightAnim[index], {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }

    const onRefresh = async () => {
        setIsRefreshing(true);
        await getStaff();
        setIsRefreshing(false);
    };

    return (
        <FlatList
            style={styles.viewStaff}
            data={arrStaff}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
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
                    height: 70,
                    gap: 5,
                }}>
                    {loadingStaff && !isRefreshing
                        &&
                        <View style={[styles.viewStaff, { justifyContent: 'center', alignItems: 'center' }]}>
                            <ActivityIndicator size="large" color="white" />
                            <Text style={{ color: 'white', fontSize: 20 }}>Loading...</Text>
                        </View>
                    }
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <Text style={{
                            color: 'white',
                            fontSize: 25,
                            fontWeight: '500'
                        }}>Staff Management</Text>
                        <Text style={{
                            color: 'grey',
                            fontSize: 15,
                            fontWeight: '500'
                        }}>View show</Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{
                            fontSize: 17,
                            fontWeight: '400',
                            color: 'grey'
                        }}>
                            All staff information
                        </Text>

                        <View style={{ gap: 5, flexDirection: 'row', alignItems: 'center' }}>
                            <FontAwesome5 name="chevron-down" size={15} color="grey" />
                            <RNPickerSelect
                                onValueChange={(value) => handleFilter(value)}
                                value={limitStaff}
                                placeholder={{
                                    label: 'Select limit...',
                                    value: null,
                                    color: 'grey',
                                }}
                                style={pickerSelectStyles}
                                useNativeAndroidPickerStyle={false}
                                items={[
                                    { label: '5 people', value: '5' },
                                    { label: '10 people', value: '10' },
                                    { label: 'All', value: 'All' },
                                ]}
                            />
                        </View>
                    </View>
                </View>
            )}
            renderItem={({ item, index }) => {
                return (
                    <PanGestureHandler
                        activeOffsetX={[0, 0]}
                        failOffsetY={[-5, 5]}
                        onGestureEvent={(event) => onSwipe(event, index)}
                    >
                        <Animated.View
                            style={{
                                height: heightAnim[index],
                            }}>
                            <Animated.View
                                style={
                                    {
                                        width: '100%',
                                        height: '100%',
                                        position: 'absolute',
                                        right: rightAnim[index],
                                        opacity: !loadingStaff ? rightAnim[index].interpolate({
                                            inputRange: [0, 100, 200],
                                            outputRange: [1, 100, 0],
                                        }) : 1
                                    }
                                }>
                                <Pressable style={styles.itemStaff}>
                                    <Image style={{
                                        height: 60,
                                        width: 60,
                                        borderRadius: 30,
                                        backgroundColor: 'white'
                                    }} source={{ uri: item.image ? item.image : 'https://res.cloudinary.com/dtjdfh2ly/image/upload/v1715830723/logo_fufu_color_bxmepe.png' }} />
                                    <View
                                        style={{ flex: 4, justifyContent: 'center', gap: 5 }}>
                                        <Text style={styles.infoMain}>{item.fullName}</Text>
                                        <Text style={styles.infoSupport}>{item.email}</Text>
                                    </View>
                                    <View
                                        style={{ flex: 2, justifyContent: 'center', alignItems: 'flex-end', gap: 5 }}>
                                        <View style={[styles.roleId, {
                                            backgroundColor: item.roleId === 'R1' ? '#d8fff4' : '#f6e7ce'
                                        }]}>
                                            <Text style={{
                                                color: item.roleId === 'R1' ? '#1b7f63' : '#a97413',
                                                fontWeight: '500'
                                            }}>{item.roleId === 'R1' ? 'Manager' : 'Staff'}</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            </Animated.View>
                            <View style={styles.viewHidden}>
                                <Pressable
                                    onPress={() => handleDestroy(item, index)}
                                    style={styles.viewDelete}>
                                    <MaterialIcons name="delete-outline" size={30} color="white" />
                                </Pressable>
                            </View>
                        </Animated.View>
                    </PanGestureHandler>

                )
            }}

            ListFooterComponent={() => (
                <View>
                    <View style={{
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        flexDirection: 'row',
                        marginBottom: 20
                    }}>
                        <Pressable
                            onPress={moveInsertStaff}
                            style={{
                                width: 70,
                                height: 70,
                                backgroundColor: '#1b7f63',
                                borderRadius: 35,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                            <AntDesign name="plus" size={33} color="white" />
                        </Pressable>
                    </View>
                </View>
            )}
        />
    )
}

export default function MainStaff() {
    return (
        <SafeAreaProvider style={styles.container}>
            <SafeAreaView>
                <View style={styles.body}>
                    {/* <View style={{ width: '100%', height: 'auto', padding: 20 }}>
                        <View style={styles.viewStaff}>

                        </View>
                    </View> */}
                    <Tab.Navigator tabBar={props => <StaffTabBar {...props} />}>
                        <Tab.Screen name="List Staff" component={ListStaff} />
                        <Tab.Screen name="Schedule Staff" component={StaffSchedule} />
                    </Tab.Navigator>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>

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
        paddingVertical: 0,
    },
    viewStaff: {
        backgroundColor: '#23252c',
        borderRadius: 24,
        padding: 10,
        paddingHorizontal: 20,
    },
    itemStaff: {
        height: '100%',
        width: '100%',
        flexDirection: 'row',
        gap: 10,
        borderBottomWidth: 0,
        borderColor: 'grey',
        alignItems: 'center',
        backgroundColor: '#23252c'
    },
    infoMain: {
        color: 'white',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 1
    },
    infoSupport: {
        color: 'grey',
        fontSize: 13,
        fontWeight: '400',
    },
    roleId: {
        paddingHorizontal: 10,
        borderRadius: 50,
        minWidth: 70,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center'
    },
    viewHidden: {
        height: '100%',
        width: '100%',
        position: 'absolute',
        zIndex: -1,
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    viewDelete: {
        height: '90%',
        width: 90,
        backgroundColor: '#f25d5d',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12
    }
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        color: '#1b7f63',
        fontSize: 17,
        fontWeight: '400',
        minWidth: 10,
    },
    inputAndroid: {
        color: '#1b7f63',
        fontSize: 17,
        fontWeight: '400',
        minWidth: 10
    },
});