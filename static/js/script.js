const addFolder = () => {
    let dialog = document.getElementById('dialog');
    if (dialog == null) {
        dialog = document.createElement("DIALOG");

        const folderP = document.createElement("p");
        folderP.style.background = 'rgb(222,222,234)';
        folderP.style.color = 'darkblue';
        folderP.style.width = '200px';
        folderP.style.height = '50px';
        folderP.style.display = 'flex';
        folderP.style.justifyContent = 'center';
        folderP.style.alignItems = 'center';
        folderP.textContent = 'New folder name:';

        const folderForm = document.createElement('form');
        folderForm.method = "POST";
        folderForm.action = "/addFolder";

        const folderInput = document.createElement('input');
        folderInput.placeholder = 'Folder name';
        folderInput.required = 'true';
        folderInput.name = 'name';
        folderForm.appendChild(folderInput);

        const folderButtonCreate = document.createElement('button');
        folderButtonCreate.textContent = 'Create';
        folderForm.appendChild(folderButtonCreate);

        const folderButtonCancel = document.createElement('button');
        folderButtonCancel.textContent = 'Cancel';
        folderButtonCancel.onclick = function () {
            dialog.remove();
        }

        folderForm.appendChild(folderButtonCancel);

        dialog.id = 'dialog'
        dialog.setAttribute('open', 'open');
        dialog.appendChild(folderP);
        dialog.style.zIndex = 100;
        dialog.style.margin = 'auto';
        dialog.style.width = '600px';
        dialog.style.height = '400px';
        dialog.style.display = 'flex';
        dialog.style.flexDirection = 'column';
        dialog.style.justifyContent = 'center';
        dialog.style.alignItems = 'center';
        dialog.appendChild(folderForm);
        document.body.appendChild(dialog);
    } else {
        dialog.remove()
    }
}

const addFile = () => {
    const extensions = ['.css', '.js', '.json', '.html', '.txt']
    let dialog = document.getElementById('dialog')
    if (dialog == null) {
        dialog = document.createElement("DIALOG");

        const fileP = document.createElement("p");
        fileP.style.background = 'rgb(222,222,234)';
        fileP.style.color = 'darkblue';
        fileP.style.width = '200px';
        fileP.style.height = '50px';
        fileP.style.display = 'flex';
        fileP.style.justifyContent = 'center';
        fileP.style.alignItems = 'center';
        fileP.textContent = 'New file name:';

        const fileForm = document.createElement('form');
        fileForm.method = "POST";
        fileForm.action = "/addFile";

        const inputDiv = document.createElement('div');
        inputDiv.style.display = 'flex';
        fileForm.appendChild(inputDiv);

        const fileInput = document.createElement('input');
        fileInput.placeholder = 'File name';
        fileInput.required = 'true';
        fileInput.name = 'name';
        inputDiv.appendChild(fileInput);

        const fileSelect = document.createElement('select');
        fileSelect.name = 'extension'
        inputDiv.appendChild(fileSelect)

        for (var i = 0; i < extensions.length; i++) {
            var option = document.createElement("option");
            option.value = extensions[i];
            option.text = extensions[i];
            fileSelect.appendChild(option);
        }

        const buttonDiv = document.createElement('div');
        buttonDiv.style.display = 'flex';
        fileForm.appendChild(buttonDiv);

        const filerButtonCreate = document.createElement('button');
        filerButtonCreate.textContent = 'Create';
        buttonDiv.appendChild(filerButtonCreate);

        const filerButtonCancel = document.createElement('button');
        filerButtonCancel.textContent = 'Cancel';
        filerButtonCancel.onclick = function () {
            dialog.remove();
        }

        buttonDiv.appendChild(filerButtonCancel);

        dialog.id = 'dialog';
        dialog.setAttribute('open', 'open');
        dialog.appendChild(fileP);
        dialog.style.zIndex = 100;
        dialog.style.margin = 'auto';
        dialog.style.width = '600px';
        dialog.style.height = '400px';
        dialog.style.display = 'flex';
        dialog.style.flexDirection = 'column';
        dialog.style.justifyContent = 'center';
        dialog.style.alignItems = 'center';
        dialog.appendChild(fileForm);
        document.body.appendChild(dialog);
    } else {
        dialog.remove();
    }
}