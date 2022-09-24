const urlParams = new URLSearchParams(window.location.search),
      key = urlParams.get('key'),
      username = urlParams.get('username');

preview = document.querySelector('#previewImage');
modelPreview = document.querySelector('#previewModelImage');
imageInput = document.querySelector('#imageInput');
modelImageInput = document.querySelector('#modelImageInput');

let img = null,
    modImg = null,
    spec = false,
    id = null,
    tName = null;

preview.addEventListener('load', () => {
    if (spec == 'hat' && 
    (preview.naturalWidth  != 64 ||
    preview.naturalHeight != 64)) {
        preview.src = '#';
        imageInput.value = null;
        img = null;
        alert('Image must be 64x64!');
    } else if (preview.naturalWidth  != 16 ||
        preview.naturalHeight != 16) {
        preview.src = '#';
        imageInput.value = null;
        img = null;
        alert('Image must be 16x16!');
    }
});

modelPreview.addEventListener('load', () => {
    if (modelPreview.naturalWidth  != 64 ||
        modelPreview.naturalHeight != 32) {
        modelPreview.src = '#';
        modelImageInput.value = null;
        modImg = null;
        alert('Image must be 64x32!');
    }
});

function updateEnabled() {
    let dlEnabled = true;
    document.getElementById("download").disabled = true;
    if (!img || !tName || !id) dlEnabled = false;
    if (spec == 'hat') {
        document.getElementById("itemID").disabled = true;
    } else if (spec) {
        document.getElementById("special0").disabled = false;
        document.getElementById("special1").disabled = false;
        document.getElementById("itemID").disabled = true;
        if (document.getElementById("special0").value == "None" ||
            document.getElementById("special1").value == "None")
            dlEnabled = false;
        if (!modImg) dlEnabled = false;
    } else {
        //document.getElementById("special0").disabled = true;
        //document.getElementById("special1").disabled = true;
        document.getElementById("itemID").disabled = false;
    }
    if (dlEnabled) document.getElementById("download").disabled = false;
}

function changeImage(input) {
    img = input.files[0];
    preview.src = URL.createObjectURL(img);
    updateEnabled();
}

function changeModelImage(input) {
    modImg = input.files[0];
    modelPreview.src = URL.createObjectURL(modImg);
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
        document.getElementById("previewModelImage").style = "height: 256px;";
        document.getElementById("modelImageInput").disabled = false;
        document.getElementById("modelImageRow").style = "";
        changeIDSpecial()
    } else {
        document.getElementById("previewModelImage").style = "display: none;";
        document.getElementById("modelImageInput").disabled = true;
        document.getElementById("modelImageRow").style = "display: none;";
        id = null;
    }
    updateEnabled();
}

function changeID(input) {
    id = input.replace(/\s/g, '');
    document.querySelector('#itemID').value = id;
    updateEnabled();
}

function changeIDSpecial() {
    id = document.getElementById("special0").value.toLowerCase() + "_" + document.getElementById("special1").value.toLowerCase();
    updateEnabled();
}

function changeName(input) {
    tName = input.replace(/\s/g, '');
    document.querySelector('#textureName').value = tName;
    updateEnabled();
}

function download() {
    if (img && id && tName && key && username) {
        let json = {'id':id, 'name':tName, 'key': key, 'username': username};
        let zip = new JSZip();
        zip.file('params.json', JSON.stringify(json));
        zip.file('texture.png', img);
        if (spec) zip.file('model_texture.png', modImg);
        zip.generateAsync({type:"blob"})
        .then(function(content) {
            saveAs(content, 'ltxtr_' + tName + '_' + username);
        });
    } else alert('Please fill out all the fields!');
}

function downloadHatTemplate() {
    const link = document.createElement('a');
    link.href = 'lab_hat_template.zip';
    link.download = 'lab_hat_template.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}