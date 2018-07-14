<?
$path = $_GET['path'];
$shell = "python /raid/data/module/clamav/www/action_php/GetFolder.py $path";
$result = shell_exec($shell);
echo $result;
?>
