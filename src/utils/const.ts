const hostname = window.location.hostname;
export const BaseUrl = hostname.includes("localhost") ? "http://app.localhost/api" : "/api"