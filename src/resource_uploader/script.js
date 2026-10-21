const urlParams = new URLSearchParams(window.location.search),
      uuid = urlParams.get('uuid');

const preview = document.querySelector('#previewImage');
const preview2 = document.querySelector('#previewImage2');
const imageInput = document.querySelector('#imageInput');
const image2Input = document.querySelector('#image2Input');
const imageInputLabel = document.querySelector('#imageInputLabel');
const image2InputLabel = document.querySelector('#image2InputLabel');
const image2Row = document.querySelector('#image2Row');
const modelRow = document.querySelector('#modelRow');
const modelInput = document.querySelector('#modelInput');

let img = null,
    img2 = null,
    model = null,
    resourceType = 'basic',
    tName = null;

preview.addEventListener('load', () => {
    if (resourceType != 'model' && (
        preview.naturalWidth  != 16 ||
        preview.naturalHeight != 16
    )) {
        preview.src = '#';
        imageInput.value = null;
        img = null;
        alert('Image must be 16x16!');
    }
});

preview2.addEventListener('load', () => {
    if (resourceType == "elytra" && (
        preview2.naturalWidth  != 64 ||
        preview2.naturalHeight != 32
    )) {
        preview2.src = '#';
        image2Input.value = null;
        img2 = null;
        alert('Image must be 64x32!');
    }
});

function isReadyForDownload() {
    if (!img || !tName) return false;
    if (resourceType == "elytra" && !img2) return false;
    if (resourceType == "model" && !model) return false;
    return true;
}

function updateEnabled() {
    document.getElementById("download").disabled = !isReadyForDownload();
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

function changeModel(input) {
    model = input.files[0];
    updateEnabled();
}

function changeResourceType(input) {
    resourceType = input.replace(/\s/g, '');

    imageInputLabel.innerHTML = "Texture";
    preview2.style = "display: none;";
    image2Input.disabled = true;
    image2Row.style = "display: none;";
    modelInput.disabled = true;
    modelRow.style = "display: none;";

    if (resourceType == "elytra") {
        imageInputLabel.innerHTML = "Item Texture:";
        image2InputLabel.innerHTML = "Wings Texture:";
        preview2.style = "height: 256px;";
        image2Input.disabled = false;
        image2Row.style = "";
    } else if (resourceType == "model") {
        modelInput.disabled = false;
        modelRow.style = "";
    }

    updateEnabled();
}

function changeName(input) {
    tName = input.replace(/\s/g, '_').replace(/\W/g, '').toLowerCase();
    document.querySelector('#textureName').value = tName;
    updateEnabled();
}

function download() {
    if (img && resourceType && tName && uuid) {
        let json = {'group':resourceType, 'name':tName, 'uuid': uuid};
        let zip = new JSZip();
        zip.file('params.json', JSON.stringify(json));
        zip.file('texture.png', img);
        if (resourceType == 'elytra') zip.file('wings.png', img2);
        else if (resourceType == 'model') zip.file('model.json', model);
        zip.generateAsync({type:"blob"})
        .then(function(content) {
            saveAs(content, 'l4r_' + tName);
        });
    } else alert('Please fill out all the fields!');
}

if (!uuid) alert('Invalid link! Please get one in-game by running the command /resource uploader');