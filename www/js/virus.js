
Ext.namespace("TCode.Virus");

TCode.Virus.Week = [
    { name:'week[]', boxLabel:'Monday', inputValue:1},
    { name:'week[]', boxLabel:'Tuesday', inputValue:2},
    { name:'week[]', boxLabel:'Wednesday', inputValue:3},
    { name:'week[]', boxLabel:'Thursday', inputValue:4},
    { name:'week[]', boxLabel:'Friday', inputValue:5},
    { name:'week[]', boxLabel:'Saturday', inputValue:6},
    { name:'week[]', boxLabel:'Sunday', inputValue:0}
];

TCode.Virus.ScanGrid = Ext.extend(Ext.grid.GridPanel, {
    //loadMask: true,
    stripeRows:true,
    viewConfig: {
        forceFit: true,
        autoSizeColumns:true
    },
    
    //initialization
    initComponent: function(){
        Ext.applyIf(this, {
            urlLoadData:'action.php?ac=getscan',
            urlSave:'action.php?ac=setscan',
            urlRemove:'action.php?ac=removescan',
            pageSize:21
        });
        this.rowSelectIndex= [];
        
        this.buildColumnModel();
        this.buildRecord();
        this.buildDataStore();
        this.buildToolbar();
        
        TCode.Virus.ScanGrid.superclass.initComponent.call(this);
        
        this.getSelectionModel().on("rowselect", this.rowSelect, this);
        this.getSelectionModel().on("rowdeselect", this.rowSelect, this);
    },
    
    rowSelect: function(sm, rowIndex, r){
        var total = sm.getSelections().length;
        switch(total){
            case 0:  //no select
                this.editbtn.setDisabled(true);
                this.deletebtn.setDisabled(true);
                this.startbtn.setDisabled(true);
                this.stopbtn.setDisabled(true);
                this.inflectbtn.setDisabled(true);
                break;
            case 1:  //single
                this.editbtn.setDisabled(false);
                this.deletebtn.setDisabled(false);
                //var record = sm.getSelections();
                var selections = sm.getSelections();
                var record = selections[0].get('inflectcount');
                if(record>0){
                    this.inflectbtn.setDisabled(false);
                }else{
                    this.inflectbtn.setDisabled(true);
                }
                // Only wait & scanning can't start
                var status = selections[0].get('status');
                if(status == '0' || status == '1'){
                    this.startbtn.setDisabled(true);
                }else{
                    this.startbtn.setDisabled(false);
                }
                // Only scanning can stop
                if(status == '1'){
                    this.stopbtn.setDisabled(false);
                }else{
                    this.stopbtn.setDisabled(true);
                }
                break;
            default: //multiple
                this.editbtn.setDisabled(true);
                this.deletebtn.setDisabled(false);
                this.startbtn.setDisabled(true);
                this.stopbtn.setDisabled(true);
                this.inflectbtn.setDisabled(true);
        }
    },
    
    /**
     * build column model of grid
     */
    buildColumnModel: function(){
        this.sm = new Ext.grid.CheckboxSelectionModel();
        var columnHeader = [];
        var i= 0;
        //columnHeader[0] = new Ext.grid.RowNumberer();
        columnHeader[0] = this.sm;
        
        for(i=0; i < this.fieldConfig.length ; i++){
            var col = this.fieldConfig[i];
            if(col.hideGrid === true){
                continue;
            }
            columnHeader.push({
                header: col.header,
                dataIndex: col.name,
                renderer: col.renderer
            });
        }
        this.cm = new Ext.grid.ColumnModel(columnHeader);
        this.cm.defaultSortable = true;
        this.columnModel  = this.cm;
    },
    buildRecord: function(){
        this.dataRecord = new Ext.data.Record.create(this.fieldConfig);
    },
    
    buildDataStore: function(){
        this.store = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({url:this.urlLoadData}),
            reader: new Ext.data.JsonReader({
                root:'root',
                totalProperty:'total'
            }, this.dataRecord),
            listeners:{
                scope:this,
                beforeload: function(){
                    if(this.rendered){
                        var checked = this.getSelections();
                        this.rowSelectIndex=[];
                        for (var i = 0 ; i < checked.length ;i++) {
                            var rowIndex = this.store.indexOf(checked[i]);
                            this.rowSelectIndex.push(rowIndex);
                        }
                        delete checked;
                    }
                },
                load: function(){
                    if(this.rendered){
                        if(this.store.getCount() >= 10 ){
                            this.addbtn.setDisabled(true);
                        }else{
                            this.addbtn.setDisabled(false);
                        }
                        for (var i = 0 ; i < this.rowSelectIndex.length ;i++) {
                            this.selModel.selectRow(this.rowSelectIndex[i], true);
                        }
                    }
                }
            }
        });
    },
    
    buildToolbar: function(){
        this.addbtn = new Ext.Toolbar.Button({
            text:'Add',
            iconCls:'add',
            handler: this.add.createDelegate(this)
        });
        this.editbtn = new Ext.Toolbar.Button({
            text:'Edit',
            iconCls:'edit',
            disabled:true,
            handler: this.edit.createDelegate(this)
        });
        this.deletebtn = new Ext.Toolbar.Button({
            text:'Delete',
            iconCls:'remove',
            disabled:true,
            handler: this.del.createDelegate(this)
        });
        this.startbtn = new Ext.Toolbar.Button({
            text:'Start',
            iconCls:'start',
            disabled:true,
            handler: this.start.createDelegate(this)
        });
        this.stopbtn = new Ext.Toolbar.Button({
            text:'Stop',
            iconCls:'stop',
            disabled:true,
            handler: this.stop.createDelegate(this)
        });
        this.inflectbtn= new Ext.Toolbar.Button({
            text:'Inflect List',
            iconCls:'app',
            disabled:true,
            handler: this.inflect.createDelegate(this)
        });
        this.tbar = new Ext.Toolbar([
            this.addbtn,
            this.editbtn,
            this.deletebtn,
            this.startbtn,
            this.stopbtn,'-',
            this.inflectbtn
        ]);
        this.bbar = new Ext.Toolbar([{xtype:'label',html:"<span style='color:darkgreen;font-weight:bold'>* Limited 10 tasks</span>"}]);
        //this.setHeight(392);
        this.store.load();
    },
    
    edit: function(){
        if(!this.dialog){
            this.createDialog();
        }
        this.dialog.show();
        this.dialog.setTitle("Edit scan");
        
        this.formPanel.getForm().reset();
        
        var record = this.getSelectionModel().getSelections()[0];
        this.scan_sid.setValue(record.get("sid"));
        this.scan_dir.setValue(record.get("dirfile"));
        this.scan_type.setValue(record.get("type"));
        this.scan_starttime.setValue(record.get("starttime"));
        this.scan_week.setValue(record.get("week"));
        this.scan_handletype.setValue(record.get("handletype"));
        
    },
    
    del: function(){
        Ext.Msg.confirm("VirusScan",'Are you sure to delete?',function(btn){
            if(btn == 'yes'){
                var selections = this.getSelectionModel().getSelections();
                var sids = [];
                if(selections.length === 0 ){
                    return false;
                }
                for(var i=0; i<selections.length ; i++){
                    var record = selections[i];
                    sids.push(record.get("sid"));
                }
                
                Ext.Ajax.request({
                    scope:this,
                    url:'action.php?ac=delscan',
                    params:{"sid[]":sids},
                    success:function(res){
                        if(res.responseText == '0'){
                            this.store.removeAll();
                        }
                        this.store.reload();
                    }
                });
            }
        }, this);
    },

    start: function(){
        Ext.Msg.confirm("VirusScan",'Are you sure to start?',function(btn){
            if(btn == 'yes'){
                var selections = this.getSelectionModel().getSelections();
                var sids = [];
                if(selections.length === 0 ){
                    return false;
                }

                for(var i=0; i<selections.length ; i++){
                    var record = selections[i];
                    sids.push(record.get("sid"));
                }

                Ext.Ajax.request({
                    scope:this,
                    url:'action.php?ac=startscan',
                    params:{"sid[]":sids},
                    success:function(){
                        this.store.reload();
                    }
                });

            } // if btn
        }, this);
    },

    stop: function(){
        Ext.Msg.confirm("VirusScan",'Are you sure to stop?<br>Notice: Other tasks with the same scheduling time will also stop !',function(btn){
            if(btn == 'yes'){
                var selections = this.getSelectionModel().getSelections();
                var sids = [];
                if(selections.length === 0 ){
                    return false;
                }

                for(var i=0; i<selections.length ; i++){
                    var record = selections[i];
                    sids.push(record.get("sid"));
                }

                Ext.Ajax.request({
                    scope:this,
                    url:'action.php?ac=stopscan',
                    params:{"sid[]":sids},
                    success:function(){
                        this.store.reload();
                    }
                });

            } // if btn
        }, this);
    },

    
    inflect:function(){
        var selections = this.getSelectionModel().getSelections();
        Ext.getCmp('maintabpanel').setActiveTab(2);
        Ext.getCmp('quarantine_grid').store.load({params:{sid:selections[0].get('sid'),start:0,limit:this.pageSize }});
    },
    
    add: function(){
        if(!this.dialog){
            this.createDialog();
        }
        this.dialog.show();
        this.dialog.setTitle("Add scan");
        this.formPanel.getForm().reset();
    },
    
    createDialog: function(){
        this.scan_type = new Ext.form.RadioGroup({
            name:'type',
            fieldLabel:'Point in time',
           // width:300,
            items:[
                 {boxLabel:'Now',name:'type', inputValue:0, checked:true},
                 {boxLabel:'Daliy',name:'type', inputValue:1},
                 {boxLabel:'Weekly',name:'type', inputValue:2}
            ],
            listeners:{
                change:this.radioTimeChange.createDelegate(this),
                render: function() {
                    while( (el = this.el.child('div.x-panel-body') ) ) {
                        el.removeClass('x-panel-body');
                    }
                    while( (el = this.el.child('div.x-form-radio-wrap') ) ) {
                        el.removeClass('x-form-radio-wrap');
                        el.setWidth(200);
                    }
                }
            }
        });
        
        this.scan_starttime = new Ext.form.TimeField({
            name:'starttime',
            hidden:true,
            fieldLabel:'Start time',
            readOnly:true,
            allowBlank:false,
            listWidth:100
        });
        
        this.scan_week = new Ext.form.CheckboxGroup({
            name:'week',
            fieldLabel:'Week',
            hidden:true,
            columns:4,
            allowBlank:false,
            items: TCode.Virus.Week,
            listeners: {
                render: function() {
                    while( (el = this.el.child('div.x-panel-body') ) ) {
                        el.removeClass('x-panel-body');
                    }
                    while( (el = this.el.child('div.x-form-check-wrap') ) ) {
                        el.removeClass('x-form-check-wrap');
                        el.setWidth(150);
                    }
                }
            }
        });
        
        this.scan_dir = new Ext.form.TextField({
            name:'dirfile',
            width:300,
            xtype:'textfield',
            readOnly:true,
            allowBlank:false,
            fieldLabel:'Scan directory/file'
        });
        this.scan_sid = new Ext.form.Hidden({
            name:'sid',
            value:'0'
        });
        this.scan_handletype = new Ext.form.RadioGroup({
            fieldLabel:'After infection',
            //width:300,
            name:'handletype',
            items:[
                { boxLabel:'Quarantine', inputValue:0, name:'handletype', checked:true},
                { boxLabel:'Delete virus', inputValue:1, name:'handletype'}
            ]
        });

        this.browseDir = function(){
            var self = this;
            var filem = new Ext.ux.FileManager({
                url:'/adm/setmain.php?fun=setdvd&ac=getfiles',
                title:'Select directory or file you want to scan',
                singleSelect:true,
                multiSelect:false,
                text:{
                    location:'location',
                    required:'required',
                    loading:'loading',
                    select:'Select',
                    cancel:'Cancel',
                    nofile:'nofile',
                    view:'view',
                    search:'Search',
                    name:'Name',
                    size:'Size',
                    type:'Type',
                    list:'List',
                    thumbimage:'thumbimage',
                    sort:'Sort'
                } 
            });
            filem.on("selectfile",function(file){
                self.scan_dir.setValue(file[0].data.url.replace(/^\/raid.{0,4}\/data\//,''));
            });
            filem.show();
        }
        this.formPanel = new Ext.form.FormPanel({
            frame:true,
            url:this.urlSave,
            labelWidth: 150,
            items:[
            this.scan_sid,
            {
                layout:'table',
                layoutConfig:{columns:2},
                items:[
                    {
                        layout:'form',
                        items:[this.scan_dir]
                    },
                    {
                        style:'margin-left:10px',
                        xtype:'button',
                        text:'Browse',
                        handler:this.browseDir.createDelegate(this)
                    }
                ]
            },
            this.scan_handletype,
            {
                xtype:'label',
                html:'<span style="font-weight:bold">Store delete virus path</span>:/NAS_Public/Virus_yyyyMMdd_HHmmss',
                style:'color:green'
            },
            this.scan_type,
            this.scan_starttime,
            this.scan_week
            ]
        });
        
        this.dialog = new Ext.Window({
            title:'Add scan',
            width:this.dlgWidth ? this.dlgWidth: 400,
            height:this.dlgHeight ? this.dlgHeight: 300,
            frame:true,
            constrain:true,
            border:false,
            modal:true,
            layout:'fit',
            closeAction:'hide',
            items:[this.formPanel],
            buttons:[{
                    text:'Apply',
                    handler:function(){
                        if(this.formPanel.getForm().isValid()){
                            this.dialog.hide();
                            this.formPanel.getForm().submit({
                                scope:this,
                                failure: function(form, action){
                                    Ext.Msg.show({
                                        title:'VirusScan',
                                        msg:action.result.msg,
                                        width:300,
                                        buttons:Ext.MessageBox.OK,
                                        icon:Ext.MessageBox.ERROR
                                    });
                                },
                                success:function(form, action){
                                    this.store.reload();
                                }
                            });
                        }
                    }.createDelegate(this)
                },{
                    text:'Cancel',
                    handler:function(){
                        this.dialog.hide();
                    }.createDelegate(this)
                }
            ]
        });
    },
    
    radioTimeChange: function(radio, value){
        this.scan_starttime.hide();
        this.scan_week.hide();
        this.scan_starttime.getEl().up('.x-form-item').setDisplayed(false);
        this.scan_week.getEl().up('.x-form-item').setDisplayed(false);
        this.scan_starttime.setDisabled(true);
        this.scan_week.setDisabled(true);
        switch(value){
            case '1':
                this.scan_starttime.show();
                this.scan_starttime.getEl().up('.x-form-item').setDisplayed(true);
                this.scan_starttime.setDisabled(false);
                break;
            case '2':
                this.scan_starttime.show();
                this.scan_starttime.getEl().up('.x-form-item').setDisplayed(true);
                this.scan_starttime.setDisabled(false);
                this.scan_week.show();
                this.scan_week.getEl().up('.x-form-item').setDisplayed(true);
                this.scan_week.setDisabled(false);
                break;
        }
    }
});


