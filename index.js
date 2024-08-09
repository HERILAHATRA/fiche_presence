document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.querySelector('#signature-pad canvas');
    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)'
    });

    function resizeCanvas() {
        // Fixer les dimensions à 200x150
        const width = 200;
        const height = 150;

        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear();
    }

    resizeCanvas();


    document.getElementById('upload-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(this);

        fetch('generante.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            document.getElementById('excel-data').innerHTML = data;

            document.querySelectorAll('.presence-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        currentRow = this.dataset.row;
                        signaturePad.clear();
                        $('#signatureModal').modal('show');
                    } else {
                        document.querySelector(`#excel-table tbody tr:nth-child(${parseInt(currentRow) + 1}) .signature-cell`).innerHTML = '';
                    }
                });
            });

            document.getElementById('save-pdf').style.display = 'block';
        })
        .catch(error => console.error('Erreur:', error));
    });

    document.getElementById('save-signature').addEventListener('click', function() {
        const dataURL = signaturePad.toDataURL('image/png');
        document.getElementById('signature-image').value = dataURL;
        $('#signatureModal').modal('hide');

        document.querySelector(`#excel-table tbody tr:nth-child(${parseInt(currentRow) + 1}) .signature-cell`).innerHTML = `<img src="${dataURL}" style="max-width: 100px;" />`;
        signaturePad.clear();
    });

    document.getElementById('save-pdf').addEventListener('click', function() {
        const tableHTML = document.getElementById('excel-table').outerHTML;

        const html = `
            <html>
                <head>
                    <style>
                        table { width: 100%; border-collapse: collapse; }
                        td, th { border: 1px solid black; padding: 8px; text-align: left; }
                        img { max-width: 100px; }
                    </style>
                </head>
                <body>
                    ${tableHTML}
                </body>
            </html>
        `;

        const formData = new FormData();
        formData.append('html', html);

        fetch('generate_pdf.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'table_with_signature.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Erreur:', error));
    });

    const clearButton = document.querySelector("[data-action=clear]");
    const undoButton = document.querySelector("[data-action=undo]");
    const changeColorButton = document.querySelector("[data-action=change-color]");
    const savePNGButton = document.querySelector("[data-action=save-png]");
    const saveJPGButton = document.querySelector("[data-action=save-jpg]");
    const saveSVGButton = document.querySelector("[data-action=save-svg]");

    if (clearButton) {
        clearButton.addEventListener("click", function () {
            signaturePad.clear();
        });
    }

    if (undoButton) {
        undoButton.addEventListener("click", function () {
            const data = signaturePad.toData();
            if (data) {
                data.pop();
                signaturePad.fromData(data);
            }
        });
    }

    if (changeColorButton) {
        changeColorButton.addEventListener("click", function () {
            const r = Math.round(Math.random() * 255);
            const g = Math.round(Math.random() * 255);
            const b = Math.round(Math.random() * 255);
            const color = `rgb(${r},${g},${b})`;
            signaturePad.penColor = color;
        });
    }

   

    if (saveJPGButton) {
        saveJPGButton.addEventListener("click", function () {
            if (signaturePad.isEmpty()) {
                alert("Please provide a signature first.");
            } else {
                const dataURL = signaturePad.toDataURL("image/jpeg");
                download(dataURL, "signature.jpg");
            }
        });
    }

    if (saveSVGButton) {
        saveSVGButton.addEventListener("click", function () {
            if (signaturePad.isEmpty()) {
                alert("Please provide a signature first.");
            } else {
                const dataURL = signaturePad.toDataURL("image/svg+xml");
                download(dataURL, "signature.svg");
            }
        });
    }

    function download(dataURL, filename) {
        const blob = dataURLToBlob(dataURL);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    }

    function dataURLToBlob(dataURL) {
        const [header, data] = dataURL.split(",");
        const mime = header.match(/:(.*?);/)[1];
        const binary = atob(data);
        const array = [];
        for (let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], { type: mime });
    }
});
