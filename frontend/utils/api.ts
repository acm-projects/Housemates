const API_BASE_URL = "https://4zhx9pu8oa.execute-api.us-east-2.amazonaws.com/dev/"

export async function apiGet(path: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })

  if (!response.ok) {
    throw new Error("API request failed")
  }

  return response.json()
}

export async function apiPost(path: string, body: any) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    throw new Error("API request failed")
  }

  return response.json()
}