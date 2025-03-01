/**
 * Tool definitions for the AI chat agent
 * Tools can either require human confirmation or execute automatically
 */
import { tool } from "ai";
import { z } from "zod";

import { agentContext } from "./server";


import  axios  from "axios";
async function fetchData() {
  try {
    const response = await axios.get("http://localhost:3104/api/generate_payment_link", {
      params: {
        userId: 123,
        amount:"2.5"
      },
    });

    console.log("Response Data:", response.data);
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
  description: "Proceed and create a ticket only if balance is positive",
  parameters: z.object({ address: z.string(), problem_description: z.string()}),
  execute: async ({ address, problem_description }) => {
    console.log(`createTicket: ${address}, ${problem_description}`);
    return "Ticket created";
  },
});


const checkBalance = tool({
  description: "Check balance once authorized",
  parameters: z.object({ code: z.string() }),
  execute: async ({ code }) => {
    console.log(`checkBalance. code: ${code}`);
    return "You have a positive balance. Would you like to proceed?";
  },
});


const Authorize = tool({
  description: "for all user related actions, authorize the user by phone number first",
  parameters: z.object({ phone: z.string() }) ,
  execute: async ({ phone }) => {
    console.log(`user phone: ${phone}`);    
    fetchData();
    //need to send a code
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
