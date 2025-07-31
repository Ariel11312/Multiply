import { Member } from "../models/Member.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { MemberTransaction } from "../models/member-transactions.js";
import { GoldenSeatOwner } from "../models/golden-seat-owner.js";
import { goldenseats } from "../models/golden-seats.js";
import { Payment } from "../models/payment.js";
import { Proof } from "../models/proof.js";
import { Withdraw } from "../models/witthdraw.js";
import { Notification } from '../models/notification.js';
export const createMember = async (request, response) => {
    
  try {
    // // Authentication check
    // const token = request.cookies.token;
    // if (!token) {
    //   return response.status(401).json({
    //     success: false,
    //     message: "Unauthorized",
    //   });
    // }

    // // Verify JWT token
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Function to format current date
    function formatCurrentDate() {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, "0");
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const year = currentDate.getFullYear();
      return `${day}/${month}/${year}`;
    }
    const formattedDate = formatCurrentDate();

    // Destructure and set default values from request body
    const {
      memberID,
      referralCode,
      memberType,
      addressNo,
      province,
      city,
      barangay,
      region,
      country,
      userType,
      role,
      memberStatus,
      paymentType,
      referredBy,
      memberDate,
      productImage = "",
      paymentMethod,
      transactionDate = new Date(),
    } = request.body;

    // Validate required fields
    const requiredFields = {
      referralCode,
      memberID,
      memberType,
      addressNo,
      province,
      city,
      barangay,
      paymentType,
      memberDate,
    };
         const notification = new Notification({
          userId:memberID, // Assuming costumerId is the user ID to notify
          title: 'Membership ' +memberType+' Approved',
          message: 'Membership' +memberType+' Approved by the admin, thank you!',
          isRead: false,
          metadata: {
            status: "pending",
            updatedAt: new Date(),
            previousStatus: "pending" // Track previous status for history
          },
          actionUrl: `/member`,
          priority: ['pending'].includes("pending") ? 2 : 1
        });
        await notification.save();


    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field);

    if (missingFields.length > 0) {
      return response.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    } 

    // Create new member instance
    const DiamondTransactionId = `DIA${Date.now()}${Math.floor(
      Math.random() * 1000
    )}`;
    const CrownTransactionId = `CRO${Date.now()}${Math.floor(
      Math.random() * 1000
    )}`;
    const newMemberTransaction = new MemberTransaction({
      memberId: memberID,
      transactionId: DiamondTransactionId,
      productName: `${memberType} Registration`,
      productImage,
      quantity: 1,
      price: 0,
      total: 0,
      paymentMethod,
      transactionDate,
    });
    await newMemberTransaction.save();
    if (memberType === "Diamond") {
      const referrer = await Member.findOne({ referralCode: referredBy });
      if (referrer) {
        if (referrer.memberRoot) {
          const savedMember = new Member({
            memberID,
            referralCode,
            memberType: [memberType],
            addressNo,
            region,
            province,
            city,
            barangay,
            userType,
            role,
            memberStatus,
            paymentType,
            referredBy,
            memberDate,
            memberRoot: DiamondTransactionId,
            referredRoot: referrer.memberRoot,
          });
          savedMember.save();
        }
      } else {
        const savedMember = new Member({
          memberID,
          referralCode,
          memberType: [memberType],
          addressNo,
          region,
          province,
          city,
          barangay,
          userType,
          role,
          memberStatus,
          paymentType,
          referredBy,
          memberDate,
          memberRoot: DiamondTransactionId,
        });
        await savedMember.save();
      }
    } else if (memberType === "Crown" && referredBy) {
      const referrer = await Member.findOne({ referralCode: referredBy });
      if (referrer.memberRoot) {
        const savedMember = new Member({
          memberID,
          referralCode,
          memberType,
          addressNo,
          region,
          province,
          city,
          barangay,
          userType,
          role,
          memberStatus,
          paymentType,
          referredBy,
          memberDate,
          memberRoot: CrownTransactionId,
          referredRoot: referrer.memberRoot,
        });

        // Save the referral transaction
        await savedMember.save();
      }
      if (referrer.memberRoot && referrer.referredRoot) {
        const savedMember = new Member({
          memberID,
          referralCode,
          memberType,
          addressNo,
          region,
          province,
          city,
          barangay,
          userType,
          role,
          memberStatus,
          paymentType,
          referredBy,
          memberDate,
          memberRoot: CrownTransactionId,
          referredRoot: referrer.referredRoot,
        });

        // Save the referral transaction
        await savedMember.save();
      }
    } else {
      const savedMember = new Member({
        memberID,
        referralCode,
        memberType: [memberType],
        addressNo,
        region,
        province,
        city,
        barangay,
        userType,
        role,
        memberStatus,
        paymentType,
        referredBy,
        memberRoot: CrownTransactionId,
        memberDate,
      });
      await savedMember.save();
    }
    // Calculate referral earnings
