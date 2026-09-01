import {SignJWT,jwtVerify} from "jose";
const secret_key = process.env.JWT_SECRET;

if(!secret_key){
    throw new Error("JWT secret key is not defined");
}

export type payload = {
    userId:string;
    email:string;
    name:string
}

const key = new TextEncoder().encode(secret_key)

export async function createJWT(payload:payload){
    return new SignJWT(payload).setProtectedHeader({alg:"HS256"}).setExpirationTime("24h").setIssuedAt(new Date()).setSubject(payload.userId).sign(key)
}

export async function verifyJWT(token:string){
    try{
    const {payload} = await jwtVerify(token,key)
    return payload
    }
    catch{
        return null;
    }
}
