import { io } from "socket.io-client"

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
  transports: ["websocket"],
})
socket.on("connect", () => {
  console.log("Socket conectado:", socket.id)
})

export default socket