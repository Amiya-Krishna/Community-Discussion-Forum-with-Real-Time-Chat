import { io } from "socket.io-client";
import { API_BASE } from "./utils/apiBase";

export const socket = io(API_BASE || "", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});
