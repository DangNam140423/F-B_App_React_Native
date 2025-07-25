import { Dimensions, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
import { barcodeToSvg } from '@adrianso/react-native-barcode-builder';
import Svg, { SvgXml } from 'react-native-svg';
import formatCurrency from "../../../store/format/formatPrice";

const { width, height } = Dimensions.get('window');

interface StaffData {
    id: number | null;
    fullName: string | null;
}

interface ScheduleData {
    id: string;
    date: string;
    timeType: string;
}

interface TimeSlot {
    valueVi: string;
    valueEn: string;
}

interface Ticket {
    id: number;
    idSchedule: string;
    numberPeople: number;
    phoneCustomer: string;
    nameCustomer: string;
    emailCustomer: string;
    ticketType: string;
    numberAdult: number;
    numberKid: number;
    numberAdultBest: number;
    numberKidBest: number;
    idStaff: number;
    bill: number;
    dishOrder: string;
    priceOrder: number;
    payStatus: boolean;
    payToken: string | null;
    receiveStatus: boolean;
    createdAt: string;
    updatedAt: string;
    staffData: StaffData;
    scheduleData: ScheduleData;
    timeSlot: TimeSlot;
    tableString: string;
}

interface DetailTicketProps {
    updateStatus: (item: Ticket) => void;
    updatePayStatus: (item: Ticket) => void;
    closeModal: () => void;
    valueTicket: Ticket;
}

export default function DetailTicket({ updateStatus, updatePayStatus, closeModal, valueTicket }: DetailTicketProps) {
    const svgBarCode = barcodeToSvg({
        value: ` ${valueTicket.id}`
    });
    return (
        <View style={styles.centeredView}>
            <View style={styles.modalView}>
                <View style={styles.header}>
                    <Pressable
                        style={[styles.buttonClose]}
                        onPress={closeModal}
                    >
                        <AntDesign name="left" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.textStyle}>{valueTicket.emailCustomer ? 'E-Ticket' : 'T-Ticket'}</Text>
                </View>
                <View style={styles.body}>
                    <View style={styles.viewTicket}>
                        <View style={styles.headerTicket}>
                            <Text style={{
                                fontSize: 22,
                                fontWeight: 'bold'
                            }}>FuFu's Space Restaurant</Text>
                            <View style={styles.rowTicket}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.label}>Date</Text>
                                    <Text>{new Date(valueTicket.scheduleData.date).toLocaleDateString()}</Text>
                                </View>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.label}>Time</Text>
                                    <Text>{valueTicket.timeSlot.valueEn}</Text>
                                </View>
                            </View>
                            <View style={styles.rowTicket}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.label}>Table</Text>
                                    <Text>{valueTicket.tableString}</Text>
                                </View>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.label}>Type</Text>
                                    <Text>{valueTicket.ticketType}</Text>
                                </View>
                            </View>
                            {/* <View style={styles.rowTicket}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.label}>Name</Text>
                                    <Text>{valueTicket.nameCustomer}</Text>
                                </View>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.label}>Phone</Text>
                                    <Text>{valueTicket.phoneCustomer}</Text>
                                </View>
                            </View> */}
                            <View style={styles.rowTicket}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.label}>Place</Text>
                                    <Text>VietNam, DongNai, Bien Hoa, PhanTrung 140</Text>
                                </View>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.label}>Price</Text>
                                    <Text>{formatCurrency(valueTicket.bill)}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.footerTicket}>
                            <Text style={{ fontWeight: 'bold' }}>Code: {valueTicket.id}</Text>
                            <View style={styles.topTicket}></View>
                            <View style={styles.leftTicket}></View>
                            <View style={styles.rightTicket}></View>
                            <SvgXml xml={svgBarCode} width="80%" height="50%" />
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.box}>
                <View style={{ flexDirection: 'row', gap: 0, alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}>
                        <Feather name="user" size={20} color="grey" />
                        <Text style={{ color: 'grey', fontSize: 17 }}>{valueTicket.nameCustomer}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}>
                        {/* <Feather name="phone" size={20} color="grey" /> */}
                        {/* <Text style={{ color: 'grey', fontSize: 17 }}> / {valueTicket.phoneCustomer}</Text> */}
                    </View>
                    <Text style={{
                        fontSize: 17,
                        color: !valueTicket.payToken ? '#1b7f63' : '#b68125'
                    }}> / {!valueTicket.payToken ? 'Active' : 'Inactive'}</Text>
                    <Text style={{
                        fontSize: 17,
                        color: valueTicket.payStatus ? '#1b7f63' : '#7d1616'
                    }}> / {valueTicket.payStatus ? 'Paied' : 'Unpaid'}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {!valueTicket.payStatus && !valueTicket.payToken &&
                        <Pressable
                            onPress={() => updatePayStatus(valueTicket)}
                            style={[styles.typeTicket, {
                                backgroundColor: '#7d1616',
                                flex: 3,
                                flexDirection: 'row',
                                gap: 5
                            }]}>
                            <FontAwesome name="dollar" size={20} color="white" />
                            <Text style={{ color: 'white', fontSize: 20 }}>Pay now</Text>
                        </Pressable>
                    }
                    {valueTicket.payToken &&
                        <Pressable
                            onPress={() => updateStatus(valueTicket)}
                            disabled={!valueTicket.payToken ? true : false}
                            style={[styles.typeTicket, {
                                backgroundColor: '#b68125',
                                flex: 4
                            }]}>
                            <Text style={{ color: 'white', fontSize: 20 }}>Update</Text>
                        </Pressable>
                    }
                    <Pressable
                        onPress={() => Linking.openURL(`tel:${valueTicket.phoneCustomer}`)}
                        style={[styles.typeTicket, {
                            flex: 1,
                        }]}>
                        <Feather name="phone" size={24} color="#1b7f63" />
                    </Pressable>
                </View>
            </View>
        </View >
    )
}


