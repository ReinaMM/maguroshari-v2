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

$visitDateTime = $reservationDate . ' ' . $arrivalTime;
$subject = 'Maguro & Shari Asakusa | Reservation | ' . $visitDateTime . ' | ' . $customerName;

$languageLabel = '日本語';
if ($language === 'en') {
    $languageLabel = '英語';
} elseif ($language === 'ko') {
    $languageLabel = '韓国語';
}

$items = [];
foreach ($order as $item) {
    $line = ($item['bowlName'] ?? 'Unknown Bowl') . ' x' . ($item['quantity'] ?? 1);
    if (!empty($item['toppings'])) {
        $line .= ' / トッピング: ' . implode(', ', $item['toppings']);
    }
    if (!empty($item['drink'])) {
        $line .= ' / ドリンク: ' . $item['drink'];
    }
    if (!empty($item['riceSize'])) {
        $line .= ' / ご飯の量: ' . $item['riceSize'];
    }
    if (!empty($item['note'])) {
        $line .= ' / メモ: ' . $item['note'];
    }
    $items[] = $line;
}

$body = "【予約情報】\n\n" .
    "■ お名前：\n{$customerName}\n\n" .
    "■ 人数：\n" . count($order) . "名\n\n" .
    "■ 日時：\n" . date('Y年m月d日 H:i', strtotime($visitDateTime)) . "\n\n" .
    "■ 言語：\n{$languageLabel}\n\n" .
    "■ 電話番号：\n{$phone}\n\n" .
    "■ メール：\n{$email}\n\n" .
    "■ 注文内容：\n" . implode("\n", $items) . "\n\n" .
    "■ 備考：\n" . ($notes !== '' ? $notes : 'なし') . "\n";

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
