"use client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import GitHubHeatmap from "@/components/GitHubHeatmap";

export default function HomePage() {
  const router = useRouter();
  const {data , isPending} = authClient.useSession();

  if(isPending){
    return (
      <div>
        <Spinner />
      </div>
    )
  }

  if(!data?.session && !data?.user){
    router.replace("/signin");
  }

  return (
  // <div>
  //   <div>{data?.user.image}</div>
  //   <div>{data?.user.email}</div>
  //   <div>{data?.user.emailVerified}</div>
  //   <div>{data?.user.id}</div>
  //   <div>{data?.user.name}</div>
  //   <Button onClick={
  //     ()=>{
  //       authClient.signOut({
  //         fetchOptions:{
  //           onError: (ctx) => console.log(ctx),
  //           onSuccess: (ctx) => router.push("/signin")
  //         }
  //       });
  //     }
  //   }></Button>
  // </div>
  <div className=" w-screen min-h-screen bg-black flex text-white ">
    <div>

    </div>
    <div>
      <GitHubHeatmap username={"tusharchauhan09"} />
    </div>
  </div>
  );
}
