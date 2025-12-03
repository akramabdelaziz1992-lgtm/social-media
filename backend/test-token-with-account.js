// Test Twilio Token with Account SID instead of API Key
const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

console.log('\n🧪 Testing Twilio Token Generation with Account SID\n');
console.log(`Account SID: ${accountSid}`);
console.log(`Auth Token: ${authToken ? authToken.substring(0, 8) + '...' : 'MISSING'}`);
console.log(`TwiML App SID: ${twimlAppSid}\n`);

try {
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  // ✅ Use Account SID as both accountSid AND signingKeySid
  // ✅ Use Auth Token as signing key secret
  const token = new AccessToken(
    accountSid,    // Account SID
    accountSid,    // Signing Key SID (using Account SID)
    authToken,     // Signing Key Secret (using Auth Token)
    { identity: 'test-agent', ttl: 3600 }
  );

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: twimlAppSid,
    incomingAllow: true,
  });

  token.addGrant(voiceGrant);

  const jwt = token.toJwt();
  
  console.log('✅ Token generated successfully!');
  console.log(`Token length: ${jwt.length} characters`);
  console.log(`Token preview: ${jwt.substring(0, 100)}...\n`);
  
  // Decode and show payload
  const parts = jwt.split('.');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  console.log('📋 Token Payload:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\n✅ This method uses Account SID + Auth Token');
  console.log('✅ Should work for development/testing');
  console.log('⚠️  For production, you should use proper API Keys\n');
  
} catch (error) {
  console.log('❌ Token generation failed:', error.message);
  console.log(error.stack);
}
