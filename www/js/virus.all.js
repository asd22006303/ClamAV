/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */




$.ajaxSetup({ 
    beforeSend: function(xhr, settings) {
        function getCookie(name) {
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
        if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
            // Only send the token to relative URLs i.e. locally.
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        }
    } 
});

function resizeGrid(grid_id, window_obj, offset, diff) {
    var gridElement = $("#" + grid_id);
    var dataArea = gridElement.find(".k-grid-content");
    var newHeight = $(window_obj).innerHeight() - offset -2;
    if(diff == undefined){
        diff = gridElement.innerHeight() - dataArea.innerHeight();
    }
    gridElement.height(newHeight);
    dataArea.height(newHeight - diff);
}

function onOpen(e) {
    kendo.ui.progress(e.sender.element, true);
}

function onRefresh(e) {
    kendo.ui.progress(e.sender.element, false);
}

function LoadingWindowShow(target){
    if(target == undefined){
        target = $('body');
    }
    kendo.ui.progress(target, true);
}

function LoadingWindowClose(target){
    if(target == undefined){
        target = $('body');
    }
    kendo.ui.progress(target, false);
}

function getFormDataToJSON($form){
    var form_array = $form.serializeArray();
    var json_array = {};

    $.map(form_array, function(n, i){
        json_array[n['name']] = n['value'];
    });
    return json_array;
}

function switchToBoolean($switch){
    return $switch.prop('checked')
}

function radioToBoolean(radio_name){
    if($("input[name=" + radio_name + "]:checked").val() == "1"){
        return true;
    }else{
        return false;
    }
}

function tabHeight(tabstrip_id){
    var tabStripElement = $("#" + tabstrip_id).kendoTabStrip(),
        tabStrip = tabStripElement.data("kendoTabStrip");

    var expandContentDivs = function(divs) {
        divs.height($(window).innerHeight() - tabStripElement.children(".k-tabstrip-items").outerHeight() - 16);
    }
    // 16px are substracted to compensate for content div vertical paddings and borders

    var resizeAll = function() {
        expandContentDivs(tabStripElement.children(".k-content")); 
    }
}

function expandTabHeight(tab_id, offset, select_function){
    if(!select_function){
        select_function = no_action
    }

    var tabStripElement = $("#" + tab_id).kendoTabStrip({
        animation:  {
                        open: {
                            effects: "fadeIn"
                        }
                    },
        select: select_function
    });
    if(offset == undefined){
        offset = 0;
    }
    var kk = parseInt(tabStripElement.children(".k-content").css("padding-top"), 10) + parseInt(tabStripElement.children(".k-content").css("padding-bottom"), 10) + parseInt(tabStripElement.children(".k-content").css("margin-top"), 10) + parseInt(tabStripElement.children(".k-content").css("margin-bottom"), 10);
    var newHeight = 490;
    //var newHeight = $(window).innerHeight() - tabStripElement.children(".k-tabstrip-items").outerHeight() - kk - 5 - offset;
    tabStripElement.height(200 - offset);
    //tabStripElement.height($(window).innerHeight() - offset);     
    tabStripElement.children(".k-content").height(newHeight);
}

function resizeHeight($obj, target, offset){
    var newheight = $(target).innerHeight() - offset;
    $obj.height(newheight);
}

//this is for Treeview to do single check
function uncheck(items) {
    for (var i = 0; i < items.length; i++) {
        items[i].set("checked", false);
        if (items[i].hasChildren) {
          uncheck(items[i].children.data())
        }
    }
}

//this is for TreeView to gather the check elements
function checkedNodeIds(nodes, checkedNodes, mode) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].checked) {
            var node_data = nodes[i].path;
            if(mode == 1){
                node_data = {'text': nodes[i].path, 'value': nodes[i].path};
            }
            checkedNodes.push(node_data);
        }

        if (nodes[i].hasChildren) {
            checkedNodeIds(nodes[i].children.view(), checkedNodes, mode);
        }
    }
}

function getTreeViewNode($treeview, mode){
    var data = [],
    treeview = $treeview.data("kendoTreeView");
    checkedNodeIds(treeview.dataSource.data(), data, mode);
    return data;
}


function objectLength(obj){
    var count = 0
    for(var i in obj){
        count++;
    }
    return count;
}

function searchJsonByIndex(index, value, json_obj){
    for(var i in json_obj){
        if(eval("json_obj[i]." + index) == value){
            return json_obj[i];
        }
    }
    return {};
}

function isValueInObject(obj, value){
    var len = objectLength(obj);
    for(var i in obj){
        if(value == obj[i]){
            return true;
        }
    }
    return false;
}

