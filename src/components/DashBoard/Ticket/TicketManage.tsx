import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SubHeaderDashBoard from "../Header/SubHeaderDashBoard2";
import ListTicket from "./ListTicket";
import CreateTicket from "./CreateTicket";
import ScannerTicket from "./ScannerTicket";
import { useEffect } from "react";


const Stack = createNativeStackNavigator();


export default function TicketManage({ navigation, route }: any) {
    const parameter = route.params && route.params ? route.params : undefined;

    useEffect(() => {
        navigation.navigate('listticket', parameter);
    }, [parameter])

    return (
        <Stack.Navigator
            initialRouteName={'listticket'}
            screenOptions={{
                headerShown: true,
                animation: 'slide_from_right',
                header: (props) => (
                    <SubHeaderDashBoard {...props}
                    />
                ),
            }}>
            <Stack.Screen
                name="listticket"
                component={ListTicket}
                options={{
                    gestureEnabled: false,
                    title: 'Ticket'
                }}
            />
            <Stack.Screen
                name="createticket"
                component={CreateTicket}
                options={{
                    gestureEnabled: true,
                    title: 'Create Ticket'
                }}
            />
            <Stack.Screen
                name="scannerticket"
                component={ScannerTicket}
                options={{
                    gestureEnabled: true,
                    title: 'Scan Ticket'
                }}
            />
        </Stack.Navigator>
    )
}