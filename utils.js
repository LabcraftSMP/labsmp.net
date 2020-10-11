let dds = document.getElementsByClassName("dropdown");
for (let i = 0; i < dds.length; i++) {
    let content = dds[i].innerHTML;
    dds[i].innerHTML = "";

    let btn = document.createElement("button");
    btn.innerHTML = "+";
    btn.setAttribute("onclick", "expand(this)") 

    let div = document.createElement("div");
    div.className = "content";
    div.innerHTML = content;
    div.style.display = "none";

    let h2 = document.createElement("h2");
    h2.innerHTML = dds[i].getAttribute("name");

    let head = document.createElement("div");
    head.className = "head";
    head.appendChild(btn);
    head.appendChild(h2);

    dds[i].appendChild(head);
    dds[i].appendChild(div);
}

function expand(x) {
    let content = x.parentElement.parentElement.getElementsByClassName("content")[0];
    if (content.style.display == "none") {
        content.style.display = "block";
        x.innerHTML = "-";
    } else {
        content.style.display = "none";
        x.innerHTML = "+";
    }
}