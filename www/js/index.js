document.addEventListener(
    "deviceready",
    () => {
        nfc.addTagDiscoveredListener(handleDesfire);
        send("Ready to scan Mensa card...");
    },
    false
);

async function handleDesfire(nfcEvent) {
    const tagId = nfc.bytesToHexString(nfcEvent.tag.id);
    send("Card detected: " + tagId);

    try {
        await nfc.connect("android.nfc.tech.IsoDep", 500);
        console.log("Connected to tag:", tagId);

        // Select Mensa app (AID: 0x5F8415)
        const AID = [0x5f, 0x84, 0x15];
        await nfc.transceive(new Uint8Array([0x90, 0x5a, 0x00, 0x00, 0x03, ...AID, 0x00]).buffer);
        console.log("Application selected");

        // Read transaction file and balance
        const transactionBuffer = await nfc.transceive(new Uint8Array([0x90, 0xf5, 0x00, 0x00, 0x01, 0x01, 0x00]).buffer);
        const balanceBuffer = await nfc.transceive(new Uint8Array([0x90, 0x6c, 0x00, 0x00, 0x01, 0x01, 0x00]).buffer);

        // Parse values using DataView (little-endian)
        const lastTransaction = readUInt32(transactionBuffer, 12) / 1000;
        const balance = readUInt32(balanceBuffer, 0) / 1000;

        send("Data read successfully", balance, lastTransaction);
    } catch (err) {
        console.error("Error: ", err);
        send("Error: " + err);
    } finally {
        await nfc.close();
        console.log("Connection closed");
    }
}

// Reads 4 bytes as little-endian unsigned int from an ArrayBuffer
function readUInt32(buffer, offset) {
    const view = new DataView(buffer);
    return view.getUint32(offset, true); // true = little-endian
}

function send(status, balance, lastTransaction) {
    document.getElementById("mainIframe").contentWindow.postMessage(
        {
            type: "nfcMensaCard",
            status: status,
            balance: balance,
            lastTransaction: lastTransaction,
        },
        "*"
    );
}
