const axios = require('axios');

const sendLoginOtp = async (mobileNumber, otp) => {

    const apiUrl = "https://www.fast2sms.com/dev/bulkV2";
    const headers = {
        "authorization": "BoDsa7RbguWvyAqMw93KQE0PIUpmJL4F8kCZYX2Ht1Oejfl56cX01uPO4v6JIAESDQdRhMbW5G8Zayqw",
        "Content-Type": "application/json"
    };

    const requestBody = {
        route: "dlt",
        sender_id: "TERMSC",
        message: "180013",
        variables_values: `${otp}`,
        flash: 0,
        numbers: mobileNumber
    };


    try {
        const response = await axios.post(apiUrl, requestBody, { headers });
        return response.data;

    } catch (error) {
        console.error('Error sending OTP via Fast2SMS:', error);
        throw error;
    }
};

module.exports = { sendLoginOtp };










