import crypto from "crypto";

export function getImageKitAuth(req, res) {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  if (!privateKey || !publicKey) {
    return res.status(500).json({ message: "ImageKit is not configured" });
  }

  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 10 * 60;
  const signature = crypto
    .createHmac("sha1", privateKey)
    .update(token + expire)
    .digest("hex");

  res.json({ token, expire, signature, publicKey });
}