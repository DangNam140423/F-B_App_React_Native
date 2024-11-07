import { HeaderBackButton } from '@react-navigation/elements';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { DrawerToggleButton } from '@react-navigation/drawer';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SubHeaderDashBoard(props: any) {
    const { navigation } = props;
    const arrRouteMain = ['liststaff', 'listticket', 'listmenu'];
    const arrRouteSub = ['createstaff', 'schedulestaff', 'createticket', 'createmenu', 'detailmenu', 'scannerticket'];
    return (
        <View style={[styles.headerBackground, {
            borderBottomWidth: props.route.name === 'liststaff' ? 0 : 0,
        }]}>
            <View style={styles.viewHeader}>
                <View style={[styles.item_header, {
                    zIndex: 1,
                    padding: arrRouteSub.includes(props.route.name) ? 0 : 20
                }]}>
                    {arrRouteSub.includes(props.route.name) &&
                        <HeaderBackButton
                            tintColor='white'
                            onPress={() => { props.navigation.goBack() }}
                            labelVisible={false}
                            style={{ paddingLeft: Platform.OS === 'ios' ? 10 : 0 }}
                        />
                    }
                    <Text style={[styles.title]}>
                        {props.options.title}
                    </Text>
                </View>
                {/* <View style={[styles.item_header, {
                    position: 'absolute',
                    width: '100%'
                }]}>
                    <Text style={[styles.title]}>
                        {props.options.title}
                    </Text>
                </View> */}
                <View style={styles.item_header}>
                    {arrRouteMain.includes(props.route.name) &&
                        <DrawerToggleButton tintColor='white' />
                    }
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
        borderColor: 'white',
        backgroundColor: '#181a20'
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
        flexDirection: 'row'
    },
    title: {
        color: 'white',
        fontWeight: '500',
        fontSize: 24,
        height: 30,
    }
});