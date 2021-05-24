import { LoginForm, Result } from "./schemas";
import axios from "axios";
import { LoginURL } from "./urls";

type LoginResult = Result & { loginResult: boolean }

export const login = async (data: LoginForm): Promise<LoginResult> => {
    return axios.post(LoginURL(), data).then((res: any): LoginResult => {
        return {
            ...res.data,
            loginResult: res.data.result === "success"
        }
    }, (err) => {
        return {
            result: "error",
            message: `LoginResult generates an error: ${err}`,
            loginResult: false,
        }
    }).catch((err) => {
        console.log(err);
        return {
            result: "error",
            message: `An error occurs when fetching the data: ${err}`,
            loginResult: false,
        }
    });
}

