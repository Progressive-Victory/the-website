'use server'



import dotenv from 'dotenv'; 


export async function getauth(code:string) {
  // var code = request.query["code"]
    console.log("code")
    dotenv.config();  // Load environment variables from .env file 
    const apiKey = process.env.OAUTH_DISCORD_APPID!;  
    const secret = process.env.OAUTH_DISCORD_CLIENT_SECRET!
    const ip = process.env.IP_ADDRESS!
    var RETURN_VARS = {}
    var params = new URLSearchParams()
    params.append("client_id", apiKey)
    params.append("client_secret",secret)
    params.append("grant_type", "authorization_code")
    params.append("code", code)
    params.append("redirect_uri",`http://${ip}:3000/oauth/discord`)
    console.log("params == ", params.toString());
    fetch(`https://discord.com/api/oauth2/token`, {
      method: "POST",
      body: params
    })
    .then(res => res.json())
    .then(json => {
        console.log("access token === " , json.access_token);
        const heads = {Authorization: `Bearer ${json.access_token}`}


        fetch(`https://discordapp.com/api/users/@me`, {headers:heads}).then(res2 => res2.json()).then(json2 => {
            // console.log(json2)
            console.log("JSON2" , json2);
            // redirect("/blog/")
            // response.send(JSON.stringify(json2));
            RETURN_VARS = json2;

        })
    })
    return RETURN_VARS
  }