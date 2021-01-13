jQuery(document).ready(function($) {
    var JSGRID_EDIT_ROW_DATA_KEY = "JSGridEditRow";
    var JSGRID_ROW_DATA_KEY = "JSGridItem";
    var editRowClass = "jsgrid-edit-row";

    var shifts = $.parseJSON(php_vars.shifts);
    var jobs = $.parseJSON(php_vars.Job);
    var divisions = $.parseJSON(php_vars.Division);
    var programs = $.parseJSON(php_vars.Program);
    var locations = $.parseJSON(php_vars.Location);
    var status = [
        { Name: "Scheduled 計劃", Id: "Scheduled" },
        { Name: "Completed 完成", Id: "Completed" },
        { Name: "Cancelled 取消", Id: "Cancelled" },
    ];

    var YhvDateField = function(config) {
        jsGrid.Field.call(this, config);
    };

    YhvDateField.prototype = new jsGrid.Field({
        css: "date-field",
        align: "center",

        sorter: function(date1, date2) {
            return new Date(date1) - new Date(date2);
        },

        itemTemplate: function(value) {
            return new Date(value).toDateString();
        },

        insertTemplate: function(value) {
            return this._insertPicker = $("<input>").datepicker({ defaultDate: new Date() });
        },

        editTemplate: function(value) {
            if (this.readOnly) {
               return this._editPicker = $("<input>").datepicker().datepicker("setDate", new Date(value)).addClass('freezeDate');
            }
            return this._editPicker = $("<input>").datepicker().datepicker("setDate", new Date(value));
        },

        insertValue: function() {
            if (this._insertPicker.datepicker("getDate")) {
                return this._insertPicker.datepicker("getDate").toDateString();
            }
        },

        editValue: function() {
            if (this._editPicker.datepicker("getDate")) {
                return this._editPicker.datepicker("getDate").toDateString();
            }
        }
    });

    jsGrid.fields.date = YhvDateField;

    function YhvDecimalField(config) {
        jsGrid.fields.number.call(this, config);
    }

    YhvDecimalField.prototype = new jsGrid.fields.number({

        filterValue: function() {
            return this.filterControl.val()
                ? parseFloat(this.filterControl.val() || 0, 10)
                : undefined;
        },

        insertValue: function() {
            return this.insertControl.val()
                ? parseFloat(this.insertControl.val() || 0, 10)
                : undefined;
        },

        editValue: function() {
            return this.editControl.val()
                ? parseFloat(this.editControl.val() || 0, 10)
                : undefined;
        }
    });

    jsGrid.fields.decimal = jsGrid.YhvDecimalField = YhvDecimalField;

    var YhvTimeField = function(config) {
        jsGrid.Field.call(this, config);
    };

    YhvTimeField.prototype = new jsGrid.Field({
        css: "time-field",
        align: "center",

        itemTemplate: function(value) {
            return value;
        },

        insertTemplate: function(value) {
            return this._insertPicker = $("<input>").timepicker({ timeFormat: 'HH:mm' });
        },
        editTemplate: function(value) {
            if (this.readOnly) {
                return this._editPicker = $("<input>").timepicker({ timeFormat: 'HH:mm' }).timepicker("setTime", value).addClass('freezeDate');
            }
            return this._editPicker = $("<input>").timepicker({ timeFormat: 'HH:mm' }).timepicker("setTime", value);
        },
        insertValue: function() {
            return this._insertPicker.val();
        },
        editValue: function() {
            return this._editPicker.val();
        }
    });

    jsGrid.fields.time = jsGrid.YhvTimeField = YhvTimeField;

    jsGrid.validators.time = {
        message: "Please enter a valid time, between 00:00 and 23:59",
        validator: function(value, item) {
            return /^([01]\d|2[0-3]|[0-9])(:[0-5]\d){1,2}$/.test(value);
        }
    }

    var $grid = $("#jsGrid");

    $("#jsGrid").jsGrid({
        width: "100%",
        height: "500px",

        inserting: true,
        editing: true,
        sorting: true,
        paging: true,
        pageLoading: false,
        filtering: true,
        deleting: false,
        editFields_forBatch: [],
        _editingRows_forBatch: [],

        editButton: false,
        deleteButton: false,
        clearFilterButton: true,
        modeSwitchButton: true,
        searchModeButtonTooltip: "Switch to searching 轉至搜索", // tooltip of switching filtering/inserting button in inserting mode
        insertModeButtonTooltip: "Switch to inserting 轉至添加", // tooltip of switching filtering/inserting button in filtering mode
        editButtonTooltip: "Edit 編輯",                      // tooltip of edit item button
        deleteButtonTooltip: "Delete",                  // tooltip of delete item button
        searchButtonTooltip: "Search 搜索",                  // tooltip of search button
        clearFilterButtonTooltip: "Clear filter 清除篩選條件",       // tooltip of clear filter button
        insertButtonTooltip: "Insert 添加",                  // tooltip of insert button
        updateButtonTooltip: "Update 更新",                  // tooltip of update item button
        cancelEditButtonTooltip: "Cancel edit",         // tooltip of cancel editing button

        noDataContent: "No volunteer shifts found 無相關義工班次紀錄",

        confirmDeleting: true,
        deleteConfirm: "Are you sure?",

        pagerContainer: null,
        pageIndex: 1,
        pageSize: 20,
        pageButtonCount: 15,
        pagerFormat: "Pages: {first} {prev} {pages} {next} {last}    {pageIndex} of {pageCount}",
        pagePrevText: "Prev",
        pageNextText: "Next",
        pageFirstText: "First",
        pageLastText: "Last",
        pageNavigatorNextText: "...",
        pageNavigatorPrevText: "...",

        invalidMessage: "Invalid data entered!",

        loadIndication: true,
        loadIndicationDelay: 500,
        loadMessage: "Please, wait...",
        loadShading: true,

        updateOnResize: true,

        rowRenderer: null,
        headerRowRenderer: null,
        filterRowRenderer: null,
        insertRowRenderer: null,
        editRowRenderer: null,

        data: shifts,

        fields: [
            { name: "ID", type: "number", readOnly: true, visible:true, filtering: false, css: "id-view", editcss: "id-edit", headercss: "id-header"},
            { name: "Contact ID", type: "number", readOnly: true, visible:false, filtering: false},
            { name: "Job", type: "select", items: jobs, valueField: "Id", textField: "Name", valueType: "string", filtering: true,
                headerTemplate: function() {
                    return 'Job 職位';
                },
                validate: {
                    validator: "required",
                    message: function() {
                        return "Job is a required field 職位為必填項";
                    }
                },
            },
            { name: "Location", type: "select", items: locations, valueField: "Id", textField: "Name", valueType: "string", filtering: true, insertcss: "loc-insert", editcss: "loc-edit", filtercss: "loc-filter",
                headerTemplate: function() {
                    return 'Location 地點';
                },
                validate: {
                    validator: "required",
                    message: function() {
                        return "Location is a required field 地點為必填項";
                    }
                },
                insertTemplate: function() {
                    var divField = this._grid.fields[4];
                    var progField = this._grid.fields[5];
                    divField.readOnly = true;
                    progField.readOnly = true;
                    var $insertControl = jsGrid.fields.select.prototype.insertTemplate.call(this);

                    $insertControl.on("change", function() {
                        var selectedLoc = $(this).val();
                        divField.readOnly = false;

                        var loc = {};
                        loc['_value'] = selectedLoc;
                        loc['_return'] = 'division';
                        $.ajax({
                            url: php_vars.filterUrl,
                            type: "POST",
                            data: loc,
                            beforeSend: function ( xhr ) {
                                $(".jsgrid-load-shader, .jsgrid-load-panel").show();
                            },
                        }).done(function(output){
                            var filtereddivs = $.parseJSON(output);
                            divField.items = filtereddivs;
                            $(".div-insert").empty().append(divField.insertTemplate());
                            $(".jsgrid-load-shader, .jsgrid-load-panel").hide();
                        });
                    });
                    return $insertControl;
                 },
                editTemplate: function (value) {
                    var divField = this._grid.fields[4];
                    var progField = this._grid.fields[5];
                    divField.readOnly = true;
                    progField.readOnly = true;
                    // Retrieve the DOM element (select)
                    // Note: prototype.editTemplate
                    var $editControl = jsGrid.fields.select.prototype.editTemplate.call(this, value);

                    // Attach onchange listener !
                    $editControl.change(function(){
                        var selectedLoc = $(this).val();
                        divField.readOnly = false;

                        var loc = {};
                        loc['_value'] = selectedLoc;
                        loc['_return'] = 'division';
                        $.ajax({
                            url: php_vars.filterUrl,
                            type: "POST",
                            data: loc,
                            beforeSend: function ( xhr ) {
                                $(".jsgrid-load-shader, .jsgrid-load-panel").show();
                            },
                        }).done(function(output){
                            var filtereddivs = $.parseJSON(output);
                            divField.items = filtereddivs;
                            $(".div-edit").empty().append(divField.editTemplate());
                            $(".jsgrid-load-shader, .jsgrid-load-panel").hide();
                        });
                    });

                    return $editControl;
                },
            },
            { name: "Division", type: "select", items: divisions, valueField: "Id", textField: "Name", valueType: "string", filtering: true, insertcss: "div-insert", editcss: "div-edit",
                headerTemplate: function() {
                    return 'Division 分支';
                },
                validate: {
                    validator: "required",
                    message: function() {
                        return "Division is a required field 分支為必填項";
                    }
                },
                itemTemplate: function(div) {
                    return div;
                },
                insertTemplate: function() {
                    var progField = this._grid.fields[5];
                    var $insertControl = jsGrid.fields.select.prototype.insertTemplate.call(this);

                    $insertControl.on("change", function() {
                        var selectedDiv = $(this).val();
                        var selectedLoc = $('.loc-insert select option:selected').val();
                        if (selectedLoc === '') {
                            alert('Please select Location!');
                            return false;
                        }
                        progField.readOnly = false;

                        var divloc = {};
                        divloc['_value'] = selectedDiv;
                        divloc['_loc'] = selectedLoc;
                        divloc['_return'] = 'program';
                        $.ajax({
                            url: php_vars.filterUrl,
                            type: "POST",
                            data: divloc,
                            beforeSend: function ( xhr ) {
                                $(".jsgrid-load-shader, .jsgrid-load-panel").show();
                            },
                        }).done(function(output){
                            var filteredprogs = $.parseJSON(output);
                            progField.items = filteredprogs;
                            $(".prog-insert").empty().append(progField.insertTemplate());
                            $(".jsgrid-load-shader, .jsgrid-load-panel").hide();
                        });
                    });
                    return $insertControl;
                },
                editTemplate: function (value) {
                    var progField = this._grid.fields[5];
                    // Retrieve the DOM element (select)
                    // Note: prototype.editTemplate
                    var $editControl = jsGrid.fields.select.prototype.editTemplate.call(this, value);

                    // Attach onchange listener !
                    $editControl.change(function(){
                        var selectedDiv = $(this).val();
                        var selectedLoc = $('.loc-edit select option:selected').val();
                        if (selectedLoc === '') {
                            alert('Please select Location!');
                            return false;
                        }
                        progField.readOnly = false;

                        var divloc = {};
                        divloc['_value'] = selectedDiv;
                        divloc['_loc'] = selectedLoc;
                        divloc['_return'] = 'program';
                        $.ajax({
                            url: php_vars.filterUrl,
                            type: "POST",
                            data: divloc,
                            beforeSend: function ( xhr ) {
                                $(".jsgrid-load-shader, .jsgrid-load-panel").show();
                            },
                        }).done(function(output){
                            var filteredprogs = $.parseJSON(output);
                            progField.items = filteredprogs;
                            $(".prog-edit").empty().append(progField.editTemplate());
                            $(".jsgrid-load-shader, .jsgrid-load-panel").hide();
                        });
                    });

                    return $editControl;
                }
            },
            { name: "Program", type: "select", items: programs, valueField: "Id", textField: "Name", valueType: "string", filtering: true, insertcss: "prog-insert", editcss: "prog-edit",
                headerTemplate: function() {
                    return 'Program 服務部門';
                },
                validate: {
                    validator: "required",
                    message: function() {
                        return "Program is a required field 服務部門為必填項";
                    }
                },
            },
            { name: "Date", type: "date", css: "date-field", filtering: false,
                headerTemplate: function() {
                    return 'Date 日期';
                },
                validate: {
                    message: function() {
                        return "Date is a required field 日期為必填項";
                    },
                    validator: function(value, item) {
                        if (item.ID) {
                            // Remove validation on edit mode, since this causes issues with batch update.
                            return true;
                        }
                        else {
                            if (value) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                    }
                }
            },
            { name: "Start Time", type: "time", width: 60, css: "time-field", filtering: false, sorting: false,
                headerTemplate: function() {
                    return 'Start Time 開始時間';
                },
                validate: {
                    validator: "required",
                    message: function() {
                        return "Start Time is a required field 開始時間為必填項";
                    }
                },
            },
            { name: "Volunteer Hours", type: "decimal", width: 50, filtering: false,
                headerTemplate: function() {
                    return 'Volunteer Hours 義工時數';
                },
            },
            { name: "Status", type: "select", items: status, valueField: "Id", textField: "Name", valueType: "string", filtering: false, sorting: false, editcss: "status-edit",
                headerTemplate: function() {
                  return '<span id="statuscontrol">Status 狀態<br/><i class="fa fa-clone" aria-hidden="true" title="Click to copy status in the first row to all rows 點擊此處複製第一行狀態至所有行"></i></span>';
                }
            },
            { type: "control", deleteButton: false }
        ],

        _eachField_forBatch: function (myfields, callBack) {
            var self = this;
            $.each(myfields, function (index, field) {
                if (field.visible) {
                    callBack.call(self, field, index);
                }
            });
        },
        editItems_forBatch: function (items) {
            this.editFields_forBatch = [];
            this._editingRows_forBatch = [];
            for(var i = 0; i < items.length; i++)
            {
                var $row = this.rowByItem(items[i]);
                if ($row.length) {
                    this._editRows_forBatch($row, items[i]);
                }
            }
        },
        _editRows_forBatch: function ($row) {
            if (!this.editing)
                return;

            var item = $row.data(JSGRID_ROW_DATA_KEY);

            var args = this._callEventHandler(this.onItemEditing, {
                row: $row,
                item: item,
                itemIndex: this._itemIndex(item)
            });

            if (args.cancel)
                return;

            if (this._editingRow) {
                this.cancelEdit();
            }

            var $editRow = this._createEditRow(item);

            var row_num = this.editFields_forBatch.length;
            var rowFields = [];
            for(var fc = 0; fc < this.fields.length; fc++) {
                var thisField = Object.create(this.fields[fc]);
                thisField.mypara = row_num;
                if(this.fields[fc].editControl) thisField.editControl = Object.create(this.fields[fc].editControl);
                rowFields.push(thisField);
            }
            this.editFields_forBatch.push(rowFields);

            this._editingRows_forBatch.push($row);
            $row.hide();
            $editRow.insertBefore($row);
            $row.data(JSGRID_EDIT_ROW_DATA_KEY, $editRow);
        },
        updateItems_forBatch: function (item) {
            var editingRows = [];
            var editedItems = [];
            for(var i = 0; i < this._editingRows_forBatch.length; i++)
            {
                var currentEditingRow = this._editingRows_forBatch[i];
                var currentEditingRowFields = this.editFields_forBatch[i];
                var editedItem ;

                var item = this._getEditedItem_forBatch(currentEditingRowFields);
                editedItem = this._validateItem(item, currentEditingRow) ? item : null;

                if (!editedItem)
                    return false;
                editingRows.push(currentEditingRow);
                editedItems.push(editedItem);
            }
            var batchData = {"batchupdate": editedItems, "cid": php_vars.cid};
            $.ajax({
                url: php_vars.actionUrl,
                type: "POST",
                data: batchData,
                beforeSend: function ( xhr ) {
                    $(".jsgrid-load-shader, .jsgrid-load-panel").show();
                },
            }).done(function(output){
                $(".jsgrid-load-shader, .jsgrid-load-panel").hide();
            });
            for(var i = 0; i < editedItems.length; i++) {
                editedItems[i]['isEdited'] = true;
                this._updateRow(editingRows[i], editedItems[i]);
            }
            this.editFields_forBatch = [];
            this._editingRows_forBatch = [];
            return;
        },
        _finishUpdate: function ($updatingRow, updatedItem, updatedItemIndex) {
            if(this._editingRow) this.cancelEdit();
            else this.cancelEdit_forBatch_row($updatingRow);
            this.data[updatedItemIndex] = updatedItem;

            var $updatedRow = this._createRow(updatedItem, updatedItemIndex);
            $updatingRow.replaceWith($updatedRow);
            return $updatedRow;
        },
        _getEditedItem_forBatch: function (myfields) {
            var result = {};
            this._eachField_forBatch(myfields, function (field) {
                if (field.editing && field.type != 'date') {
                    this._setItemFieldValue(result, field, field.editValue());
                }
            });
            return result;
        },
        cancelEdit_forBatch_row: function (updatedRow) {
            if (!updatedRow)
                return;
            updatedRow.prev("tr." + this.editRowClass).remove();
            updatedRow.show();
        },
        cancelEdit_forBatch: function (rowItems) {
            for(var i = 0; i < rowItems.length; i++)
            {
                var $row = this.rowByItem(rowItems[i]);
                if ($row.length) {
                    this.cancelEdit_forBatch_row($row);
                }
            }
        },

        controller: {
            insertItem: function(item) {
                var d = $.Deferred();
                item.contact_id = php_vars.cid;
                item.actionmethod = 'insert';
                // updating data request
                $.ajax({
                    url: php_vars.actionUrl,
                    type: "POST",
                    data: item,
                    beforeSend: function ( xhr ) {
                        $(".jsgrid-load-shader, .jsgrid-load-panel").show();
                    },
                }).done(function(output){
                    d.resolve(item);
                    $(".jsgrid-load-shader, .jsgrid-load-panel").hide();
                });
                return d.promise();
            },

            onItemInserted: function(args) {
                $("#jsGrid").jsGrid("loadData");
            },

            updateItem: function(item) {
                if (item.isEdited) {
                    return;
                }
                item.contact_id = php_vars.cid;
                item.actionmethod = 'update';
                // updating data request
                $.ajax({
                    url: php_vars.actionUrl,
                    type: "POST",
                    data: item,
                    beforeSend: function ( xhr ) {
                        $(".jsgrid-load-shader, .jsgrid-load-panel").show();
                    },
                }).done(function(output){
                    $(".jsgrid-load-shader, .jsgrid-load-panel").hide();
                });
            },

            loadData: function(filter) {
                var d = $.Deferred();
                filter.cid = php_vars.cid;
                filter.actionmethod = 'search';
                // server-side filtering
                $.ajax({
                    type: "POST",
                    url: php_vars.actionUrl,
                    data: filter,
                    dataType: "json"
                }).done(function(result) {
                    d.resolve(result);
                });

                return d.promise();
            }

        }
    });

    $('#btnBatchSave1').hide();
    $('#btnBatchCancel1').hide();
    $('#statuscontrol i').hide();

    $("#batch-controls").on('click', '#btnBatchEdit1', function() {
        $.each([2,3,4,5,6,7,8], function(index, field) {
            $grid.jsGrid("fieldOption", field, "readOnly", true);
        });
        $grid.jsGrid("fieldOption", 10, "visible", false);
        $('#btnBatchEdit1').hide();
        var rows = $grid.jsGrid("option", "data");
        $grid.jsGrid("editItems_forBatch", rows);
        $('#btnBatchSave1').show();
        $('#btnBatchCancel1').show();
        $('#statuscontrol i').show();
        $('.jsgrid-filter-row').hide();
    });

    $("#batch-controls").on('click', '#btnBatchSave1', function() {
        if($grid.jsGrid("updateItems_forBatch")){
            $.each([2,3,4,5,6,7,8], function(index, field) {
                $grid.jsGrid("fieldOption", field, "readOnly", false);
            });
            $grid.jsGrid("fieldOption", 10, "visible", true);
            $('#btnBatchSave1').hide();
            $('#btnBatchCancel1').hide();
            $('#btnBatchEdit1').show();
            $('#statuscontrol i').hide();
            $('.jsgrid-filter-row').show();
        }
    });
    $("#batch-controls").on('click', '#btnBatchCancel1', function() {
        var rows = $grid.jsGrid("option", "data");
        $grid.jsGrid("cancelEdit_forBatch", rows);
        $.each([2,3,4,5,6,7,8], function(index, field) {
            $grid.jsGrid("fieldOption", field, "readOnly", false);
        });
        $grid.jsGrid("fieldOption", 10, "visible", true);
        $('#btnBatchSave1').hide();
        $('#btnBatchCancel1').hide();
        $('#btnBatchEdit1').show();
        $('#statuscontrol i').hide();
    });

    $(document).on('click', '#statuscontrol', function() {
        var gridBody = $("#jsGrid").find('.jsgrid-grid-body');
        //fire the click event of first row to select first item.
        var status = gridBody.find('.jsgrid-table tr:first-child .status-edit select option').filter(":selected").val();
        if (confirm('Are you sure you would like to mark all volunteer shifts as ' + status + '? 您是否確定要把所有義工班次的狀態都標記為 ' + status + '?')) {
            $('.status-edit select').each(function(i, sel) {
                $(sel).val(status);
            });
        }
    });

    // Tooltip translation
    $('.jsgrid-insert-mode-button').attr('title', 'Switch to inserting 轉至添加');
    $('.jsgrid-search-button').attr('title', 'Search 搜索');
    $('.jsgrid-clear-filter-button').attr('title', 'Clear filter 清除篩選條件');
    $('.jsgrid-edit-button').attr('title', 'Edit 編輯');
    $('.jsgrid-insert-button').attr('title', 'Insert 添加');
    $('.jsgrid-search-mode-button').attr('Switch to searching 轉至搜索');
    $('.jsgrid-filter-button').attr('title', 'Filter 篩選條件');
});
