import React, { useEffect, useRef, useState } from 'react';
import { View, ImageBackground, Text, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import HomeScreen from './src/components/HomePage/Home/HomeScreen';
import UserScreen from './src/components/HomePage/User/UserScreen';
import CustomTabBar from './src/components/HomePage/CustomTabBar/CustomTabBar';
import MyHeader from './src/components/HomePage/CustomTabBar/CustomHeader';
import BookingScreen from './src/components/HomePage/Booking/BookingScreen';
import MenuScreen from './src/components/HomePage/Menu/MenuScreen';
import { RootBottomParamList, RootDrawParamList, RootStackParamListMain } from './src/navigation/routes';
import { Provider, useDispatch } from 'react-redux';
import store, { RootState } from './src/store/store';
import { useSelector } from 'react-redux';
import AuthScreen from './src/components/Auth/AuthScreen';
import LoginScreen from './src/components/Auth/LoginScreen';
import SignUpScreen from './src/components/Auth/SignUpScreen';
import * as SecureStore from 'expo-secure-store';
import { setArrTicket, setAuth, setInfoUser, setPushToken, setRoute, setToken } from './src/store/slices/appSlice';
import registerNNPushToken from 'native-notify';
import { registerIndieID, unregisterIndieDevice, getNotificationInbox, registerFollowMasterID, registerFollowerID, postFollowingID, unfollowMasterID, updateFollowersList, getFollowMaster, deleteFollowMaster } from 'native-notify';
import { REACT_APP_JWT_SECRET, REACT_APP_BACKEND_URL } from '@env';
import JWT from 'expo-jwt';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import DashBoard from './src/components/DashBoard/DashBoard';
import Staff from './src/components/DashBoard/Staff/ListStaff';
import CustomDrawer from './src/components/DashBoard/CustomDrawer/CustomDrawer';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import HeaderDashBoard from './src/components/DashBoard/Header/HeaderDashBoard';
import SVG_FuFu from './src/store/logo/logo_fufu_svg';
import StaffManage from './src/components/DashBoard/Staff/StaffManage';
import ScheduleManage from './src/components/DashBoard/Schedule/ScheduleManage';
import TicketManage from './src/components/DashBoard/Ticket/TicketManage';
import axios from 'axios';
import saveToken from './src/store/token/savetoken';
import MenuManage from './src/components/DashBoard/Menu/MenuManage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import ListNotification from './src/components/DashBoard/Notification/ListNotification';
import Profile from './src/components/DashBoard/Profile/Profile';

// SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator<RootBottomParamList>();
const Stack = createNativeStackNavigator<RootStackParamListMain>();
const Drawer = createDrawerNavigator<RootDrawParamList>();

const background_App = 'https://res.cloudinary.com/dtjdfh2ly/image/upload/v1727926754/space_7_seceom.jpg';
const themeUI = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'rgba(0, 0, 0, 0.8)',
  },
};

const themeDashBoard = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#181a20',
  },
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

const navigationRef = createNavigationContainerRef<RootDrawParamList>();


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
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }
  return token;
}

const MainApp = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const roterReux = useSelector((state: RootState) => state.app.route);

  // useEffect(() => {
  //   //   //   const getaa = async () => {
  //   //   //     let notifications = await getNotificationInbox(23684, 'Wuaq0f7zMq3lJxql3cEVrq');
  //   //   //     console.log("unreadCount: ", notifications);
  //   //   //   }
  //   //   //   getaa();
  //   //   Notifications.addNotificationReceivedListener(notification => {
  //   //     // console.log(notification.request.content.data);
  //   //     // navigation.navigate('user');
  //   //     // dispatch(setRoute('user'));
  //   //   });

  //   //   Notifications.addNotificationResponseReceivedListener(notification => {
  //   //     navigation.navigate('user');
  //   //     dispatch(setRoute('user'));
  //   const subscription = Notifications.addNotificationResponseReceivedListener(notification => {
  //     console.log("OKKk", notification.notification.request.content.data);
  //     // Xử lý thông báo ở đây
  //   });

  //   return () => subscription.remove();
  // });

  return (
    <ImageBackground resizeMode='cover' source={{ uri: background_App }} style={{ flex: 1 }}>
      {/* <StatusBar style={roterReux === 'user' ? 'light' : 'dark'} /> */}
      <Tab.Navigator
        initialRouteName={'home'}
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          header: (props) => (
            <MyHeader {...props} />
          ),
        }}
      >
        <Tab.Screen
          name="home"
          component={HomeScreen}
          options={{
            headerShown: false,
            title: 'Home'
          }}
        />
        <Tab.Screen
          name="booking"
          component={BookingScreen}
          options={{
            headerShown: false,
            title: 'Booking'
          }}
        />
        <Tab.Screen
          name="menu"
          component={MenuScreen}
          options={{ title: 'Menu' }}
        />
        <Tab.Screen
          name="user"
          component={UserScreen}
          options={{ title: 'User' }}
        />
      </Tab.Navigator>
    </ImageBackground>
  );
};

