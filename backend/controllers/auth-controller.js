import { User } from "../models/user.js";
import bcrypt from "bcryptjs";
import { generateJWTToken } from "../utils/generateJWTToken.js";
import { sendPasswordResetEmail, sendResetSuccessEmail } from "../emails/email.js";
import crypto from "crypto";
import { Member } from "../models/Member.js";
import { MemberTransaction } from "../models/member-transactions.js";
import moment from "moment";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { sendOtp } from "../utils/semaphore-utils.js"; // Assuming you have the SMS service
import { Cart } from "../models/cart.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const signup = async (request, response) => {
    try {
        const { firstName, lastName, phoneNumber, password } = request.body;

        // Enhanced input validation
        if (!firstName?.trim() || !lastName?.trim() || !phoneNumber?.trim() || !password?.trim()) {
            return response.status(400).json({
                success: false,
                message: "All fields are required and cannot be empty",
            });
        }

        // Enhanced name validation
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
            return response.status(400).json({
                success: false,
                message: "Names should only contain letters and be between 2-50 characters",
            });
        }

        // Enhanced phone validation - accepts both with/without country code
        const phoneRegex = /^(?:\+?63|0)?([0-9]{10})$/;
        if (!phoneRegex.test(phoneNumber)) {
            return response.status(400).json({
                success: false,
                message: "Invalid phone number format. Please enter a valid Philippine mobile number",
            });
        }

        // Format phone number to standard format (63XXXXXXXXXX)
        const formattedPhone = phoneNumber.replace(/^\+?63|^0/, "63");

        // Password strength validation
        if (password.length < 8) {
            return response.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long",
            });
        }

        // Check for existing user
        const existingUser = await User.findOne({ phoneNumber: formattedPhone });
        if (existingUser) {
            return response.status(409).json({
                success: false,
                message: "User with this phone number already exists",
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phoneNumber: formattedPhone,
            password: hashedPassword,
            isVerified: false,
            verificationCode: otp,
            verificationCodeExpiry: otpExpiry,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const cart = new Cart({
            userId: newUser._id,   
            items: [],
            totalAmount: 0,
            updatedAt: new Date(),
            createdAt: new Date()
        });
        cart.save();
        // Save user
        await newUser.save();

        // Send OTP via SMS
        const otpMessage = `Your verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;
        await sendOtp(formattedPhone, otpMessage);

        // Return success response
        return response.status(201).json({
            success: true,
            message: "User created successfully. Please verify your phone number with the OTP sent.",
            data: {
                userId: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                phoneNumber: newUser.phoneNumber,
                isVerified: newUser.isVerified,
                createdAt: newUser.createdAt,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);

        // Handle specific MongoDB errors
        if (error.code === 11000) {
            return response.status(409).json({
                success: false,
                message: "User with this phone number already exists",
            });
        }

        return response.status(500).json({
            success: false,
            message: "An error occurred during signup",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

export const login = async (request, response) => {
    let { number, password } = request.body;

    // Format phone number
    if (number.startsWith("09")) {
        number = "9" + number.slice(2);
    }

    try {
        // Check if user exists
        const user = await User.findOne({ phoneNumber: number });

        if (!user) {
            return response.status(400).json({ success: false, message: "Invalid phone number" });
        }

        // Check if password matches
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return response.status(400).json({ success: false, message: "Incorrect password" });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return response.status(400).json({ success: false, message: "Phone number not verified" });
        }

        // Generate JWT token
        generateJWTToken(response, user._id);

        response.status(200).json({
            success: true,
            message: "Login Successful",
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return response.status(500).json({ success: false, message: "An unexpected error occurred" });
    }
};
export const logout = (request, response) => {
    response.clearCookie("token");
    response.status(200).json({ success: true, message: "Logged Out Successfully" });
};
export const verifyEmail = async (request, response) => {
    const { code } = request.body;

    try {
        const user = await User.findOne({ verificationCode: code });

        if (!user) {
            return response.status(400).json({ success: false, message: "Incorrect code or code expired." });
        }

        // Check if the OTP is expired
        if (user.verificationCodeExpiry < new Date()) {
            return response.status(400).json({ success: false, message: "Verification code has expired." });
        }

        // Mark user as verified
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpiry = undefined;

        // Generate JWT token
        generateJWTToken(response, user._id);

        await user.save();
        return response.status(200).json({ success: true, message: "Phone number verified successfully." });
    } catch (error) {
        console.error("Error verifying phone number:", error);
        return response.status(500).json({ success: false, message: "An error occurred while verifying the phone number." });
    }
};


export const forgotPassword = async (request, response) => {
    const { email } = request.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return response.status(400).json({ success: false, message: "Invalid email" });
        }

        // Generate reset token
        const resetPasswordToken = crypto.randomBytes(32).toString("hex");
        const resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour expiry

        // Save reset token to user
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpiredAt = resetPasswordExpiresAt;

        await user.save();

        // Send reset email
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`);

        return response.status(200).json({ success: true, message: "Reset password email sent successfully" });
    } catch (error) {
        console.error("Forgot password error:", error);
        return response.status(500).json({ success: false, message: "An error occurred while processing your request." });
    }
};
export const resetPassword = async (request, response) => {
    try {
        const { token } = request.params;
        const { password } = request.body;

        // Find user by token and ensure the token is not expired
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiredAt: { $gt: Date.now() }, // Check expiration
        });

        if (!user) {
            return response.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password and reset token fields
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiredAt = undefined;

        await user.save();

        // Send success email
        await sendResetSuccessEmail(user.email);

        return response.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return response.status(500).json({
            success: false,
            message: "An error occurred while resetting the password",
        });
    }
};
export const checkAuth = async (request, response) => {
    try {
        // Retrieve token from cookies
        const token = request.cookies.token;
        
        if (!token) {
            return response.status(401).json({
                status: 401
            });
        }
        // Decode and verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        // Find the user by ID
        const user = await User.findById(decoded.userId).select("-password"); // Exclude password
        if (!user) {
            return response.status(401).json({
                status: 401
            });
        }

        response.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Error in checkAuth:", error);
        response.status(400).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};

export const checkMember = async (request, response) => {

    const token = request.cookies.token;
    if (!token) {
        return response.status(401).json({
            success: false,
            message: 'Authentication token is missing.',
        });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    try {
        const member = await Member.findOne({ memberID: decoded.userId });
        if (!member) {
            return response.status(400).json({
                success: false,
                message: "member not found",
            });
        }

        response.status(200).json({ success: true, user: { ...member._doc } })
    } catch (error) {
        console.log(error)
        response.status(400).json({ success: false, message: error.message })
    }
}


export const checkMemberTransaction = async (request, response) => {
    const token = request.cookies.token;
    if (!token) {
        return response.status(401).json({
            success: false,
            message: 'Authentication token is missing.',
        });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    try {
        // Find the user by userId
        const user = await User.findById(decoded.userId);
        if (!user) {
            return response.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        // Find all transactions for this user
        const membertrans = await MemberTransaction.find({ memberId: user._id });

        // If no transactions are found, return a proper message
        if (membertrans.length === 0) {
            return response.status(400).json({
                success: false,
                message: "No transactions found for this user"
            });
        }

        // Get the start and end time for different periods
        const startOfToday = moment().startOf('day').toDate();
        const endOfToday = moment().endOf('day').toDate();
        const startOfYesterday = moment().subtract(1, 'days').startOf('day').toDate();
        const endOfYesterday = moment().subtract(1, 'days').endOf('day').toDate();
        const startOfThisMonth = moment().startOf('month').toDate();
        const endOfThisMonth = moment().endOf('month').toDate();
        const startOfLastMonth = moment().subtract(1, 'months').startOf('month').toDate();
        const endOfLastMonth = moment().subtract(1, 'months').endOf('month').toDate();

        // Parse the transactionDate and filter based on transaction date for different periods
        const transactionsToday = membertrans.filter(transaction => {
            const transactionDate = moment(transaction.transactionDate, 'M/D/YYYY').toDate();
            return transactionDate >= startOfToday && transactionDate <= endOfToday;
        });

        const transactionsYesterday = membertrans.filter(transaction => {
            const transactionDate = moment(transaction.transactionDate, 'M/D/YYYY').toDate();
            return transactionDate >= startOfYesterday && transactionDate <= endOfYesterday;
        });

        const transactionsThisMonth = membertrans.filter(transaction => {
            const transactionDate = moment(transaction.transactionDate, 'M/D/YYYY').toDate();
            return transactionDate >= startOfThisMonth && transactionDate <= endOfThisMonth;
        });

        const transactionsLastMonth = membertrans.filter(transaction => {
            const transactionDate = moment(transaction.transactionDate, 'M/D/YYYY').toDate();
            return transactionDate >= startOfLastMonth && transactionDate <= endOfLastMonth;
        });

        // Calculate totals
        const totalAmount = membertrans.reduce((acc, transaction) => acc + transaction.total, 0);
        const totalIncomeYesterday = transactionsYesterday.reduce((acc, transaction) => acc + transaction.total, 0);
        const totalIncomeToday = transactionsToday.reduce((acc, transaction) => acc + transaction.total, 0);
        const totalIncomeThisMonth = transactionsThisMonth.reduce((acc, transaction) => acc + transaction.total, 0);
        const totalIncomeLastMonth = transactionsLastMonth.reduce((acc, transaction) => acc + transaction.total, 0);

        // Number of transactions today
        const numberOfTransactionsToday = transactionsToday.length;

        response.status(200).json({
            success: true,
            user: membertrans,
            total: totalAmount, // Total for all transactions
            totalIncomeYesterday: totalIncomeYesterday, // Total for yesterday
            totalIncomeToday: totalIncomeToday, // Total for today
            totalIncomeThisMonth: totalIncomeThisMonth, // Total for this month
            totalIncomeLastMonth: totalIncomeLastMonth, // Total for last month
            numberOfTransactionsToday: numberOfTransactionsToday // Number of transactions made today
        });

    } catch (error) {
        console.log(error);
        response.status(400).json({
            success: false,
            message: error.message
        });
    }
};



export const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        // Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, given_name, family_name, picture, sub: googleId } = ticket.getPayload();

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // If user does not exist, create a new one
            user = new User({
                firstName: given_name,
                lastName: family_name,
                email,
                profileImage: picture,
                googleId,
                isGoogleUser: true,
                isVerified: true, // Google accounts are already verified
            });
            const cart = new Cart({
                userId: googleId,   
                items: [],
                totalAmount: 0,
                updatedAt: new Date(),
                createdAt: new Date()
            });
            cart.save();
            await user.save();
        }

        // Generate JWT token and set it in an HTTP-only cookie
        generateJWTToken(res, user._id);

        res.json({ success: true, message: "Login successful" });
    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({ success: false, message: "Login failed" });
    }
};

export const resendOtp = async (req, res) => {
    const { phoneNumber } = req.body;
    console.log('Resending OTP to:', phoneNumber);
    try {
        let formattedNumber = phoneNumber;
        if (phoneNumber.startsWith("09")) {
            formattedNumber = "9" + phoneNumber.slice(2);
        }

        console.log('Resending OTP to:', formattedNumber);

        // Find user by phone number
        const userPhone = await User.findOne({ phoneNumber: formattedNumber });

        if (!userPhone) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this phone number'
            });
        }

    
        // Check if the OTP is expired
        const now = new Date();
        if (userPhone.verificationCodeExpiry && new Date(userPhone.verificationCodeExpiry) < now) {
            console.log("OTP expired, generating a new one...");
            // Generate a new OTP
            const newOtpCode = crypto.randomInt(100000, 999999).toString();
            const newExpiry = new Date();
            newExpiry.setMinutes(newExpiry.getMinutes() + 5); // Set expiry to 5 minutes from now

            // Update OTP and expiry in the database
            userPhone.verificationCode = newOtpCode;
            userPhone.verificationCodeExpiry = newExpiry;
            await userPhone.save();

            // Use the new OTP
            var otpCode = newOtpCode;
        } else {
            // Use existing OTP if still valid
            var otpCode = userPhone.verificationCode;
        }

        // Create OTP message
        const otpMessage = `Your verification code is: ${otpCode}. This code will expire in 5 minutes. Do not share this code with anyone.`;

        // Send OTP (Ensure sendOtp function is defined)
        const result = await sendOtp(phoneNumber, otpMessage);

        return res.status(200).json({
            success: true,
            message: 'OTP resent successfully',
            data: result,
            otpCode: otpCode
        });
    } catch (error) {
        console.error('Error in resendOtp function:', error);

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to resend OTP'
        });
    }
};
