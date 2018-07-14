<?
$db_cmd = 'sqlite /raid/data/module/clamav/system/virus.db';

if($_POST['action'] == 'delquarantine'){
    $qid = $_POST['qid'];
    $REMOVE_NAME=trim(shell_exec("/opt/bin/sqlite /raid/data/module/clamav/system/virus.db \"select filename from quarantine where qid='$qid'\""));
    unlink('/raid/data/module/clamav/system/quarantine/'.$REMOVE_NAME);
    shell_exec(${db_cmd}. ' "delete from quarantine where qid=' .$qid . '"');
}

if($_POST['action'] == 'delallquarantine'){
    shell_exec("rm /raid/data/module/clamav/system/quarantine/*");
    shell_exec(${db_cmd}. ' "delete from quarantine"');
}

if($_POST['action'] == 'restore'){
    $qid = $_POST['qid'];
    shell_exec('/raid/data/module/clamav/system/bin/restore.sh ' .$qid);
}   
?>
