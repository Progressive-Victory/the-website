import BlogCard from "@/components/BlogCard";
import { Header } from "@/components/Header";
// import BlogHeader from "./BlogHeader";
import { Logo } from "../../components/Logo";
import { redirect } from 'next/navigation'


import dotenv from 'dotenv';
dotenv.config();

import Link from "next/link";
import { MainLayout } from "@/components/MainLayout";
import { Footer } from "@/components/Footer";

export default function Home() {

    return (
      <div className="bg-steel-blue w-full">
        <Header />
        <div>
          <div className="bg-[#D4E6F5] p-10">
            <h2 className="text-4xl font-bold text-center p-10">Login</h2>
            
            
          </div>
          <DiscordButton></DiscordButton>
        </div>
        
        <Footer />
      </div>
    );
  
  
}



export function DiscordButton() {
  const ID = process.env.OAUTH_DISCORD_APPID!;  
    const secret = process.env.OAUTH_DISCORD_CLIENT_SECRET!
    const host = process.env.HOST!
    // const discordauthpath:string  = `https://discord.com/oauth2/authorize?client_id=${ ID }&response_type=code&redirect_uri=http%3A%2F%2F${ ip }%3A3000%2Foauth%2Fdiscord%2F&scope=identify+email`
    // const redirect_uri
  return (
      <div  style={{display: "flex",flexDirection: "column", width: "130%", height:"30%"}}>
        <Link href={{
        pathname: 'https://discord.com/oauth2/authorize',
        query: { client_id: ID , 
          response_type : "code", 
          redirect_uri: `http://${host}/oauth/discord/`, 
          scope: "identify"


        },
      }}>
        <img width="30%"  src="images/discord-logo-blue.svg"></img>
        </Link>

      
      </div>
  )

}

