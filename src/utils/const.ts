const hostname = window.location.hostname;
export const BaseUrl = hostname.includes("localhost") ? "http://localhost:3000" : "https://app.remox.io";