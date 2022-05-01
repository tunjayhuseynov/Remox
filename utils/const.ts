const env = process.env.NODE_ENV

export const BaseUrl = env == "development" ? "http://localhost:3000" : "https://app.remox.io";