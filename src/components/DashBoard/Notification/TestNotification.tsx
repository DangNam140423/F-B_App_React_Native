import { useState, useEffect, useRef, useCallback } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useFocusEffect } from '@react-navigation/native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: true,
    }),
});

export default function TestNotification() {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(
        undefined
    );
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

        if (Platform.OS === 'android') {
            Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
        }
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
            console.log(notification.request.content.badge);
            Notifications.setBadgeCountAsync(2);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log("click: ", response.notification.request.content.data);
        });

        return () => {
            console.log("Component unmounted");
            notificationListener.current &&
                Notifications.removeNotificationSubscription(notificationListener.current);
            responseListener.current &&
                Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    const dismissNotification = async (notificationId: string) => {
        // console.log(notificationId);
        await Notifications.dismissNotificationAsync(notificationId);
        // Loại bỏ khỏi thanh thông báo hoặc khu vực hiển thị thông báo trên thiết bị
        await Notifications.setBadgeCountAsync(0);
        // Cập nhật lại Badge ở biểu tượng app
    };

    // useFocusEffect(
    //     useCallback(() => {
    //         console.log("Reg")
    //         notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
    //             console.log(notification);
    //             // Handle notification
    //         });

    //         responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    //             console.log("click: ", response.notification.request.content.data);
    //         });

    //         return () => {
    //             // Hủy bỏ listener khi tab không còn được hiển thị
    //             if (notificationListener.current) {
    //                 console.log("Cancle");
    //                 Notifications.removeNotificationSubscription(notificationListener.current);
    //             }
    //             if (responseListener.current) {
    //                 console.log("Cancle");
    //                 Notifications.removeNotificationSubscription(responseListener.current);
    //             }
    //         };
    //     }, [])
    // );

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'space-around',
            }}>
            <Text>Your expo push token: {expoPushToken}</Text>
            <Text>{`Channels: ${JSON.stringify(
                channels.map(c => c.id),
                null,
                2
            )}`}</Text>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text>Title: {notification && notification.request.content.title} </Text>
                <Text>Body: {notification && notification.request.content.body}</Text>
                <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
            </View>
            <Button title="Dismiss Notification" onPress={() => {
                const identifier = notification?.request.identifier;
                if (identifier) {
                    dismissNotification(identifier);
                } else {
                    console.log('No notification identifier available to dismiss.');
                }
            }}
            />
            <Button
                title="Press to schedule a notification"
                onPress={async () => {
                    await schedulePushNotification();
                }}
            />
        </View>
    );
}

async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "You've got mail! 📬",
            body: 'Here is the notification body',
            data: { data: 'goes here', test: { test1: 'more data' } },
        },
        trigger: { seconds: 2 },
    });
}

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        // Learn more about projectId:
        // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
        // EAS projectId is used here.
        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                throw new Error('Project ID not found');
            }
            token = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
            // console.log(token);
        } catch (e) {
            token = `${e}`;
        }
    } else {
        alert('Must use physical device for Push Notifications');
    }

    return token;
}
