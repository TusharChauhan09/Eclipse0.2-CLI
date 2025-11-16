"use client";
import AuthForm from "@/components/auth-form";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
const SignInPage = () => {
  const router = useRouter();
    const {data , isPending} = authClient.useSession();
  
    if(isPending){
      return (
        <div>
          <Spinner />
        </div>
      )
    }
  
    if(data?.session && data?.user){
      router.replace("/");
    }

  return (
    <div>
        <AuthForm />
    </div>
  )
}

export default SignInPage;
