import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SubHeaderDashBoard from "../Header/SubHeaderDashBoard2";
import ListMenu from "./ListMenu";
import CreateMenu from "./CreateMenu";
import DetailMenu from "./DetailMenu";


const Stack = createNativeStackNavigator();


export default function MenuManage() {
    return (
        <Stack.Navigator
            initialRouteName={'listmenu'}
            screenOptions={{
                headerShown: true,
                animation: 'slide_from_right',
                header: (props) => (
                    <SubHeaderDashBoard {...props}
                    />
                ),
            }}>
            <Stack.Screen
                name="listmenu"
                component={ListMenu}
                options={{
                    gestureEnabled: false,
                    title: 'Menu'
                }}
            />
            <Stack.Screen
                name="createmenu"
                component={CreateMenu}
                options={{
                    gestureEnabled: true,
                    title: 'Add Dish'
                }}
            />
            <Stack.Screen
                name="detailmenu"
                component={DetailMenu}
                options={{
                    gestureEnabled: true,
                    title: 'Detail Dish'
                }}
            />
        </Stack.Navigator>
    )
}