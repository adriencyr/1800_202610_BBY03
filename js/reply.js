document.addEventListener("DOMContentLoaded", () => {

    const replyForm = document.getElementById("submitReplyBtn");

    replyForm?.addEventListener("click", (e) => {
        e.preventDefault();

        console.log("Reply submitted");

        location.href = "./post-details.html";
    });

});