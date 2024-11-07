import React, { useRef } from 'react';
import { Animated, PanResponder, View, StyleSheet } from 'react-native';

const SwipeExample = () => {
    const animeTest = new Animated.Value(0);

    // Giới hạn giá trị trong phạm vi từ 0 đến 200
    const clampedValue = Animated.diffClamp(animeTest, -50, 100);

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        // onPanResponderMove: (event, gestureState) => {
        //     // Gọi hàm handlePanGesture để thực hiện Animation
        //     // handlePanGesture(event, gestureState);
        // },
        onPanResponderMove: Animated.event(
            [
                null,
                { dx: animeTest }, // Directly map the dx (horizontal drag) to the pan animated value
            ],
            { useNativeDriver: false }
        ),
        // onPanResponderRelease: () => {
        //     // Reset về giá trị 0 khi thả ra
        //     Animated.spring(animeTest, {
        //         toValue: 0,
        //         useNativeDriver: false,
        //     }).start();
        // }
    });

    const handlePanGesture = (event: any, gestureState: any) => {
        // Sử dụng Animated.timing với diffClamp để giới hạn giá trị
        Animated.timing(animeTest, {
            toValue: -event.nativeEvent.translationX, // Giới hạn giá trị pan theo translationX
            duration: 0,
            useNativeDriver: false,
        }).start();
    };

    return (
        <View style={styles.container}>
            <Animated.View
                {...panResponder.panHandlers}
                style={[styles.box, { transform: [{ translateX: clampedValue }] }]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: 350,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
    },
    box: {
        width: 150,
        height: 150,
        backgroundColor: 'skyblue',
        borderRadius: 10,
        transform: [{ translateX: 0 }]
    },
});

export default SwipeExample;
