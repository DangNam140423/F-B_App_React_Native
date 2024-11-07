import { Dimensions, FlatList, Image, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get('window');

export default function ImageFuFu() {
    return (
        <View style={{ flex: 1 }}>
            <Text style={{ marginVertical: 20, paddingHorizontal: 5, fontSize: 17, fontWeight: '400', color: 'rgba(0, 0, 0, 0.75)' }}>
                FUFU'S SPACE
            </Text>

            <View style={{ flex: 1, padding: 10 }}>
                <FlatList
                    data={[
                        'https://res.cloudinary.com/dtjdfh2ly/image/upload/v1712482019/space_2_hcfxop.jpg',
                        'https://res.cloudinary.com/dtjdfh2ly/image/upload/v1712477102/space_5_ytpjyk.jpg',
                        'https://res.cloudinary.com/dtjdfh2ly/image/upload/v1712477101/space_6_kzybpz.jpg',
                        'https://res.cloudinary.com/dtjdfh2ly/image/upload/v1712464584/space_4_s8znpz.jpg'
                    ]}
                    horizontal
                    keyExtractor={(item, index) => index.toString()}
                    keyboardShouldPersistTaps="handled"
                    showsHorizontalScrollIndicator={false}
                    style={{
                        width: width
                    }}
                    renderItem={({ item }) => (
                        <Image style={{
                            width: 300,
                            height: '100%',
                            marginRight: 10,
                            borderRadius: 20,
                        }}
                            resizeMode="cover"
                            source={{ uri: item }} />
                    )}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
});
