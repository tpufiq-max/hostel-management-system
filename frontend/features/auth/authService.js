// Auth service: thin wrapper around the auth endpoints exposed by the backend.
// All methods return the unwrapped envelope { success, message, data, errors }
// produced by the response interceptor in api/api.js.

import { post, get, tokenService } from "../../api/api";

export const authService = {
  /**
   * POST /auth/login
   * @returns { accessToken, refreshToken, tokenType, user }
   */
  async login(email, password) {
    const res = await post("/auth/login", { email, password });
    const payload = res?.data ?? {};
    if (payload.accessToken) {
      tokenService.setTokens(payload.accessToken, payload.refreshToken);
    }
    return payload;
  },

  /**
   * POST /auth/register
   * @param body { name, username, email, password, role, phone }
   */
  async register(body) {
    const res = await post("/auth/register", body);
    const payload = res?.data ?? {};
    if (payload.accessToken) {
      tokenService.setTokens(payload.accessToken, payload.refreshToken);
    }
    return payload;
  },

  /**
   * GET /auth/me
   * Returns the currently authenticated user (validates the token).
   */
  async me() {
    const res = await get("/auth/me");
    return res?.data ?? null;
  },

  /**
   * POST /auth/forgot-password
   */
  async forgotPassword(email) {
    return post("/auth/forgot-password", { email });
  },

  /**
   * POST /auth/reset-password
   */
  async resetPassword(token, newPassword) {
    return post("/auth/reset-password", { token, newPassword });
  },

  /**
   * POST /auth/change-password
   */
  async changePassword(currentPassword, newPassword) {
    return post("/auth/change-password", { currentPassword, newPassword });
  },

  /**
   * Local-only: clear stored tokens. The backend is stateless so there is no
   * server-side logout to call.
   */
  logout() {
    tokenService.clearTokens();
  },

  hasValidSession() {
    return Boolean(tokenService.getAccess());
  },
};

export default authService;
