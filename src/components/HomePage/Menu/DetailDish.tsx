import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native"
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function DetailDish({ valueDish }: any) {

    return (
        <View style={styles.viewBoxUser} >
            <View style={{
                flexDirection: 'row',
                gap: 5,
                paddingVertical: 5
            }}>
                <Image
                    style={styles.avatar}
                    source={{
                        uri: valueDish && valueDish.image
                    }}
                />
                <View style={{
                    gap: 5,
                    flex: 1,
                    justifyContent: 'center'
                }}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Text style={{
                            fontSize: 20,
                            fontWeight: '500',
                            flex: 1
                        }}>{valueDish && valueDish.name}</Text>
                        <View style={{
                            padding: 5,
                            backgroundColor: 'grey',
                            width: 70,
                            height: 30,
                            borderRadius: 5
                        }}>
                            <Text style={{ textAlign: 'center', color: 'white' }}>
                                {valueDish && valueDish.categoryData.valueEn}
                            </Text>
                        </View>
                    </View>
                    <View style={{
                        gap: 3,
                        alignItems: 'flex-start',
                        flexDirection: 'row'
                    }}>
                        <Feather name="star" size={15} color={'#219778'} />
                        <Feather name="star" size={15} color={'#219778'} />
                        <Feather name="star" size={15} color={'#219778'} />
                        <Feather name="star" size={15} color={'#219778'} />
                        <Feather name="star" size={15} color={'#219778'} />
                    </View>
                </View>
            </View>
            <Text style={{
                paddingLeft: 20,
                fontSize: 15,
                fontWeight: '400',
                color: 'grey',
                width: '100%'
            }}>{valueDish && valueDish.description}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    viewBoxUser: {
        width: width,
        minHeight: 140,
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 30,
    },
    avatar: {
        height: 150,
        width: 150,
        borderRadius: 150 / 2,
        marginTop: -150 / 2,
        borderWidth: 2,
        borderColor: 'white'
    }
});