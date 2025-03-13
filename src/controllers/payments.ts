import { Request, Response } from 'express';
import { prisma } from '../conn/connection';
import express from "express";
import axios from "axios";
import moment from "moment";

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany();
    res.status(200).json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};




export async function payMpesa(req: express.Request, res: express.Response) {
  if (req.method !== "POST") {
     res.status(405).json({ error: "Method not allowed" });
     return;
  }

  try {
    const { userId, phoneNumber, amount } = req.body;
console.log(req.body, "payments")
    if (!userId || !phoneNumber || !amount ) {
       res.status(400).json({ error: "Missing required fields" });
       return;
    }

    // Get access token
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
    const { data: tokenResponse } = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` },
    });
    const accessToken = (tokenResponse as { access_token: string }).access_token;

    // Generate timestamp
    const timestamp = moment().format("YYYYMMDDHHmmss");

    // Generate password
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString("base64");

    

    interface StkPushResponse {
        CheckoutRequestID: string;
        // Add other properties that the response may contain
      }
try {
  console.log("Sending STK Push request...................................");

    const stkPushResponse = await axios.post<StkPushResponse>(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {
          BusinessShortCode: process.env.MPESA_SHORTCODE, // Recipient (Business)
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: phoneNumber, // Payer (User's phone number)
          PartyB: process.env.MPESA_SHORTCODE, // Recipient (Your Paybill/Till Number)
          PhoneNumber: phoneNumber,
          CallBackURL: process.env.MPESA_CALLBACK_URL,
          AccountReference: `User-${userId}`,
          TransactionDesc: "Payment for service",
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      console.log("Callback URL:", process.env.MPESA_CALLBACK_URL);
      console.log("STK Push Response:", stkPushResponse.data);

    // Store payment request in database
    const payment = await prisma.payment.create({
      data: {
        userId,
        //bookingServiceId,
        amount,
        paymentMethod: "M-Pesa",
        paymentStatus: "processing",
        paymentDate: new Date(),
        transactionId: stkPushResponse.data.CheckoutRequestID, // Store STK push request ID
      },
    });

     res.status(200).json({ success: true, payment });
     return;
    }catch (error:any) {
      console.error("Error in STK Push:", error.response?.data || error.message);
       res.status(500).json({ error: "STK Push request failed" });
       return;
    }
  } catch (error) {
    console.error("M-Pesa payment error:", error);
     res.status(500).json({ error: "Internal server error" });
     return;
  }
}


export async function mpesaWebhook(
  req: express.Request,
  res: express.Response
) {
  console.log("Webhook hit!", req.method, req.body); // Log request method and body
  console.log('Request received:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
  });
  if (req.method !== "POST") {
     res.status(405).json({ error: "Method not allowed" });
     return;
  }

  try {
    const { Body } = req.body;

    if (!Body || !Body.stkCallback) {
       res.status(400).json({ error: "Invalid callback payload" });
       return;
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } =
      Body.stkCallback;

    console.log("M-Pesa Callback received:", Body.stkCallback);

    // Check if the transaction was successful
    if (ResultCode === 0) {
      const amount = CallbackMetadata.Item.find((item: any) => item.Name === "Amount")?.Value;
      const transactionId = CallbackMetadata.Item.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value;

      // Update the database
      await prisma.payment.updateMany({
        where: { transactionId: CheckoutRequestID },
        data: {
          paymentStatus: "completed",
          transactionId: transactionId, // Store Mpesa transaction ID
        },
      });

      console.log("Payment completed successfully:", transactionId);
    } else {
      // If the payment failed, update the status
      await prisma.payment.updateMany({
        where: { transactionId: CheckoutRequestID },
        data: { paymentStatus: "failed",
            failureReason: ResultDesc, 
        },
      });

      console.log("Payment failed:", ResultDesc);
    }

     res.status(200).json({ message: "Callback received successfully" });
     return;
  } catch (error) {
    console.error("Error handling M-Pesa callback:", error);
     res.status(500).json({ error: "Internal server error" });
     return;
  }
}

