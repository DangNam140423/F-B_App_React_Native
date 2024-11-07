import { Animated, Dimensions, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from "react";
import axios from "axios";


const { width, height } = Dimensions.get('window');

interface objectUser {
    id: number;
    name: string;
    username: string;
    email: string;
    address: {
        street: string;
        suite: string;
        city: string;
        zipcode: string;
        geo: {
            lat: string;
            lng: string;
        }
    },
    phone: string;
    website: string;
    company: {
        name: string;
        catchPhrase: string;
        bs: string;
    }
}

export default function SearchScreen() {
    const [arrUser, setArrUser] = useState<objectUser[]>([]);
    const [textSearch, setTextSearch] = useState<string>("");
    const [haveResult, setHaveResult] = useState(false);
    const [focused, setFocused] = useState(false);

    const widthAnim = useRef(new Animated.Value(100)).current; // Giá trị ban đầu là 85%
    const textInputRef = useRef<TextInput>(null);

    useEffect(() => {
        axios.get('https://jsonplaceholder.typicode.com/users')
            .then(function (response) {
                setArrUser(response.data)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .finally(function () {
            });
    }, []);

    const changeTextSeach = (value: any) => {
        setTextSearch(value);
    }

    useEffect(() => {
        if (textSearch) {
            setHaveResult(true)
        } else {
            setHaveResult(false)
        }
    }, [textSearch]);

    const clearTextSearch = () => {
        setTextSearch("");
    }

    const focusInput = () => {
        if (textInputRef.current) {
            textInputRef.current.focus(); // Làm cho TextInput nhận tiêu điểm
        }
        setFocused(true)
    }

    const cancleInput = () => {
        if (textInputRef.current) {
            textInputRef.current.blur(); // Làm mất tiêu điểm
        }
        setFocused(false)
    }

    const handleSubmitEditing = () => {
        if (textInputRef.current) {
            textInputRef.current.blur(); // Làm mất tiêu điểm
        }
        setFocused(false)
    }

    Animated.timing(widthAnim, {
        toValue: focused ? 85 : 100,
        duration: 200, // Thời gian chuyển đổi 0.5 giây
        useNativeDriver: false, // Không dùng native driver vì chúng ta đang thay đổi width
    }).start();

    return (
        <View style={styles.container}>
            <View
                style={styles.body}
            >
                <View style={styles.viewFormSearch}>
                    <Animated.View
                        style={[
                            {
                                alignItems: 'center',
                                flexDirection: 'row',
                                // width: haveResult ? '85%' : '100%',
                                width: widthAnim.interpolate({
                                    inputRange: [85, 100],
                                    outputRange: ['85%', '100%'],
                                }),
                            },
                        ]}
                    >
                        <TextInput style={styles.iputSearch}
                            value={textSearch}
                            ref={textInputRef}
                            onFocus={focusInput}
                            // onBlur={cancleInput}
                            onChangeText={(event) => { changeTextSeach(event) }}
                            onSubmitEditing={handleSubmitEditing}
                            placeholder="Search friend..."
                        />
                        {!haveResult
                            ?
                            <Pressable style={styles.iconSearch}>
                                <Feather name="search" size={20} color="white" />
                            </Pressable>
                            :
                            <Pressable onPress={clearTextSearch} style={styles.iconSearch}>
                                <Feather name="x" size={20} color="white" />
                            </Pressable>
                        }
                    </Animated.View>
                    <Pressable
                        onPress={cancleInput}
                        style={{
                            width: '15%',
                            display: focused ? 'flex' : 'none',
                        }}>
                        <Text style={{
                            fontSize: 17,
                            textAlign: 'right'
                        }}>Close</Text>
                    </Pressable>
                </View>
                <View style={styles.viewResult}>
                    <View style={{
                        display: !haveResult ? 'none' : 'flex'
                    }}>
                        <Text style={{
                            fontSize: 22,
                            fontWeight: '500'
                        }}>Top Results</Text>
                        <Text style={{
                            fontSize: 18,
                            fontWeight: '400',
                            color: '#828282',
                            lineHeight: 40
                        }}>What are you looking for ?</Text>
                        <FlatList
                            data={arrUser}
                            // keyExtractor={(item, index) => index.toString()} // Ensure each item has a unique key
                            keyExtractor={(item) => item.id.toString()} // Ensure each item has a unique key
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            style={styles.viewListFriend}

                            renderItem={({ item }) =>
                                <View style={styles.item_user}>
                                    <View style={styles.viewInfo}>
                                        <Image
                                            style={styles.avatar_user}
                                            source={{
                                                uri: item.id === 1
                                                    ?
                                                    'https://i.pinimg.com/originals/90/d9/06/90d906e6d1dc7b21aa5ffe011e57c3ff.jpg'
                                                    : item.id === 2
                                                        ?
                                                        'https://i.pinimg.com/originals/44/f4/08/44f408f2f83f4902f8cdae1e7e5f830c.jpg'
                                                        :
                                                        item.id === 3
                                                            ?
                                                            'https://i.pinimg.com/originals/1f/3e/87/1f3e875bc42f9e36b7c9922a2ff0a422.jpg'
                                                            :
                                                            'https://i.pinimg.com/originals/01/c6/6b/01c66ba35366731308ede577b2f0dd82.jpg'
                                            }}
                                        />
                                        <View>
                                            <Text style={styles.nameUser}>{item.name}</Text>
                                            <Text style={styles.phoneUser}>{item.phone}</Text>
                                        </View>
                                    </View>
                                </View>
                            }
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    body: {
        flex: 1,
        marginHorizontal: 0,
        marginTop: 120,
        width: width,
        // marginBottom: 80,
        paddingHorizontal: 20,
        flexDirection: 'column',
        gap: 30
    },
    viewFormSearch: {
        height: 60,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    iputSearch: {
        height: 50,
        width: '100%',
        backgroundColor: 'white',
        borderColor: '#AFAFAF',
        borderWidth: 1,
        borderRadius: 50,
        paddingLeft: 20,
        paddingRight: 60,
        color: 'black',
        fontSize: 17
    },
    iconSearch: {
        position: 'absolute',
        right: 0,
        height: 40,
        width: 40,
        borderRadius: 40 / 2,
        backgroundColor: '#343434',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5
    },
    viewResult: {
        height: height - 120 - 30 - 60 - 100,
        width: '100%',
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 20,
    },
    viewResult_In: {
        display: 'flex'
    },
    viewListFriend: {
        width: '100%',
        flexDirection: 'column',
    },
    item_user: {
        width: '100%',
        height: 80,
        marginVertical: 10,
        alignItems: 'center',
        flexDirection: 'row',
    },
    viewInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    avatar_user: {
        height: 50,
        width: 50,
        borderRadius: 50 / 2,
        borderColor: '#B2B0B0',
        borderWidth: 1
    },
    nameUser: {
        fontSize: 15,
        fontWeight: '500',
        color: 'black'
    },
    phoneUser: {
        fontSize: 15,
        fontWeight: 'medium',
        color: '#B2B0B0'
    },
});