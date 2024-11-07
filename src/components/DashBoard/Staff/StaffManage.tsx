import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ListStaff from "./ListStaff";
import InsertStaff from "./CreateStaff";
import SubHeaderDashBoard from "../Header/SubHeaderDashBoard2";
import StaffSchedule from "./StaffSchedule";


const Stack = createNativeStackNavigator();


export default function StaffManage() {
    return (
        <Stack.Navigator
            initialRouteName={'liststaff'}
            screenOptions={{
                headerShown: true,
                animation: 'slide_from_right',
                header: (props) => (
                    <SubHeaderDashBoard {...props}
                    />
                ),
            }}>
            <Stack.Screen
                name="liststaff"
                component={ListStaff}
                options={{
                    gestureEnabled: false,
                    title: 'Staff'
                }}
            />
            <Stack.Screen
                name="createstaff"
                component={InsertStaff}
                options={{
                    gestureEnabled: true,
                    title: 'Create Account'
                }}
            />
            <Stack.Screen
                name="schedulestaff"
                component={StaffSchedule}
                options={{
                    gestureEnabled: false,
                    title: 'Staff'
                }}
            />
        </Stack.Navigator>
    )
}