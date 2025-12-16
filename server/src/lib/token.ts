import fs from "fs/promises";
import chalk from "chalk";

import { TOKEN_FILE, CONFIG_DIR } from "../cli/commands/auth/login";

// to get token
export async function getStoredToken() {
  try {
    const data = await fs.readFile(TOKEN_FILE, "utf-8");
    const token = JSON.parse(data);
    return token;
  } catch (error) {
    // file does not exist
    return null;
  }
}

// to store token
export async function storeToken(token: any) {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });

    const tokenData = {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      token_type: token.token_type,
      scope: token.scope,
      expires_at: token.expires_in
        ? new Date(Date.now() + token.expires_in * 1000).toISOString()
        : null,
      created_at: new Date().toISOString(),
    };

    await fs.writeFile(TOKEN_FILE, JSON.stringify(tokenData, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error(chalk.red("Failed to store token:"), error);
    return false;
  }
}

// to clear token
export async function clearStoreToken() {
  try {
    await fs.unlink(TOKEN_FILE);
    return true;
  } catch (error) {
    console.error(chalk.red("Failed to clear token:"), error);
    return false;
  }
}

// to check token expiry
export async function isTokenExpire() {
  const token = await getStoredToken();
  if (!token || !token.expires_at) {
    return true;
  }

  const expiresAt = new Date(token.expires_at);
  const now = new Date();

  // 5 minutes buffer 
  return expiresAt.getTime() - now.getTime() < 5 * 60 * 1000;
}


// to check authentication
export async function requireAuth(){
    const token = await getStoredToken();
    if (!token) {
        console.error(chalk.red("❌ Not authenticated. Please run 'eclipse login' to login first."));
        process.exit(1);
    }

    if (await isTokenExpire()) {
        console.error(chalk.yellow("⚠️ Your session has expired. Please login again."));
        process.exit(1);
    }

    return token;
}