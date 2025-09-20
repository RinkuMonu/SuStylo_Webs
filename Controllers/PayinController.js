import axios from "axios";
import PayIn from "../Models/PayinModel.js";
import Wallet from "../Models/WalletModel.js";
import mongoose from "mongoose";

const payIn = async (req, res) => {
  try {
    const { amount, reference, name, mobile, email, userId, description } = req.body;

    if (!amount || !reference || !name || !mobile || !email || !userId) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const finalAmount = Number(amount);
    if (isNaN(finalAmount)) {
      return res.status(400).json({ success: false, message: "Amount must be a number" });
    }

    // Call WorldPay API
    const payInData = await axios.post(
      "https://api.worldpayme.com/api/v1.1/createUpiIntent",
       {
    amount: finalAmount, // send in rupees
    reference,
    name,
    email,
    mobile,
    currency: "INR",
    callbackUrl: "https://yourdomain.com/api/payIn/callback"
  },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.WORLDPAY_TOKEN}`, // move token to .env
        },
      }
    );

    // Save transaction as Pending
    const newPayIn = new PayIn({
      userId: new mongoose.Types.ObjectId(userId),
      amount: finalAmount,
      reference,
      name,
      mobile,
      email,
      description: description || "Top up transaction",
      status: "Pending",
    });
    await newPayIn.save();

    return res.status(200).json({
      success: true,
      data: payInData.data,
      message: "PayIn intent created successfully. Awaiting callback.",
    });

  } catch (error) {
    console.error("WorldPay Error:", error.response?.data || error.message);
    return res.status(400).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

const callbackPayIn = async (req, res) => {
    try {
        const data = req.body;
        const payin = await PayIn.findOne({ reference: data.reference });
        if (!payin) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        if (data.status === "Success") {
            const userWallet = await Wallet.findOne({ user: payin.userId });
            payin.status = "Approved";
            payin.utr = data.utr;
            await payin.save();
            userWallet.balance += payin.amount;
            await userWallet.save();
            return res.status(200).json({ message: "PayIn successful", payin });
        }
        payin.status = "Failed";
        await payin.save();
        return res.status(400).json({ message: "Payment Failed", payin });
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const getPayInRes = async (req, res) => {
    const { reference } = req.query;
    const payin = await PayIn.findOne({ reference });
    if (!payin) {
        return res.status(404).send("No data found");
    }
    return res.status(200).send(payin);
}

const payInReportAllUsers = async (req, res) => {
    try {
        const { userId, startDate, endDate, status, paymentGateway } = req.query;

        let filter = {};

        if (userId) {
            filter.userId = new mongoose.Types.ObjectId(userId);
        }
        if (status) {
            filter.status = status;
        }
        if (paymentGateway) {
            filter.paymentGateway = paymentGateway;
        }
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const payIns = await PayIn.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    "userDetails.name": 1,
                    "userDetails.email": 1,
                    amount: 1,
                    reference: 1,
                    paymentGateway: 1,
                    paymentMode: 1,
                    status: 1,
                    description: 1,
                    utr: 1,
                    createdAt: 1,
                },
            },
            { $sort: { createdAt: -1 } },
        ]);

        return res.status(200).json({ success: true, data: payIns });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

export { payIn, callbackPayIn, getPayInRes, payInReportAllUsers };