TCode.Virus.QuarantineGrid = Ext.extend(Ext.grid.GridPanel, {
    loadMask: true,
    stripeRows:true,
    viewConfig: {
        forceFit: true,
        autoSizeColumns:true
    },
    
    //initialization
    initComponent: function(){
        Ext.applyIf(this, {
            urlLoadData:'action.php?ac=getquarantine',
            urlRestore:'action.php?ac=restore',
            urlRemove:'action.php?ac=delquarantine',
            urlRemoveAll:'action.php?ac=delallquarantine',
            pageSize:21
        });
        
        this.buildColumnModel();
        this.buildRecord();
        this.buildDataStore();
        this.buildToolbar();
        
        TCode.Virus.QuarantineGrid.superclass.initComponent.call(this);
        
        this.getSelectionModel().on("rowselect", this.rowSelect, this);
        this.getSelectionModel().on("rowdeselect", this.rowSelect, this);
    },
    
    rowSelect: function(sm, rowIndex, r){
        var total = sm.getSelections().length;
        switch(total){
            case 0:  //no select
                this.restorebtn.setDisabled(true);
                this.deletebtn.setDisabled(true);
                break;
            default: //multiple
                this.restorebtn.setDisabled(false);
                this.deletebtn.setDisabled(false);
        }
    },
    
    /**
     * build column model of grid
     */
    buildColumnModel: function(){
        this.sm = new Ext.grid.CheckboxSelectionModel();
        var columnHeader = [];
        var i = 0;
        columnHeader[0] = this.sm;
        
        for(i=0; i < this.fieldConfig.length ; i++){
            var col = this.fieldConfig[i];
            if(col.hideGrid === true){
                continue;
            }
            columnHeader.push({
                header: col.header,
                dataIndex: col.name,
                renderer: col.renderer
            });
        }
        this.cm = new Ext.grid.ColumnModel(columnHeader);
        this.cm.defaultSortable = true;
        this.columnModel  = this.cm;
    },
    buildRecord: function(){
        this.dataRecord = new Ext.data.Record.create(this.fieldConfig);
    },
    
    buildDataStore: function(){
        this.store = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({url:this.urlLoadData}),
            reader: new Ext.data.JsonReader({
                root:'root',
                totalProperty:'total'
            }, this.dataRecord)
        });
    },
    
    buildToolbar: function(){
        this.restorebtn = new Ext.Toolbar.Button({
            text:'Restore',
            iconCls:'restore',
            disabled:true,
            handler: this.restore.createDelegate(this)
        });
        this.deletebtn = new Ext.Toolbar.Button({
            text:'Delete',
            iconCls:'remove',
            disabled:true,
            handler: this.del.createDelegate(this)
        });
        this.deleteallbtn = new Ext.Toolbar.Button({
            text:'Delete all',
            iconCls:'remove',
            handler: this.delall.createDelegate(this)
        });
        this.listbtn= new Ext.Toolbar.Button({
            text:'List all',
            iconCls:'app',
            handler: this.listall.createDelegate(this)
        });
        this.tbar = new Ext.Toolbar([
            this.restorebtn,
            this.deletebtn,
            this.deleteallbtn,
            '-',this.listbtn
        ]);
        this.bbar = new Ext.PagingToolbar({
            pageSize:this.pageSize,
            store:this.store,
            displayInfo:true,
            displayMsg:'display {0}~{1}, total:{2}',
            emptyMsg:'no record'
        });
        this.store.load({params:{start:0,limit:this.pageSize}});
    },
    listall:function(){
        this.store.load({params:{start:0,limit:this.pageSize}});
    },
    
    del: function(){
        Ext.Msg.confirm("Delete", "Are you sure to delete?", function(btn){
            if(btn=='yes'){
                var selections = this.getSelectionModel().getSelections();
                var qids = [];
                if(selections.length === 0 ){
                    return false;
                }
                for(var i=0; i<selections.length ; i++){
                    var record = selections[i];
                    qids.push(record.get("qid"));
                }
                
                Ext.Ajax.request({
                    scope:this,
                    url:this.urlRemove,
                    params:{"qid[]":qids},
                    success:function(){
                        this.store.reload();
                    }
                });
            }
        }, this);
    },
    
    delall: function(){
        Ext.Msg.confirm("Delete all", "Are you sure to delete all?", function(btn){
            if(btn=='yes'){
                Ext.Ajax.request({
                    scope:this,
                    url:this.urlRemoveAll,
                    success:function(){
                        this.store.reload();
                    }
                });                
            }
        }, this);
    },
    
    restore: function(){
        Ext.Msg.confirm("Restore", "Are you sure to restore?", function(btn){
            if(btn=='yes'){
                var selections = this.getSelectionModel().getSelections();
                var qids = [];
                if(selections.length === 0 ){
                    return false;
                }
                for(var i=0; i<selections.length ; i++){
                    var record = selections[i];
                    qids.push(record.get("qid"));
                }
                Ext.Ajax.request({
                    scope:this,
                    url:this.urlRestore,
                    params:{"qid[]":qids},
                    success:function(){
                        this.store.reload();
                    }
                });
            }
        }, this);
        
    }
});


