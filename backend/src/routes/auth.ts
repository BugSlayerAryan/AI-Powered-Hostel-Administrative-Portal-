import { Router } from 'express'; import bcrypt from 'bcryptjs'; import jwt from 'jsonwebtoken'; import { z } from 'zod'; import crypto from 'node:crypto'; import { User } from '../models/index.js'; import { authenticate,AuthedRequest } from '../middleware/auth.js';
const router=Router();
const base32='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function encodeBase32(bytes:Buffer){let bits=0;let value=0;let output='';for(const byte of bytes){value=(value<<8)|byte;bits+=8;while(bits>=5){output+=base32[(value>>>(bits-5))&31];bits-=5}}if(bits)output+=base32[(value<<(5-bits))&31];return output}
function decodeBase32(value:string){let bits=0;let buffer=0;const output:number[]=[];for(const char of value.replace(/=+$/,'').toUpperCase()){const index=base32.indexOf(char);if(index<0)throw new Error('Invalid authenticator secret');buffer=(buffer<<5)|index;bits+=5;if(bits>=8){output.push((buffer>>>(bits-8))&255);bits-=8}}return Buffer.from(output)}
function totp(secret:string,at=Date.now()){const counter=Math.floor(at/30000);const data=Buffer.alloc(8);data.writeBigUInt64BE(BigInt(counter));const digest=crypto.createHmac('sha1',decodeBase32(secret)).update(data).digest();const offset=digest[digest.length-1]!&15;const code=((digest[offset]!&127)<<24|(digest[offset+1]!<<16)|(digest[offset+2]!<<8)|digest[offset+3]!)%1000000;return String(code).padStart(6,'0')}
function validTotp(secret:string,code:string){return [0,-1,1].some(offset=>totp(secret,Date.now()+offset*30000)===code)}
router.post('/login',async(req,res)=>{const parsed=z.object({email:z.string().min(1),password:z.string().min(1)}).safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Enter your username or email and password'});const identifier=parsed.data.email.trim().toLowerCase();const user=await User.findOne(identifier.includes('@')?{email:identifier}:{username:identifier}).select('+passwordHash');if(!user||!user.active||!await bcrypt.compare(parsed.data.password,user.passwordHash))return res.status(401).json({message:'Username/email or password is incorrect'});user.lastLogin=new Date();await user.save();const token=jwt.sign({sub:user.id},process.env.JWT_SECRET!,{expiresIn:'12h'});return res.json({token,user:user.toJSON()})});
router.post('/forgot-password',async(req,res)=>{const parsed=z.object({identifier:z.string().trim().min(1)}).safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Enter your username or email'});const identifier=parsed.data.identifier.toLowerCase();const user=await User.findOne(identifier.includes('@')?{email:identifier}:{username:identifier}).select('+resetTokenHash +resetTokenExpiresAt');const response:{message:string;resetToken?:string}={message:'If an account matches, password reset instructions have been created.'};if(user&&user.active){const resetToken=crypto.randomBytes(32).toString('hex');user.resetTokenHash=crypto.createHash('sha256').update(resetToken).digest('hex');user.resetTokenExpiresAt=new Date(Date.now()+15*60*1000);await user.save();if(process.env.NODE_ENV!=='production')response.resetToken=resetToken;}return res.json(response)});
router.post('/reset-password',async(req,res)=>{const parsed=z.object({token:z.string().trim().min(32),password:z.string().min(10).max(128)}).safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Use a valid reset token and a password of at least 10 characters'});const hash=crypto.createHash('sha256').update(parsed.data.token).digest('hex');const user=await User.findOne({resetTokenHash:hash,resetTokenExpiresAt:{$gt:new Date()},active:true}).select('+passwordHash +resetTokenHash +resetTokenExpiresAt');if(!user)return res.status(400).json({message:'This reset link is invalid or expired'});user.passwordHash=await bcrypt.hash(parsed.data.password,12);user.resetTokenHash=undefined;user.resetTokenExpiresAt=undefined;await user.save();return res.json({message:'Password updated. You can now sign in.'})});
router.get('/me',authenticate,(req:AuthedRequest,res)=>res.json({user:req.user}));
router.post('/2fa/setup',authenticate,async(req:AuthedRequest,res)=>{
  const secret=encodeBase32(crypto.randomBytes(20));
  req.user.twoFactorSecret=secret;
  await req.user.save();
  const label=encodeURIComponent(`HostelOS:${req.user.email}`);
  return res.json({secret,otpauthUrl:`otpauth://totp/${label}?secret=${secret}&issuer=HostelOS&algorithm=SHA1&digits=6&period=30`});
});
router.post('/2fa/enable',authenticate,async(req:AuthedRequest,res)=>{
  const parsed=z.object({code:z.string().regex(/^\d{6}$/)}).safeParse(req.body);
  if(!parsed.success||!req.user.twoFactorSecret||!validTotp(req.user.twoFactorSecret,parsed.data.code))return res.status(400).json({message:'The verification code is invalid or expired'});
  const codes=Array.from({length:8},()=>crypto.randomBytes(5).toString('hex'));
  req.user.twoFactorEnabled=true;
  req.user.recoveryCodeHashes=await Promise.all(codes.map(code=>bcrypt.hash(code,10)));
  await req.user.save();
  return res.json({user:req.user.toJSON(),recoveryCodes:codes});
});
router.post('/2fa/disable',authenticate,async(req:AuthedRequest,res)=>{
  const parsed=z.object({code:z.string().regex(/^\d{6}$/)}).safeParse(req.body);
  if(!parsed.success||!req.user.twoFactorSecret||!validTotp(req.user.twoFactorSecret,parsed.data.code))return res.status(400).json({message:'Enter a valid authenticator code to disable 2FA'});
  req.user.twoFactorEnabled=false;req.user.twoFactorSecret=undefined;req.user.recoveryCodeHashes=[];await req.user.save();return res.json({user:req.user.toJSON()});
});
router.put('/me',authenticate,async(req:AuthedRequest,res)=>{
  const parsed=z.object({
    name:z.string().trim().min(2).max(100),
    email:z.string().trim().email(),
    phone:z.string().trim().max(30).optional(),
    department:z.string().trim().max(100).optional(),
    course:z.string().trim().max(100).optional(),
    academicYear:z.string().trim().max(30).optional(),
    guardianName:z.string().trim().max(100).optional(),
    guardianPhone:z.string().trim().max(30).optional(),
    profileImage:z.string().trim().max(255).optional()
  }).safeParse(req.body);
  if(!parsed.success)return res.status(400).json({message:'Please check the profile details and try again'});
  const email=parsed.data.email.toLowerCase();
  const duplicate=await User.findOne({_id:{$ne:req.user._id},email});
  if(duplicate)return res.status(409).json({message:'That email address is already in use'});
  Object.assign(req.user,parsed.data,{email});
  await req.user.save();
  return res.json({user:req.user.toJSON()});
});
router.post('/logout',authenticate,(_req,res)=>res.json({ok:true}));
export default router;
