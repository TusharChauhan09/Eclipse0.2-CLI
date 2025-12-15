"use client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import GitHubHeatmap from "@/components/GitHubHeatmap";

export default function HomePage() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  if (!data?.session && !data?.user) {
    router.replace("/signin");
  }

  return (
    <div className=" w-full min-h-screen flex flex-col  bg-black text-white ">
      <div className=" min-h-4 flex justify-between my-2 mx-2 border rounded-md py-1 px-2">
        <div></div>
        <Button
          className="border"
          onClick={() => {
            authClient.signOut({
              fetchOptions: {
                onError: (ctx) => console.log(ctx),
                onSuccess: (ctx) => router.push("/signin"),
              },
            });
          }}
        >
          sigin out
        </Button>
      </div>
      <div className=" w-full min-h-40 flex justify-center items-center gap-x-5">
        <div >
          {/* @ts-ignore */}
          <img src={data?.user.image} alt="user-image" className="size-30 rounded-full " />
        </div>
        <div className="flex flex-col p-4 ">
          <div>{data?.user.name}</div>
          <GitHubHeatmap username={"tusharchauhan09"} />
          {/* <div>{data?.user.email}</div> */}
        </div>
      </div>
      <div>
        
      </div>
    </div>
  );
}