TCode.Virus.Status = Ext.extend(Ext.form.FormPanel, {
    defaultType:'textfield',
    labelAlign:'top',
    initComponent: function(){
        this.items = [
            { hideLabel:true,inputType:'image',style:'cursor:default', autoCreate:{tag:'input', type:'image', src:'images/virusicon.png'}},
            { fieldLabel:'Last scan', id:'lastscan', cls:'fakeLabel', readOnly:true},
            { fieldLabel:'Last update', id:'lastupdate', cls:'fakeLabel', readOnly:true}
        ];
        TCode.Virus.Status.superclass.initComponent.call(this);
    }
});

var task;
Runner = {
    run: function(){
        Ext.Ajax.request({
            url:'action.php?ac=updatenow_check',
            success: function(res){
                var progress = res.responseText;
                if(!Ext.isEmpty(progress)){
                    if(progress=='100'){
                        task.stop(Runner);
                        task.start(RunnerScan);
                        Ext.MessageBox.updateProgress(1, '100%');
                        setTimeout(function(){
                            Ext.MessageBox.hide();
                        },800);
                    }else if(progress=='101'){
                        task.stop(Runner);
                        task.start(RunnerScan);
                        Ext.MessageBox.hide();
                        Ext.Msg.show({title:'Update',msg:'Update failure, please check your network',icon:Ext.MessageBox.ERROR,buttons:Ext.MessageBox.OK});
                    }else{
                        Ext.MessageBox.updateProgress(progress/100, progress+'%');
                    }
                }
            }
        });
    },
    interval: 1000
}
RunnerManual = {
    run: function(){
        Ext.Ajax.request({
            url:'action.php?ac=manual_check',
            success: function(res){
                var progress = res.responseText;
                if(!Ext.isEmpty(progress)){
                    if(progress=='100'){
                        task.stop(RunnerManual);
                        task.start(RunnerScan);
                        setTimeout(function(){
                            Ext.MessageBox.hide();
                        },800);
                    }
                    Ext.MessageBox.updateProgress(progress/100, progress+'%');
                }
            }
        });
    },
    interval: 1000
}
RunnerScan = {
    run:function(){
        Ext.Ajax.request({
            url:'action.php?ac=load',
            callback:function(ajax, v, action){
                if(action.responseText!=''){
                    var obj = Ext.decode(action.responseText);
                    Ext.getCmp('lastupdate').setValue(obj[0].lastupdate);
                    var tmp  = Ext.getCmp('lastscan').getValue();
                    if(tmp != obj[0].lastscan){
                        Ext.getCmp('lastscan').setValue(obj[0].lastscan);
                        if(Virus.scan){
                            Virus.scan.store.reload();
                        }
                    }
                }
            }
        });
    },
    interval: 2000
}
task = new Ext.util.TaskRunner();
task.start(RunnerScan);



