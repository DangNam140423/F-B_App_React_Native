import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamListMain = {
    web: { isAuthenticated: boolean } | undefined;
    main: { isAuthenticated: boolean } | undefined;
    auth: { isAuthenticated: boolean } | undefined;
    login: { isAuthenticated: boolean } | undefined;
    signup: { isAuthenticated: boolean } | undefined;
};

export type NavigationPropMain = StackNavigationProp<RootStackParamListMain>;

export type RootBottomParamList = {
    home: { background_App: string } | undefined;
    user: { background_App: string } | undefined;
    menu: { categoryProps?: string } | undefined;  // Add categoryProps
    booking: { background_App: string } | undefined;
};

export type NavigationProp = BottomTabNavigationProp<RootBottomParamList>;

export type RootDrawParamList = {
    dashboard: undefined;
    staff: undefined;
    menu: undefined;
    ticket: undefined;
    schedule: undefined;
    notifications: undefined;
    profile: undefined;
};

export type DrawNavigationProp = DrawNavigationProp<RootDrawParamList>;