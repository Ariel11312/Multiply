import { GoldenSeatOwner } from "../models/golden-seat-owner.js";
import { goldenseats } from "../models/golden-seats.js";
import { MemberTransaction } from "../models/member-transactions.js";
import { Member } from "../models/Member.js";
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";

export const GetAllTransaction = async (request, response) => {
  try {
    // Validate token
    const token = request.cookies.token;
    if (!token) {
      return response
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    // Decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return response
        .status(403)
        .json({ success: false, message: "Invalid token" });
    }

    // Fetch transactions for the authenticated user
    const transactions = await MemberTransaction.find({
      memberId: decoded.userId,
    });

    // Fetch user data
    const user = await User.findById(decoded.userId).select(
      "firstName lastName"
    );

    if (!user) {
      return response
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Attach user details to transactions
    const transactionsWithUser = transactions.map((txn) => ({
      ...txn.toObject(), // Convert Mongoose document to plain object
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
    }));

    // Return transactions with user data
    response
      .status(200)
      .json({ success: true, transactions: transactionsWithUser });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    response.status(500).json({ success: false, message: "Server error" });
  }
};

// export const GoldenSeatsCommissions = async (request, response) => {
//   try {
//     const token = request.cookies.token;
//     if (!token) {
//       return response.status(401).json({
//         success: false,
//         message: "Authentication token is missing.",
//       });
//     }

//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const memberGoldenSeater = decoded.userId; // Extract userId from the token
//     const existingMember = await GoldenSeatOwner.findOne({
//       userId: memberGoldenSeater,
//     });
//     if (existingMember) {
//       const position = existingMember.position;
//       if (position === "e-Captain") {

//         const spot = existingMember.spot;

//         const goldenSeatersSpot = await goldenseats.find({
//           captain: spot,
//         });

//         // Summing up all commissions
//         const totalCommission = goldenSeatersSpot.reduce(
//           (sum, seat) => sum + (seat.commission || 0),
//           0
//         );
//         response
//           .status(200)
//           .json({
//             success: true,
//             totalCommission: totalCommission,
//             spot: spot,
//             position: position,
//           });
//       }
//       if (position === "e-Mayor") {
//         const spot = existingMember.spot;

//         const goldenSeatersSpot = await goldenseats.find({
//           mayor: spot,
//         });
//         console.log(goldenSeatersSpot.commission);
//         // Summing up all commissions
//         const totalCommission = goldenSeatersSpot.reduce(
//           (sum, seat) => sum + (seat.commission || 0),
//           0
//         );
//         response
//           .status(200)
//           .json({
//             success: true,
//             totalCommission: totalCommission,
//             spot: spot,
//             position: position,
//           });
//       }
//       if (position === "e-Governor") {
//         const spot = existingMember.spot;
  
//         const goldenSeatersSpot = await goldenseats.find({
//           governor: spot,
//         });
//         console.log(goldenSeatersSpot.commission);
//         // Summing up all commissions
//         const totalCommission = goldenSeatersSpot.reduce(
//           (sum, seat) => sum + (seat.commission || 0),
//           0
//         );
//         response
//           .status(200)
//           .json({
//             success: true,
//             totalCommission: totalCommission,
//             spot: spot,
//             position: position,
//           });
//       }
//       if (position === "e-Senator") {
//         const spot = existingMember.spot;
  
//         const goldenSeatersSpot = await goldenseats.find({
//           senator: spot,
//         });
//         console.log(goldenSeatersSpot.commission);
//         // Summing up all commissions
//         const totalCommission = goldenSeatersSpot.reduce(
//           (sum, seat) => sum + (seat.commission || 0),
//           0
//         );
//         response
//           .status(200)
//           .json({
//             success: true,
//             totalCommission: totalCommission,
//             spot: spot,
//             position: position,
//           });
//       }
//       if (position === "e-Vice President") {
//         const spot = "Philippines";
  
//         const goldenSeatersSpot = await goldenseats.find({
//             vicePresident: spot,
//         });
//         // Summing up all commissions
//         const totalCommission = goldenSeatersSpot.reduce(
//           (sum, seat) => sum + (seat.commission || 0),
//           0
//         );
//         response
//           .status(200)
//           .json({
//             success: true,
//             totalCommission: totalCommission,
//             spot: spot,
//             position: position,
//           });
//       }
//       if (position === "e-President") {
//         const spot = "Philippines";
  
//         const goldenSeatersSpot = await goldenseats.find({
//             President: spot,
//         });
//         // Summing up all commissions
//         const totalCommission = goldenSeatersSpot.reduce(
//           (sum, seat) => sum + (seat.commission || 0),
//           0
//         );
//         response
//           .status(200)
//           .json({
//             success: true,
//             totalCommission: totalCommission,
//             spot: spot,
//             position: position,
//           });
//       }
//     }
//   } catch (error) {}
// };

export const UpdateTransaction = async (req, res) => {
  try {
    
    // Get transactionId from the request body, not from the token
    const { transactionId, claimOption, amount, claimStatus, claimDate } = req.body;
  
    const transaction = await MemberTransaction.findOne({ transactionId: transactionId });
    console.log(transaction)
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }
    
    // Update the transaction fields
    transaction.claimOption = claimOption;
    transaction.claimedAmount = amount;
    transaction.claimStatus = claimStatus || 'claimed';
    transaction.claimDate = claimDate || new Date();
    
    // Handle claimOption logic
    if (claimOption === "5000 pesos") {
      transaction.price = 5000;
      transaction.total = 5000;

    } else if (claimOption === "40 bottles") {
      transaction.productName = "40 Bottles";
    }
    
    // Save the updated transaction
    await transaction.save();
    
    // Return a safe response
    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction: {
        transactionId: transaction.transactionId,
        productName: transaction.productName,
        price: transaction.price,
        total: transaction.total,
        claimOption: transaction.claimOption,
        claimedAmount: transaction.claimedAmount,
        claimStatus: transaction.claimStatus,
        claimDate: transaction.claimDate
      }
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update transaction",
      error: error.message
    });
  }
};