const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        paddingTop: 60,
        paddingHorizontal: 20,
        height: height,
        width: width,
        backgroundColor: '#1b7f63',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    },
    buttonClose: {
        borderRadius: 20,
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20
    },
    body: {
        flex: 1,
        width: '100%',
        alignItems: 'center'
    },
    viewTicket: {
        marginTop: 30,
        borderRadius: 24,
        backgroundColor: 'white',
        height: 500,
        width: 300
    },
    headerTicket: {
        height: '70%',
        width: '100%',
        paddingLeft: 20,
        paddingTop: 20,
        gap: 30
    },
    rowTicket: {
        flexDirection: 'row',
        width: '100%',
        gap: 15
    },
    itemInfo: {
        flex: 1,
        gap: 5,
    },
    label: {
        fontSize: 17,
        fontWeight: 'bold'
    },
    footerTicket: {
        height: '30%',
        width: '100%',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1
    },
    topTicket: {
        position: 'absolute',
        top: 0,
        width: '100%',
        borderColor: 'grey',
        borderWidth: 1.5,
        borderStyle: 'dashed',
    },
    leftTicket: {
        backgroundColor: '#1b7f63',
        height: 70,
        width: 70,
        borderRadius: 35,
        position: 'absolute',
        left: -35,
        top: -35
    },
    rightTicket: {
        backgroundColor: '#1b7f63',
        height: 70,
        width: 70,
        borderRadius: 35,
        position: 'absolute',
        right: -35,
        top: -35
    },
    box: {
        position: 'absolute',
        bottom: 0,
        width: width,
        height: 170,
        backgroundColor: '#181a20',
        // backgroundColor: '#23252c',
        borderTopStartRadius: 20,
        borderTopEndRadius: 20,
        padding: 30,
        gap: 20,
        // justifyContent: 'space-between'
    },
    typeTicket: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12
    },
});