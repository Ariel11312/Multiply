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

    // Validate orderItems is an array before processing
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'Order items are required and must be an array' });
    }

    // Log order items properly
    console.log("Processing order items:");
    orderItems.forEach((item, index) => {
      console.log(`Order Item ${index+1}: ${item.name}`);
    });

    const referralMember = await Member.findOne({ memberID: customerId });
    if (!referralMember) {
      return res.status(404).json({ message: 'Referral member not found' });
    }

    // Process each order item
    for (const item of orderItems) {
      console.log(`Processing item: ${item.name}`);
      let commissionGold = 0;
      // Check for specific products to create golden seat with different commission values
      if (item.name === "Cnergee 1200 Capsules") {
        console.log("Creating golden seat for Cnergee 1200 Capsules purchase");
        commissionGold = 250;
        const goldenSeat = new goldenseats({
          captain: referralMember.barangay,
          mayor: referralMember.city,
          governor: referralMember.province,
          senator: referralMember.region,
          vicePresident: "Philippines",
          President: "Philippines",
          commission: commissionGold,
        });
        await goldenSeat.save();

        // Process commissions for all positions here
        await processAllCommissions(referralMember, commissionGold);
      } 
      else if (item.name === "Cnergee 30 Capsules") {
        console.log("Creating golden seat for Cnergee 10 Capsules purchase");
        commissionGold = 10;
        const goldenSeat = new goldenseats({
          captain: referralMember.barangay,
          mayor: referralMember.city,
          governor: referralMember.province,
          senator: referralMember.region,
          vicePresident: "Philippines",
          President: "Philippines",
          commission: commissionGold,
        });
        await goldenSeat.save();
        await processAllCommissions(referralMember, commissionGold);
      }
      else if (item.name === "Cnergee 60 Capsules") {
        console.log("Creating golden seat for Cnergee 600 Capsules purchase");
        commissionGold = 20;
        const goldenSeat = new goldenseats({
          captain: referralMember.barangay,
          mayor: referralMember.city,
          governor: referralMember.province,
          senator: referralMember.region,
          vicePresident: "Philippines",
          President: "Philippines",
          commission: commissionGold,
        });
        await goldenSeat.save();
        await processAllCommissions(referralMember, commissionGold);
      }
      else if (item.name === "Cnergee 100 Capsules") {
        console.log("Creating golden seat for Cnergee 600 Capsules purchase");
        commissionGold = 30;
        const goldenSeat = new goldenseats({
          captain: referralMember.barangay,
          mayor: referralMember.city,
          governor: referralMember.province,
          senator: referralMember.region,
          vicePresident: "Philippines",
          President: "Philippines",
          commission: commissionGold,
        });
        await goldenSeat.save();
        await processAllCommissions(referralMember, commissionGold);
      }
    }
    
    // Helper function to process all commissions
    async function processAllCommissions(referralMember, commissionGold) {
      // E-Senator commission
      const eSenatorPosition = referralMember.region;
      const eSenator = await GoldenSeatOwner.findOne({
      position: "e-Senator",
      spot: eSenatorPosition,
      });
      
      if (eSenator) {
      const PositionTransactionCodeSenator =
        "GOLD" + Math.random().toString(36).substring(2, 10).toUpperCase();
      const eSenatorId = eSenator.userId;
      console.log("e-Senator ID: " + eSenatorId);
      const saveSenatorCommission = new MemberTransaction({
        memberId: eSenatorId,
        price: commissionGold,
        total: commissionGold,
        transactionDate: new Date().toLocaleString(),
        transactionId: PositionTransactionCodeSenator,
        productName: "E-Senator Commission",
      });
      await saveSenatorCommission.save();
      }
    
      // E-Governor commission
      const eGovernor = await GoldenSeatOwner.findOne({
      position: "e-Governor",
      spot: referralMember.province,
      });
      
      if (eGovernor) {
      const PositionTransactionCodeGovernor =
        "GOLD" + Math.random().toString(36).substring(2, 10).toUpperCase();
      const eGovernorId = eGovernor.userId;
      console.log("e-Governor ID: " + eGovernorId);
      const saveGovernorCommission = new MemberTransaction({
        memberId: eGovernorId,
        price: commissionGold,
        total: commissionGold,
        transactionDate: new Date().toLocaleString(),
        transactionId: PositionTransactionCodeGovernor,
        productName: "E-Governor Commission",
      });
      await saveGovernorCommission.save();
      }
    
      // E-Mayor commission
      const eMayor = await GoldenSeatOwner.findOne({
      position: "e-Mayor",
      spot: referralMember.city,
      });
      
      if (eMayor) {
      const PositionTransactionCodeMayor =
        "GOLD" + Math.random().toString(36).substring(2, 10).toUpperCase();
      const eMayorId = eMayor.userId;
      console.log("e-Mayor ID: " + eMayorId);
      const saveMayorCommission = new MemberTransaction({
        memberId: eMayorId,
        price: commissionGold,
        total: commissionGold,
        transactionDate: new Date().toLocaleString(),
        transactionId: PositionTransactionCodeMayor,
        productName: "E-Mayor Commission",
      });
      await saveMayorCommission.save();
      }
    
      // E-Captain commission
      const eCaptain = await GoldenSeatOwner.findOne({
      position: "e-Captain",
      spot: referralMember.barangay,
      });
      
      if (eCaptain) {
      const PositionTransactionCodeCaptain =
        "GOLD" + Math.random().toString(36).substring(2, 10).toUpperCase();
      const eCaptainId = eCaptain.userId;
      console.log("e-Captain ID: " + eCaptainId);
      const saveCaptainCommission = new MemberTransaction({
        memberId: eCaptainId,
        price: commissionGold,
        total: commissionGold,
        transactionDate: new Date().toLocaleString(),
        transactionId: PositionTransactionCodeCaptain,
        productName: "E-Captain Commission",
      });
      await saveCaptainCommission.save();
      }
      
      // Referral commission
      if (referralMember) {
      const transactionCode =
        "RE" + Math.random().toString(36).substring(2, 10).toUpperCase();
      const ref = referralMember.referredBy;
      console.log("Referral: " + ref);
      
     // Referral commission processing
if (ref) {
  try {
    const referralPerson = await Member.findOne({ referralCode: ref });
    
    if (!referralPerson) {
      console.log("Referral person not found with code:", ref);
      return; // Skip if no referral person found
    }

    console.log("Referral Person Member Type:", referralPerson.memberType);
    
    // Process commission for each item in the order
    for (const item of orderItems) {
      try {
        console.log("Processing commission for item:", item.name);
        
        // Determine commission amount based on member type
        let commissionAmount = 0;
        
        if (item.name === "Cnergee 30 Capsules" && referralPerson.memberType?.includes("X1")) {
          commissionAmount = 3;
        } else if (item.name === "Cnergee 30 Capsules" && referralPerson.memberType?.includes("X2")) {
          commissionAmount = 6;
        } else if (item.name === "Cnergee 30 Capsules" && referralPerson.memberType?.includes("X3")) {
          commissionAmount = 7;
        } else if (item.name === "Cnergee 30 Capsules" && referralPerson.memberType?.includes("X5")) {
          commissionAmount = 9;
        }
        else if (item.name === "Cnergee 60 Capsules" && referralPerson.memberType?.includes("X1")) {
          commissionAmount = 10;
        }
        else if (item.name === "Cnergee 60 Capsules" && referralPerson.memberType?.includes("X2")) {
          commissionAmount = 20;
        }
        else if (item.name === "Cnergee 60 Capsules" && referralPerson.memberType?.includes("X3")) {
          commissionAmount = 25;
        }
        else if (item.name === "Cnergee 60 Capsules" && referralPerson.memberType?.includes("X5")) {
          commissionAmount = 30;
        }
        else if (item.name === "Cnergee 100 Capsules" && referralPerson.memberType?.includes("X1")) {
          commissionAmount = 20;
        }
        else if (item.name === "Cnergee 100 Capsules" && referralPerson.memberType?.includes("X2")) {
          commissionAmount = 30;
        }
        else if (item.name === "Cnergee 100 Capsules" && referralPerson.memberType?.includes("X3")) {
          commissionAmount = 40;
        }
        else if (item.name === "Cnergee 100 Capsules" && referralPerson.memberType?.includes("X5")) {
          commissionAmount = 50;
        }

        else if (item.name === "Cnergee 1200 Capsules" && referralPerson.memberType?.includes("X1")) {
          commissionAmount = 100;
        }
        else if (item.name === "Cnergee 1200 Capsules" && referralPerson.memberType?.includes("X2")) {
          commissionAmount = 200;
        }
        else if (item.name === "Cnergee 1200 Capsules" && referralPerson.memberType?.includes("X3")) {
          commissionAmount = 300;
        }
        else if (item.name === "Cnergee 1200 Capsules" && referralPerson.memberType?.includes("X5")) {
          commissionAmount = 500;
        }

          // Skip if no commission applies
        if (commissionAmount <= 0) {
          console.log("No commission for member type:", referralPerson.memberType);
          continue;
        }

        const transactionCode = "RE" + Math.random().toString(36).substring(2, 10).toUpperCase();
        
        const commissionRecord = new MemberTransaction({
          memberId: referralPerson.memberID,
          price: commissionAmount,
          total: commissionAmount,
          transactionDate: new Date().toLocaleString(),
          transactionId: transactionCode,
          productName: `Re-Purchase Commission for ${item.name}`,
        });
        
        await commissionRecord.save();
        console.log(`Commission of ${commissionAmount} recorded for ${item.name}`);
        
      } catch (itemError) {
        console.error("Error processing commission for item:", item.name, itemError);
        // Continue with next item even if one fails
      }
    }
  } catch (referralError) {
    console.error("Error processing referral commission:", referralError);
    // Continue with order processing even if referral commission fails
  }
}
      }
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
