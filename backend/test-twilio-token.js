// Test Twilio API Key validation
const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;
const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

console.log('\n🔍 Checking Twilio Credentials...\n');
console.log(`Account SID: ${accountSid}`);
console.log(`Auth Token: ${authToken ? authToken.substring(0, 8) + '...' : 'MISSING'}`);
console.log(`API Key: ${apiKey}`);
console.log(`API Secret: ${apiSecret ? apiSecret.substring(0, 8) + '...' : 'MISSING'}`);
console.log(`TwiML App SID: ${twimlAppSid}\n`);

// Test 1: Basic Twilio client
console.log('📞 Test 1: Testing main Twilio client...');
try {
  const client = twilio(accountSid, authToken);
  console.log('✅ Main client initialized\n');
} catch (error) {
  console.log('❌ Main client failed:', error.message, '\n');
}

// Test 2: Generate Access Token
console.log('🎫 Test 2: Generating Access Token...');
try {
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const token = new AccessToken(
    accountSid,
    apiKey,
    apiSecret,
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

  // Decode token to check payload
  const parts = jwt.split('.');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  console.log('📋 Token Payload:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('');

} catch (error) {
  console.log('❌ Token generation failed:', error.message, '\n');
  console.log('Stack:', error.stack);
}

// Test 3: Validate API Key by fetching account details
console.log('🔑 Test 3: Validating API Key by fetching account...');
try {
  const client = twilio(apiKey, apiSecret, { accountSid });
  client.api.accounts(accountSid).fetch()
    .then(account => {
      console.log('✅ API Key is valid!');
      console.log(`Account: ${account.friendlyName}`);
      console.log(`Status: ${account.status}\n`);
    })
    .catch(error => {
      console.log('❌ API Key validation failed:', error.message);
      console.log('Error code:', error.code);
      console.log('\n⚠️  This means the API Key or Secret is INVALID!\n');
      console.log('👉 Solution: Generate a new API Key from:');
      console.log('   https://console.twilio.com/us1/develop/voice/manage/api-keys\n');
    });
} catch (error) {
  console.log('❌ API Key validation failed:', error.message, '\n');
}
