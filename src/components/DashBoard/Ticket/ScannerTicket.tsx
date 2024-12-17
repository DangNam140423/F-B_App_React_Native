import axios from 'axios';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import saveToken from '../../../store/token/savetoken';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { setAuth } from '../../../store/slices/appSlice';

export default function ScannerTicket({ navigation }: any) {
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.app.token);
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    const handleBarCodeScanned = ({ type, data }: any) => {
        setScanned(true);
        if (data && Number.isInteger(Number(data))) {
            navigation.navigate('listticket', {
                getTicket: true,
                idTicket: Number(data)
            });
        } else {
            alert("Invalid code");
        }
        // Alert.alert(
        //     "Confirm",
        //     `Do you want to activate ticket code ${data}?`,
        //     [
        //         {
        //             text: "Activate",
        //             onPress: () => {
        //                 axios.put(`http://192.168.1.24:3000/api/update-ticket`,
        //                     {
        //                         dataTicket: { id: data }
        //                     },
        //                     {
        //                         headers: {
        //                             'Content-Type': 'application/json',
        //                             'Authorization': `Bearer ${token}`
        //                         }
        //                     })
        //                     .then(function (response) {
        //                         if (response.data.errCode === 0) {


        //                         }
        //                     })
        //                     .catch(async function (error) {
        //                         console.log(error);
        //                         if (error.response && [401, 403].includes(error.response.status)) {
        //                             await saveToken("token", "");
        //                             dispatch(setAuth(false));
        //                         } else {
        //                             console.log(error);
        //                         }
        //                     });
        //             }
        //         },
        //         {
        //             text: "Cancle",
        //             style: "cancel"
        //         },
        //     ],
        //     { cancelable: true }
        // );
    };

    // Xin quyền truy cập camera
    const requestPermissionCam = async () => {
        const { status } = await requestPermission();
        if (status !== 'granted') {
            alert('Quyền truy cập camera bị từ chối, vào cài đặt để cấp quyền!');
        }
    };

    useEffect(() => {
        requestPermissionCam();
    }, []);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermissionCam} title="grant permission" />
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    return (
        <View style={styles.container}>
            {/* <CameraView style={styles.camera} facing={facing}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                        <Text style={styles.text}>Flip Camera</Text>
                    </TouchableOpacity>
                </View>
            </CameraView> */}
            {scanned
                ?
                <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />
                :
                <CameraView
                    style={styles.camera}
                    facing={facing}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr", 'aztec', 'ean13', 'ean8', 'qr', 'pdf417', 'upc_e', 'datamatrix', 'code39', 'code93', 'itf14', 'codabar', 'code128', 'upc_a'],
                    }}
                >
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                            <Text style={styles.text}>Flip Camera</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
});
