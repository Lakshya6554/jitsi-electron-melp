export default class PingManager {
    constructor() {
        if (!PingManager.instance) {
            this.consecutiveDisconnectAttempts = 0;
            this.maxConsecutiveDisconnectAttempts = 2;
            this.intervalId = null;
            this.isActive = false;

            this.sendPacketAndHandleResponse = this.sendPacketAndHandleResponse.bind(this);
            this.forceSendPing = this.forceSendPing.bind(this); 
            //this.handleNextPacket = this.handleNextPacket.bind(this);

            PingManager.instance = this;
        }
        return PingManager.instance;
    }

    sendPacketAndHandleResponse(packet, timeout, callback) {
        // const responseTimeout = setTimeout(() => {
        //     this.handleTimeout();
        // }, timeout);

        this.handleTimeout = () => {
            console.log('Response timeout. Disconnecting...');
            this.incrementAndCheckDisconnectAttempts();
        };

        this.incrementAndCheckDisconnectAttempts = () => {
            this.consecutiveDisconnectAttempts += 1;
            if (this.consecutiveDisconnectAttempts >= this.maxConsecutiveDisconnectAttempts) {
                console.log('Exceeded consecutive disconnect attempts. Shutting down ping mechanism.');
                destroyCandy();
                this.stop();
            }
            else reconnectCandy();
        };

        // const clearResponseTimeout = () => {
        //    // clearTimeout(responseTimeout);
        // };

        Candy.Core.getConnection().sendIQ(packet, (response) => {
           // clearResponseTimeout();
            this.processResponse(response, callback);
        }, (errorInfo)=>{
            //destroyCandy();
            this.handleTimeout();
            console.log("pingmanager_controller => error or timeout errorInfo= "+errorInfo);
        }, timeout);
    }

    sendPingPacket(methodName) {
        console.log(`sendPingPacket methodName=${methodName}`)
        const pingIq = $iq({ type: 'get', xmlns: 'jabber:client' }).c('ping', { xmlns: 'urn:xmpp:ping' });
        this.sendPacketAndHandleResponse(pingIq, 600, this.handleNextPacket);
    }

    processResponse(response, callback) {
        console.log('Received response:', response);
        const responseType = response.getAttribute('type');

        if (responseType !== 'result') {
            console.log('Disconnecting due to unexpected response type:', responseType);
            Candy.Core.disconnect();
            this.incrementAndCheckDisconnectAttempts();
        } else {
            this.consecutiveDisconnectAttempts = 0;
            callback();
        }
    }

    handleNextPacket() {
        // Continue with additional packets or logic as needed
        console.log('Waiting for the next interval...');

        // if ping mech is not active this will restart , otherwise ok
        this.start();
    }

    forceSendPing() {
        // Forcefully send a ping at any time
        //console.log("force send ping trigger");
        this.sendPingPacket('forceSendPing');
    }

    start() {
        //console.log("active",this.isActive);
        if (!this.isActive) {       
            console.log("PMan start");
            // Set up an interval to send packets every 10 seconds
            this.intervalId = setInterval(() => this.sendPingPacket('50Seconds interval'), 50000);
            this.isActive = true;
        }
    }

    stop() {
        if (this.isActive) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.isActive = false;
        }
    }
}

// Usage
// const pingManagerInstance = new PingManager();
// pingManagerInstance.start(); // Start the ping mechanism

// // Forcefully send a ping at any time
// pingManagerInstance.forceSendPing();

// // Later, when you want to stop the ping mechanism
// pingManagerInstance.stop();
