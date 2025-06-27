const User = require('../Model/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { signUpValidation, signInValidation } = require('../validator/authValidation');


const signUp = async (req, res) => {
  try {
    const { error, value } = signUpValidation.validate(req.body, { abortEarly: false });

    if (error) {
      const validationErrors = error.details.map((err) => err.message);

      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }

    const { name, email, password } = value;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};



const signIn = async (req, res) => {
  try {
    // Validate input
    const { error, value } = signInValidation.validate(req.body, { abortEarly: false });
    if (error) {
      const validationErrors = error.details.map((err) => err.message);
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }

    const { email, password } = value;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }


    // Access Token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );




    // Refresh Token
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );



    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      // secure: false,
      // sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send access token to frontend
    return res.status(200).json({
      message: 'Login successful',
      accessToken,
    });

  } catch (err) {
    console.error('SignIn error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};




const refreshAccessToken = (req, res) => {
  const token = req.cookies.refreshToken; 

  if (!token) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('Refresh token error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};



const getUserData = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const userData = await User.findOne({ _id: userId });

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(userData);
  } catch (err) {
    console.error('Failed to fetch user data:', err);
    return res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};


module.exports = {
  signUp,
  signIn,
  refreshAccessToken,
  getUserData
};
