import { HeaderBackButton } from '@react-navigation/elements';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyHeader({ title }: any) {
    // const handleBack = () => {
    //     navigation.goBack();
    // }

    const moveBack = () => {
        // navigation.goBack();
    }

    return (
        <View style={styles.headerBackground}>
            <View style={styles.viewUserName}>
                <View style={styles.item_header}>
                    {title === 'Search' &&
                        <Pressable onPress={moveBack}>
                            <Feather name="chevron-left" size={30} color="black" />
                        </Pressable>
                    }
                    <Text style={[styles.title,
                    {
                        fontWeight: title === 'Search' ? '300' : '400',
                        fontSize: title === 'Search' ? 20 : 24,
                        height: 30
                    }
                    ]}>
                        {title}
                    </Text>
                </View>
                <Pressable style={styles.item_header}>
                    <Feather name="bell" size={24} color="white" />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerBackground: {
        paddingHorizontal: 15,
        flexDirection: 'row',
        zIndex: 1,
        // borderBottomColor: '#eae9e9',
        // borderBottomWidth: 2,
        // backgroundColor: "#F5F4F4"
    },
    viewUserName: {
        height: 50,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    item_header: {
        width: 'auto',
        height: 60,
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        color: 'white',
    }

    // headerHome: {
    //     position: 'absolute',
    //     top: 0,
    //     backgroundColor: 'rgb(255, 255, 255, 0.9)',
    //     height: 100
    // },
    // header: {
    //     backgroundColor: '#3b4e91',
    //     height: 100
    // },

    // backHeader: {
    // },
    // icon: {
    // },
    // headerHomeLeft: {
    //     marginHorizontal: 20,
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     gap: 5
    // },
    // avatar: {
    //     height: 50,
    //     width: 50,
    //     borderRadius: 50
    // },
    // userName: {
    //     fontSize: 15,
    //     fontFamily: 'OpenSans_Regular'
    // },
    // rightHeader: {
    //     marginHorizontal: 20,
    // }
});