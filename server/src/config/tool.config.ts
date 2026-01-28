import { tool } from 'ai';
import { google } from "@ai-sdk/google";
import chalk from "chalk";
export const availableTools = [
    {
        id:"google-search",
        name:"Google Search",
        description:"Access the latest information from the web using Google Search. Useful for answering questions about current events or finding specific information online.",
        getTool: ()=>google.tools.googleSearch({}),
        enabled: false
    },
];


// export function getEnabledTools() {
//     const tools = {};

//     try{
//         for(const toolConfig of availableTools){

//         }
//     }
// }