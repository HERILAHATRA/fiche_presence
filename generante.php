<?php
require 'vendor/autoload.php';

use Dompdf\Dompdf;
use PhpOffice\PhpSpreadsheet\IOFactory;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['excelFile'])) {
    $fileTmpPath = $_FILES['excelFile']['tmp_name'];
    
    try {
        // Lire le fichier Excel
        $spreadsheet = IOFactory::load($fileTmpPath);
        $sheet = $spreadsheet->getActiveSheet();
        $data = $sheet->toArray();

        // Commencez la sortie HTML avec le DOCTYPE
        $html = '';
        $html .= '<div class="container mt-5">';
        $html .= '<h2>Excel Data</h2>';
        $html .= '<table id="excel-table" class="table table-bordered">';
        $html .= '<thead><tr>';
        foreach ($data[0] as $key => $value) {
            $html .= '<th>' . htmlspecialchars($value) . '</th>';
        }
        $html .= '<th>PRESENCE</th>'; // Ajouter une colonne pour indiquer l'presence
        $html .= '<th>SIGNATURE</th>'; // Ajouter l'entête pour la colonne Signature
        $html .= '</tr></thead>';
        $html .= '<tbody>';
        foreach (array_slice($data, 1) as $index => $row) {
            $html .= '<tr>';
            foreach ($row as $cell) {
                $html .= '<td>' . htmlspecialchars($cell) . '</td>';
            }
            // Ajouter une case à cocher pour l'presence et une cellule pour la signature
            $html .= '<td><input type="checkbox" class="presence-checkbox" data-row="' . $index . '"></td>';
            $html .= '<td class="signature-cell"></td>';
            $html .= '</tr>';
        }
        $html .= '</tbody>';
        $html .= '</table>';
        $html .= '</div>';

        echo $html;
    } catch (Exception $e) {
        echo 'Erreur lors de la lecture du fichier Excel : ', $e->getMessage();
    }
} else {
    echo 'Invalid request method or no file uploaded.';
}
?>
