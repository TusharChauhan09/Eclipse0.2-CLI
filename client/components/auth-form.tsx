import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

import { Button } from "./ui/button";

import { authClient } from "@/lib/auth-client";

const AuthForm = () => {
  return (
    <div>
      <Card className="border-dashed border">
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                className="w-full h-full"
                type="button"
                onClick={() =>
                  authClient.signIn.social({
                    provider: "github",
                    callbackURL: "http://localhost:3000",
                  })
                }
              >
                Sign in with Github
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
