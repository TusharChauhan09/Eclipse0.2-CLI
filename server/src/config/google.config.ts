import "dotenv/config";

export const config = {
    googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    eclipseModel: process.env.ECLIPSE_MODEL || "gemini-2.5-flash",
}