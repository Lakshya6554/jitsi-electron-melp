export default class UserActivityManager {

    constructor() {
        if (!UserActivityManager.instance) {
            // Initialize properties
            this.lastInteractionTime = Date.now();
            this.inactivityThresholdInSeconds = 300; // Default threshold: 5 minutes

            // Throttle settings
            this.throttleTimeout = null;
            
            // Event listeners for user interactions
            this.setupEventListeners();

            // Queue to store callbacks and their associated times
            this.callbackQueue = [];
            
            // Singleton instance
            UserActivityManager.instance = this;
        }

        return UserActivityManager.instance;
    }

    // Event listeners for user interactions
    setupEventListeners() {
        window.addEventListener('mousemove', this.handleUserActivity.bind(this));
        window.addEventListener('keydown', this.handleUserActivity.bind(this));
        window.addEventListener('click', this.handleUserActivity.bind(this));
        // Add more events as needed (e.g., 'scroll', 'touchstart', etc.)
    }

    // Method to receive callbacks with time and store them in the callback queue
    registerCallbackWithTime(callback, inactiveTimeInSeconds) {
        //console.log(`registerCallbackWithTime callbackQueue=${JSON.stringify(this.callbackQueue)}  ## ${callback}`);
        // Check if the callback already exists in the queue
        const existingCallbackIndex = this.callbackQueue.findIndex(entry => entry.callback === callback);

        if (existingCallbackIndex !== -1) {
            // Update the associated inactive time for the existing callback
            this.callbackQueue[existingCallbackIndex].inactiveTimeInSeconds = inactiveTimeInSeconds;
        } else {
            // Add the callback and its associated time to the queue
            this.callbackQueue.push({ callback, inactiveTimeInSeconds });
        }
    }

    handleUserActivity(methodName = 'userActivity') {
        //console.log(`handleUserActivity methodName=${methodName}`)
        
        // Clear existing timeout to debounce the function call
        clearTimeout(this.throttleTimeout);
        // Set a new timeout to limit the function call rate
        this.throttleTimeout = setTimeout(() => {
            const currentTime = Date.now();
            const elapsedTimeInSeconds = Math.floor((currentTime - this.lastInteractionTime) / 300); 

            //console.log(`handleUserActivity callbackQueue=${JSON.stringify(this.callbackQueue)}  ## elapsedTimeInSeconds=${elapsedTimeInSeconds} ## ${currentTime} ## ${this.lastInteractionTime}`);
            // Check the elapsed time and call callbacks with times less than the current inactive time
            this.callbackQueue.forEach(({ callback, inactiveTimeInSeconds }) => {
                if (elapsedTimeInSeconds > inactiveTimeInSeconds) {
                    // Add your callback logic here or call a separate method
                    console.log(`Calling callback for inactive time ${inactiveTimeInSeconds} seconds.`);
                    callback();
                }
            });

            // Update the last interaction time
            this.updateLastInteractionTime();
        }, 100);
    }

    updateLastInteractionTime() {
        this.lastInteractionTime = Date.now();
    }

    getInactivityTimeInSeconds() {
        const elapsedTimeInSeconds = Math.floor((Date.now() - this.lastInteractionTime) / 1000);
        return elapsedTimeInSeconds;
    }

    // Set a custom inactivity threshold
    setInactivityThresholdInSeconds(thresholdInSeconds) {
        this.inactivityThresholdInSeconds = thresholdInSeconds;
    }

    // Method to track and record user's last activity
    recordUserActivity() {
        // Add your logic here to record the user's last activity on the client side
        console.log("User activity recorded at:", new Date(this.lastInteractionTime));
    }
}

// Example usage:
