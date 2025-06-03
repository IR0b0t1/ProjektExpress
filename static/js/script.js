const uploadInput = document.getElementById('upload');
const fileNameText = document.getElementById('file-name');

if (uploadInput) {
    uploadInput.addEventListener('change', function () {
        const files = uploadInput.files;
        if (files.length === 0) {
            fileNameText.textContent = "No files selected";
        } else if (files.length === 1) {
            fileNameText.textContent = `1 file selected`;
        } else {
            fileNameText.textContent = `${files.length} files selected`;
        }
    });
};

const addFolder = () => {
    let dialog = document.getElementById('dialog');
    if (dialog == null) {
        const root = document.querySelector('main').dataset.root;

        dialog = document.createElement("dialog");
        dialog.id = 'dialog';
        dialog.style.zIndex = '10000';
        dialog.style.padding = '20px';
        dialog.style.border = 'none';
        dialog.style.width = '100%';
        dialog.style.height = '100%';
        dialog.style.display = 'flex';
        dialog.style.flexDirection = 'column';
        dialog.style.justifyContent = 'center';
        dialog.style.alignItems = 'center';
        dialog.style.opacity = 0.5;
        dialog.style.justifySelf = 'center';

        const folderP = document.createElement("p");
        folderP.style.background = 'rgb(222,222,234)';
        folderP.style.color = 'darkblue';
        folderP.style.width = '200px';
        folderP.style.height = '50px';
        folderP.style.display = 'flex';
        folderP.style.justifyContent = 'center';
        folderP.style.alignItems = 'center';
        folderP.style.marginBottom = '20px';
        folderP.textContent = 'New folder name:';

        const folderForm = document.createElement('form');
        folderForm.method = "POST";
        folderForm.action = "/addFolder";
        folderForm.style.display = 'flex';
        folderForm.style.flexDirection = 'column';
        folderForm.style.gap = '10px';
        folderForm.style.alignItems = 'center';

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'root';
        hiddenInput.value = root;
        folderForm.appendChild(hiddenInput);

        const folderInput = document.createElement('input');
        folderInput.placeholder = 'Folder name';
        folderInput.required = true;
        folderInput.name = 'name';
        folderInput.style.padding = '5px';
        folderForm.appendChild(folderInput);

        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.style.display = 'flex';
        buttonsWrapper.style.gap = '10px';

        const folderButtonCreate = document.createElement('button');
        folderButtonCreate.textContent = 'Create';
        folderButtonCreate.type = 'submit';
        buttonsWrapper.appendChild(folderButtonCreate);

        const folderButtonCancel = document.createElement('button');
        folderButtonCancel.textContent = 'Cancel';
        folderButtonCancel.type = 'button';
        folderButtonCancel.onclick = function () {
            dialog.close();
            dialog.remove();
        }
        buttonsWrapper.appendChild(folderButtonCancel);

        folderForm.appendChild(buttonsWrapper);

        dialog.appendChild(folderP);
        dialog.appendChild(folderForm);
        document.body.appendChild(dialog);

        dialog.showModal();
    } else {
        dialog.close();
        dialog.remove();
    }
}

const addFile = () => {
    let dialog = document.getElementById('dialog');
    if (dialog == null) {
        const root = document.querySelector('main').dataset.root;
        const extensions = ['.css', '.js', '.json', '.html', '.txt'];

        dialog = document.createElement("dialog");
        dialog.id = 'dialog';
        dialog.style.zIndex = '10000';
        dialog.style.padding = '20px';
        dialog.style.border = 'none';
        dialog.style.width = '100%';
        dialog.style.height = '100%';
        dialog.style.display = 'flex';
        dialog.style.flexDirection = 'column';
        dialog.style.justifyContent = 'center';
        dialog.style.alignItems = 'center';
        dialog.style.opacity = 0.5;
        dialog.style.justifySelf = 'center';

        const fileP = document.createElement("p");
        fileP.style.background = 'rgb(222,222,234)';
        fileP.style.color = 'darkblue';
        fileP.style.width = '200px';
        fileP.style.height = '50px';
        fileP.style.display = 'flex';
        fileP.style.justifyContent = 'center';
        fileP.style.alignItems = 'center';
        fileP.style.marginBottom = '20px';
        fileP.textContent = 'New file name:';

        const fileForm = document.createElement('form');
        fileForm.method = "POST";
        fileForm.action = "/addFile";
        fileForm.style.display = 'flex';
        fileForm.style.flexDirection = 'column';
        fileForm.style.gap = '10px';
        fileForm.style.alignItems = 'center';

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'root';
        hiddenInput.value = root;
        fileForm.appendChild(hiddenInput);

        const inputWrapper = document.createElement('div');
        inputWrapper.style.display = 'flex';
        inputWrapper.style.gap = '10px';

        const fileInput = document.createElement('input');
        fileInput.placeholder = 'File name';
        fileInput.required = true;
        fileInput.name = 'name';
        fileInput.style.padding = '5px';
        inputWrapper.appendChild(fileInput);

        const fileSelect = document.createElement('select');
        fileSelect.name = 'extension';
        fileSelect.style.padding = '5px';
        for (let i = 0; i < extensions.length; i++) {
            const option = document.createElement('option');
            option.value = extensions[i];
            option.text = extensions[i];
            fileSelect.appendChild(option);
        }
        inputWrapper.appendChild(fileSelect);

        fileForm.appendChild(inputWrapper);

        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.style.display = 'flex';
        buttonsWrapper.style.gap = '10px';

        const fileButtonCreate = document.createElement('button');
        fileButtonCreate.textContent = 'Create';
        fileButtonCreate.type = 'submit';
        buttonsWrapper.appendChild(fileButtonCreate);

        const fileButtonCancel = document.createElement('button');
        fileButtonCancel.textContent = 'Cancel';
        fileButtonCancel.type = 'button';
        fileButtonCancel.onclick = function () {
            dialog.close();
            dialog.remove();
        }
        buttonsWrapper.appendChild(fileButtonCancel);

        fileForm.appendChild(buttonsWrapper);

        dialog.appendChild(fileP);
        dialog.appendChild(fileForm);
        document.body.appendChild(dialog);

        dialog.showModal();
    } else {
        dialog.close();
        dialog.remove();
    }
}

const renameFolder = (oldFolderName) => {
    let dialog = document.getElementById('dialog');
    if (dialog == null) {
        const root = document.querySelector('main').dataset.root;

        dialog = document.createElement("dialog");
        dialog.id = 'dialog';
        dialog.style.zIndex = '10000';
        dialog.style.padding = '20px';
        dialog.style.border = 'none';
        dialog.style.width = '100%';
        dialog.style.height = '100%';
        dialog.style.display = 'flex';
        dialog.style.flexDirection = 'column';
        dialog.style.justifyContent = 'center';
        dialog.style.alignItems = 'center';
        dialog.style.opacity = 0.5;
        dialog.style.justifySelf = 'center';

        const folderP = document.createElement("p");
        folderP.style.background = 'rgb(222,222,234)';
        folderP.style.color = 'darkblue';
        folderP.style.width = '200px';
        folderP.style.height = '50px';
        folderP.style.display = 'flex';
        folderP.style.justifyContent = 'center';
        folderP.style.alignItems = 'center';
        folderP.style.marginBottom = '20px';
        folderP.textContent = 'Rename folder:';

        const folderForm = document.createElement('form');
        folderForm.method = "POST";
        folderForm.action = "/renameFolder";
        folderForm.style.display = 'flex';
        folderForm.style.flexDirection = 'column';
        folderForm.style.gap = '10px';
        folderForm.style.alignItems = 'center';

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'root';
        hiddenInput.value = root;
        folderForm.appendChild(hiddenInput);

        const hiddenFolderInput = document.createElement('input');
        hiddenFolderInput.type = 'hidden';
        hiddenFolderInput.name = 'oldName';
        hiddenFolderInput.value = oldFolderName || '';
        folderForm.appendChild(hiddenFolderInput);

        const folderInput = document.createElement('input');
        folderInput.placeholder = 'New folder name';
        folderInput.required = true;
        folderInput.name = 'newName';
        folderInput.style.padding = '5px';
        folderForm.appendChild(folderInput);

        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.style.display = 'flex';
        buttonsWrapper.style.gap = '10px';

        const folderButtonRename = document.createElement('button');
        folderButtonRename.textContent = 'Rename';
        folderButtonRename.type = 'submit';
        buttonsWrapper.appendChild(folderButtonRename);

        const folderButtonCancel = document.createElement('button');
        folderButtonCancel.textContent = 'Cancel';
        folderButtonCancel.type = 'button';
        folderButtonCancel.onclick = function () {
            dialog.close();
            dialog.remove();
        };
        buttonsWrapper.appendChild(folderButtonCancel);

        folderForm.appendChild(buttonsWrapper);

        dialog.appendChild(folderP);
        dialog.appendChild(folderForm);
        document.body.appendChild(dialog);

        dialog.showModal();
    } else {
        dialog.close();
        dialog.remove();
    }
};

