import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native"
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from "../../../navigation/routes";
import { useDispatch, useSelector } from 'react-redux';
import { setRoute } from '../../../store/slices/appSlice';
import { RootState } from "../../../store/store";


const { width, height } = Dimensions.get('window');

export default function HeaderHome() {
    const dispatch = useDispatch();
    const inforUser = useSelector((state: RootState) => state.app.inforUser)
    const navigation = useNavigation<NavigationProp>();

    const moveProfileScreen = () => {
        dispatch(setRoute('user'));
        navigation.navigate('user');
    }

    return (
        <View style={[styles.headerHome]}>
            <View style={styles.viewUserName}>
                <View>
                    <Text style={styles.userName}>Hi, {inforUser.fullName} !</Text>
                    <Text style={styles.question}>What you want to cook today?</Text>
                </View>
                <Pressable style={styles.borderAvatar} onPress={moveProfileScreen}>
                    <Image
                        style={styles.avatar}
                        source={{ uri: 'https://i.pinimg.com/originals/dd/45/59/dd45590a07fc4273232b682ff445a93e.jpg' }}
                    />
                </Pressable>
            </View>
        </View >
    )
}

const styles = StyleSheet.create({
    headerHome: {
        paddingHorizontal: 10,
        flexDirection: 'row',
        zIndex: 1,
        // borderBottomColor: '#eae9e9',
        // borderBottomWidth: 2,
    },
    viewUserName: {
        height: 80,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userName: {
        fontSize: 30,
        fontWeight: '500',
        letterSpacing: 1.5,
        color: "#1b7f63"
    },
    question: {
        fontSize: 17,
        color: '#a9a8a8'
    },
    borderAvatar: {
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#1b7f63',
        padding: 2
    },
    avatar: {
        height: 50,
        width: 50,
        borderRadius: 50,
    },
});