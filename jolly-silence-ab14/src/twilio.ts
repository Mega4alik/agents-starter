

import axios from "axios";
//import twilio from "twilio";
import * as Twilio from 'twilio';

import {accountSid, authToken} from "./config";
const twilioPhoneNumber = "+12722055617";
const recipientPhoneNumber = "+77779537464";

const client = Twilio(accountSid, authToken);

export async function sendSMS(to: string, otp: string): void {
  try {
    const response = await axios.get("http://localhost:3104/zendesk/tickets/add", {
      params: {
        userId: 123,
        amount: "2.5",
      },
      headers:{
        
      }
    });

    console.log("Response Data:", response.data);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const message = await client.messages.create({
      body: `Ваш код для верификации ${verificationCode}`,
      from: twilioPhoneNumber,
      to: recipientPhoneNumber,
    });

    console.log("SMS отправлен:", message.sid);
  } catch (error) {
    console.error("Error:", error);
  }
}


