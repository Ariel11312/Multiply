import { GoldenSeatOwner } from "../models/golden-seat-owner.js";
import { goldenseats } from "../models/golden-seats.js";
import { MemberTransaction } from "../models/member-transactions.js";
import { Member } from "../models/Member.js";
import { Order } from "../models/order.js";
import jwt from "jsonwebtoken";

/**
 * Controller to handle placing a new order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

export const userOrder = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    const userOrders = await Order.find({ customerId: userId });

    return res.status(200).json(userOrders);
  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).json({
      message: "Failed to retrieve order",
      error: error.message,
    });
  }
};

export const placeOrder = async (req, res) => {
  try {
    const {
      customerId,
      email,
      name,
      phone,
      address,
      region,
      province,
      city,
      barangay,
      postalCode,
      landmark,
      paymentMethod,
      regionName,
      provinceName,
      cityName,
      barangayName,
      orderItems,
    } = req.body;

    const referralMember = await Member.findOne({ memberID: customerId });

    const goldenSeat = new goldenseats({
      captain: referralMember.barangay,
      mayor: referralMember.city,
      governor: referralMember.province,
      senator: referralMember.region,
      vicePresident: "Philippines",
      President: "Philippines",
      commission: 10,
    });
    await goldenSeat.save();

    const eSenatorPosition = referralMember.region;
    const eSenator = await GoldenSeatOwner.findOne({
      position: "e-Senator",
      spot: eSenatorPosition,
    });
    const PositionTransactionCodeSenator =
      "GOLD" + Math.random().toString(36).substring(2, 10).toUpperCase();
    if (eSenator) {
      const eSenatorId = eSenator.userId;
      console.log("e-Senator ID: " + eSenatorId);
      const saveSenatorCommission = new MemberTransaction({
        memberId: eSenatorId,
        price: 10, // Example commission amount
        total: 10, // Example commission amount
        transactionDate: new Date().toLocaleString(), // Show only date and time
        transactionId: PositionTransactionCodeSenator,
        productName: "E-Senator Commission",
      });
      saveSenatorCommission.save();
    }

    const eGovernor = await GoldenSeatOwner.findOne({
      position: "e-Governor",
      spot: referralMember.province,
    });
    const PositionTransactionCodeGovernor =
      "GOLD" + Math.random().toString(36).substring(2, 10).toUpperCase();
    if (eGovernor) {
      const eGovernorId = eGovernor.userId;
      console.log("e-Governor ID: " + eGovernorId);
      const saveGovernorCommission = new MemberTransaction({
        memberId: eGovernorId,
        price: 10, // Example commission amount
        total: 10, // Example commission amount
        transactionDate: new Date().toLocaleString(), // Show only date and time
        transactionId: PositionTransactionCodeGovernor,
        productName: "E-Governor Commission",
      });
      saveGovernorCommission.save();
    }

    const eMayor = await GoldenSeatOwner.findOne({
      position: "e-Mayor",
      spot: referralMember.city,
    });
    const PositionTransactionCodeMayor =
      "GOLD" + Math.random().toString(36).substring(2, 10).toUpperCase();
    if (eMayor) {
      const eMayorId = eMayor.userId;
      console.log("e-Mayor ID: " + eMayorId);
      const saveMayorCommission = new MemberTransaction({
        memberId: eMayorId,
        price: 10, // Example commission amount
        total: 10, // Example commission amount
        transactionDate: new Date().toLocaleString(), // Show only date and time
        transactionId: PositionTransactionCodeMayor,
        productName: "E-Mayor Commission",
      });
      saveMayorCommission.save();
    }

    const eCaptain = await GoldenSeatOwner.findOne({
      position: "e-Captain",
      spot: referralMember.barangay,
    });
    const PositionTransactionCodeCaptain =
      "GOLD" + Math.random().toString(36).substring(2, 10).toUpperCase();
    if (eCaptain) {
      const eCaptainId = eCaptain.userId;
      console.log("e-Captain ID: " + eCaptainId);
      const saveCaptainCommission = new MemberTransaction({
        memberId: eCaptainId,
        price: 10, // Example commission amount
        total: 10, // Example commission amount
        transactionDate: new Date().toLocaleString(), // Show only date and time
        transactionId: PositionTransactionCodeCaptain,
        productName: "E-Captain Commission",
      });
      saveCaptainCommission.save();
    }
    // Generate a random 8-letter code starting with "RE"
    const transactionCode =
      "RE" + Math.random().toString(36).substring(2, 10).toUpperCase();
    if (referralMember) {
      const ref = referralMember.referredBy;
      console.log(ref);
      const referralPerson = await Member.findOne({ referralCode: ref });
      const saveCommission = new MemberTransaction({
        memberId: referralPerson.memberID,
        price: 10, // Example commission amount
        total: 10, // Example commission amount
        transactionDate: new Date().toLocaleString(), // Show only date and time
        transactionId: transactionCode,
        productName: "Re-Purchase Commission",
      });
      saveCommission.save();
      //     }

      // Validate required fields
      // if (!customerId || !email || !name || !phone || !address || !orderItems || orderItems.length === 0) {
      //   return res.status(400).json({ message: 'Missing required fields' });
      // }

      // Validate email format
      // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // if (!emailRegex.test(email)) {
      //   return res.status(400).json({ message: 'Invalid email format' });
    }

    // Calculate order totals
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingFee = 150; // Example fixed shipping fee
    const total = subtotal + shippingFee;

    // Create a new order instance
    const newOrder = new Order({
      customerId,
      email,
      name,
      phone,
      address,
      region,
      province,
      city,
      barangay,
      postalCode,
      landmark,
      paymentMethod,
      regionName,
      provinceName,
      cityName,
      barangayName,
      orderItems,
      subtotal,
      shippingFee,
      total,
      status: "pending",
      orderDate: new Date(),
    });

    // Save to database
    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({
      message: "Something went wrong",
      error:
        process.env.NODE_ENV === "production" ? "Server error" : error.message,
    });
  }
};

// Using ES modules export as the import style suggests this is preferred
export default { placeOrder };
