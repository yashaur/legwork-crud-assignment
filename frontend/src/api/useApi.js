import { useDispatch, useSelector } from "react-redux";
import { setTokens, logout } from "../store/authSlice.js";

export default function useApi() {
  const accessToken = useSelector((state) => state.auth.access);
  const refreshToken = useSelector((state) => state.auth.refresh);
  const username = useSelector((state) => state.auth.username);
  const dispatch = useDispatch();

  async function safeJson(response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  async function request(url, options = {}) {
    const headers = {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const finalOptions = {
      ...options,
      headers,
    };

    let response = await fetch(url, finalOptions);

    if (response.status === 401) {
      const reLogin = await fetch("/auth/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!reLogin.ok) {
        dispatch(logout());
        throw {
          status: reLogin.status,
          body: { detail: "Session expired — please log in again." },
        };
      }

      const data = await reLogin.json();

      dispatch(
        setTokens({ access: data.access, refresh: refreshToken, username }),
      );

      const retryHeaders = {
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.access}`,
      };
      response = await fetch(url, { ...options, headers: retryHeaders });
    }

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      throw { status: response.status, body: await safeJson(response) };
    }

    return await safeJson(response);
  }

  function get(url) {
    return request(url);
  }

  function post(url, data) {
    return request(url, { method: "POST", body: JSON.stringify(data) });
  }

  function patch(url, data) {
    return request(url, { method: "PATCH", body: JSON.stringify(data) });
  }

  function del(url) {
    return request(url, { method: "DELETE" });
  }

  return { request, get, post, patch, del };
}
