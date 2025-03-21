/**
 * Tool definitions for the AI chat agent
 * Tools can either require human confirmation or execute automatically
 */
import { tool } from "ai";
import { z } from "zod";
import { agentContext } from "./server";
import  axios  from "axios";
import {ZENDESK_TOKEN, accountSid, authToken} from "./config";

// Twilio 
//import { sendSMS } from "./twilio"; // Import function
const twilioNumber = "+12722055617";

async function sendOTP(to: string, otp: string): Promise<void> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const data = new URLSearchParams();
  data.append("Body", `Your verification code is ${otp}`);
  data.append("From", twilioNumber);
  data.append("To", to);

  try {
    const response = await axios.post(url, data, {
      auth: {
        username: accountSid,
        password: authToken,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    console.log(`OTP sent! Message SID: ${response.data.sid}, code: ${otp}`);

  } catch (error) {
    console.error("Failed to send OTP:", error.response?.data || error.message);
  }
  return true;
} 




async function createPaymentLink(): Promise<any> {
  try {
    const response = await axios.get("http://localhost:3104/api/generate_payment_link", {
      params: {
        userId: 123,
        amount:"2.5"
      },
    });
    console.log("Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}


async function zendeskCreateTicket(params): Promise<any>{
  try {
    const response = await axios.get("http://localhost:3104/zendesk/tickets/add", {
      params: params,
      headers: {"username": "erasyl@webapi.ai", "token": ZENDESK_TOKEN, "remoteUri": "https://eradevsupport.zendesk.com/api/v2"}
    });
    console.log("Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}


/**
 * Weather information tool that requires human confirmation
 * When invoked, this will present a confirmation dialog to the user
 * The actual implementation is in the executions object below
 */
const getWeatherInformation = tool({
  description: "show the weather in a given city to the user",
  parameters: z.object({ city: z.string() }),
  // Omitting execute function makes this tool require human confirmation
});

/**
 * Local time tool that executes automatically
 * Since it includes an execute function, it will run without user confirmation
 * This is suitable for low-risk operations that don't need oversight
 */
const getLocalTime = tool({
  description: "get the local time for a specified location",
  parameters: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    console.log(`Getting local time for ${location}`);
    return "10am";
  },
});


/*
const getOrderDetails = tool({
  description: "Get latest order details, make sure to authorize user first",
  parameters: z.object({ code: z.string() }),
  execute: async ({ code }) => {
    console.log(`getOrderDetails.provided code: ${code}`);
    return "#223 timo boll rocket expected to be delievered at 10pm";
  },
}); */


const createTicket = tool({
  description: "Proceed and create a ticket only if balance is positive and user is already authorized",
  parameters: z.object({ phone: z.string(), address: z.string(), problem_description: z.string()}),
  execute: async ({ phone, address, problem_description }) => {
    var name = 'Anuar Sharafudinov'; //preauthorized
    var params = {name:name, phone:phone, address:address, problem_description:problem_description};
    console.log("Creating a ticket..", params);    
    zendeskCreateTicket(params);
    return "Ticket created";
  },
});


const checkBalance = tool({
  description: "Check balance once authorized",
  parameters: z.object({ code: z.string() }),
  execute: async ({ code }) => {
    console.log(`checkBalance. code: ${code}`);
    if (code == 4444){
      const data = await createPaymentLink();
      console.log("checkBalance.data:", data);
      return "Pay your amount here - "+data.url;
    }
    else return "You have a positive balance. Would you like to proceed?";
  },
});


const Authorize = tool({
  description: "for all user related questions/issues, authorize the user by phone number first. Only ask phone number, no more questions before authorized.",
  parameters: z.object({ phone: z.string() }) ,
  execute: async ({ phone }) => {
    console.log(`user phone: ${phone}`);
    sendOTP(phone, "2244");    
    return "We sent you a code, please provide it";
  },
});

const scheduleTask = tool({
  description:
    "schedule a task to be executed at a later time. 'when' can be a date, a delay in seconds, or a cron pattern.",
  parameters: z.object({
    type: z.enum(["scheduled", "delayed", "cron"]),
    when: z.union([z.number(), z.string()]),
    payload: z.string(),
  }),
  execute: async ({ type, when, payload }) => {
    // we can now read the agent context from the ALS store
    const agent = agentContext.getStore();
    if (!agent) {
      throw new Error("No agent found");
    }
    try {
      agent.schedule(
        type === "scheduled"
          ? new Date(when) // scheduled
          : type === "delayed"
          ? when // delayed
          : when, // cron
        "executeTask",
        payload
      );
    } catch (error) {
      console.error("error scheduling task", error);
      return `Error scheduling task: ${error}`;
    }
    return `Task scheduled for ${when}`;
  },
});
/**
 * Export all available tools
 * These will be provided to the AI model to describe available capabilities
 */
export const tools = {
  //getWeatherInformation,
  //getLocalTime,
  //scheduleTask,  
  Authorize,
  checkBalance,
  createTicket,
};

/**
 * Implementation of confirmation-required tools
 * This object contains the actual logic for tools that need human approval
 * Each function here corresponds to a tool above that doesn't have an execute function
 */

export const executions = {
  getWeatherInformation: async ({ city }: { city: string }) => {
    console.log(`Getting weather information for ${city}`);
    return `The weather in ${city} is sunny`;
  },
};
