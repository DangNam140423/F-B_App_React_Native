import { HeaderBackButton } from '@react-navigation/elements';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerToggleButton } from '@react-navigation/drawer';

export default function HeaderDashBoard(props: any) {
    const { navigation } = props;

    return (
        <View style={styles.headerBackground}>
            <View style={styles.viewHeader}>
                {/* <View style={[styles.item_header, { zIndex: 1 }]}>
                </View> */}
                <View style={[styles.item_header, {
                    paddingHorizontal: 20
                }]}>
                    <Text style={[styles.title]}>
                        {props.route.name.charAt(0).toUpperCase() + props.route.name.slice(1)}
                    </Text>
                </View>
                <View style={styles.item_header}>
                    <DrawerToggleButton tintColor='white' />

                    {/* <Pressable
                        onPress={() => { navigation.navigate('notifications') }}>
                        <Ionicons name="notifications" size={24} color="white" style={{ paddingRight: 10 }} />
                    </Pressable> */}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerBackground: {
        height: 100,
        justifyContent: 'flex-end',
        borderBottomWidth: 0,
        borderColor: 'white'
    },
    viewHeader: {
        height: 50,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    item_header: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: 'white',
        fontWeight: '500',
        fontSize: 24,
        height: 30
    }
});