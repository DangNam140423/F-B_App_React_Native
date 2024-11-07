import { Animated, View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import { AntDesign } from '@expo/vector-icons';


const { width, height } = Dimensions.get('window');


export default function StaffTabBar({ state, descriptors, navigation, position }: any) {
    return (
        <View style={styles.viewTop}>
            {state.routes.map((route: any, index: any) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                const inputRange = state.routes.map((_: any, i: any) => i);
                const opacity = position.interpolate({
                    inputRange,
                    outputRange: inputRange.map((i: any) => (i === index ? 1 : 1)),
                });

                return (
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={styles.touchView}
                        key={index}

                    >
                        <View style={[
                            styles.buttonView,
                            { borderBottomWidth: isFocused ? 2 : 0 }
                        ]}>
                            {/* <Animated.Text style={[
                                { opacity },
                                styles.textLabel,
                                { color: isFocused ? 'white' : 'grey' }
                            ]}>
                                {label}
                            </Animated.Text> */}
                            <Animated.View
                                style={[
                                    { opacity }
                                ]}>
                                {label === 'List Staff'
                                    ?
                                    <AntDesign name="bars" size={30} color={isFocused ? 'white' : 'grey'} />
                                    :
                                    <AntDesign name="calendar" size={30} color={isFocused ? 'white' : 'grey'} />
                                }
                            </Animated.View>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    viewTop: {
        overflow: 'hidden',
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 5,
        height: 40
    },
    touchView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonView: {
        borderBottomColor: 'white',
        width: '100%',
        alignItems: 'center',
        paddingBottom: 5
    },
    textLabel: {
        fontSize: 20,
    }
})