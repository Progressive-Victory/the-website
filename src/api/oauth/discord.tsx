'use server'



import dotenv from 'dotenv'; 



export async function getauth(codestr:string) {
  // var code = request.query["code"]
    console.log("code")
    dotenv.config();  // Load environment variables from .env file 
    const app_id = process.env.OAUTH_DISCORD_APPID!;  
    const secret = process.env.OAUTH_DISCORD_CLIENT_SECRET!
    const host = process.env.HOST!
    var RETURN_VARS = {}
     // params.append("client_id", apiKey)
    // params.append("client_secret",secret)
    // params.append("grant_type", "authorization_code")
    // params.append( code)
    // params.append("redirect_uri",`http://${ip}:3000/oauth/discord/`)
    // console.log("params == ", params.toString());
    // fetch(`https://discord.com/api/oauth2/token`, {
    //   method: "POST",
    //   body: params
    // })
    const body = new URLSearchParams({
      client_id: app_id,
      client_secret: secret,
      grant_type: "authorization_code",
      redirect_uri: `http://${host}/oauth/discord/`,
      code:codestr,
      scope: "identify"
    }).toString();

    const { access_token = null, token_type = null } = await fetch("https://discord.com/api/oauth2/token", {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
      body,
    }).then((res) => res.json());
    console.log(access_token, token_type);
    const me = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `${token_type} ${access_token}` },
    }).then((res) => {RETURN_VARS = res.json()});
    // var params = new URLSearchParams()


   
    return RETURN_VARS

    
  }