Virus = {
    init: function(){
        Ext.QuickTips.init();
        Ext.BLANK_IMAGE_URL = 'extjs/resources/images/default/s.gif';
       // Ext.form.Field.prototype.msgTarget = 'side';
        this.loadMeta();
        this.buildStatus();
        this.buildScan();
        this.buildUpdateCode();
        this.buildQuarantine();
        
        //control
        Virus.controlpanel = new Ext.Panel({
            region:'center',
            layout:'fit',
            frame:true,
            title:'Virus Control Panel',
            items:[{
                xtype:'tabpanel',
                id:'maintabpanel',
                activeTab:0,
                border:false,
                deferredRender:false,
                items:[ Virus.scan, Virus.updateCode, Virus.quarantine]
            }]
        });
        Virus.statuspanel = new Ext.Panel({
            layout:'fit',
            frame:true,
            split:true,
            collapsible:true,
            title:'Virus',
            region:'west',
            width:150,
            items:[ Virus.status ] 
        });
        
        var panel = new Ext.Panel({
            renderTo:'VirusDOM',
            height:595,
            width:1003,
            layout:'border',
            border:false,
            style:'margin:0 auto;text-align:left',
            items:[
                Virus.statuspanel, Virus.controlpanel
            ]
        });
    },
    loadMeta: function(){
        Ext.Ajax.request({
            scope:this,
            url:'action.php?ac=load',
            callback:function(ajax, v, action){
                var obj = Ext.decode(action.responseText);
                this.scheduleType.setValue(obj[0].type);
                this.scheduleStarttime.setValue(obj[0].starttime);
                this.scheduleWeek.setValue(obj[0].week);
                if(obj[0].type=='1'){
                    this.scheduleWeek.setDisabled(true);
                }else{
                    this.scheduleWeek.setDisabled(false);
                }
                if(obj[0].schedule == '0'){
                    this.scheduleFieldSet.collapse();
                }else{
                    this.scheduleFieldSet.expand();
                }
                Ext.getCmp('lastupdate').setValue(obj[0].lastupdate);
                Ext.getCmp('lastscan').setValue(obj[0].lastscan);
            }
        });
    },
    buildStatus: function(){
        Virus.status = new TCode.Virus.Status();
    },
    
    buildScan: function(){
        var metaData = [
            {name: 'sid', hideGrid:true},
            {name: 'type', hideGrid:true},
            {name: 'starttime', hideGrid:true},
            {name: 'week', hideGrid:true},
            {name: 'handletype', hideGrid:true},
            {header: "Directory/files", width: 220, name: 'dirfile'},
            {header: "Last scan",       width: 100, name: 'lastscan', type:'date', renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'), dateFormat:'Y-m-d H:i:s'},
            {header: "Inflect count",   width: 60,  name: 'inflectcount', renderer: this.scanInflectCount},
            {header: "Status",          width: 100, name: 'status', renderer: this.scanResult}
        ];
        
        Virus.scan = new TCode.Virus.ScanGrid({
            fieldConfig : metaData,
            title:'Scanner',
            layout:'fit',
            dlgWidth:650,
            dlgHeight:280
        });
    },
    scanInflectCount: function(value){
        return (value>0)?"<span style='color:red'>"+value+"</span>": value;
    },
    
    scanResult: function(value){
        var result = ["<span style='color:blue'>Wait...</span>","<span style='color:blue'>Scanning...</span>","Finish","<span style='color:red'>Failure</span>","Terminate"];
        return result[value];
    },
    

    progressWin: function(){
        Ext.MessageBox.show({
            title:'Update',
            msg:'Update now...',
            progress:true,
            progressText:'0%',
            closable:false,
            width:300,
            buttons:Ext.Msg.CANCEL,
            fn: function(){
                task.stop(Runner);
                task.start(RunnerScan);
                Ext.MessageBox.hide();
            }
        });
    },
    
    progressManualWin: function(){
        Ext.MessageBox.show({
            title:'Update',
            msg:'Update now...',
            progress:true,
            progressText:'0%',
            closable:false,
            width:300,
            buttons:Ext.Msg.CANCEL,
            fn: function(){
                task.stop(RunnerManual);
                task.start(RunnerScan);
                Ext.MessageBox.hide();
            }
        });
    },
   
    nowBtnClick: function(){
        Ext.Msg.confirm("Update", "Are you sure to update now?", function(btn){
            if(btn == 'yes'){
                Ext.Ajax.request({
                    scope:this,
                    url:'action.php?ac=updatenow',
                    success:function(){
                        Virus.progressWin();
                        task.stop(RunnerManual);
                        task.stop(RunnerScan);
                        task.start(Runner);
                    }
                });
            }
        }, this);
    },
    manualBtnClick:function(){
        if(Ext.getCmp('fileupload').getValue()!=''){
            Ext.Msg.confirm("Update", "Are you sure to update manual?", function(btn){
                if(btn == 'yes'){
                            
                    Ext.MessageBox.show({
                        msg: 'Update virus code, please wait...',
                        progressText: 'Upload...',
                        width:300,
                        wait:true,
                        waitConfig: {interval:200},
                        icon:'ext-mb-upload'
                    });
            
                    this.manualForm.getForm().submit({
                        url:'action.php?ac=manual',
                        failure: function(obj, res){
                            var value = res.result.msg;
                            Ext.MessageBox.hide();
                            Ext.MessageBox.show({
                                title:'Update',
                                msg:value,
                                width:300,
                                icon:Ext.MessageBox.ERROR,
                                buttons:Ext.Msg.OK
                            });
                        },
                        success:function(){
                            Ext.MessageBox.hide();
                            Ext.MessageBox.show({
                                title:'Update',
                                msg:'Update success',
                                width:300,
                                icon:Ext.MessageBox.INFO,
                                buttons:Ext.Msg.OK
                            });
                        }
                    });
                }
            }, this);
        }
        
    },
    
    scheduleTypeChange: function(radio, value){
        this.scheduleStarttime.hide();
        this.scheduleWeek.hide();
        this.scheduleStarttime.getEl().up('.x-form-item').setDisplayed(false);
        this.scheduleWeek.getEl().up('.x-form-item').setDisplayed(false);
        if(value=='1'){
            this.scheduleWeek.setDisabled(true);
            this.scheduleStarttime.show();
            this.scheduleStarttime.getEl().up('.x-form-item').setDisplayed(true);
        }else{
            this.scheduleWeek.setDisabled(false);
            this.scheduleStarttime.show();
            this.scheduleWeek.show();
            this.scheduleStarttime.getEl().up('.x-form-item').setDisplayed(true);
            this.scheduleWeek.getEl().up('.x-form-item').setDisplayed(true); 
        }
    },
    
    scheduleSaveClick: function(){
        this.scheduleForm.getForm().submit({
            url:'action.php?ac=schedule',
            success:function(form, action){
                Ext.Msg.show({
                    title:'VirusScan',
                    msg:action.result.msg,
                    width:300,
                    buttons:Ext.MessageBox.OK,
                    icon:Ext.MessageBox.INFO
                });
            }
        });
    },
    
    scheduleCollapse: function(){
        Ext.Ajax.request({
            url:'action.php?ac=hideschedule'
        });
    },
    
    buildUpdateCode: function(){
        this.nowBtn = new Ext.Button({
            text:'Online update now',
            handler:this.nowBtnClick.createDelegate(this)
        });
        var nowUpdate = new Ext.Panel({
            items:[{
                    xtype:'fieldset',
                    title:'Update now',
                    autoHeight:true,
                    items:[ this.nowBtn,{
                            xtype:'label',
                            html:"Online update you should confirm your network is throud out the internet. Update will spent few minute."
                    }]
                }]
        });
        
        this.scheduleType = new Ext.form.RadioGroup({
            fieldLabel:'Type',
            items:[
                { boxLabel:'Daliy', name:'type', checked:true, inputValue:1},
                { boxLabel:'Weekly', name:'type', inputValue:2}
            ]
        });
        this.scheduleType.on("change", this.scheduleTypeChange, this);
        
        this.scheduleStarttime = new Ext.form.TimeField({
            name:'starttime',
            allowBlank:false,
            readOnly:true,
            fieldLabel:'Start time',
            listWidth:100
        });
        
        this.scheduleWeek = new Ext.form.CheckboxGroup({
            hidden:true,
            fieldLabel:'Week',
            columns:1,
            allowBlank:false,
            items: TCode.Virus.Week,
            listeners: {
                render: function() {
                    while( (el = this.el.child('div.x-panel-body') ) ) {
                        el.removeClass('x-panel-body');
                    }
                    while( (el = this.el.child('div.x-form-check-wrap') ) ) {
                        el.removeClass('x-form-check-wrap');
                        el.setWidth(150);
                    }
                }
            }
        });
        
        this.scheduleFieldSet = new Ext.form.FieldSet({
            title:'Schedule',
            autoHeight:true,
            checkboxToggle:true,
            checkboxName:'enable',
            collapsed: false, 
            buttonAlign:'left',
            items:[
                this.scheduleType,
                this.scheduleStarttime,
                this.scheduleWeek
            ],
            buttons:[{ text:'Save schedule', handler:this.scheduleSaveClick.createDelegate(this)}]
        });
        this.scheduleFieldSet.on("collapse", this.scheduleCollapse, this);
        
        this.scheduleForm = new Ext.form.FormPanel({
            height:500,
            items:[ this.scheduleFieldSet ] 
        });
        
        this.manualForm= new Ext.form.FormPanel({
            labelWidth:130,
            fileUpload: true,
            items:[{
                xtype:'fieldset',
                title:'Manual',
                autoHeight:true,
                buttonAlign:'left',
                items:[{ name:'manualtext',id:'fileupload', xtype:'fileuploadfield', fieldLabel:'Select update(*.zip)', allowBlank:false}],
                buttons:[{ text:'Manual update', handler:this.manualBtnClick.createDelegate(this)}]
            }]
        });
        
        
        //schedule
        Virus.updateCode = new Ext.Panel({
            frame:true,
            title:'Update',
            items:[nowUpdate, this.manualForm, this.scheduleForm]
        });
    },
    
    //quarantine
    buildQuarantine: function(){
        var metaData = [
            {name: 'qid', hideGrid:true},
            {name: 'sid', hideGrid:true},
            {header: "File name", width: 100,name: 'filename'},
            {header: "Path",width: 200, name: 'path'},
            {header: "Virus name", width: 100, name: 'virusname'}
        ];
        
        Virus.quarantine = new TCode.Virus.QuarantineGrid({
            id:'quarantine_grid',
            fieldConfig : metaData,
            urlLoadData:'action.php?ac=getquarantine',
            title:'Quarantine',
            layout:'fit',
            height:392,
            dlgWidth:550,
            dlgHeight:230
        });
    }
    
}

Ext.onReady(Virus.init, Virus);
