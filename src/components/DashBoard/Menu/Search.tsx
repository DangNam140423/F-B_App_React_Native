import { Animated, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from "react";

export default function Search({ searchByName, categoryChoose }: any) {
    const [textSearch, setTextSearch] = useState<string>("");
    const [focused, setFocused] = useState(false);

    const widthAnim = useRef(new Animated.Value(100)).current; // Giá trị ban đầu là 85%
    const textInputRef = useRef<TextInput>(null);

    const changeTextSeach = (value: string) => {
        setTextSearch(value);
        searchByName(value);
    }

    const clearTextSearch = () => {
        setTextSearch("");
        changeTextSeach("");
    }

    const focusInput = () => {
        if (textInputRef.current) {
            textInputRef.current.focus(); // Làm cho TextInput nhận tiêu điểm
        }
        setFocused(true);
    }

    const cancleInput = () => {
        if (textInputRef.current) {
            textInputRef.current.blur(); // Làm mất tiêu điểm
        }
        setFocused(false);
    }

    const handleSubmitEditing = () => {
        if (textInputRef.current) {
            textInputRef.current.blur(); // Làm mất tiêu điểm
        }
        setFocused(false);
    }


    useEffect(() => {
        Animated.timing(widthAnim, {
            toValue: focused ? 85 : 100,
            duration: 200,
            useNativeDriver: false, // Không dùng native driver vì chúng ta đang thay đổi width
        }).start();
    }, [focused]);


    return (
        <View style={styles.viewFormSearch}>
            <Animated.View
                style={[
                    {
                        alignItems: 'center',
                        flexDirection: 'row',
                        width: widthAnim.interpolate({
                            inputRange: [85, 100],
                            outputRange: ['85%', '100%'],
                        }),
                    },
                ]}
            >
                <TextInput style={[styles.iputSearch, { paddingLeft: categoryChoose ? 130 : 20 }]}
                    value={textSearch}
                    ref={textInputRef}
                    onFocus={focusInput}
                    // onBlur={cancleInput}
                    onChangeText={(event) => { changeTextSeach(event) }}
                    onSubmitEditing={handleSubmitEditing}
                    placeholder="Search..."
                    placeholderTextColor={'grey'}
                />
                {!focused
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
                    textAlign: 'right',
                    color: 'white'
                }}>Close</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    viewFormSearch: {
        height: 'auto',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    iputSearch: {
        height: 50,
        width: '100%',
        backgroundColor: '#333',
        borderColor: '#AFAFAF',
        borderWidth: 1,
        borderRadius: 50,
        paddingRight: 60,
        color: 'white',
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
    }
});
