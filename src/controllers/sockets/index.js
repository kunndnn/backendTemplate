export const userHandler = (io, socket) => {
  socket.on("test", (data) => {
    io.emit("test", `hello ${data.name} !!!`);
  });
};
