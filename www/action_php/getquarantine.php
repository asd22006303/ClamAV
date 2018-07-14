<?
$data_quarantine = array();
$qid = trim(shell_exec('sqlite /raid/data/module/clamav/system/virus.db "select qid from quarantine"'));
if($qid != ''){
    $qid_list = explode("\n", $qid);
    for($x=0;$x<count($qid_list);$x++){
        $data = trim(shell_exec('sqlite /raid/data/module/clamav/system/virus.db "select * from quarantine where qid=' .$qid_list[$x].'"'));
        $data_list = explode("|", $data);
        $qid = $data_list[0];
        $sid = $data_list[1];
        $filename = $data_list[2];
        $path = $data_list[3];
        array_push($data_quarantine, array('qid' => $qid, 'sid' => $sid, 'filename' => $filename, 'path' => $path));
    }
}
$data_quarantine_json = json_encode($data_quarantine);
echo $data_quarantine_json;
?>
