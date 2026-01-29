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


export function getEnabledTools() {
    const tools: Record<string, any> = {};

    try{
        for(const toolConfig of availableTools){
            if(toolConfig.enabled){
                tools[toolConfig.id] = toolConfig.getTool();
            }
        }
        if(Object.keys(tools).length>0){
            console.log(chalk.gray(`[DEBUG] Enabled tools: ${Object.keys(tools).join(", ")}`));
        }
        else{
            console.log(chalk.yellow(`[DEBUG] No tools enabled.`));
        }
        return Object.keys(tools).length > 0 ? tools : undefined;
    }
    catch(error){
        console.log(chalk.red(`[ERROR] Failed to initialize tools: ${(error as Error).message}`));
        console.log(chalk.yellow(`Make sure you have @ai-sdk/google installed and properly configured.`));
        console.log(chalk.yellow(`RUN: npm install @ai-sdk/google@latest`));
        return undefined;
    }
}


export function toogleTool(toolId: string){
    const tool = availableTools.find(t=>t.id===toolId);
    if(tool){
        tool.enabled = !tool.enabled;
        console.log(chalk.green(`[INFO] Tool "${tool.name}" is now ${tool.enabled ? "enabled" : "disabled"}.`));
        return tool.enabled;
    }
    console.log(chalk.red(`[ERROR] Tool with ID "${toolId}" not found.`));
    return false;
}


export function enableTools(toolIds: string[]){
    console.log(chalk.gray(`[DEBUG] enableTools called with: ${toolIds.join(", ")}`));
    availableTools.forEach(tool=>{
        const wasEnabled = tool.enabled;
        tool.enabled = toolIds.includes(tool.id);
        if (tool.enabled !== wasEnabled) {
            console.log(chalk.green(`[DEBUG] Tool "${tool.name}" is now ${tool.enabled ? "enabled" : "disabled"}.`));
        }
    });

    const enableCount = availableTools.filter(t=>t.enabled).length;
    console.log(chalk.green(`[DEBUG] Total enabled tools: ${enableCount}/${availableTools.length}`));
}

export function getEnabledToolNames(){
    const names = availableTools.filter(t=>t.enabled).map(t=>t.name);
    console.log(chalk.gray(`[DEBUG] getEnabledToolNames: ${names.join(", ")}`));
    return names;
}

export function resetTools(){
    availableTools.forEach(tool=>{
        tool.enabled = false;
    });
    console.log(chalk.green(`[INFO] All tools have been reset to disabled.`));
}