const DashBoardApp = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const inforUser = useSelector((state: RootState) => state.app.inforUser);
  const token = useSelector((state: RootState) => state.app.token);
  const [numberTicketNew, setNumberTicketNew] = useState<number>(0);
  const arrTicketRedux = useSelector((state: RootState) => state.app.arrTicket);
  const [numberNotification, setNumberNotification] = useState<number>(0);
  const arrNotificationRedux = useSelector((state: RootState) => state.app.arrNotification);

  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);


  const getNumberTicketNew = (arrTicket: any) => {
    let result = 0;
    arrTicket.filter((item: any) => {
      if (item.payToken !== null) {
        result++;
      }
    });

    return result;
  }

  const getNumberNotification = (arrNotification: any) => {
    let result = 0;
    arrNotification.filter((item: any) => {
      if (!item.isRead) {
        result++;
      }
    });

    return result;
  }

  const getTicket = async () => {
    await axios.post(`http://192.168.1.24:3000/api/get-all-ticket`,
      {
        date: null
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(function (response) {
        if (response.data.errCode === 0) {
          setNumberTicketNew(getNumberTicketNew(response.data.dataTicket));
          // dispatch(setArrTicket(response.data.dataTicket));
        }
      })
      .catch(async function (error) {
        console.log(error);
        if (error.response && [401, 403].includes(error.response.status)) {
          await saveToken("token", "");
          dispatch(setAuth(false));
        } else {
          console.log(error);
        }
      })
      .finally(function () {
      });
  }

  const getAllNotification = async () => {
    await axios.post(`http://192.168.1.24:3000/api/get-notification`,
      {
        userId: inforUser.idUser
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(function (response) {
        if (response.data.errCode === 0) {
          setNumberNotification(getNumberNotification(response.data.arrNotifi));
        } else {
          alert(response.data.errMessage);
        }
      })
      .catch(async function (error) {
        if (error.response && [401, 403].includes(error.response.status)) {
          await saveToken("token", "");
          dispatch(setAuth(false));
        } else {
          console.log(error);
        }
      })
      .finally(function () {
      });
  }

  useEffect(() => {
    getTicket();
  }, [arrTicketRedux]);

  useEffect(() => {
    getAllNotification();
  }, [arrNotificationRedux]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      getTicket();
      getAllNotification();
      // console.log(notification.request.content.badge);
      // Notifications.setBadgeCountAsync(0);

    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // console.log("clickkk: ", response.notification.request.content?.data.bill);
      // if (navigationRef.isReady()) {
      //   navigationRef.navigate('notifications');
      // } else {
      //   console.log("No");
      // }
      // navigation.navigate('notifications', {
      //   isReload: true
      // });
      navigation.navigate('main', {
        screen: 'notifications',
        params: { isReload: true },
      });
    });
  }, []);

  return (
    <>
      {/* <StatusBar style={1 ? 'light' : 'dark'} /> */}
      <Drawer.Navigator
        initialRouteName='dashboard'
        drawerContent={props => <CustomDrawer {...props} />}
        screenOptions={{
          headerShown: true,
          drawerActiveBackgroundColor: '#d8fff4',
          drawerActiveTintColor: '#1b7f63',
          drawerInactiveTintColor: 'white',
          drawerLabelStyle: { marginLeft: -20 },
          swipeEnabled: true,
          header: (props) => (
            <HeaderDashBoard {...props} />
          ),
        }}
      >
        <Drawer.Screen name='dashboard'
          component={DashBoard}
          options={{
            title: 'DashBoard',
            drawerIcon: (
              ({ color }) => (
                <MaterialIcons name="dashboard" size={24} color={color} />
              )
            )
          }} />
        {
          ['R1', 'R0'].includes(inforUser.roleId) &&
          <Drawer.Screen name='staff' component={StaffManage}
            options={{
              headerShown: false,
              title: 'Staff',
              drawerIcon: (
                ({ color }) => (
                  <MaterialIcons name="people-alt" size={24} color={color} />
                )
              )
            }} />
        }
        <Drawer.Screen name='schedule' component={ScheduleManage}
          options={{
            title: 'Schedule',
            drawerIcon: (
              ({ color }) => (
                <MaterialIcons name="calendar-today" size={24} color={color} />
              )
            )
          }} />
        <Drawer.Screen name='ticket' component={TicketManage}
          options={{
            headerShown: false,
            title: 'Ticket',
            drawerIcon: (
              ({ color }) => (
                <>
                  <FontAwesome name="ticket" size={24} color={color} />
                  <View style={{
                    height: 20,
                    width: 20,
                    backgroundColor: numberTicketNew > 0 ? 'red' : 'transparent',
                    borderRadius: 10,
                    position: 'absolute',
                    right: 10,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Text style={{ color: 'white' }}>
                      {numberTicketNew > 0 && numberTicketNew}
                    </Text>
                  </View>
                </>
              )
            )
          }} />
        {
          ['R1', 'R0'].includes(inforUser.roleId) &&
          <Drawer.Screen name='menu' component={MenuManage}
            options={{
              headerShown: false,
              title: 'Menu',
              drawerIcon: (
                ({ color }) => (
                  <MaterialIcons name="fastfood" size={24} color={color} />
                )
              )
            }} />
        }
        <Drawer.Screen name='notifications' component={ListNotification}
          options={{
            title: 'Notifications',
            drawerIcon: (
              ({ color }) => (
                <>
                  <MaterialIcons name="notifications-active" size={24} color={color} />
                  <View style={{
                    height: 20,
                    width: 20,
                    backgroundColor: numberNotification > 0 ? 'red' : 'transparent',
                    borderRadius: 10,
                    position: 'absolute',
                    right: 10,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Text style={{ color: 'white' }}>
                      {numberNotification > 0 && numberNotification}
                    </Text>
                  </View>
                </>
              )
            )
          }} />
        <Drawer.Screen name='profile' component={Profile}
          options={{
            title: 'Profile',
            drawerIcon: (
              ({ color }) => (
                <View style={{ backgroundColor: color, borderRadius: 20, padding: 5 }}>
                  <SVG_FuFu color={color === 'white' ? 'black' : 'white'} />
                </View>
              )
            )
          }} />
      </Drawer.Navigator>
    </>
  );
}

const Router = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.app.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);
  const inforUser = useSelector((state: RootState) => state.app.inforUser);

  // unregisterIndieDevice('10', 23684, 'Wuaq0f7zMq3lJxql3cEVrq');
  // useEffect(() => {
  //   const getNotification = async () => {
  //     console.log("notifications: ");
  //     let notifications = await getNotificationInbox(23684, 'Wuaq0f7zMq3lJxql3cEVrq');
  //     console.log("notifications: ", notifications);
  //   }
  //   getNotification();
  // }, []);


  const verifyToken = (token: string) => {
    let key = REACT_APP_JWT_SECRET;
    let decoded = null;
    try {
      decoded = JWT.decode(token, key);
      // const currentTime = Math.floor(Date.now() / 1000);
      // if (decoded.iat && Math.abs(currentTime - decoded.iat) > 5) {
      //   console.warn("Token iat không hợp lệ do chênh lệch thời gian");
      // }

      dispatch(setInfoUser({
        idUser: decoded.id,
        fullName: decoded.fullName,
        phoneNumber: decoded.phone,
        email: decoded.email,
        roleId: decoded.roleId,
        image: decoded.image
      }))
    } catch (error: any) {
      console.log(error);
    }

    return decoded;
  }

  useEffect(() => {
    async function checkToken() {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
          dispatch(setAuth(true));
          dispatch(setToken(token));
          verifyToken(token);
          dispatch(setRoute("home"));
        } else {
          dispatch(setAuth(false));
          dispatch(setToken(""));
          dispatch(setRoute("home"));
        }
      } catch (error) {
        console.error('Error checking token:', error);
        dispatch(setAuth(false));
        dispatch(setToken(""));
      } finally {
        setIsLoading(false);
      }
    }

    checkToken();
  }, [isAuthenticated])

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && dispatch(setPushToken(token)));
  }, []);

  if (isLoading) {
    return <Text>Loading</Text>;
  }

  return (
    <NavigationContainer theme={inforUser.roleId === 'R3' ? themeUI : themeDashBoard}>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'main' : 'auth'}
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom'
        }}
      >
        {
          isAuthenticated && inforUser.roleId === 'R3'
          &&
          <Stack.Screen
            name="main"
            component={MainApp}
            options={{ gestureEnabled: false }}
          />
        }
        {
          isAuthenticated && ['R1', 'R0', 'R2'].includes(inforUser.roleId)
          &&
          <Stack.Screen
            name="main"
            component={DashBoardApp}
            options={{ gestureEnabled: false }}
          />
        }
        <Stack.Screen
          name="auth"
          component={AuthScreen}
        />
        <Stack.Screen
          name="login"
          component={LoginScreen}
        />
        <Stack.Screen
          name="signup"
          component={SignUpScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const App = () => {
  // const [loaded, error] = useFonts({
  //   'OpenSans_Regular': require('./assets/fonts/OpenSans-Regular.ttf'),
  // });

  // useEffect(() => {
  //   if (loaded || error) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [loaded, error]);

  // if (!loaded && !error) {
  //   return null;
  // }

  return (
    <Provider store={store}>
      <Router />
    </Provider>
  )
};

export default App;
