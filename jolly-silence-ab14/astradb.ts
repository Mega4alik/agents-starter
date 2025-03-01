
import {ASTRA_CLIENT_SECRET, ASTRA_CLIENT_TOKEN, ASTRA_DB_API_URL, ASTRA_CLIENT_ID} from "./config";
const CLIENT_SECRET = ASTRA_CLIENT_SECRET;
const TOKEN = ASTRA_CLIENT_TOKEN;
const NAMESPACE = "default_keyspace"; //"hack1";
const COLLECTION = "collection1_nvidia_emb"; // Replace with your collection name


/*
//import fetch from "node-fetch";
async function queryCollection() {
  const url = `${ASTRA_DB_API_URL}/api/rest/v2/namespaces/${NAMESPACE}/collections/${COLLECTION}`;
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Cassandra-Token": TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    console.log("Query Result:", data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

queryCollection();
*/


import { DataAPIClient } from "@datastax/astra-db-ts";

// Initialize the client
const client = new DataAPIClient(ASTRA_CLIENT_TOKEN);
const db = client.db('https://f722fd26-2185-4cc8-9c80-f9b688941ccd-us-east-2.apps.astra.datastax.com');

(async () => {
  const colls = await db.listCollections();
  console.log('Connected to AstraDB:', colls, NAMESPACE, COLLECTION);
    const collection = db.collection(  NAMESPACE, COLLECTION);
    //const documents = await collection.find({});

    var userQuestion = 'How does your company handle mobile number portability for large organizations';
    const query = {question: userQuestion};
    const topChunks = await collection.find(query, {
      limit: 5,  // Limit results to 5 documents (top 5 chunks)
      sort: { relevanceScore: -1 }  // Sort by relevance score (assuming you have a relevanceScore field)
    });


    topChunks.forEach((chunk: any) => {
      console.log('Text Content:', chunk.text);  // .data.text Assuming the text field is called "text"
      // If your field is named differently, replace "text" with the correct field name
    });
    
})();



