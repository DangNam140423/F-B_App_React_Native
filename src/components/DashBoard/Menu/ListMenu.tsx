import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Button, Platform, StyleSheet, FlatList, Dimensions, ImageBackground, Pressable, Animated, TouchableWithoutFeedback, Keyboard, ActivityIndicator, KeyboardAvoidingView, RefreshControl } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import axios from 'axios';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Search from './Search';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import * as SecureStore from 'expo-secure-store';
import { setAuth } from '../../../store/slices/appSlice';
import { AntDesign, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import DetailMenu from './DetailMenu';
import { REACT_APP_JWT_SECRET, REACT_APP_IP } from '@env';

const { width, height } = Dimensions.get('window');
interface objectCategory {
    keyMap: string,
    valueVi: string,
    valueEn: string,
    image: string,
    countDish: number
}

interface objectMenu {
    name: string,
    many_sizes: boolean,
    price_S: number,
    price_M: number,
    price_L: number,
    category: string,
    description: string,
    image: string,
    categoryData: {
        keyMap: string,
        valueVi: string,
        valueEn: string,
        image: string
    }
}

async function saveToken(key: string, value: string) {
    await SecureStore.setItemAsync(key, value);
}

export default function ListMenu({ route, navigation }: any) {
    const categoryProps = (route.params && route.params.categoryProps ? route.params.categoryProps : '');
    const paramProps = route.params && route.params ? route.params : undefined;

    const dispatch = useDispatch();
    const [category, setCategory] = useState<objectCategory[]>([]);
    const token = useSelector((state: RootState) => state.app.token);
    const [arrMenu, setArrMenu] = useState<objectMenu[]>([]);
    const [arrMenu2, setArrMenu2] = useState<objectMenu[]>([]);
    const infoUser = useSelector((state: RootState) => state.app.inforUser);
    const [valueDishChoose, setValueDishChoose] = useState<objectMenu>();
    const [inputSearch, setInputSearch] = useState("");
    const [categoryChoose, setCategoryChoose] = useState<objectCategory>();

    const [loadingMenu, setLoadingMenu] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const getCategory = async () => {
            await axios.get(`http://192.168.142.61:3000/api/get-all-code?type=DISHES_CATEGORY`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(function (response) {
                    setCategory(response.data.data);
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
        getCategory();
    }, [token]);

    const getMenu = async () => {
        setLoadingMenu(true);
        await axios.get(`http://192.168.142.61:3000/api/get-all-menu?category=ALL`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(function (response) {
                setArrMenu(response.data.menus);
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
                setLoadingMenu(false);
            });
    }

    useEffect(() => {
        getMenu();
    }, [token]);


    useEffect(() => {
        if (paramProps && paramProps.isGetProps) {
            getMenu();
        }
    }, [paramProps]);

    useEffect(() => {
        setCategoryChoose(categoryProps);
    }, [categoryProps])

    const handleChooseDish = (dish: objectMenu) => {
        Keyboard.dismiss();
        setValueDishChoose(dish);
        navigation.navigate('detailmenu', {
            valueDish: dish
        });
    }


    const searchByName = (value: string) => {
        setInputSearch(value);
    };

    useEffect(() => {
        let result = arrMenu.filter(item =>
            item.name.toLowerCase().includes(inputSearch.toLowerCase())
            &&
            (categoryChoose ? item.category === (categoryChoose.keyMap) : true)
        );
        if (result.length > 0) {
            setArrMenu2(result);
        } else {
            setArrMenu2([])
        }
    }, [inputSearch, categoryChoose, arrMenu]);

    const scrollFlat = () => {
        Keyboard.dismiss();
    }

    const selectCategory = (value: objectCategory) => {
        setCategoryChoose(value);
    }

    const moveAddMenu = () => {
        navigation.navigate('createmenu');
    }

    const onRefresh = async () => {
        setIsRefreshing(true);
        await getMenu();
        setIsRefreshing(false);
    };

    return (
        <SafeAreaProvider style={styles.container}>
            <SafeAreaView style={styles.safeAre}>
                <View style={styles.body}>
                    <View>
                        <Search searchByName={searchByName} categoryChoose={categoryChoose} />
                        <View style={{
                            position: 'absolute',
                            width: 120,
                            height: 50,
                            borderRadius: 25,
                            backgroundColor: '#1b7f63',
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                            borderColor: 'grey',
                            borderWidth: 1,
                            display: categoryChoose ? 'flex' : 'none'
                        }}>
                            <Text style={{
                                fontSize: 15,
                                fontWeight: '400',
                                color: 'white'
                            }}>{categoryChoose?.valueEn}</Text>
                            <Pressable onPress={() => setCategoryChoose(undefined)}>
                                < Feather name="x" size={24} color="white" />
                            </Pressable>
                        </View>
                    </View>
                    <View style={{
                        width: '100%',
                        height: 70,
                        paddingVertical: 15,
                    }}>
                        <FlatList
                            horizontal
                            data={category}
                            keyExtractor={(item, index) => index.toString()} // Ensure each item has a unique key
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"

                            renderItem={({ item }) =>
                                <Pressable
                                    onPress={() => selectCategory(item)}
                                    style={{
                                        width: 100,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 20,
                                        borderRadius: 10,
                                        backgroundColor: '#1b7f63'
                                    }}>
                                    <Text style={{ color: 'white' }}>{item.valueEn}</Text>
                                </Pressable>
                            }
                        />
                    </View>

                    {loadingMenu && !isRefreshing
                        &&
                        <View
                            style={{ width: '100%', gap: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#343434" />
                            <Text style={{ fontSize: 20, fontWeight: '500', color: '#343434' }}>Loading...</Text>
                        </View>
                    }
                    <FlatList
                        data={category}
                        keyExtractor={(item, index) => index.toString()} // Ensure each item has a unique key
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        onScroll={scrollFlat}
                        refreshControl={
                            <RefreshControl
                                colors={['black']}
                                tintColor={'white'}
                                refreshing={isRefreshing}
                                onRefresh={onRefresh}
                            />
                        }

                        renderItem={({ item }) => <View></View>}
                        ListFooterComponent={() => (
                            <View style={{ marginVertical: 10, flexDirection: 'row', flexWrap: 'wrap', rowGap: 20 }}>
                                {(arrMenu.length > 0 && !inputSearch && !categoryChoose
                                    ?
                                    arrMenu
                                    :
                                    arrMenu2
                                )
                                    .map((item, index) => (
                                        <View style={styles.itemDishFake} key={index}>
                                            <Pressable style={styles.itemDish} onPress={() => handleChooseDish(item)}>
                                                <ImageBackground source={{ uri: item.image }} style={
                                                    [StyleSheet.absoluteFill, { padding: 10, borderRadius: 12, justifyContent: 'flex-end' }]
                                                }>
                                                    <BlurView
                                                        intensity={20}
                                                        style={{
                                                            width: '100%',
                                                            borderRadius: 12,
                                                            minHeight: 80,
                                                            padding: 5,
                                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                                            overflow: 'hidden',
                                                            justifyContent: 'space-between'
                                                        }}>
                                                        <View >
                                                            <Text
                                                                numberOfLines={2}
                                                                ellipsizeMode="tail"
                                                                style={{
                                                                    color: 'white',
                                                                    fontSize: 17,
                                                                    fontWeight: '600',
                                                                    marginBottom: 10
                                                                }}>
                                                                {item.name}
                                                            </Text>
                                                        </View>
                                                        <View style={{ gap: 3, alignItems: 'flex-start', justifyContent: 'flex-end', flexDirection: 'row' }}>
                                                            <Feather name="star" size={15} color={'#219778'} />
                                                            <Feather name="star" size={15} color={'#219778'} />
                                                            <Feather name="star" size={15} color={'#219778'} />
                                                            <Feather name="star" size={15} color={'#219778'} />
                                                            <Feather name="star" size={15} color={'#219778'} />
                                                        </View>
                                                    </BlurView>
                                                </ImageBackground>
                                            </Pressable>
                                        </View>
                                    ))
                                }
                            </View>
                        )}
                    />
                </View>

                <Pressable
                    onPress={moveAddMenu}
                    style={{
                        width: 70,
                        height: 70,
                        backgroundColor: '#1b7f63',
                        borderRadius: 35,
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'absolute',
                        right: 20,
                        bottom: 50
                    }}>
                    <AntDesign name="plus" size={30} color="white" />
                </Pressable>
            </SafeAreaView>
        </SafeAreaProvider >
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    safeAre: {
        flex: 1,
        width: '100%',
    },
    body: {
        flex: 1,
        padding: 10,
        overflow: 'hidden'
    },
    itemDishFake: {
        height: 200,
        width: (width - 20) / 2,
        alignItems: 'center'
    },
    itemDish: {
        height: '100%',
        width: '90%',
        backgroundColor: 'grey',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'white'
    },
});
