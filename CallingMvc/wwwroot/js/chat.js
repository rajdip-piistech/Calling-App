const connection = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub")
    .build();

connection.on("ReceiveMessage", function (user, message) {
    const li = document.createElement("li");
    li.textContent = `${user}: ${message}`;
    document.getElementById("messages").appendChild(li);
});

connection.start().catch(function (err) {
    console.error(err.toString());
});

document.getElementById("sendButton").addEventListener("click", function () {
    const user = "User"; // Replace with the actual username
    const message = document.getElementById("messageInput").value;
    connection.invoke("SendMessage", user, message).catch(function (err) {
        console.error(err.toString());
    });
    document.getElementById("messageInput").value = "";
});