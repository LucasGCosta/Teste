<?php

header('Content-type: application/json');

echo json_encode([
    'time' => date('Y-m-d H:i:s')
]);
