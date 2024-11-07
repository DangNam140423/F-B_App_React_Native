import { BlurView } from "expo-blur";
import { ActivityIndicator, Dimensions, FlatList, Image, ImageBackground, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from '@expo/vector-icons';
import React, { memo, useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import Dialog from "react-native-dialog";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "../../../navigation/routes";
import { setRoute } from "../../../store/slices/appSlice";

const { width, height } = Dimensions.get('window');
const imageTicket = 'https://res.cloudinary.com/dtjdfh2ly/image/upload/v1726987634/F_and_B_Pro_App/image-from-rawpixel-id-15047084-png_tqm3w7.png';

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

const TrendFood = memo(({ arrMenu }: any) => {
    const dispatch = useDispatch();
    const navigation = useNavigation<NavigationProp>();
    const [visible, setVisible] = useState(false);
    const [itemDish, setItemDish] = useState<objectMenu>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const showDialog = (item: objectMenu) => {
        setVisible(true);
        setItemDish(item);
    };

    const handleCancel = () => {
        setVisible(false);
    };
    const moveMenuScreen = () => {
        dispatch(setRoute('menu'));
        navigation.navigate('menu', {
            categoryProps: undefined
        });
    };

    const moveBookingScreen = () => {
        dispatch(setRoute('booking'));
        navigation.navigate('booking');
    }

    return (
        <View>
            <Dialog.Container contentStyle={{ width: width - 20 }} blurStyle={{ backgroundColor: 'white' }} visible={visible}>
                {Platform.OS === 'ios' ? (
                    <Dialog.Description >
                        <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                            <Image style={{ width: 70, height: 70, borderRadius: 20 }}
                                source={{ uri: itemDish && itemDish.image }} />
                            <View style={{ width: '80%' }}>
                                <Text style={{ color: 'black', fontSize: 17, fontWeight: 'bold' }}>{itemDish ? itemDish.name : ''}</Text>
                                <Text style={{ color: 'black', width: '100%', fontSize: 12 }}>
                                    {itemDish ? itemDish.description : ''}
                                </Text>
                            </View>
                        </View>
                    </Dialog.Description>
                ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                        <Image style={{ width: 70, height: 70, borderRadius: 20 }}
                            source={{ uri: itemDish && itemDish.image }} />
                        <View style={{ width: '80%' }}>
                            <Text style={{ fontSize: 17, fontWeight: 'bold' }}>{itemDish ? itemDish.name : ''}</Text>
                            <Text style={{ width: '100%' }}>
                                {itemDish ? itemDish.description : ''}
                            </Text>
                        </View>
                    </View>
                )}
                <Dialog.Button label="Cancel" onPress={handleCancel} />
            </Dialog.Container>
            <View style={{
                backgroundColor: '#1b7f63',
                width: '100%',
                borderRadius: 20,
                marginBottom: 20,
                alignItems: 'center',
                flexDirection: 'row',
                padding: 10,
                gap: 20
            }}>
                {/* {error && <Text>Failed to load image</Text>}

                {loading &&
                    <ActivityIndicator size="large" color="#0000ff" />
                } */}
                <Image
                    source={{ uri: imageTicket }}
                    style={{
                        width: 100,
                        height: 100,
                        transform: [{ rotate: '-30deg' }],
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.8,
                        shadowRadius: 2
                    }}
                // onLoadStart={() => {
                //     setLoading(true);
                //     setError(false);
                // }}
                // onLoad={() => setLoading(false)}
                // onError={() => {
                //     setLoading(false);
                //     setError(true);
                // }}
                />
                <View style={{ flex: 1, }}>
                    <Text style={{
                        fontSize: 14,
                        fontWeight: '400',
                        marginBottom: 10,
                        color: 'white',
                    }}>
                        Reserve your buffet spot today!
                    </Text>
                    <Pressable onPress={moveBookingScreen}>
                        <Text style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: 'white',
                            textDecorationLine: 'underline',
                        }}>
                            Booking
                        </Text>
                    </Pressable>
                </View>
            </View>
            <View style={{
                justifyContent: 'space-between',
                alignItems: "center",
                marginBottom: 20,
                flexDirection: 'row',
            }}>
                <Text style={{
                    fontSize: 20,
                    fontWeight: '500',
                    color: 'white'
                }}>Trending Food & Drinks</Text>
                <Pressable
                    onPress={moveMenuScreen}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                    <Text style={{
                        color: '#a9a8a8',
                        fontSize: 15,
                    }}>View All </Text>
                    <Feather size={22} color={'grey'} name="arrow-right" />
                </Pressable>
            </View>

            <FlatList
                data={arrMenu.slice(0, 5).reverse()}
                horizontal
                keyExtractor={(item, index) => index.toString()}
                keyboardShouldPersistTaps="handled"
                showsHorizontalScrollIndicator={false}
                style={{
                    width: '100%'
                }}
                renderItem={({ item }) =>
                    <Pressable
                        onPress={() => { showDialog(item) }}
                        style={{
                            height: 400,
                            width: 250,
                            borderRadius: 20,
                            marginRight: 20,
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: 'white'
                        }}>
                        <ImageBackground source={{ uri: item.image }} style={
                            [StyleSheet.absoluteFill, { padding: 20 }]
                        }>
                            <View style={{ flex: 1 }}>
                                <BlurView
                                    intensity={20}
                                    style={{
                                        width: 80,
                                        borderRadius: 12,
                                        padding: 10,
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        overflow: 'hidden'
                                    }}>
                                    <Text style={{ color: 'white', textAlign: 'center' }}>
                                        {item.categoryData.valueEn}
                                    </Text>
                                </BlurView>
                            </View>
                            <BlurView
                                intensity={20}
                                style={{
                                    flexDirection: 'row',
                                    width: '100%',
                                    borderRadius: 12,
                                    minHeight: 100,
                                    padding: 10,
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    overflow: 'hidden'
                                }}>
                                <View style={{ width: '50%' }}>
                                    <Text
                                        numberOfLines={2}
                                        ellipsizeMode="tail"
                                        style={{
                                            color: 'white',
                                            fontSize: 20,
                                            fontWeight: '600',
                                            marginBottom: 10
                                        }}>
                                        {item.name}
                                    </Text>
                                    <Text style={{
                                        color: 'white',
                                        fontSize: 15
                                    }}>
                                        {item.many_sizes ? '3 size' : '1 size'}
                                    </Text>
                                </View>
                                <View style={{ gap: 3, width: '50%', alignItems: 'flex-start', justifyContent: 'flex-end', flexDirection: 'row' }}>
                                    <Feather name="star" size={15} color={'#219778'} />
                                    <Feather name="star" size={15} color={'#219778'} />
                                    <Feather name="star" size={15} color={'#219778'} />
                                    <Feather name="star" size={15} color={'#219778'} />
                                    <Feather name="star" size={15} color={'#219778'} />
                                </View>
                            </BlurView>
                        </ImageBackground>
                    </Pressable>
                }
            />
            <View style={{
                flexDirection: 'row',
                marginVertical: 20,
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Text style={{
                    fontSize: 20,
                    fontWeight: '500',
                    color: 'white'
                }}>Category</Text>
            </View>
        </View >
    )
});

export default TrendFood;