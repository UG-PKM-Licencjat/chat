import https from "https";

export async function verifyGoogleToken(token: string): Promise<string | null> {
  const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;

  return new Promise((resolve, reject) => {
    https
      .get(tokenInfoUrl, (resp) => {
        let data = "";

        resp.on("data", (chunk) => {
          data += chunk;
        });

        resp.on("end", () => {
          try {
            const tokenInfo = JSON.parse(data);
            const { sub } = tokenInfo;
            // TODO Validate fields if needed
            resolve(sub);
          } catch (error) {
            console.error("Error parsing token info:", error);
            resolve(null);
          }
        });
      })
      .on("error", (err) => {
        console.error("Error verifying token:", err.message);
        resolve(null);
      });
  });
}
