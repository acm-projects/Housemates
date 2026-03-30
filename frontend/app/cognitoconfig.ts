export const callProtectedApi = async () => {
  const token = localStorage.getItem("token") || "";

  // REPLACE THIS with your "Invoke URL" from the API Gateway Stages page
  const API_URL = "https://dlhyieg9zf.execute-api.us-east-2.amazonaws.com/dev/SignUp";

  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Authorization": token, 
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    // If you get a 403 error here, it means the Cognito Authorizer 
    // rejected your token or the URL is wrong.
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
};