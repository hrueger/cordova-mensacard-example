document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    console.log("Cordova is ready");
    updateStatus("Tap your Mensa card");
}

function updateStatus(message) {
    document.getElementById("status").innerText = message;
}

function updateBalance(balance, lastTransaction) {
    document.getElementById("balance").innerText = balance.toFixed(2);
    document.getElementById("lastTransaction").innerText = `-${lastTransaction.toFixed(2)}`;
}

function byteArrayToInt(bytes) {
    let value = 0;
    for (let i = 0; i < bytes.length; i++) {
        value += bytes[i] << (8 * (bytes.length - 1 - i));
    }
    return value;
}

async function startScan() {
    updateStatus("Scanning...");
    cordova.plugins.permissions.requestPermission(cordova.plugins.permissions.NFC, console.log, console.log);

    nfc.addTagDiscoveredListener(handleDesfire);
    const DESFIRE_SELECT_PICC = "00 A4 04 00 07 D2 76 00 00 85 01 00";
    const DESFIRE_SELECT_AID = "90 5A 00 00 03 AA AA AA 00";

    // nfc.addTagDiscoveredListener(console.log, console.log, console.log);

    // nfc.readerMode(0, console.log, console.log);

    async function handleDesfire(nfcEvent) {
        const tagId = nfc.bytesToHexString(nfcEvent.tag.id);
        console.log("Processing", tagId);

        try {
            await nfc.connect("android.nfc.tech.IsoDep", 500);
            console.log("connected to", tagId);

            let response = await nfc.transceive(DESFIRE_SELECT_PICC);
            ensureResponseIs("9000", response);

            response = await nfc.transceive(DESFIRE_SELECT_AID);
            ensureResponseIs("9100", response);
            // 91a0 means the requested application not found

            alert("Selected application AA AA AA");

            // more transcieve commands go here
        } catch (error) {
            alert(error);
        } finally {
            await nfc.close();
            console.log("closed");
        }
    }

    function ensureResponseIs(expectedResponse, buffer) {
        const responseString = util.arrayBufferToHexString(buffer);
        if (expectedResponse !== responseString) {
            const error = "Expecting " + expectedResponse + " but received " + responseString;
            throw error;
        }
    }
}

function transceive(command) {
    return new Promise((resolve, reject) => {
        nfc.transceive(command, resolve, reject);
    });
}
