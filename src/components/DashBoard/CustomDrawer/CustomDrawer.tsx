import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { useDispatch, useSelector } from "react-redux";
import { setAuth, setRoute, setToken } from "../../../store/slices/appSlice";
import AntDesign from '@expo/vector-icons/AntDesign';
import { RootState } from "../../../store/store";
import ImageView from "react-native-image-viewing";
import { useState } from "react";
import avatarDefault from "../../../store/avatar/avatarUser";
import axios from "axios";



async function saveToken(key: string, value: string) {
    await SecureStore.setItemAsync(key, value);
}

export default function CustomDrawer(props: any) {
    const dispatch = useDispatch();
    const pushTokenRedux = useSelector((state: RootState) => state.app.pushToken);
    const infoUser = useSelector((state: RootState) => state.app.inforUser);

    const image = [
        {
            uri: infoUser.image ? infoUser.image : avatarDefault
        }
    ];
    const [visible, setIsVisible] = useState(false);

    const handleLogout = async () => {
        Alert.alert(
            "Confirm Logout",
            "Are you sure you want to log out?",
            [
                {
                    text: "Cancel",
                    // onPress: () => console.log("Logout Cancelled"),
                    style: "cancel"
                },
                {
                    text: "Logout",
                    onPress: async () => {
                        await axios.post(`http://192.168.1.24:3000/api/logout`,
                            {
                                idUser: infoUser.idUser,
                                tokenDevice: pushTokenRedux
                            });
                        await saveToken("token", "");
                        // if (infoUser.roleId === 'R3') {
                        //   await unregisterIndieDevice(infoUser.email, 23684, 'Wuaq0f7zMq3lJxql3cEVrq');
                        // } else if (['R0', 'R1', 'R2'].includes(infoUser.roleId)) {
                        //   await unregisterIndieDevice('R0', 23684, 'Wuaq0f7zMq3lJxql3cEVrq');
                        // }
                        dispatch(setRoute("home"));
                        dispatch(setAuth(false));
                        dispatch(setToken(""));
                    }
                }
            ],
            { cancelable: true } // Có thể hủy bằng cách nhấn ra ngoài Alert
        );
    };

    const openAvatar = () => {
        setIsVisible(true);
    }
    return (
        <View style={{ flex: 1, backgroundColor: '#23252c' }}>
            <DrawerContentScrollView {...props}>
                <View style={{
                    borderBottomWidth: 2,
                    borderColor: 'grey',
                    height: 150,
                    marginBottom: 10,
                    paddingVertical: 10,
                    padding: 10,
                    gap: 15
                }}>
                    <ImageView
                        presentationStyle="fullScreen"
                        images={image}
                        imageIndex={0}
                        visible={visible}
                        onRequestClose={() => setIsVisible(false)}
                        backgroundColor={infoUser.image ? 'black' : 'white'}
                    />
                    <View style={{
                        flexDirection: 'row',
                        gap: 10,
                        alignItems: 'center'
                    }}>
                        <Pressable
                            onPress={openAvatar}
                            style={{
                                height: 70, width: 70,
                                borderRadius: 35,
                                borderColor: '#1b7f63',
                                borderWidth: 2,
                                padding: 3
                            }}>
                            <Image
                                style={{
                                    height: 60, width: 60,
                                    backgroundColor: 'white',
                                    borderRadius: 30
                                }}
                                source={{ uri: infoUser.image ? infoUser.image : avatarDefault }} />
                        </Pressable>
                        <View>
                            <Text style={styles.infoMain}>{infoUser.fullName}</Text>
                            <Text style={styles.infoSupport}>{infoUser.email}</Text>
                        </View>
                    </View>

                    <View style={{
                        backgroundColor: '#1b7f63',
                        paddingHorizontal: 15,
                        padding: 10,
                        borderRadius: 50,
                        // width: 100,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>
                            {infoUser.roleId === 'R0' && 'Boss'}
                            {infoUser.roleId === 'R1' && 'Manager'}
                            {infoUser.roleId === 'R2' && 'Staff'}
                        </Text>
                    </View>
                </View>
                <DrawerItemList {...props} />

            </DrawerContentScrollView>
            <View style={{
                height: 100,
                borderTopWidth: 2,
                borderColor: 'grey',
                padding: 20
            }}>
                <Pressable
                    onPress={handleLogout}
                    style={{
                        flexDirection: 'row',
                        gap: 10,
                        alignItems: 'center'
                    }}>
                    <AntDesign name="logout" size={24} color="#ad2626" />
                    <Text style={{ fontSize: 17, color: '#ad2626' }}>Logout</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    infoMain: {
        color: 'white',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 1
    },
    infoSupport: {
        color: 'grey',
        fontSize: 15,
        fontWeight: '400',
    }
});