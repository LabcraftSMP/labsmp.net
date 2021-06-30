const urlParams = new URLSearchParams(window.location.search),
      key = urlParams.get('key'),
      username = urlParams.get('username');

preview = document.querySelector('#previewImage');
imageInput = document.querySelector('#imageInput');

let img = null,
    id = null,
    tName = null;

preview.addEventListener('load', () => {
    if (preview.naturalHeight != 16 || preview.naturalWidth != 16) {
        preview.src = '#';
        imageInput.value = null;
        img = null;
        alert('Image must be 16x16');
    }
});

function changeImage(input) {
    img = input.files[0];
    preview.src = URL.createObjectURL(img);
}

function changeID(input) {
    id = input.replace(/\s/g, '');
    document.querySelector('#itemID').value = id;
}

function changeName(input) {
    tName = input.replace(/\s/g, '');
    document.querySelector('#textureName').value = tName;
}

function download() {
    if (img && id && tName && key && username) {
        let json = {'id':id, 'name':tName, 'key': key, 'username': username};
        let zip = new JSZip();
        zip.file('params.json', JSON.stringify(json));
        zip.file('texture.png', img);
        zip.generateAsync({type:"blob"})
        .then(function(content) {
            saveAs(content, 'ltxtr_' + tName + '_' + username);
        });
    } else alert('Please fill out all the fields!');
}
