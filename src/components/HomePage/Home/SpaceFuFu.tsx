import React, { memo } from "react";
import { Dimensions, FlatList, Image, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get('window');

const SpaceFuFu = memo(() => {
    return (
        <View style={{ flex: 1 }}>
            <Text style={{
                marginVertical: 20,
                paddingHorizontal: 5,
                fontSize: 20,
                fontWeight: '500',
                color: 'white'
            }}>
                Fufu's Space
            </Text>

            <View style={{ flex: 1 }}>
                <FlatList
                    data={[
                        'https://res.cloudinary.com/dtjdfh2ly/image/upload/v1728015872/423717501_7476779825667943_5057650677074659778_n_vdgxvb.jpg',
                        'https://res.cloudinary.com/dtjdfh2ly/image/upload/v1728015902/449831476_122158236560172904_7867850852835768691_n_vfhnep.jpg',
                        'https://res.cloudinary.com/dtjdfh2ly/image/upload/v1728015826/424553611_7476780709001188_4930352344868831142_n_vnkobc.jpg',
                        'https://res.cloudinary.com/dtjdfh2ly/image/upload/v1728015904/438240060_122140527320172904_3091797972076083456_n_gvdsom.jpg'
                    ]}
                    horizontal
                    keyExtractor={(item, index) => index.toString()}
                    keyboardShouldPersistTaps="handled"
                    showsHorizontalScrollIndicator={false}
                    style={{
                        width: '100%',
                    }}
                    renderItem={({ item }) => (
                        <Image style={{
                            width: 300,
                            height: '100%',
                            marginRight: 20,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: 'white'
                        }}
                            resizeMode="cover"
                            source={{ uri: item }} />
                    )}
                />
            </View>
        </View>
    )
});

export default SpaceFuFu;
