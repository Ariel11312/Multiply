
import { Withdraw } from '../models/witthdraw.js';
import { User } from '../models/user.js';

// Create a new withdrawal request
// Create a new withdrawal request
export const createWithdrawal = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    const { memberID, amount, method, accountInfo } = req.body;
        const withdrawal = new Withdraw({
      memberID,
      amount: amount, // Store the requested amount
      paymentMethod:method,
      accountNumber:accountInfo.number,
      accountName:accountInfo.name,
      status: 'Pending'
    });

    await withdrawal.save();
    // Validate required fields
    if (!memberID || !amount || !paymentMethod || !accountNumber || !accountName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate amount
    if (amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is ₱1'
      });
    }

    // Validate payment method
    const validMethods = ['GCash', 'PayMaya', 'Bank Transfer'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    // Calculate fee (5% as shown in frontend)
    const fee = amount * 0.05;
    const netAmount = amount - fee; // Net amount user receives

    // Check if user has sufficient balance (uncomment if balance checking is needed)
    // if (user.balance < amount) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Insufficient balance'
    //   });
    // }

    // Create withdrawal request

  } catch (error) {
    console.error('Create withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// // Get all withdrawals for a user
// export const getUserWithdrawals = async (req, res) => {
//   try {
//     const userIds = req.user.id;
//     const { page = 1, limit = 10, status } = req.query;

//     const query = { userIds };
//     if (status) {
//       query.status = status;
//     }

//     const withdrawals = await Withdraw.find(query)
//       .populate('userIds', 'name email')
//       .populate('processedBy', 'name email')
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await Withdraw.countDocuments(query);

//     const formattedWithdrawals = withdrawals.map(withdrawal => ({
//       id: withdrawal._id,
//       memberID: withdrawal.memberID,
//       amount: withdrawal.amount,
//       paymentMethod: withdrawal.paymentMethod,
//       accountNumber: withdrawal.accountNumber,
//       accountName: withdrawal.accountName,
//       status: withdrawal.status.toLowerCase(),
//       date: withdrawal.createdAt.toISOString().split('T')[0],
//       estimatedArrival: getEstimatedArrival(withdrawal.paymentMethod),
//       fee: withdrawal.amount * 0.05,
//       netAmount: withdrawal.amount - (withdrawal.amount * 0.05),
//       notes: withdrawal.notes,
//       processedBy: withdrawal.processedBy
//     }));

//     res.status(200).json({
//       success: true,
//       data: formattedWithdrawals,
//       pagination: {
//         current: parseInt(page),
//         total: Math.ceil(total / limit),
//         count: withdrawals.length,
//         totalRecords: total
//       }
//     });

//   } catch (error) {
//     console.error('Get user withdrawals error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get single withdrawal by ID
// export const getWithdrawalById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid withdrawal ID'
//       });
//     }

//     const withdrawal = await Withdraw.findOne({ _id: id, userId })
//       .populate('userId', 'name email')
//       .populate('processedBy', 'name email');

//     if (!withdrawal) {
//       return res.status(404).json({
//         success: false,
//         message: 'Withdrawal not found'
//       });
//     }

//     const formattedWithdrawal = {
//       id: withdrawal._id,
//       memberID: withdrawal.memberID,
//       amount: withdrawal.amount,
//       paymentMethod: withdrawal.paymentMethod,
//       accountNumber: withdrawal.accountNumber,
//       accountName: withdrawal.accountName,
//       status: withdrawal.status.toLowerCase(),
//       date: withdrawal.createdAt.toISOString().split('T')[0],
//       estimatedArrival: getEstimatedArrival(withdrawal.paymentMethod),
//       fee: withdrawal.amount * 0.05,
//       netAmount: withdrawal.amount - (withdrawal.amount * 0.05),
//       notes: withdrawal.notes,
//       processedBy: withdrawal.processedBy,
//       createdAt: withdrawal.createdAt,
//       updatedAt: withdrawal.updatedAt
//     };

//     res.status(200).json({
//       success: true,
//       data: formattedWithdrawal
//     });

//   } catch (error) {
//     console.error('Get withdrawal by ID error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Admin: Get all withdrawals
// export const getAllWithdrawals = async (req, res) => {
//   try {
//     const { page = 1, limit = 20, status, paymentMethod, memberID } = req.query;

//     const query = {};
//     if (status) query.status = status;
//     if (paymentMethod) query.paymentMethod = paymentMethod;
//     if (memberID) query.memberID = { $regex: memberID, $options: 'i' };

//     const withdrawals = await Withdraw.find(query)
//       .populate('userId', 'name email')
//       .populate('processedBy', 'name email')
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await Withdraw.countDocuments(query);

//     const formattedWithdrawals = withdrawals.map(withdrawal => ({
//       id: withdrawal._id,
//       memberID: withdrawal.memberID,
//       user: withdrawal.userId,
//       amount: withdrawal.amount,
//       paymentMethod: withdrawal.paymentMethod,
//       accountNumber: withdrawal.accountNumber,
//       accountName: withdrawal.accountName,
//       status: withdrawal.status,
//       date: withdrawal.createdAt.toISOString().split('T')[0],
//       estimatedArrival: getEstimatedArrival(withdrawal.paymentMethod),
//       fee: withdrawal.amount * 0.05,
//       netAmount: withdrawal.amount - (withdrawal.amount * 0.05),
//       notes: withdrawal.notes,
//       processedBy: withdrawal.processedBy,
//       createdAt: withdrawal.createdAt,
//       updatedAt: withdrawal.updatedAt
//     }));

//     res.status(200).json({
//       success: true,
//       data: formattedWithdrawals,
//       pagination: {
//         current: parseInt(page),
//         total: Math.ceil(total / limit),
//         count: withdrawals.length,
//         totalRecords: total
//       }
//     });

//   } catch (error) {
//     console.error('Get all withdrawals error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Admin: Update withdrawal status
// export const updateWithdrawalStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, notes } = req.body;
//     const processedBy = req.user.id; // Admin user ID

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid withdrawal ID'
//       });
//     }

//     const validStatuses = ['Pending', 'Approved', 'Completed', 'Rejected'];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status'
//       });
//     }

//     const withdrawal = await Withdraw.findById(id);
//     if (!withdrawal) {
//       return res.status(404).json({
//         success: false,
//         message: 'Withdrawal not found'
//       });
//     }

//     // Update withdrawal
//     withdrawal.status = status;
//     withdrawal.processedBy = processedBy;
//     if (notes) withdrawal.notes = notes;

//     await withdrawal.save();

//     // Populate for response
//     await withdrawal.populate('userId', 'name email');
//     await withdrawal.populate('processedBy', 'name email');

//     res.status(200).json({
//       success: true,
//       message: 'Withdrawal status updated successfully',
//       data: {
//         id: withdrawal._id,
//         memberID: withdrawal.memberID,
//         amount: withdrawal.amount,
//         paymentMethod: withdrawal.paymentMethod,
//         status: withdrawal.status,
//         notes: withdrawal.notes,
//         processedBy: withdrawal.processedBy,
//         updatedAt: withdrawal.updatedAt
//       }
//     });

//   } catch (error) {
//     console.error('Update withdrawal status error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Cancel withdrawal (only if pending)
// export const cancelWithdrawal = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid withdrawal ID'
//       });
//     }

//     const withdrawal = await Withdraw.findOne({ _id: id, userId });
//     if (!withdrawal) {
//       return res.status(404).json({
//         success: false,
//         message: 'Withdrawal not found'
//       });
//     }

//     if (withdrawal.status !== 'Pending') {
//       return res.status(400).json({
//         success: false,
//         message: 'Only pending withdrawals can be cancelled'
//       });
//     }

//     withdrawal.status = 'Rejected';
//     withdrawal.notes = 'Cancelled by user';
//     await withdrawal.save();

//     res.status(200).json({
//       success: true,
//       message: 'Withdrawal cancelled successfully'
//     });

//   } catch (error) {
//     console.error('Cancel withdrawal error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get withdrawal statistics (Admin)
// export const getWithdrawalStats = async (req, res) => {
//   try {
//     const stats = await Withdraw.aggregate([
//       {
//         $group: {
//           _id: '$status',
//           count: { $sum: 1 },
//           totalAmount: { $sum: '$amount' }
//         }
//       }
//     ]);

//     const totalWithdrawals = await Withdraw.countDocuments();
//     const totalAmount = await Withdraw.aggregate([
//       { $group: { _id: null, total: { $sum: '$amount' } } }
//     ]);

//     const monthlyStats = await Withdraw.aggregate([
//       {
//         $match: {
//           createdAt: {
//             $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
//           }
//         }
//       },
//       {
//         $group: {
//           _id: { $dayOfMonth: '$createdAt' },
//           count: { $sum: 1 },
//           amount: { $sum: '$amount' }
//         }
//       },
//       { $sort: { '_id': 1 } }
//     ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         statusBreakdown: stats,
//         totalWithdrawals,
//         totalAmount: totalAmount[0]?.total || 0,
//         monthlyStats
//       }
//     });

//   } catch (error) {
//     console.error('Get withdrawal stats error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Helper function to get estimated arrival time
// const getEstimatedArrival = (paymentMethod) => {
//   switch (paymentMethod) {
//     case 'GCash':
//       return '1-2 hours';
//     case 'PayMaya':
//       return '1-2 hours';
//     case 'Bank Transfer':
//       return '1-3 business days';
//     default:
//       return '1-3 business days';
//   }
// };