function raidCapacityCaculator(capacity_array){
    //translate capacity list to MB list
    var tb = /(\d*)TB/;
    var gb = /(\d*)GB/;
    var mb = /(\d*)MB/;
    var trans_list = [];

    for(var i in capacity_array){
        var unit = 0;
        var num = 0;

        var tb_result = tb.exec(capacity_array[i]);
        if( tb_result != null){
            unit = 1048576;
            num = +tb_result[1];
            trans_list.push(num * unit);
            continue;
        }

        var gb_result = gb.exec(capacity_array[i]);
        if( gb_result != null){
            unit = 1024;
            num = +gb_result[1];
            trans_list.push(num * unit);
            continue;
        }

        var mb_result = mb.exec(capacity_array[i]);
        if( mb_result != null){
            unit = 1;
            num = +mb_result[1];
            trans_list.push(num * unit);
            continue;
        }
    }
    return trans_list;
}

function raidCapacity(capacity_list, raid_type){
    var disk_capacity_list = raidCapacityCaculator(capacity_list);

    var min = Math.min.apply(Math, disk_capacity_list);
    var length = disk_capacity_list.length;
    var waste = 0;
    var backup = 0;
    var sum = 0;
    var result;
    switch(raid_type){
        case 'j':
            result = raid0Caculator(disk_capacity_list);
            break;
        case '0':
            result = raid0Caculator(disk_capacity_list);
            break;
        case '1':
            result = raid1Caculator(disk_capacity_list);
            break;
        case '5':
            result = raid5Caculator(disk_capacity_list);
            break;
        case '6':
            result = raid6Caculator(disk_capacity_list);
            break;
        case '10':
            result = raid10Caculator(disk_capacity_list);
            break;
        case '50':
            result = raid50Caculator(disk_capacity_list);
            break;
        case '60':
            result = raid60Caculator(disk_capacity_list);
            break;
    }
    if (result == undefined){
        result = [0,0,0];
    }
    return [result[0], result[1], result[2]];

}


function raid0Caculator(disk_capacity_list){
    disk_capacity_list.sort();
    var waste = 0;
    var backup = 0;
    var sum = 0;
    for(var i in disk_capacity_list){
        sum = sum + disk_capacity_list[i];
    }
    return [sum, backup, waste];
}

function raid1Caculator(disk_capacity_list){
    disk_capacity_list.sort();
    var waste = 0;
    var backup = 0;
    var sum = 0;
    var length = disk_capacity_list.length;
    var min = Math.min.apply(Math, disk_capacity_list);

    sum = min;
    backup = min * (length - 1);
    for(var i in disk_capacity_list){
        waste =  waste + (disk_capacity_list[i] - min);
    }
    return [sum, backup, waste];
}

function raid5Caculator(disk_capacity_list){
    disk_capacity_list.sort();
    var waste = 0;
    var backup = 0;
    var sum = 0;
    var length = disk_capacity_list.length;
    var min = Math.min.apply(Math, disk_capacity_list);

    sum = min * (length - 1);
    backup = min;
    for(var i in disk_capacity_list){
        waste =  waste + (disk_capacity_list[i] - min);
    }
    return [sum, backup, waste];
}

function raid6Caculator(disk_capacity_list){
    disk_capacity_list.sort();
    var waste = 0;
    var backup = 0;
    var sum = 0;
    var length = disk_capacity_list.length;
    var min = Math.min.apply(Math, disk_capacity_list);

    sum = min * (length - 2);
    backup = min * 2;
    for(var i in disk_capacity_list){
        waste =  waste + (disk_capacity_list[i] - min);
    }
    return [sum, backup, waste];
}
function raid10Caculator(disk_capacity_list){
    disk_capacity_list.sort();
    var waste = 0;
    var backup = 0;
    var sum = 0;
    var length = disk_capacity_list.length;

    var raid_list = [];
    for(var i = 0; i < length; i++){
        if(i % 2 == 0){
            var raid_tmp = [];
            raid_tmp.push(disk_capacity_list[i]);
        }else{
            raid_tmp.push(disk_capacity_list[i]);
            var result = raid1Caculator(raid_tmp);
            sum = sum + result[0];
            backup = backup + result[1];
            waste = waste + result[2];
        }
    }
    return [sum, backup, waste];
}


function raid50Caculator(disk_capacity_list){
    disk_capacity_list.sort();
    var waste = 0;
    var backup = 0;
    var sum = 0;
    var length = disk_capacity_list.length;

    var raid1 = [];
    var raid2 = [];

    for(var i = 0; i < length; i++){
        if(i < (length / 2)){
            raid1.push(disk_capacity_list[i]);
        }else{
            raid2.push(disk_capacity_list[i]);
        }
    }
    var _raid1 = raid5Caculator(raid1);
    var _raid2 = raid5Caculator(raid2);

    return [_raid1[0] + _raid2[0], _raid1[1] + _raid2[1], _raid1[2] + _raid2[2]];
}

