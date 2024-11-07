import { LinearGradient } from "expo-linear-gradient";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "react-native-reanimated/lib/typescript/Animated";

export default function AuthScreen({ navigation }: any) {
    const background_App = 'https://i.pinimg.com/originals/ef/2c/59/ef2c59764c7f3f59e53e0ba0129c7f87.jpg';

    const moveLoginScreen = () => {
        navigation.navigate('login');
    }

    const moveRegisterScreen = () => {
        navigation.navigate('signup');
    }

    const moveMainScreen = () => {
        navigation.navigate('main');
    }

    return (
        <ImageBackground resizeMode='cover' source={{ uri: background_App }} style={{ flex: 1 }}>
            <LinearGradient
                colors={['transparent', 'black',]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.8 }}
                style={styles.inner}
            >
                <View style={{
                    height: 500,
                    width: '100%',
                    gap: 15,
                }}>
                    <Text style={{ color: 'white', fontSize: 50, fontWeight: 'bold', width: '90%' }}>
                        Cooking a Delicious Food Eaily
                    </Text>
                    <Text style={{ color: '#9f9f9f', fontSize: 20, fontWeight: '300', width: '70%' }}>
                        Discover more than 1200 food recipes in your hands and cooking it easily!
                    </Text>
                    <Pressable onPress={moveLoginScreen} style={{
                        marginTop: 25
                    }}>
                        <LinearGradient
                            colors={['#1b7f63', '#29d297',]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                width: '100%',
                                height: 70,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 30
                            }}
                        >
                            <Text style={{
                                color: 'white',
                                fontWeight: '500',
                                fontSize: 20
                            }}>Login</Text>
                        </LinearGradient>
                    </Pressable>
                    <Pressable
                        onPress={moveRegisterScreen}
                        style={{
                            width: '100%',
                            height: 70,
                            backgroundColor: 'black',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 30,
                            borderWidth: 1.5,
                            borderColor: '#1b7f63'
                        }}>
                        <Text style={{
                            color: 'white',
                            fontWeight: '500',
                            fontSize: 20
                        }}>Sign Up</Text>
                    </Pressable>
                </View>
            </LinearGradient>
        </ImageBackground>
    )
}


const styles = StyleSheet.create({
    inner: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 10
    },
})