const renameFile = (oldFileName) => {
    let dialog = document.getElementById('dialog');
    if (dialog == null) {
        const root = document.querySelector('main').dataset.root;

        dialog = document.createElement("dialog");
        dialog.id = 'dialog';
        dialog.style.zIndex = '10000';
        dialog.style.padding = '20px';
        dialog.style.border = 'none';
        dialog.style.width = '100%';
        dialog.style.height = '100%';
        dialog.style.display = 'flex';
        dialog.style.flexDirection = 'column';
        dialog.style.justifyContent = 'center';
        dialog.style.alignItems = 'center';
        dialog.style.opacity = 0.5;
        dialog.style.justifySelf = 'center';

        const fileP = document.createElement("p");
        fileP.style.background = 'rgb(222,222,234)';
        fileP.style.color = 'darkblue';
        fileP.style.width = '200px';
        fileP.style.height = '50px';
        fileP.style.display = 'flex';
        fileP.style.justifyContent = 'center';
        fileP.style.alignItems = 'center';
        fileP.style.marginBottom = '20px';
        fileP.textContent = 'Rename file:';

        const fileForm = document.createElement('form');
        fileForm.method = "POST";
        fileForm.action = "/renameFile";
        fileForm.style.display = 'flex';
        fileForm.style.flexDirection = 'column';
        fileForm.style.gap = '10px';
        fileForm.style.alignItems = 'center';

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'root';
        hiddenInput.value = root;
        fileForm.appendChild(hiddenInput);

        const hiddenOldNameInput = document.createElement('input');
        hiddenOldNameInput.type = 'hidden';
        hiddenOldNameInput.name = 'oldName';
        hiddenOldNameInput.value = oldFileName;
        fileForm.appendChild(hiddenOldNameInput);

        const fileInput = document.createElement('input');
        fileInput.placeholder = 'New file name';
        fileInput.required = true;
        fileInput.name = 'newName';
        fileInput.style.padding = '5px';
        fileForm.appendChild(fileInput);

        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.style.display = 'flex';
        buttonsWrapper.style.gap = '10px';

        const fileButtonRename = document.createElement('button');
        fileButtonRename.textContent = 'Rename';
        fileButtonRename.type = 'submit';
        buttonsWrapper.appendChild(fileButtonRename);

        const fileButtonCancel = document.createElement('button');
        fileButtonCancel.textContent = 'Cancel';
        fileButtonCancel.type = 'button';
        fileButtonCancel.onclick = function () {
            dialog.close();
            dialog.remove();
        };
        buttonsWrapper.appendChild(fileButtonCancel);

        fileForm.appendChild(buttonsWrapper);

        dialog.appendChild(fileP);
        dialog.appendChild(fileForm);
        document.body.appendChild(dialog);

        dialog.showModal();
    } else {
        dialog.close();
        dialog.remove();
    }
};
