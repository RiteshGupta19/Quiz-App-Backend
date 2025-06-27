const Auth = require('../Model/authSchema');
const Student = require('../../Model/studentSchema');
const generateOtp = require('../utils/generateOtp');
const { sendLoginOtp } = require('../services/sendLoginOtp');
const jwt = require('jsonwebtoken');

const sendOtp = async (req, res) => {
    const { mobileNo } = req.body;

    console.log('req.body', req.body)


    try {
        // Validate mobile number format (assuming 10 digit Indian number)
        if (!mobileNo || mobileNo.length !== 10) {
            return res.status(400).json({ message: 'Invalid mobile number' });
        }

        const student = await Student.findOne({ mobileNo });

        if (!student) {
            return res.status(404).json({
                message: 'Entered mobile number is not associated with any student',
            });
        }

        if (!student.isEnrolled) {
            return res.status(403).json({
                error: {
                    title: 'Access Denied',
                    message: 'Student is not enrolled. OTP cannot be sent.',
                },
            });
        }


        // Check if an OTP already exists for this mobile number
        let existingOtp = await Auth.findOne({ mobileNo });

        if (existingOtp) {
            const currentTime = new Date();
            const expirationTime = new Date(existingOtp.otpExpiration);

            if (expirationTime > currentTime) {
                return res.status(400).json({
                    message: 'OTP already sent to your mobile number. Please wait 2 min before requesting a new OTP.',
                });
            }
        }


        // Generate new unique OTP
        const otp = await generateOtp();
        const otpExpiration = new Date(Date.now() + 120 * 1000); // 2 minutes from now

        if (existingOtp) {
            existingOtp.otp = otp;
            existingOtp.otpExpiration = otpExpiration;
            await existingOtp.save();
            console.log('Updated OTP is', otp);
        } else {

            console.log('new entry')

            await Auth.create({ mobileNo, otp, otpExpiration });
            console.log('Created new OTP is', otp);
        }

        // Send OTP via SMS service
        // await sendLoginOtp(mobileNo, otp);

        return res.status(200).json({
            message: 'OTP sent successfully',
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
};



const verifyOtp = async (req, res) => {
  const { mobileNo, otp } = req.body;

  try {
    if (!mobileNo || mobileNo.length !== 10) {
      return res.status(400).json({
        error: {
          title: "Invalid Input",
          message: "Invalid mobile number"
        }
      });
    }

    if (!otp || otp.length !== 6) {
      return res.status(400).json({
        error: {
          title: "Invalid Input",
          message: "Invalid OTP format"
        }
      });
    }

    const authRecord = await Auth.findOne({ mobileNo });

    if (!authRecord) {
      return res.status(400).json({
        error: {
          title: "OTP Failed",
          message: "No OTP record found. Please request a new OTP."
        }
      });
    }

    const currentTime = new Date();
    const otpExpirationTime = new Date(authRecord.otpExpiration);

    if (otpExpirationTime < currentTime) {
      return res.status(400).json({
        error: {
          title: "OTP Expired",
          message: "Your OTP has expired. Please request a new OTP."
        }
      });
    }

    if (authRecord.otp !== otp) {
      return res.status(400).json({
        error: {
          title: "OTP Failed",
          message: "Invalid OTP. Please try again."
        }
      });
    }

    authRecord.otp = null;
    authRecord.otpExpiration = null;
    await authRecord.save();

    const student = await Student.findOne({ mobileNo });
    if (!student || !student.isEnrolled) {
      return res.status(403).json({
        error: {
          title: "Not Allowed",
          message: "Student is not enrolled or no longer exists."
        }
      });
    }

    const accessToken = jwt.sign(
      { mobileNo },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15min' }
    );

    const refreshToken = jwt.sign(
      { mobileNo },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'OTP verified successfully',
      accessToken,
      refreshToken,
      mobileNo
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        title: "Server Error",
        message: "Error verifying OTP"
      }
    });
  }
};



const refreshToken = async (req, res) => {

    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }

    try {

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);



        // const student = await Student.findOne({mobileNo: decoded.mobileNo})

        // if (!student) {
        //     return res.status(404).json({
        //         message: 'Entered mobile number is not associated with any student',
        //     });
        // }

        // if (!student.isEnrolled) {
        //     return res.status(403).json({
        //         error: {
        //             title: 'Access Denied',
        //             message: 'Student is not enrolled. OTP cannot be sent.',
        //         },
        //     });
        // }



        const newAccessToken = jwt.sign(
            { mobileno: decoded.mobileNo },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15min" }
        );


        res.status(200).json({
            accessToken: newAccessToken,

        });

    } catch (err) {
        if (err.name === "TokenExpiredError") {

            return res.status(401).json({ message: "Refresh token expired" });
        }

        res.status(401).send('Failed to refresh token')
    }
}



module.exports = { sendOtp, verifyOtp, refreshToken };

