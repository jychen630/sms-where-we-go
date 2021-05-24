export const host = "http://localhost:8080";
export const apiVersion = "v1";

export const LoginURL = () => `${host}/${apiVersion}/login`;
export const LogoutURL = () => `${host}/${apiVersion}/logout`;
export const RegisterURL = () => `${host}/${apiVersion}/register`;
export const ValidateURL = () => `${host}/${apiVersion}/validate`;
export const RosterURL = () => `${host}/${apiVersion}/roster`;
