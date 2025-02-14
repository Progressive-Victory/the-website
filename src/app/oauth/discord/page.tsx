
'use client'
import { redirect, useSearchParams } from 'next/navigation'
import { useRouter } from "next/router";
import { getauth } from '../../../api/oauth/discord';

import dotenv from 'dotenv'; 

import App from 'next/app';
dotenv.config();  // Load environment variables from .env file 
const apiKey = process.env.OAUTH_DISCORD_APPID;  
const AppId = process.env.OAUTH_DISCORD_APPID;
const secret = process.env.OAUTH_DISCORD_CLIENT_SECRET
export default function Home() {
  const searchParams = useSearchParams();
    let property1 : string = searchParams.get("code")!
    const handleClick = async() => {
        const endpointData = await getauth(property1)
        console.log(endpointData);
    }


  

    // const parameter1 = query.postName;
    // const parameter2 = query.postId;
  return (
    <div className="bg-steel-blue w-full">

      <div>
        <div className="bg-[#D4E6F5] p-10">
          <h2 className="text-4xl font-bold text-center p-10">Account</h2>
          
        </div>

      
        <button onClick={()=>handleClick()}>"{property1}"</button>
          
          



        
      </div>
      
    </div>
  );
}

// function getData(code:string) {
//   let data = getauth(code)

// }
