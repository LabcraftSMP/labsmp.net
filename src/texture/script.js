const urlParams = new URLSearchParams(window.location.search),
      uuid = urlParams.get('uuid');

const preview = document.querySelector('#previewImage');
const preview2 = document.querySelector('#previewImage2');
const imageInput = document.querySelector('#imageInput');
const image2Input = document.querySelector('#image2Input');
const imageInputLabel = document.querySelector('#imageInputLabel');
const image2InputLabel = document.querySelector('#image2InputLabel');
const image2Row = document.querySelector('#image2Row');

let img = null,
    img2 = null,
    spec = false,
    tiny = false,
    id = null,
    tName = null;

preview.addEventListener('load', () => {
    if (spec == 'hat') {
        if (
            preview.naturalWidth  != 64 ||
            preview.naturalHeight != 64
        ) {
            preview.src = '#';
            imageInput.value = null;
            img = null;
            alert('Image must be 64x64!');
        }
    } else if (
        preview.naturalWidth  != 16 ||
        preview.naturalHeight != 16
    ) {
        preview.src = '#';
        imageInput.value = null;
        img = null;
        alert('Image must be 16x16!');
    }
});

preview2.addEventListener('load', () => {
    if (spec && id == "elytra") {
        if (
            preview2.naturalWidth  != 64 ||
            preview2.naturalHeight != 32
        ) {
            preview2.src = '#';
            image2Input.value = null;
            img2 = null;
            alert('Image must be 64x32!');
        }
    } else if (
        preview2.naturalWidth  != 16 ||
        preview2.naturalHeight != 16
    ) {
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
        preview2.style = "";
        image2Input.disabled = false;
        image2Row.style = "";
        changeID("");
    } else {
        preview2.style = "display: none;";
        image2Input.disabled = true;
        image2Row.style = "display: none;";
        document.getElementById("special").value = "None";
        changeID("");
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

    if (spec) {
        preview2.style.height = "512px";
        switch (id) {
            case "bundle":
                imageInputLabel.innerHTML = "Empty Texture:";
                image2InputLabel.innerHTML = "Full Texture:";
                break;
            case "elytra":
                imageInputLabel.innerHTML = "Item Texture:";
                image2InputLabel.innerHTML = "Model Texture:";
                preview2.style.height = "256px";
                break;
            default:
                imageInputLabel.innerHTML = "Texture 1:";
                image2InputLabel.innerHTML = "Texture 2:";
        }
    } else {
        imageInputLabel.innerHTML = "Texture:";
    }
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
    link.href = 'https://github.com/LabcraftSMP/labsmp.net/raw/main/src/texture/lab_hat_template_UNZIP_ME.zip';
    link.download = 'lab_hat_template_UNZIP_ME.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