const calculateReferralEarnings = (memberType) => {
  const earningsMap = {
    X1: 750 * 0.05,
    X2: 1500 * 0.05,
    X3: 4500 * 0.05,
    X5: 7500 * 0.05,
    Crown: 0,
    Diamond: 250000,
  };
  
  return earningsMap[memberType] || 0;
};

// Calculate golden seats commission rates
const commissionRates = {
  X1: 10,
  X2: 20,
  X3: 60,
  X5: 100,
  Crown: 0,
  Diamond: 250000,
};

const commission = commissionRates[memberType] || 0;

// Create golden seats entry with proper validation
const goldenSeats = new goldenseats({
  captain: barangay || "", // Ensure it's a string, not undefined
  mayor: city || "", // Ensure it's a string, not undefined
  governor: province || "", // Ensure it's a string, not undefined
  senator: region || "", // Ensure it's a string, not undefined
  vicePresident: country || "Philippines", // Ensure it's a string, not undefined
  President: country || "Philippines", // Optional but provide value if available
  commission: commission,
});

// Alternative approach with explicit validation:
/*
const goldenSeats = new goldenseats({
  captain: String(barangay || ""),
  mayor: String(city || ""),
  governor: String(province || ""),
  senator: String(region || ""),
  vicePresident: String(country || ""),
  President: String(country || ""),
  commission: commission,
});
*/

// Debug logging (remove in production)
console.log('Golden Seats Data:', {
  captain: barangay,
  mayor: city,
  governor: province,
  senator: region,
  vicePresident: country,
  President: country,
  commission: commission
});
    // Handle referral transactions
    if (referredBy) {
      const referrer = await Member.findOne({ referralCode: referredBy });

      if (!referrer) {
        return response.status(400).json({
          success: false,
          message: "Invalid referral code",
        });
      }

      // Find all members referred by the referrer
      const referralsTransactionId = `TXN${Date.now()}${Math.floor(
        Math.random() * 1000
      )}`;
      const referralTransactionId = `TXN${Date.now()}${Math.floor(
        Math.random() * 1000
      )}`;
      // Count the number of Crown members among the referred members

      if (referrer.referredRoot && memberType === "Crown") {
        const referredMember = await Member.findOne({
          memberRoot: referrer.referredRoot,
        });
        const memberCount = await Member.countDocuments({
          referredRoot: referredMember.memberRoot,
        });
        if (memberCount > 1) {
          const indirect = new MemberTransaction({
            memberId: referredMember.memberID,
            transactionId: referralsTransactionId,
            productName: `Indirect Referral Bonus`,
            productImage, // Ensure this variable is defined
            quantity: 1,
            price: 2000,
            total: 2000,
            paymentMethod, // Ensure this variable is defined
            transactionDate: formattedDate, // Ensure this variable is defined
          });
          await indirect.save();
        }
      }
      if (referrer.referredRoot && memberType === "Diamond") {

        const referredMember = await Member.findOne({
          memberRoot: referrer.referredRoot,
        });
        const indirect = new MemberTransaction({
          memberId: referredMember.memberID,
          transactionId: referralTransactionId,
          productName: `Indirect Referral Bonus`,
          productImage, // Ensure this variable is defined
          quantity: 1,
          price: 100000,
          total: 100000,
          paymentMethod, // Ensure this variable is defined
          transactionDate: formattedDate, // Ensure this variable is defined
        });
        await indirect.save();
      }

      // Calculate referral earnings based on the memberType
      const referralEarnings = calculateReferralEarnings(memberType);

      // Generate a unique transaction ID

      // Create referral transaction
      const referralTransaction = new MemberTransaction({
        memberId: referrer.memberID,
        transactionId: referralTransactionId,
        productName: `${memberType} Referral Bonus`,
        productImage, // Ensure this variable is defined
        quantity: 1,
        price: referralEarnings,
        total: referralEarnings,
        paymentMethod, // Ensure this variable is defined
        transactionDate: formattedDate, // Ensure this variable is defined
      });

      // Save the referral transaction
      await referralTransaction.save();

      // Optionally, update the referrer's earnings or other fields
      referrer.totalEarnings += referralEarnings;
      await referrer.save();

      
    }
    // Calculate base amount for golden seats commission
    // Save all records
    await Promise.all([
      goldenSeats.save(),
      Member.findByIdAndUpdate(
        memberID,
        { $set: { goldenSeatsId: goldenSeats._id } },
        { new: true }
      ),
    ]);
    const result = await Payment.findOneAndDelete({memberID:memberID});
    return response.status(201).json({
      success: true,
      message: "Member created and golden seats assigned successfully",
      data: {
        goldenSeats,
        commission: `${commission * 100}%`,
      },
    });
    
  }
    catch (error) {
    console.error(
      "Error in member creation and golden seats assignment:",
      error
    );
    
    if (error.name === "JsonWebTokenError") {
      return response.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    
    if (error.name === "ValidationError") {
      return response.status(400).json({
        success: false,
        message: error.message,
      });
    }
       
    return response.status(500).json({
      success: false,
      message:
        "An error occurred during member creation and golden seats assignment",
    });
  }
};

