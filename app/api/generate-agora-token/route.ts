import { RtcTokenBuilder, RtcRole as Role } from 'agora-access-token'; // Import RtcRole as Role

// Define types for the request body
interface GenerateTokenRequest {
  channelName: string;
  uid: number;
}

// Get these from your Agora Console
const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID as string;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE as string; // Your Agora App Certificate

// Function to generate Agora token with default expiration time of 1 day (86400 seconds) and default role as PUBLISHER
const generateToken = (
  channelName: string,
  uid: number,
  role = Role.PUBLISHER, // Default role is PUBLISHER
  expirationTimeInSeconds: number = 86400 // Default expiration time is 1 day (86400 seconds)
): string => {
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTime + expirationTimeInSeconds;

  return RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );
};

// API Route handler
export async function POST(req: Request): Promise<Response> {
  try {
    const { channelName, uid }: GenerateTokenRequest = await req.json(); // Parse JSON body

    if (!channelName || !uid) {
      return new Response(
        JSON.stringify({ error: 'Missing channelName or uid' }),
        { status: 400 }
      );
    }

    // Generate a token with default values (1-day expiration and PUBLISHER role)
    const token = generateToken(channelName, uid);

    // Return the generated token
    return new Response(
      JSON.stringify({ token }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
