import { axiosInstance } from "@/api/axios";
import type { LoginResponseT, UserLoginValuesT } from "@/types"
import { AxiosInstance } from "axios";
import type { UserRegisterValuesT } from "@/types";
interface AuthServiceInterface {
    login(userCredentials: UserLoginValuesT): Promise<LoginResponseT>;
    logout(): Promise<void>;
    register(userCredentials: UserRegisterValuesT): Promise<void>;
}
export class AuthService implements AuthServiceInterface {
    constructor(private readonly api: AxiosInstance) { }
    async login(userCredentials: UserLoginValuesT):Promise<LoginResponseT> {
        return this.api.post("/login", userCredentials);
    }
    async logout():Promise<void> {
        return this.api.post("/logout");
    }
    async register(userCredentials: UserRegisterValuesT):Promise<void> {
        return this.api.post("/register", userCredentials);
    }
}
export const authService = new AuthService(axiosInstance);
