<?php
function redirect_with_error($message) {
    $target = 'reserve.html?error=' . urlencode($message);
    header('Location: ' . $target);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_with_error('Invalid request method');
}

$customerName = trim($_POST['fullName'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$reservationDate = trim($_POST['reservationDate'] ?? '');
$arrivalTime = trim($_POST['arrivalTime'] ?? '');
$notes = trim($_POST['notes'] ?? '');
$language = trim($_POST['languageDetected'] ?? '');
$orderJson = $_POST['orderJson'] ?? '[]';

if ($customerName === '' || $email === '' || $reservationDate === '' || $arrivalTime === '') {
    redirect_with_error('Missing required fields');
}

$order = json_decode($orderJson, true);
if (!is_array($order) || count($order) === 0) {
    redirect_with_error('No order items');
}

$requestId = 'R-' . date('Ymd') . '-' . rand(100, 999);
$to = 'maguroshariasakusa@gmail.com';
$subject = 'New Reservation Request - ' . $requestId;

$items = [];
foreach ($order as $item) {
    $line = ($item['bowlName'] ?? 'Unknown Bowl') . ' x' . ($item['quantity'] ?? 1);
    if (!empty($item['toppings'])) {
        $line .= ' | toppings: ' . implode(', ', $item['toppings']);
    }
    if (!empty($item['drink'])) {
        $line .= ' | drink: ' . $item['drink'];
    }
    if (!empty($item['note'])) {
        $line .= ' | note: ' . $item['note'];
    }
    $items[] = $line;
}

$body = "New Reservation Request\n\n" .
    "Request ID: {$requestId}\n" .
    "Customer Name: {$customerName}\n" .
    "Email: {$email}\n" .
    "Phone: {$phone}\n" .
    "Date: {$reservationDate}\n" .
    "Arrival Time: {$arrivalTime}\n" .
    "Language: {$language}\n\n" .
    "Order:\n" . implode("\n", $items) . "\n\n" .
    "Notes:\n" . ($notes !== '' ? $notes : '(none)') . "\n";

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/plain; charset=UTF-8';
$headers[] = 'From: Maguro to Shari Asakusa <noreply@maguroshari.com>';
$headers[] = 'Reply-To: ' . $email;

$sent = mail($to, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    redirect_with_error('Email sending failed');
}

header('Location: thank-you.html?requestId=' . urlencode($requestId));
exit;