function raid60Caculator(disk_capacity_list){
    disk_capacity_list.sort();
    var waste = 0;
    var backup = 0;
    var sum = 0;
    var length = disk_capacity_list.length;

    var raid1 = [];
    var raid2 = [];

    for(var i = 0; i < length; i++){
        if(i < (length / 2)){
            raid1.push(disk_capacity_list[i]);
        }else{
            raid2.push(disk_capacity_list[i]);
        }
    }
    var _raid1 = raid6Caculator(raid1);
    var _raid2 = raid6Caculator(raid2);

    return [_raid1[0] + _raid2[0], _raid1[1] + _raid2[1], _raid1[2] + _raid2[2]];
}

function toGridObject(obj){
    var grid_obj = [];
    for(var i in obj){
        grid_obj.push({'item': i, 'value': obj[i]});
    }
    return grid_obj;
}

function makeid(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function popWindowView(title, msg, type){
    // type can be "info", "success", "warning" and "error".
    if(!type){
        type = 'info';
    }
    if(type != 'info' && type != 'success' && type != 'warning' && type != 'error'){
        type = 'info';
    }
    if(!title){
        var tmp = {
            info: 'Info',
            warning: 'Warning',
            success: 'Success',
            error: 'Error'
        };
        title = tmp[type]
    }
    if(window.top.is_demo){
        title = 'DEMO';
    }
    var png = {
        info: '/static/src/pic/icons/notify_info.png',
        warning: '/static/src/pic/icons/notify_warning.png',
        success: '/static/src/pic/icons/notify_success.png',
        error: '/static/src/pic/icons/notify_error.png'
    };

    var message = {
        title: title,
        message: msg,
        info_png: png[type]
    };
    var popup = window.top.popup;
    popup.show(message, type);
}


function showWindowView(width, height, title, msg_div, type, ok_function, cencel_function, initial_msg_div, notify_type){  // type: OK, OKCANCEL
    var offset = 40;
    if (notify_type != "default") {
        if(type == 'OK' && (msg_div.indexOf('input') == -1 || msg_div.indexOf('div') == -1)){
            popWindowView(title, msg_div, notify_type);
            ok_function();
            return true;
        }
    }

    if(type == 'OKCENCEL'){
    var buttons = ''
    }
    var language = JSON.parse(localStorage.getItem('index_language'));
    var r_id = makeid(10);
    if (language == null) {
        language = {};
        language['global'] = {};
        language['global']['ok'] = "OK";
        language['global']['cancel'] = "Cancel";
    }
    switch(type){
        case 'OKCENCEL':
            buttons = '<div id="showWindowView_ok_btn_' + r_id + '" class="error_btn" style="width: 45%; float: left">' + language.global.ok + '</div><div id="showWindowView_cencel_btn_' + r_id + '" class="error_btn" style="width: 45%; float: right;">' + language.global.cancel + '</div>';
            break;
        case 'OK':
            buttons = '<div id="showWindowView_ok_btn_' + r_id + '" class="error_btn" style="width: 99%">' + language.global.ok + '</div>';
            break;
    }

    var divs = '<div id="' + r_id + '"><div style="height:' + (height - offset - 10) + 'px; text-align: center; margin: 0px auto; margin-top:10px; width: 90%;">'+ msg_div +'</div><div style="text-align: center; width:90%; margin: 0 auto; height: '+ offset +'px;">' + buttons + '</div></div>';

    window.$("body").append(divs);

    var ew = $("#" + r_id).kendoWindow({
        close: function(e){
            if(type=='OK'){
                ok_function();
            }
            this.destroy();
        },
        height: height,
        width: width,
        modal: true,
        title: title,
        resizable: false
    }).data("kendoWindow");
    ew.center().open();
    $("#showWindowView_ok_btn_" + r_id).kendoButton({
        click: function(){
            ok_function();
            ew.close();
        }
    });

    if(type == 'OKCENCEL') {
        $("#showWindowView_cencel_btn_" + r_id).kendoButton().click(function () {
            cencel_function();
            ew.close();
        });
    }

    initial_msg_div();
}
//showErrorWindow(200, 100, 'asasas', '<div style="text-align: center;margin: 0px auto; margin-top: 10px; width: 50%; font-size: 20px;">1231321231</div>', 'OK', function(){ console.log('CLICK OK')}, function(){ console.log('CLICK CENCEL')});
function assignValue(data, assign_array){
    for(var i in assign_array){
        var selector = $("#" + assign_array[i].id)
        var value = eval("data." + assign_array[i].data);
        var value_assign = assign_array[i].value_assign;
        switch(assign_array[i].type){
            case 'textbox':
                selector.val(value);
                break;
            case 'checkbox':
                if(value_assign == undefined){
                    value_assign = ['0', '1']
                }
                if (value == value_assign[1]){
                    selector.prop('checked', true);
                }else{
                    selector.prop('checked', false);
                }
                break;
            case 'kendoNumericTextBox':
                selector.data("kendoNumericTextBox").value(+value);
                break;
            case 'kendoDropDownList':
                selector.data("kendoDropDownList").value(value);
                break;
            case 'kendoComboBox':
                selector.data("kendoComboBox").value(value);
                break;
            case 'radio':
                $("input[name=" + assign_array[i].id + "][value="+ value +"]").prop("checked",true)
                break;
            case 'kendoDatePicker':
                selector.data("kendoDatePicker").value(value);
                break;
            case 'label':
                selector.text(value);
                break;
            case 'kendoListView':
                var source = new kendo.data.DataSource({
                    data: value,
                });
                selector.data("kendoListView").setDataSource(source);
                break;
            case 'kendoMultiSelect':
                selector.data("kendoMultiSelect").value(value);
                break;
            case 'kendoMultiSelect_string':
                var tmpv = value.split(',');
                selector.data("kendoMultiSelect").value(tmpv);
                break;
        }
    }
}

function no_action(){}

function assignLanguage(lang_obj){
    for(var i in lang_obj){
        var prefix = i;
        var value = lang_obj[i];
        for(var j in value){
            for(var k = 1; k <= 5; k++){
                $("#_" + prefix + "_" + j).text(value[j]);
                var selector = $("#_" + prefix + "_" + j + k);
                if (selector.length == 0){
                    break;
                }else{
                    selector.text(value[j]);
                }
            }
        }
    }
}

function onUploadError(e) {
    return;
    // Array with information about the uploaded files
    var files = e.files;
    var file_name = files[0].name;
    if (e.operation == "upload") {
        showWindowView(300, 100, 'Upload Fail', 'Upload '+ file_name +' Fail', 'OK', function(){}, function(){}, function(){});
    }
}

function onUpload(e){
    var files = e.files;
}

function downloadResult(result, url, fail_string){
    if(result == false){
        showWindowView(300, 100, 'Fail', fail_string, 'OK', function(){}, function(){}, function(){}, "default");
    }else{
        window.location.href = url;
    }
}

function get_download_file(url, fail_string, success_func, language){
    LoadingWindowShow();
    var $ifrm = $("<iframe style='display:none' />");
    $ifrm.attr("src", url);
    $ifrm.appendTo("body");
    $ifrm.load(function () {
        var isFirefox = typeof InstallTrigger !== 'undefined';
        if(!isFirefox){
            //if the download link return a page
            //load event will be triggered
            var $iframe = $(this);
            var $contents = $iframe.contents();
            var error_code = $contents.find('pre').text();
            if(fail_string == undefined || fail_string == ''){
                fail_string = language['error'][error_code];
            }
            downloadResult(false, url, fail_string);
            LoadingWindowClose();
        }
    });
    LoadingWindowClose();
    if(success_func){
        success_func();
    }
}

function initTreeView($treeview, url, change_func, checkbox, auto_bind, dataSourceChange_func, single){
    if(url == undefined){
        url = "action_php/folders.php"
    }
    folders = new kendo.data.HierarchicalDataSource({
        transport: {
            read: {
                url: url,
                dataType: "json"
            }
        },
        schema: {
            model: {
                id: "path",
                hasChildren: "directory"
            }
        },
        change: (dataSourceChange_func == undefined)? no_action() : dataSourceChange_func,
    });
    if(checkbox == true){
        if(!$treeview.data('kendoTreeView')) {
            var treeview = $treeview.kendoTreeView({
                dataSource: folders,
                dataTextField: "name",
                change: change_func,
                autoBind: (auto_bind == undefined) ? true : auto_bind,
                checkboxes: {
                    checkChildren: false
                },
            }).data("kendoTreeView");
        }else{
            $treeview.data('kendoTreeView').setDataSource(folders);
        }
    }else {
        if(!$treeview.data('kendoTreeView')) {
            var treeview = $treeview.kendoTreeView({
                dataSource: folders,
                dataTextField: "name",
                change: change_func,
                autoBind: (auto_bind == undefined) ? true : auto_bind,
            }).data("kendoTreeView");
        }else{
            $treeview.data('kendoTreeView').setDataSource(folders);
        }
    }

    if(single){
        $treeview.on("click", ":checkbox", function(e) {
            var tree = $treeview.data("kendoTreeView");
            uncheck(tree.dataSource.data());
            tree.dataItem(e.currentTarget).set("checked", true);
        });
    }

    return treeview;
}

function closeTopWindow(window_id){
    window.top.$("#" + window_id).data("kendoWindow").close();
}

function getData(get_array, _data){
    var inner_data = _data
    if (_data == undefined){
        inner_data = {}
    }
    for(var i in get_array){
        var obj = get_array[i];
        var type = obj.type;
        var id = obj.id;
        var key = obj.key;
        var value_assign = (obj.value_assign == undefined) ? ['0', '1'] : obj.value_assign ;
        var selector = $("#" + id);
        switch (type){
            case 'kendoDropDownList':
                inner_data[key] = selector.data(type).value();
                break;
            case 'kendoComboBox':
                inner_data[key] = selector.data(type).value();
            case 'textbox':
                inner_data[key] = selector.val();
                break;
            case 'checkbox':
                inner_data[key] = selector.prop('checked') ? value_assign[1] : value_assign[0];
                break;
            case 'radio':
                inner_data[key] = $("input[name=" + id + "]:checked").val();
                break;
            case 'kendoNumericTextBox':
                inner_data[key] = selector.data(type).value();
                if (inner_data[key] == null) {
                    inner_data[key] = ""
                }
                inner_data[key] = inner_data[key].toString();
                break;
            case 'kendoTreeView':
                inner_data[key] = getTreeViewNode(selector);
                break;
            case 'kendoListView':
                inner_data[key] = selector.data(type).dataSource.data().toJSON();
                break;
            case 'kendoMultiSelect':
                inner_data[key] = selector.data(type).value();
                break;
            case 'kendoDatePicker':
                inner_data[key] = selector.data(type).value();
                break;
        }
    }
    return inner_data
}

function setGridCheckboxClick($grid, grid_id, css, css_mapping, conflic_columns){
    $grid.data("kendoGrid").tbody.on('click', css, function (e) {
        var row = $(e.target).closest("tr");
        var item = $grid.data("kendoGrid").dataItem(row);
        for(var i in conflic_columns){
            if(conflic_columns[i].id == css_mapping){
                continue;
            }
            item.set(conflic_columns[i].id, false);
        }
        item.set(css_mapping, $(e.target).prop("checked"));
        for(var i in conflic_columns){
            if(conflic_columns[i].id == css_mapping){
                continue;
            }
            $("#" + conflic_columns[i].check_all_id).prop('checked', false);
        }

        var displayedData = $grid.data().kendoGrid.dataSource.data();
        folder_data = JSON.stringify(displayedData);
    });
}


function setGridCheckboxSelectAll(grid_id ,id, conflic_columns) {
    $("#" + grid_id).data("kendoGrid").thead.on("click", "#" + id, function (e) {
        for(var i in conflic_columns){
            if(conflic_columns[i].check_all_id == id){
                continue;
            }
            $("#" + conflic_columns[i].check_all_id).prop('checked', false);
        }
        var ds = $("#" + grid_id).data().kendoGrid.dataSource.data();
        for (var i = 0; i < ds.length; i++) {
            for(var j in conflic_columns){
                if(conflic_columns[j].check_all_id == id){
                    ds[i][conflic_columns[j].id] = $("#" + id).prop('checked');
                    continue;
                }
                ds[i][conflic_columns[j].id] = false;
            }
        }
        var new_ds = new kendo.data.DataSource({
            data: ds
        });
        $("#" + grid_id).data("kendoGrid").setDataSource(new_ds);

    });
}

function gridCheckboxSet($grid, grid_id, conflict_array){
    for(var i in conflict_array){
        for(var j in conflict_array[i]){
            setGridCheckboxClick($grid, 'acl_grid', conflict_array[i][j].css, conflict_array[i][j].id, conflict_array[i]);
        }
    }
}

function selectAll(grid_id, conflict_columns){
    for(var i in conflict_columns){
        setGridCheckboxSelectAll(grid_id, conflict_columns[i].check_all_id, conflict_columns);
    }
}

function gridSelectAll(grid_id, conflict_array){
    for(var i in conflict_array){
        selectAll(grid_id, conflict_array[i]);
    }
}

function refresh_user_grid_from_topwindow(grid_id) {
    var grid = window.top.$("#setting_panel").children("iframe")[0].contentWindow.$("#service_window").children("iframe")[0].contentWindow.$("#" + grid_id).data("kendoGrid");
    grid.dataSource.read();
    grid.refresh();
}

function clearGridSelectAllCheckbox(collection){
    for(var i in collection){
        for(var j in collection[i]) {
            var id = collection[i][j].check_all_id;
            $("#" + id).prop('checked', false);
        }
    }
}

function componentEnableHandler(component, kendo_or_not, controller_attr, event_type, all){
    /*
    component: the control area id
    kendo_or_not: boolean
    controller_attr: it will set disable or enable according the value, for example, assign a checkbox checked property
    event_type: 1 is visible or invisible, 2 is enable or disable.
    all: if component is a div, set all as true is mean all component in this area will be effected.
     */
    if(event_type == 1){ // visibility
        if(kendo_or_not == true){
            if(controller_attr){
                component.show();
            }else{
                component.hide();
            }
        }else{
            if (controller_attr == undefined){
                component.toggle();
            }else {
                component.toggle(controller_attr);
            }
        }
    }

    if(event_type == 2){  // enabled
        if(kendo_or_not == true){
            component.enable(controller_attr);
        }else{
            if(all == true){
                component = $("#" + component.attr('id') + " *")
            }
            component.prop('disabled', controller_attr);
        }
    }
}

function assignDescription(div_id, desc_array){
    /*
    var xxxx_desc_arry = [
        {'id': 'xxxx_desc5', 'value': language.xxxx.desc4, 'css': 'description_css'}, //allow self-define css
        {'id': 'xxxx_desc4', 'value': language.xxxx.desc3, 'css': 'description_css'},
        {'id': 'xxxx_desc3', 'value': language.xxxx.desc2, 'css': 'description_css'},
        {'id': 'xxxx_desc2', 'value': language.xxxx.desc1, 'css': 'description_css'},
        {'id': 'xxxx_desc1', 'value': language.xxxx.desc, 'css': 'description_css'},
    ];
     */
    var selector = $('#' + div_id);
    for(var i = 0; i <=100; i++){
        if(desc_array[i] == undefined || desc_array[i].value == undefined){
            break;
        }
        if(desc_array[i].css == undefined){
            desc_array[i].css = 'description_css';
        }
        var div = '<div id="' + desc_array[i].id + '" class="'+ desc_array[i].css +'">' + desc_array[i].value + '</div>';

        selector.after(div);
    }
}

function initListView($listview, template, data){
    var source_dataSource = new kendo.data.DataSource({
        data: data
    });

    $listview.kendoListView({
        dataSource: source_dataSource,
        template: template
    });

    return $listview.data('kendoListView');
}

function spaceUnitTranslate(original_value, original_unit, new_unit, fix, return_unit){
    var ov = parseInt(original_value);
    var unit_filter = {
        'BYTE': 0.0009765625,
        'KB': 1,
        'MB': 1024,
        'GB': 1048576,
        'TB': 1073741824,
        'AUTO': 1
    };
    var value = ov * unit_filter[original_unit.toUpperCase()];
    if (new_unit.toUpperCase() != 'AUTO') {
        return parseFloat((value / unit_filter[new_unit.toUpperCase()]).toFixed(fix));
    }else{
        var d_unit = (value < 1024) ? 'KB' : (value < 1048576) ? 'MB' : (value < 10737410824) ? 'GB' : 'TB';
        var final_value = value / unit_filter[d_unit];
        return [parseFloat(final_value.toFixed(fix)), (return_unit == true) ? d_unit : unit_filter[d_unit]];
    }
}

function mappingDataToListView($listview, data){
    var ds = new kendo.data.DataSource({
        data: data
    });
    $listview.data('kendoListView').setDataSource(ds);
}

function objListToArray(objList, key){
    var tmp = [];
    for(var i in objList){
        if (objList[i] == undefined){
            continue;
        }
        var ttmp = eval('objList[i].' + key);
        if(ttmp != undefined){
            tmp.push(ttmp);
        }
    }
    return tmp;
}

function createWizardWindow(window_id, url, title, height, width, close_fun, modal, resizable){
    if(modal == undefined){
        modal == true;
    }
    if(resizable == undefined){
        resizable == false;
    }

    if (window.top.$("#" + window_id).length==0) {
        add_windows_array("#" + window_id)
        var new_windows = window.top.$("<div id='" + window_id + "'></div>").appendTo(document.body).kendoWindow({
            close: function (e) {
                close_fun();
                remove_windows_array("#" + window_id)
                this.destroy();
            },
            content: encodeURI(url),
            iframe: true,
            height: height,
            minHeight: height,
            width: width,
            minWidth: width,
            modal: modal,
            open: onOpen,
            title: title,
            refresh: onRefresh,
            resizable: resizable,
            actions: resizable ? ["Maximize", "Close"] : ["Close"],
        }).data("kendoWindow").center().open();
    }else{
        var new_windows = window.top.$("#" + window_id).kendoWindow({
            close: function (e) {
                close_fun();
                this.destroy();
            },
            content: url,
            iframe: true,
            height: height,
            width: width,
            modal: modal,
            open: onOpen,
            title: title,
            refresh: onRefresh,
            resizable: resizable,
            actions: resizable ? ["Maximize", "Close"] : ["Close"],
        }).data("kendoWindow").center().open().toFront();

    }
}

function refreshGrid($id, refresh){
    var grid = $id.data('kendoGrid');
    grid.dataSource.read();
    if(refresh){
        grid.refresh();
    }
}


function refreshSelfWindow(url){
    var iframeWindow = window;
    var parentWindow = iframeWindow.parent;

    parentWindow.$("[data-role=window]").each(function() {
        var dialog = parentWindow.$(this).data("kendoWindow");
        var iframe = parentWindow.$(this).find("iframe");
        var id = parentWindow.$(this).attr('id');

        var contentWindow = iframe.length && iframe[0].contentWindow;
        if (contentWindow == iframeWindow) {
            dialog.open();
            dialog.refresh(url);
        }
    })
}


function close_this_window(e){
    if (e != undefined) {
        e.preventDefault();
    }
    var iframeWindow = window;
    var parentWindow = iframeWindow.parent;

    parentWindow.$("[data-role=window]").each(function() {
        var dialog = parentWindow.$(this).data("kendoWindow");
        var iframe = parentWindow.$(this).find("iframe");
        var contentWindow = iframe.length && iframe[0].contentWindow;

        if (contentWindow == iframeWindow) {
            dialog.close();
        }
    })
}

function send_app_action(module_name, status) {
    LoadingWindowShow();
    var final_data = {
        'module_name': module_name,
        'status': status
    };

    $.ajax({
        url: '/center/app/info/' + module_name + '/',
        type: 'POST',
        data: JSON.stringify(final_data),
        success: function(result){
            LoadingWindowClose();
            if(result.error == '0'){
                showWindowView(300, 100, 'permission denied', 'permission denied', 'OK', function(){

                }, no_action, no_action);
            }
            if (result.responseText == 'True'){
                switch(status){
                    case 'install': //install
                        showWindowView(230, 100, all_language['app_center']['install_success_title'], all_language['app_center']['install_successfully'], 'OK', no_action, no_action, no_action);
                        break;
                    case 'uninstall': //uninstall
                        showWindowView(230, 100, all_language['app_center']['uninstall_success_title'], all_language['app_center']['uninstall_successfully'], 'OK', no_action, no_action, no_action);
                        break;
                }
            }
        },
        error: function(result){
            LoadingWindowClose();
            if (result.responseText == 'True'){
                switch(status){
                    case 'install':
                        showWindowView(230, 100, all_language['app_center']['install_success_title'], all_language['app_center']['install_successfully'], 'OK', no_action, no_action, no_action);
                        break;
                    case 'uninstall':
                        showWindowView(230, 100, all_language['app_center']['uninstall_success_title'], all_language['app_center']['uninstall_successfully'], 'OK', no_action, no_action, no_action);
                        break;
                }
            }
        }
    });
}

function shutdown_nas(show_tip, title, msg){
    if(!title){
        title = 'Shutdown'
    }
    if(!msg){
        msg = 'Shutdown Now?'
    }
    $.ajax({
        url: '/control/power/is_ready_down/',
        type: 'GET',
        error: no_action,
        success: function(result) {
            LoadingWindowClose()
            switch (result){
                case true:
                    if(show_tip){
                        showWindowView(300, 100, title, msg, 'OK', function(){
                            window.top.location.href = '/control/power/sysdown/?action=halt'
                        }, no_action, no_action);
                    }else{
                        window.top.location.href = '/control/power/sysdown/?action=halt';
                    }
                    break;
                default :
                    showWindowView(300, 100, all_language['power']['btn_shutdown'], all_language['power']['cannot_poweroff'] + "<p><div>" + all_language['power']['suspend_' + result] + "</div>", 'OK', no_action, no_action, no_action);
                    break;
            }
        }
    });



    
}

function reboot_nas(show_tip, title, msg){
    if(!title){
        title = 'Reboot'
    }
    if(!msg){
        msg = 'Reboot Now?'
    }
    $.ajax({
        url: '/control/power/is_ready_down/',
        type: 'GET',
        error: no_action,
        success: function(result) {
            LoadingWindowClose()
            switch (result){
                case true:
                    if(show_tip){
                        showWindowView(300, 100, title, msg, 'OKCENCEL', function(){
                            window.top.location.href = '/control/power/sysdown/?action=reboot';
                        }, no_action, no_action);
                    }else{
                        window.top.location.href = '/control/power/sysdown/?action=reboot';
                    }
                    break;
                default :
                    showWindowView(300, 100, all_language['power']['btn_shutdown'], all_language['power']['cannot_poweroff'] + "<p><div>" + all_language['power']['suspend_' + result] + "</div>", 'OK', no_action, no_action, no_action);
                    break;
            }
        }
    });
}

function nas_power(action){
    var power_ata = {
        'action': action
    };

    $.ajax({
        url: '/control/power/sysdown/',
        type: 'POST',
        //dataType: 'text',
        data: JSON.stringify(power_ata),
        error: no_action,
        success: no_action
    });
}

function select_tabs(tab){
    var id = "#" + tab + "_tab";
    var item = $(id);
    if(item.length == 0){
        return false;
    }
    if(!item.is(":visible")){
        return true;
    }
    $("#tabstrip").data("kendoTabStrip").activateTab(item);
}


function remove_windows_array(id){
    // remove windows id in open_windows array
    for(var i in open_windows){
        if(id == open_windows[i]){
            open_windows.splice(i, 1)
        }
    }
}

function add_windows_array(id){
    open_windows.push(id);
}


function object_clone(object) {
    var item = new Object();

    var item = $.extend({}, object);
    return item;
}


function imgAutoSize($ImgD, h, w) {
    var ImgD = $ImgD
    var image = new Image();
    image.src = ImgD.attr('src');
    image.onload = function(){
         if (image.width < w && image.height < h) {
             ImgD.width(image.width);
             ImgD.height(image.height);
         }
         else {
             if (w / h <= image.width / image.height) {
                 ImgD.width(w);
                 ImgD.height(w * (image.height / image.width));
             }
             else {
                 ImgD.width(h * (image.width / image.height));
                 ImgD.height(h);
             }
         }
    };

 }


// This function is for checking dhcp ip range. If false, the range is invalid.
function checkIpRangeValid(start_ip, end_ip) {
    var start = start_ip.split(".");
    var end = end_ip.split(".");

    var result1 = (start[0] == end[0])? true: false;
    var result2 = (start[1] == end[1])? true: false;
    var result3 = (start[2] == end[2])? true: false;
    var result4 = (parseInt(start[3]) <= parseInt(end[3]))? true: false;

    return (result1 && result2 && result3 && result4);
}

function check_idle(){
    $.ajax({
        url: encodeURI('/idle'),
        type: 'GET',
        error: no_action,
        success: function(result){
            if(!result){
                window.top.location.href = '/admin/login/';
            }
        }
    });
}

function progressChange(progress_obj, percent){
    if(percent > 80){
        progress_obj.progressWrapper.css({
            "background-color": "red",
            "border-color": "red"
        });
        return true;
    }
    if(percent > 50){
        progress_obj.progressWrapper.css({
            "background-color": "orange",
            "border-color": "orange"
        });
        return true;
    }
    if(percent <= 50){
        progress_obj.progressWrapper.css({
            "background-color": "#8EBC00",
            "border-color": "#8EBC00"
        });
        return true;
    }
}

function function_tab_control(tabstrip_id, tab_array) {
    var all_function_status = window.all_function_status;

    for(var i in tab_array.reverse()){
        var func_name = tab_array[i].function_name;
        var func_status = all_function_status[func_name];

        if (func_status == undefined) {
            func_status = "0";
        }

        if (func_status != "0") {
            continue;
        }

        var tab_id = tab_array[i].tab_id;
        var selector = $('#' + tab_id);

        componentEnableHandler(selector, false, false, 1);
    }

    for (var i in tab_array.reverse()) {
        var func_name = tab_array[i].function_name;
        var func_status = all_function_status[func_name];

        if (func_status == "1") {
            var tabstrip = $('#' + tabstrip_id);
            var tab_id = tab_array[i].tab_id;
            var tab = $('#' + tab_id);
            if (tab != null) {
                var index = tab.index();
                tabstrip.data("kendoTabStrip").select(index);
                break;
            }
        }
    }
}
function findHighestZIndex()
{
    var divs = document.getElementsByTagName('div');
    var highest = 0;
    for (var i = 0; i < divs .length; i++)
    {
        var zindex = divs[i].style.zIndex;
        if (zindex > highest) {
            highest = zindex;
        }
    }
    return highest;
}

var hour = [];
for(var i =0 ; i<=24; i++){
    if(i < 10){
        hour.push({value: '0' + i});
        continue;
    }
    hour.push({value: '' + i});
}

var minute = [];
for(var i =0 ; i<=59; i++){
    if(i < 10){
        minute.push({value: '0' + i});
        continue;
    }
    minute.push({value: '' + i});
}


var open_windows = [];
var wizard_height = '470px';
var wizard_width = '680px';
var refresh_interval = 30000;
var monitor_widget_limit = 30;
var max_user_id = 20000;
var max_window = 4;
