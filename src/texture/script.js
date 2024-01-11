const urlParams = new URLSearchParams(window.location.search),
      uuid = urlParams.get('uuid');

preview = document.querySelector('#previewImage');
preview2 = document.querySelector('#previewImage2');
imageInput = document.querySelector('#imageInput');
image2Input = document.querySelector('#image2Input');

let img = null,
    img2 = null,
    spec = false,
    tiny = false,
    id = null,
    tName = null;

preview.addEventListener('load', () => {
    if (spec == 'hat') {
        if (preview.naturalWidth  != 64 ||
        preview.naturalHeight != 64) {
            preview.src = '#';
            imageInput.value = null;
            img = null;
            alert('Image must be 64x64!');
        }
    } else if (preview.naturalWidth  != 16 ||
    preview.naturalHeight != 16) {
        preview.src = '#';
        imageInput.value = null;
        img = null;
        alert('Image must be 16x16!');
    }
});

preview2.addEventListener('load', () => {
    if (preview2.naturalWidth  != 16 ||
        preview2.naturalHeight != 16) {
        preview2.src = '#';
        image2Input.value = null;
        img2 = null;
        alert('Image must be 16x16!');
    }
});

function updateEnabled() {
    let dlEnabled = true;
    document.getElementById("download").disabled = true;
    if (!img || !tName || !id) dlEnabled = false;
    if (spec == 'hat') {
        document.getElementById("itemID").disabled = true;
        document.getElementById("tiny").disabled = true;
    } else if (spec) {
        document.getElementById("special").disabled = false;
        document.getElementById("itemID").disabled = true;
        document.getElementById("hat").disabled = true;
        if (document.getElementById("special").value == "None")
            dlEnabled = false;
        if (!img2) dlEnabled = false;
    } else {
        document.getElementById("special").disabled = true;
        document.getElementById("itemID").disabled = false;
        document.getElementById("tiny").disabled = false;
        document.getElementById("hat").disabled = false;
    }
    
    if (tiny) document.getElementById("hat").disabled = true;
    if (dlEnabled) document.getElementById("download").disabled = false;
}

function changeImage(input) {
    img = input.files[0];
    preview.src = URL.createObjectURL(img);
    updateEnabled();
}

function changeImage2(input) {
    img2 = input.files[0];
    preview2.src = URL.createObjectURL(img2);
    updateEnabled();
}

function changeType(input, type) {
    spec = input;
    if (type == 'hat') {
        spec = input ? type : false;
        preview.src = '#';
        imageInput.value = null;
        img = null;
        id = 'carved_pumpkin';
        changeID(id);
    } else if (spec) {
        document.getElementById("previewImage2").style = "";
        document.getElementById("image2Input").disabled = false;
        document.getElementById("image2Row").style = "";
        changeID("")
    } else {
        document.getElementById("previewImage2").style = "display: none;";
        document.getElementById("image2Input").disabled = true;
        document.getElementById("image2Row").style = "display: none;";
        id = null;
    }
    updateEnabled();
}

function changeTiny(value) {
    tiny = value;
    updateEnabled();
}

function changeID(input) {
    id = input.replace(/\s/g, '');
    document.querySelector('#itemID').value = id;
    updateEnabled();
}

function changeName(input) {
    tName = input.replace(/\s/g, '');
    document.querySelector('#textureName').value = tName;
    updateEnabled();
}

function download() {
    if (img && id && tName && uuid) {
        let json = {'id':id, 'name':tName, 'uuid': uuid};
        if (tiny) json.tiny = true;
        let zip = new JSZip();
        zip.file('params.json', JSON.stringify(json));
        zip.file('texture.png', img);
        if (spec && spec != 'hat') zip.file('texture_2.png', img2);
        zip.generateAsync({type:"blob"})
        .then(function(content) {
            saveAs(content, 'ltxtr_' + tName);
        });
    } else alert('Please fill out all the fields!');
}

function downloadHatTemplate() {
    const link = document.createElement('a');
    link.href = 'lab_hat_template_UNZIP_ME.zip';
    link.download = 'lab_hat_template_UNZIP_ME.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
