<?php
declare(strict_types=1);

/*
 لوحة أدمن الطريق ميديا - ملف واحد
 المسارات:
 admin.php                 تسجيل الدخول / لوحة الإحصائيات
 admin.php?action=setup    التثبيت الأول
 admin.php?action=track    استقبال زيارات الموقع
 admin.php?action=logout   تسجيل الخروج
*/

$configFile = __DIR__ . '/config.php';
$action = $_GET['action'] ?? '';

function html(string $v): string {
    return htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
}
function detectDevice(string $ua): string {
    if (preg_match('/tablet|ipad|playbook|silk/i', $ua)) return 'Tablet';
    if (preg_match('/mobile|iphone|ipod|android/i', $ua)) return 'Mobile';
    return 'Desktop';
}
function detectBrowser(string $ua): string {
    if (str_contains($ua, 'Edg/')) return 'Edge';
    if (str_contains($ua, 'OPR/') || str_contains($ua, 'Opera')) return 'Opera';
    if (str_contains($ua, 'Chrome/')) return 'Chrome';
    if (str_contains($ua, 'Firefox/')) return 'Firefox';
    if (str_contains($ua, 'Safari/')) return 'Safari';
    return 'Other';
}

/* التثبيت الأول */
if ($action === 'setup') {
    if (is_file($configFile)) {
        header('Location: admin.php');
        exit;
    }
    $error = '';
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $host = trim((string)($_POST['db_host'] ?? 'localhost'));
        $name = trim((string)($_POST['db_name'] ?? ''));
        $user = trim((string)($_POST['db_user'] ?? ''));
        $pass = (string)($_POST['db_pass'] ?? '');
        $email = strtolower(trim((string)($_POST['admin_email'] ?? '')));
        $adminPass = (string)($_POST['admin_password'] ?? '');
        try {
            if (!$name || !$user || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new RuntimeException('تأكد من بيانات قاعدة البيانات والبريد.');
            }
            if (strlen($adminPass) < 8) {
                throw new RuntimeException('كلمة مرور الأدمن يجب أن تكون 8 أحرف على الأقل.');
            }
            $pdo = new PDO(
                "mysql:host={$host};dbname={$name};charset=utf8mb4",
                $user,
                $pass,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            $pdo->exec("SET time_zone = '+03:00'");
            $pdo->exec("CREATE TABLE IF NOT EXISTS admins (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(190) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            $pdo->exec("CREATE TABLE IF NOT EXISTS analytics_events (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                visitor_id CHAR(64) NOT NULL,
                session_id VARCHAR(80) NOT NULL,
                event_type VARCHAR(30) NOT NULL DEFAULT 'pageview',
                event_name VARCHAR(100) NULL,
                page_path VARCHAR(255) NOT NULL,
                page_title VARCHAR(255) NULL,
                referrer VARCHAR(500) NULL,
                device VARCHAR(20) NOT NULL,
                browser VARCHAR(30) NOT NULL,
                ip_hash CHAR(64) NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_created_at (created_at),
                INDEX idx_visitor_id (visitor_id),
                INDEX idx_event_type (event_type),
                INDEX idx_page_path (page_path)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            $stmt = $pdo->prepare("INSERT INTO admins (email,password_hash) VALUES (?,?)");
            $stmt->execute([$email, password_hash($adminPass, PASSWORD_DEFAULT)]);
            $cfg = [
                'db' => ['host'=>$host,'name'=>$name,'user'=>$user,'pass'=>$pass],
                'app' => ['timezone'=>'Asia/Amman','secret'=>bin2hex(random_bytes(32))]
            ];
            $content = "<?php\nreturn " . var_export($cfg, true) . ";\n";
            if (file_put_contents($configFile, $content, LOCK_EX) === false) {
                throw new RuntimeException('تعذر إنشاء config.php. تأكد من صلاحية الكتابة للمجلد.');
            }
            header('Location: admin.php?installed=1');
            exit;
        } catch (Throwable $e) {
            $error = $e->getMessage();
        }
    }
    ?>
    <!doctype html><html lang="ar" dir="rtl"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>تثبيت لوحة الطريق ميديا</title><link rel="stylesheet" href="style.css"></head>
    <body class="auth-body"><main class="auth-shell">
      <section class="auth-brand"><div class="logo">TM</div><span>إعداد لمرة واحدة</span>
        <h1>تثبيت لوحة<br><b>الطريق ميديا</b></h1>
        <p>أنشئ قاعدة MySQL في Hostinger ثم أدخل بياناتها وحساب الأدمن.</p>
      </section>
      <section class="auth-card"><h2>بيانات التثبيت</h2>
        <p class="muted">هذه البيانات تبقى داخل ملف config.php على الاستضافة.</p>
        <?php if ($error): ?><div class="alert error"><?=html($error)?></div><?php endif; ?>
        <form method="post" class="setup-form">
          <label>DB Host<input name="db_host" value="localhost" required></label>
          <label>اسم قاعدة البيانات<input name="db_name" required></label>
          <label>مستخدم قاعدة البيانات<input name="db_user" required></label>
          <label>كلمة مرور قاعدة البيانات<input type="password" name="db_pass"></label>
          <label class="wide">بريد الأدمن<input type="email" name="admin_email" required></label>
          <label class="wide">كلمة مرور الأدمن<input type="password" name="admin_password" minlength="8" required></label>
          <button class="primary wide">تثبيت النظام</button>
        </form>
      </section>
    </main></body></html>
    <?php
    exit;
}

if (!is_file($configFile)) {
    header('Location: admin.php?action=setup');
    exit;
}
$config = require $configFile;
date_default_timezone_set($config['app']['timezone'] ?? 'Asia/Amman');

function db(): PDO {
    static $pdo;
    global $config;
    if ($pdo instanceof PDO) return $pdo;
    $d = $config['db'];
    $pdo = new PDO(
        "mysql:host={$d['host']};dbname={$d['name']};charset=utf8mb4",
        $d['user'], $d['pass'],
        [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]
    );
    $pdo->exec("SET time_zone = '+03:00'");
    return $pdo;
}

/* API استقبال الزيارات */
if ($action === 'track') {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }
    $ua = (string)($_SERVER['HTTP_USER_AGENT'] ?? '');
    if (!$ua || preg_match('/bot|crawler|spider|preview|facebookexternalhit/i', $ua)) {
        http_response_code(204); exit;
    }
    $raw = file_get_contents('php://input');
    if (!$raw || strlen($raw) > 8192) { http_response_code(400); exit; }
    $data = json_decode($raw, true);
    if (!is_array($data)) { http_response_code(400); exit; }
    $clean = static fn($v,$n) => mb_substr(trim((string)$v),0,$n,'UTF-8');
    $visitor = preg_replace('/[^a-zA-Z0-9_-]/','',$clean($data['visitor_id'] ?? '',80));
    $session = preg_replace('/[^a-zA-Z0-9_-]/','',$clean($data['session_id'] ?? '',80));
    if (strlen($visitor)<10 || strlen($session)<10) { http_response_code(422); exit; }
    $type = in_array(($data['event_type'] ?? 'pageview'),['pageview','action'],true)
        ? $data['event_type'] : 'pageview';
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $ipHash = hash_hmac('sha256',$ip,$config['app']['secret']);
    $stmt = db()->prepare("INSERT INTO analytics_events
      (visitor_id,session_id,event_type,event_name,page_path,page_title,referrer,device,browser,ip_hash)
      VALUES (?,?,?,?,?,?,?,?,?,?)");
    $stmt->execute([
        hash('sha256',$visitor), $session, $type,
        $clean($data['event_name'] ?? '',100) ?: null,
        $clean($data['page_path'] ?? '/',255) ?: '/',
        $clean($data['page_title'] ?? '',255) ?: null,
        $clean($data['referrer'] ?? '',500) ?: null,
        detectDevice($ua), detectBrowser($ua), $ipHash
    ]);
    http_response_code(204);
    exit;
}

/* الجلسة */
session_name('ALTARIQ_ADMIN');
session_set_cookie_params([
    'lifetime'=>0,'path'=>'/',
    'secure'=>(!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    'httponly'=>true,'samesite'=>'Lax'
]);
session_start();

if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    header('Location: admin.php');
    exit;
}

/* تسجيل الدخول */
if (!isset($_SESSION['admin_id'])) {
    $error = '';
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $email = strtolower(trim((string)($_POST['email'] ?? '')));
        $password = (string)($_POST['password'] ?? '');
        $stmt = db()->prepare("SELECT id,email,password_hash FROM admins WHERE email=? LIMIT 1");
        $stmt->execute([$email]);
        $admin = $stmt->fetch();
        if ($admin && password_verify($password,$admin['password_hash'])) {
            session_regenerate_id(true);
            $_SESSION['admin_id'] = (int)$admin['id'];
            $_SESSION['admin_email'] = $admin['email'];
            db()->prepare("UPDATE admins SET last_login=NOW() WHERE id=?")->execute([$admin['id']]);
            header('Location: admin.php');
            exit;
        }
        usleep(350000);
        $error = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
    }
    ?>
    <!doctype html><html lang="ar" dir="rtl"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>دخول الأدمن | الطريق ميديا</title><link rel="stylesheet" href="style.css"></head>
    <body class="auth-body"><main class="auth-shell">
      <section class="auth-brand"><div class="logo">TM</div><span>لوحة إدارة الموقع</span>
        <h1>أهلاً بعودتك<br><b>إلى الطريق ميديا</b></h1>
        <p>تابع زيارات الموقع والصفحات الأكثر مشاهدة والأجهزة ومصادر الزوار.</p>
        <div class="secure">🔒 كلمة المرور مشفّرة وتسجيل الدخول بجلسة PHP.</div>
      </section>
      <section class="auth-card"><div class="mobile-logo">TM</div><h2>تسجيل الدخول</h2>
        <p class="muted">أدخل بيانات حساب الأدمن.</p>
        <?php if (isset($_GET['installed'])): ?><div class="alert success">تم التثبيت بنجاح.</div><?php endif; ?>
        <?php if ($error): ?><div class="alert error"><?=html($error)?></div><?php endif; ?>
        <form method="post" class="login-form">
          <label>البريد الإلكتروني<input type="email" name="email" autocomplete="username" required></label>
          <label>كلمة المرور<input type="password" name="password" autocomplete="current-password" required></label>
          <button class="primary">دخول إلى لوحة التحكم</button>
        </form>
        <small>لا تضع رابط لوحة الأدمن داخل قائمة موقع الزوار.</small>
      </section>
    </main></body></html>
    <?php
    exit;
}

/* لوحة الإحصائيات */
$pdo = db();
$period = in_array(($_GET['period'] ?? '7'),['7','30','90'],true) ? (int)$_GET['period'] : 7;
$totalViews = (int)$pdo->query("SELECT COUNT(*) FROM analytics_events WHERE event_type='pageview'")->fetchColumn();
$totalVisitors = (int)$pdo->query("SELECT COUNT(DISTINCT visitor_id) FROM analytics_events WHERE event_type='pageview'")->fetchColumn();
$todayViews = (int)$pdo->query("SELECT COUNT(*) FROM analytics_events WHERE event_type='pageview' AND DATE(created_at)=CURDATE()")->fetchColumn();
$actions = (int)$pdo->query("SELECT COUNT(*) FROM analytics_events WHERE event_type='action'")->fetchColumn();

$stmt=$pdo->prepare("SELECT DATE(created_at) day,COUNT(*) views FROM analytics_events
 WHERE event_type='pageview' AND created_at>=DATE_SUB(CURDATE(),INTERVAL ? DAY)
 GROUP BY DATE(created_at) ORDER BY day");
$stmt->execute([$period-1]); $chart=$stmt->fetchAll();
$maxChart=max(array_map(fn($r)=>(int)$r['views'],$chart) ?: [1]);

$stmt=$pdo->prepare("SELECT page_path,COUNT(*) views,COUNT(DISTINCT visitor_id) visitors
 FROM analytics_events WHERE event_type='pageview' AND created_at>=DATE_SUB(NOW(),INTERVAL ? DAY)
 GROUP BY page_path ORDER BY views DESC LIMIT 7");
$stmt->execute([$period]); $pages=$stmt->fetchAll();

$stmt=$pdo->prepare("SELECT device,COUNT(*) visits FROM analytics_events
 WHERE event_type='pageview' AND created_at>=DATE_SUB(NOW(),INTERVAL ? DAY)
 GROUP BY device ORDER BY visits DESC");
$stmt->execute([$period]); $devices=$stmt->fetchAll();
$deviceTotal=max(array_sum(array_map(fn($r)=>(int)$r['visits'],$devices)),1);

$stmt=$pdo->prepare("SELECT CASE WHEN referrer IS NULL OR referrer='' THEN 'دخول مباشر' ELSE referrer END source,
 COUNT(*) visits FROM analytics_events WHERE event_type='pageview'
 AND created_at>=DATE_SUB(NOW(),INTERVAL ? DAY) GROUP BY source ORDER BY visits DESC LIMIT 6");
$stmt->execute([$period]); $sources=$stmt->fetchAll();

$recent=$pdo->query("SELECT page_path,device,browser,created_at FROM analytics_events
 WHERE event_type='pageview' ORDER BY id DESC LIMIT 10")->fetchAll();
?>
<!doctype html><html lang="ar" dir="rtl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>إحصائيات الطريق ميديا</title><link rel="stylesheet" href="style.css"></head>
<body class="dash-body"><div class="layout">
<aside class="sidebar">
  <a class="side-brand" href="admin.php"><span>TM</span><div><strong>الطريق ميديا</strong><small>لوحة الإدارة</small></div></a>
  <nav><a class="active" href="#">▦ نظرة عامة</a><a href="#pages">▤ الصفحات</a><a href="#sources">↗ المصادر</a><a href="#recent">◷ أحدث الزيارات</a></nav>
  <footer><span><?=html($_SESSION['admin_email'])?></span><a href="?action=logout">تسجيل الخروج</a></footer>
</aside>
<main class="main">
<header class="dash-head"><div><span>إحصائيات مباشرة</span><h1>أداء موقع الطريق ميديا</h1><p>آخر تحديث: <?=date('d/m/Y - h:i A')?></p></div>
  <div class="tabs"><a class="<?=$period===7?'active':''?>" href="?period=7">7 أيام</a><a class="<?=$period===30?'active':''?>" href="?period=30">30 يوم</a><a class="<?=$period===90?'active':''?>" href="?period=90">90 يوم</a></div>
</header>

<section class="cards">
  <article><i>◉</i><span>إجمالي المشاهدات</span><strong><?=number_format($totalViews)?></strong><small>كل مرات فتح الصفحات</small></article>
  <article><i>♙</i><span>الزوار الفريدون</span><strong><?=number_format($totalVisitors)?></strong><small>حسب هوية المتصفح</small></article>
  <article><i>☀</i><span>مشاهدات اليوم</span><strong><?=number_format($todayViews)?></strong><small><?=date('d/m/Y')?></small></article>
  <article><i>↗</i><span>تفاعلات التواصل</span><strong><?=number_format($actions)?></strong><small>واتساب، إيميل، نموذج وPDF</small></article>
</section>

<section class="grid-main">
<article class="panel chart"><div class="panel-head"><div><h2>الزيارات اليومية</h2><p>آخر <?=$period?> يومًا</p></div><b>● Live</b></div>
<?php if(!$chart):?><div class="empty">لا توجد زيارات بعد. أضف tracker.js إلى موقع الزوار.</div>
<?php else:?><div class="bars"><?php foreach($chart as $r):$h=max(8,((int)$r['views']/$maxChart)*100);?>
<div class="bar-col"><em><?=$r['views']?></em><i style="height:<?=round($h)?>%"></i><small><?=date('d/m',strtotime($r['day']))?></small></div>
<?php endforeach;?></div><?php endif;?></article>

<article class="panel"><div class="panel-head"><div><h2>الأجهزة</h2><p>طريقة تصفح الزوار</p></div></div>
<div class="devices"><?php if(!$devices):?><div class="empty mini">لا توجد بيانات.</div><?php endif;?>
<?php foreach($devices as $d):$pct=round(((int)$d['visits']/$deviceTotal)*100);?>
<div><header><span><?=html($d['device'])?></span><strong><?=$pct?>%</strong></header><p><i style="width:<?=$pct?>%"></i></p></div>
<?php endforeach;?></div></article>
</section>

<section class="grid-two">
<article class="panel" id="pages"><div class="panel-head"><div><h2>الصفحات الأكثر مشاهدة</h2><p>حسب الفترة المختارة</p></div></div>
<div class="table-wrap"><table><thead><tr><th>الصفحة</th><th>المشاهدات</th><th>الزوار</th></tr></thead><tbody>
<?php if(!$pages):?><tr><td colspan="3" class="none">لا توجد بيانات.</td></tr><?php endif;?>
<?php foreach($pages as $p):?><tr><td><i class="dot"></i><?=html($p['page_path'])?></td><td><?=$p['views']?></td><td><?=$p['visitors']?></td></tr><?php endforeach;?>
</tbody></table></div></article>

<article class="panel" id="sources"><div class="panel-head"><div><h2>مصادر الزيارات</h2><p>من أين وصل الزوار</p></div></div>
<div class="sources"><?php if(!$sources):?><div class="empty mini">لا توجد بيانات.</div><?php endif;?>
<?php foreach($sources as $i=>$s):?><div><i><?=$i+1?></i><span><strong><?=html(mb_strimwidth($s['source'],0,45,'…','UTF-8'))?></strong><small><?=$s['visits']?> زيارة</small></span></div><?php endforeach;?>
</div></article>
</section>

<article class="panel recent" id="recent"><div class="panel-head"><div><h2>أحدث الزيارات</h2><p>آخر 10 مشاهدات</p></div></div>
<div class="table-wrap"><table><thead><tr><th>الصفحة</th><th>الجهاز</th><th>المتصفح</th><th>الوقت</th></tr></thead><tbody>
<?php if(!$recent):?><tr><td colspan="4" class="none">لا توجد زيارات مسجلة.</td></tr><?php endif;?>
<?php foreach($recent as $r):?><tr><td><?=html($r['page_path'])?></td><td><?=html($r['device'])?></td><td><?=html($r['browser'])?></td><td><?=date('d/m/Y h:i A',strtotime($r['created_at']))?></td></tr><?php endforeach;?>
</tbody></table></div></article>
</main></div></body></html>