export const getAllMembers = async (request, response) => {
  try {
    const members = await Member.find();
    response.status(200).json({
      success: true,
      members,
    });
  } catch (error) {
    console.error(`Error fetching members: ${error.message}`);
    response.status(500).json({
      success: false,
      message: "An error occurred while fetching members",
    });
  }
};
export const getAllUserProof = async (request, response) => {
  try {
    const members = await Payment.find();
    const ids = members.map(member => member._id.toString());
    const userIds = members.map(member => member.memberID.toString());
    
    const userProof = await Proof.find({ id: { $in: ids } });
    const user = await User.find({ _id: { $in: userIds } })
    const withdraw = await Withdraw.find();    // Fixed console.log - objects need to be stringified or logged separately
    
    response.status(200).json({
      success: true,
      members,
      userProof, // Added userProof to response
      user, // Added userProof to response
      withdraw,
    });
  } catch (error) {
    console.error(`Error fetching members: ${error.message}`);
    response.status(500).json({
      success: false,
      message: "An error occurred while fetching members",
    });
  }
};

export const getMemberById = async (request, response) => {
  try {
    const member = await Member.findOne({ memberID: request.params.id });

    if (!member) {
      return response.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    response.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    console.error(`Error fetching member: ${error.message}`);
    response.status(500).json({
      success: false,
      message: "An error occurred while fetching member",
    });
  }
};

export const getPaymentById = async (request, response) => {
    const memberId = request.params.id;
    
    try {
        // Find all payment records for this member
        const payments = await Payment.find({ memberID: memberId });
        
        if (!payments || payments.length === 0) {
            return response.status(404).json({
                success: false,
                message: "No payment records found for this member",
                payments: [] // Return empty array for consistency
            });
        }

        response.status(200).json({
            success: true,
            message: "Payment records retrieved successfully",
            payments // Return the array of payment documents
        });
    } catch (error) {
        console.error(`Error fetching payments: ${error.message}`);
        response.status(500).json({
            success: false,
            message: "An error occurred while fetching payment records",
            payments: [] // Return empty array for consistency
        });
    }
};
export const getProofById = async (request, response) => {
    const memberId = request.params.id;
    try {
        // Find all payment records for this member
        const payments = await Payment.find({ _id: memberId });
        
        if (!payments || payments.length === 0) {
            return response.status(404).json({
                success: false,
                message: "No payment records found for this member",
                payments: [] // Return empty array for consistency
            });
        }

        response.status(200).json({
            success: true,
            message: "Payment records retrieved successfully",
            payments // Return the array of payment documents
        });
    } catch (error) {
        console.error(`Error fetching payments: ${error.message}`);
        response.status(500).json({
            success: false,
            message: "An error occurred while fetching payment records",
            payments: [] // Return empty array for consistency
        });
    }
};

export const updateMember = async (request, response) => {
  try {
    // Extract the token from cookies
    const { memberType, memberID,role } = request.body; // Extract position and memberType

console.log("update")
    // Find member by memberID
    const member = await Member.findOne({ memberID });

    // If no member was found, return 404
    if (!memberID) {
      return response.status(404).json({
        success: false,
        message: "Member not found or unauthorized",
      });
    }

    // Add new member type to the array if not already included
    if (!member.memberType) {
      // If memberType doesn't exist, initialize as array
      member.memberType = [memberType];
    } else if (Array.isArray(member.memberType)) {
      // If already an array and doesn't include the new type, add it
      if (!member.memberType.includes(memberType)) {
        member.memberType.push(memberType);
      }
    } else {
      // If it's a single value, convert to array
      member.memberType = [member.memberType];
      // Add new type if different
      if (member.memberType[0] !== memberType) {
        member.memberType.push(memberType);
      }
    }

    // Save the updates
    await member.save();

    const spot = request.body.spot;
    // Create a new GoldenSeatOwner document
    const createGoldenSeats = new GoldenSeatOwner({
      userId: memberID,
      position:memberType,
      spot: role,
    });

    // Save the new GoldenSeatOwner document
    await createGoldenSeats.save();
      

    const result = await Payment.findOneAndDelete({memberID:memberID});
     if (!result) {
            return res.status(404).json({ 
                success: false, 
                message: 'Payment not found' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Payment deleted successfully',
            deletedPayment: result // Optional: return deleted data
        });
    // Success response
    return response.status(200).json({
      success: true,
      message: "Member updated successfully",
      member,
    });
  } catch (error) {
    console.error(`Error updating member: ${error.message}`);
    return response.status(500).json({
      success: false,
      message: "An error occurred while updating the member",
    });
  }
};
export const deleteMember = async (request, response) => {
  try {
    // Check if user exists and is authenticated
    const user = await User.findById(request.userId);
    if (!user) {
      return response.status(401).json({
        success: false,
        message: "User not found or unauthorized",
      });
    }

    const member = await Member.findOneAndDelete({
      memberID: request.params.memberID,
      userId: request.userId,
    });

    if (!member) {
      return response.status(404).json({
        success: false,
        message: "Member not found or unauthorized",
      });
    }

    response.status(200).json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (error) {
    console.error(`Error deleting member: ${error.message}`);
    response.status(500).json({
      success: false,
      message: "An error occurred while deleting member",
    });
  }
};

export const getMembersByType = async (request, response) => {
  try {
    const members = await Member.find({
      memberType: request.params.memberType,
      userId: request.userId,
    });

    response.status(200).json({
      success: true,
      members,
    });
  } catch (error) {
    console.error(`Error fetching members by type: ${error.message}`);
    response.status(500).json({
      success: false,
      message: "An error occurred while fetching members",
    });
  }
};

// export const searchMembers = async (request, response) => {
//     try {
//         const { query } = request.query;

//         const members = await Member.find({
//             userId: request.userId,
//             $or: [
//                 { memberID: { $regex: query, $options: 'i' } },
//                 { province: { $regex: query, $options: 'i' } },
//                 { city: { $regex: query, $options: 'i' } },
//                 { barangay: { $regex: query, $options: 'i' } }
//             ]
//         });

//         response.status(200).json({
//             success: true,
//             members
//         });
//     } catch (error) {
//         console.error(`Error searching members: ${error.message}`);
//         response.status(500).json({
//             success: false,
//             message: "An error occurred while searching members"
//         });
//     }
// };
export const memberReferral = async (request, response) => {
  try {
    const { referralCode } = request.params;
    const member = await Member.findOne({ referralCode });
    if (!member) {
      return response.status(404).json({
        success: false,
        message: "Member not found",
      });
    }
    response.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    console.error(`Error fetching member by referral code: ${error.message}`);
    response.status(500).json({
      success: false,
      message: "An error occurred while fetching member",
    });
  }
};
export const upgradePackage = async (req, res) => {
  const response = await axios.post(
    import.meta.env.VITE_API_URL + "/api/paymongo/create-payment",
    {
      amount: amount,
      description: seat.title,
      name: "Customer Name", // Optional, add real customer data if needed
      email: "customer@example.com", // Optional
      phone: "09123456789", // Optional
    }
  );

  if (response.data.success) {
    setPaymentUrl(response.data.checkoutUrl); // Set the URL to redirect the user to PayMongo
    localStorage.setItem(
      "memberGoldenSeat",
      JSON.stringify({
        GoldenSeat: "success",
        name: selectedSeat.title,
      })
    );
    window.location.href = response.data.checkoutUrl; // Redirect to PayMongo checkout
  } else {
    setError("Failed to create payment, please try again.");
  }
}
export const createPackage = async (req, res) => {
  try {

    const { memberType, memberID } = req.body;
         const notification = new Notification({
          userId:memberID, // Assuming costumerId is the user ID to notify
          title: 'Membership ' +memberType+' Approved',
          message: 'Membership ' +memberType+' upgrade Approved by the admin, thank you!',
          isRead: false,
          metadata: {
            status: "pending",
            updatedAt: new Date(),
            previousStatus: "pending" // Track previous status for history
          },
          actionUrl: `/member`,
          priority: ['pending'].includes("pending") ? 2 : 1
        });
        await notification.save();

    if (!memberType) {
      return res.status(400).json({ success: false, message: 'Package name is required' });
    }

    // Find the member by memberID
    const member = await Member.findOne({ memberID });
    
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Update member's package/type based on the purchase
    if (!member.memberType.includes(memberType)) {
      member.memberType.push(memberType);
      
      // You might want to update other fields based on the package
      // For example, updating memberStatus or paymentType
      
      // Save the updated member
      await member.save();
          const result = await Payment.findOneAndDelete({memberID:memberID});
      // Return success response
      return res.status(200).json({
        success: true,
        message: 'Package upgraded successfully',
        data: {
          memberID: member.memberID,
          memberType: member.memberType
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Member already has this package'
      });
    }
  } catch (error) {
    console.error('Error upgrading package:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }

  };

export const getReapers = async (req, res) => {
  try {
    const { reaper } = req.body;

    // Find member by referralCode and only return the memberType array
    const member = await Member.findOne(
      { referralCode: reaper },
      { memberType: 1, _id: 0 } // Projection: only include memberType
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
        memberType: [] // Return empty array
      });
    }

    // Ensure memberType exists and is an array
    const memberTypeArray = Array.isArray(member.memberType) 
      ? member.memberType 
      : [];

    res.status(200).json({
      success: true,
      memberType: memberTypeArray,
      count: memberTypeArray.length
    });

  } catch (error) {
    console.error("Error fetching reapers:", error);
    res.status(500).json({ 
      success: false,
      memberType: [], // Always return array even on error
      message: "Server error while fetching reapers",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const createPayment = async (request, response) => {
  try {
    
    // Fix: Extract data from request.body correctly
    const {
      memberID, // Remove `: decoded` - this was wrong
      referralCode,
      memberType,
      addressNo,
      province,
      city,
      barangay,
      region,
      country,
      userType = "Member",
      role = 'sower',
      memberStatus = "Pending",
      paymentType,
      referredBy,
      memberDate,
      productImage = "",
      paymentMethod,
      transactionDate = new Date(),
    } = request.body;

    // Validation: Check required fields
    if (!memberID || !memberType || !paymentType) {
      return response.status(400).json({
        success: false,
        message: "Missing required fields: memberID, memberType, or paymentType",
      });
    }

    // Create new payment document
    const savedMember = new Payment({
      memberID,
      referralCode,
      memberType,
      addressNo,
      region,
      province,
      city,
      barangay,
      userType,
      role,
      memberStatus,
      paymentType,
      referredBy,
      memberDate,
      paymentMethod, // Add missing fields if needed
      transactionDate,
      productImage,
      country,
    });

    // Fix: Use await to save the document
    const result = await savedMember.save();
  
    // Return success response
    return response.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: result,
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      return response.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message),
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return response.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    return response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const approvWithdraw = async (request, response) => {
  try {
    // Log request body for debugging
    console.log(request.body);
    
    const {
      id,
      withdrawalId,
      amount,
      paymentMethod,
    } = request.body;

    // Validate required fields
    if (!withdrawalId || !amount || !paymentMethod) {
      return response.status(400).json({
        success: false,
        message: 'Missing required fields: withdrawalId, amount, or paymentMethod'
      });
    }

    const DiamondTransactionId = `WTA${Date.now()}${Math.floor(
      Math.random() * 1000
    )}`;

    const transactionDate = new Date();

    // Create new member transaction
    const newMemberTransaction = new MemberTransaction({
      memberId: withdrawalId,
      transactionId: DiamondTransactionId,
      productName: `Withdrawal`,
      quantity: 1,
      price: -amount,
      total: -amount,
      paymentMethod,
      transactionDate,
    });

    await newMemberTransaction.save();
         const notification = new Notification({
          userId:withdrawalId, // Assuming costumerId is the user ID to notify
          title: 'Withdrawal',
          message: 'Withdrawal for' +amount+' has been Approved by the admin, thank you!',
          isRead: false,
          metadata: {
            status: "pending",
            updatedAt: new Date(),
            previousStatus: "pending" // Track previous status for history
          },
          actionUrl: `/member`,
          priority: ['pending'].includes("pending") ? 2 : 1
        });
        await notification.save();
    // Update withdrawal status
    const updateWithdrawal = await Withdraw.findOneAndUpdate(
      { _id: id }, // Fixed: Use _id instead of memberID
      { status: 'Approved' },
      { new: true }
    );

    // Check if withdrawal was found and updated
    if (!updateWithdrawal) {
      return response.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
    }
    const deletewithdraw = await Withdraw.findOneAndDelete(
      { _id: id }
    )
    // Send success response
    return response.status(200).json({
      success: true,
      message: 'Withdrawal approved successfully',
      data: {
        transaction: newMemberTransaction,
        withdrawal: updateWithdrawal
      }
    });

  } catch (error) {
    console.error('Error approving withdrawal:', error);
    return response.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
export const rejectWithdraw = async (request, response) => {
  try {
    // Log request body for debugging
    console.log(request.body);
    
    const {
      id,
      withdrawalId,
      amount,
      paymentMethod,
    } = request.body;

    // Validate required fields
    if (!withdrawalId || !amount || !paymentMethod) {
      return response.status(400).json({
        success: false,
        message: 'Missing required fields: withdrawalId, amount, or paymentMethod'
      });
    }


         const notification = new Notification({
          userId:withdrawalId, // Assuming costumerId is the user ID to notify
          title: 'Withdrawal',
          message: 'Withdrawal for ' +amount+' has been Rejected by the admin, please contact our admin immediately thank you!',
          isRead: false,
          metadata: {
            status: "pending",
            updatedAt: new Date(),
            previousStatus: "pending" // Track previous status for history
          },
          actionUrl: `/member`,
          priority: ['pending'].includes("pending") ? 2 : 1
        });
        await notification.save();
    // Update withdrawal status
    const updateWithdrawal = await Withdraw.findOneAndUpdate(
      { _id: id }, // Fixed: Use _id instead of memberID
      { status: 'Rejected' },
      { new: true }
    );
    const deletewithdraw = await Withdraw.findOneAndDelete(
      { _id: id }
    )
    // Check if withdrawal was found and updated
    if (!updateWithdrawal) {
      return response.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
    }

    // Send success response
    return response.status(200).json({
      success: true,
      message: 'Withdrawal approved successfully',
      data: {
        withdrawal: updateWithdrawal
      }
    });

  } catch (error) {
    console.error('Error approving withdrawal:', error);
    return response.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
export const declineMembership = async (request, response) => {   
  try {     
    // Log request body for debugging     
    console.log(request.body);     
    const { memberId,userId } = request.body;
    
    // Check if memberId is provided
    if (!memberId) {
      return response.status(400).json({
        success: false,
        message: 'Member ID is required'
      });
    }
    
    // Execute the delete operation and await it
    const deleteMemberApproval = await Payment.findByIdAndDelete(memberId);
    
    // Check if the document was found and deleted
    if (!deleteMemberApproval) {
      return response.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
     const notification = new Notification({
          userId, // Assuming costumerId is the user ID to notify
          title: `Membership Declined`,
          message: 'Your membership declined due to not enough proof',
          isRead: false,
          metadata: {
            status: "pending",
            updatedAt: new Date(),
            previousStatus: "pending" // Track previous status for history
          },
          actionUrl: `/`,
          priority: ['pending'].includes("pending") ? 2 : 1
        });
        await notification.save();
    
    // Return success response
    return response.status(200).json({
      success: true,
      message: 'Membership declined successfully',
      data: deleteMemberApproval
    });
    
  } catch (error) {     
    console.error('Error decline membership:', error);     
    return response.status(500).json({       
      success: false,       
      message: 'Internal server error',       
      error: error.message     
    });   
  } 
};