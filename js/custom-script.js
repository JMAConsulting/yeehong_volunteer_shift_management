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
        { Name: "Scheduled", Id: "Scheduled" },
        { Name: "Completed", Id: "Completed" },
        { Name: "Cancelled", Id: "Cancelled" },
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
            return this._insertPicker.datepicker("getDate").toISOString();
        },

        editValue: function() {
            return this._editPicker.datepicker("getDate").toISOString();
        }
    });

    jsGrid.fields.date = YhvDateField;

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

        noDataContent: "No volunteer shifts found",

        confirmDeleting: true,
        deleteConfirm: "Are you sure?",

        pagerContainer: null,
        pageIndex: 1,
        pageSize: 50,
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
            { name: "ID", type: "number", readOnly: true, editing:false, visible:false, filtering: false},
            { name: "Contact ID", type: "number", readOnly: true, editing:false, visible:false, filtering: false},
            { name: "Job", type: "select", items: jobs, valueField: "Id", textField: "Name", valueType: "string", filtering: true },
            { name: "Location", type: "select", items: locations, valueField: "Id", textField: "Name", valueType: "string", filtering: true, insertcss: "loc-insert", editcss: "loc-edit", filtercss: "loc-filter",
                insertTemplate: function() {
                    var divField = this._grid.fields[4];
                    var $insertControl = jsGrid.fields.select.prototype.insertTemplate.call(this);

                    $insertControl.on("change", function() {
                        var selectedLoc = $(this).val();

                        var loc = {};
                        loc['_value'] = selectedLoc;
                        loc['_isJsGrid'] = 1;
                        $.ajax({
                            url: php_vars.getDept,
                            type: "POST",
                            data: loc
                        }).done(function(output){
                            var filtereddivs = $.parseJSON(output);
                            divField.items = filtereddivs;
                            $(".div-insert").empty().append(divField.insertTemplate());
                        });
                    });
                    return $insertControl;
                 },
                editTemplate: function (value) {
                    var divField = this._grid.fields[4];
                    // Retrieve the DOM element (select)
                    // Note: prototype.editTemplate
                    var $editControl = jsGrid.fields.select.prototype.editTemplate.call(this, value);

                    // Attach onchange listener !
                    $editControl.change(function(){
                        var selectedLoc = $(this).val();

                        var loc = {};
                        loc['_value'] = selectedLoc;
                        loc['_isJsGrid'] = 1;
                        $.ajax({
                            url: php_vars.getDept,
                            type: "POST",
                            data: loc
                        }).done(function(output){
                            var filtereddivs = $.parseJSON(output);
                            divField.items = filtereddivs;
                            $(".div-edit").empty().append(divField.insertTemplate());
                        });
                    });

                    return $editControl;
                },
            },
            { name: "Division", type: "select", items: divisions, valueField: "Id", textField: "Name", valueType: "string", filtering: true, insertcss: "div-insert", editcss: "div-edit",
                itemTemplate: function(team) {
                    return team;
                },

                insertTemplate: function() {
                    var selectedLoc = $('.loc-insert select option:selected').val();

                    var progField = this._grid.fields[5];
                    var $insertControl = jsGrid.fields.select.prototype.insertTemplate.call(this);

                    $insertControl.on("change", function() {
                        var selectedDiv = $(this).val();

                        var divloc = {};
                        divloc['_value'] = selectedDiv;
                        divloc['_loc'] = selectedLoc;
                        divloc['_isJsGrid'] = 1;
                        $.ajax({
                            url: php_vars.getPro,
                            type: "POST",
                            data: divloc
                        }).done(function(output){
                            var filteredprogs = $.parseJSON(output);
                            progField.items = filteredprogs;
                            $(".prog-insert").empty().append(progField.insertTemplate());
                        });
                    });
                    return $insertControl;
                },

                editTemplate: function (value) {
                    var selectedLoc = $('.loc-edit select option:selected').val();
                    var progField = this._grid.fields[5];
                    // Retrieve the DOM element (select)
                    // Note: prototype.editTemplate
                    var $editControl = jsGrid.fields.select.prototype.editTemplate.call(this, value);

                    // Attach onchange listener !
                    $editControl.change(function(){
                        var selectedDiv = $(this).val();

                        var divloc = {};
                        divloc['_value'] = selectedDiv;
                        divloc['_loc'] = selectedLoc;
                        divloc['_isJsGrid'] = 1;
                        $.ajax({
                            url: php_vars.getPro,
                            type: "POST",
                            data: loc
                        }).done(function(output){
                            var filteredprogs = $.parseJSON(output);
                            progField.items = filteredprogs;
                            $(".prog-edit").empty().append(progField.insertTemplate());
                        });
                    });

                    return $editControl;
                }
            },
            { name: "Program", type: "select", items: programs, valueField: "Id", textField: "Name", valueType: "string", filtering: true, insertcss: "prog-insert", editcss: "prog-edit"},
            { name: "Date", type: "date", css: "date-field", filtering: false},
            { name: "Volunteer Hours", type: "number", width: 50, filtering: false },
            { name: "Status", type: "select", items: status, valueField: "Id", textField: "Name", valueType: "string", filtering: false},
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
            for(var i = 0; i < editedItems.length; i++)
            {
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
                if (field.editing) {
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
                // updating data request
                $.ajax({
                    url: php_vars.insertSignup,
                    type: "POST",
                    data: item
                }).done(function(output){
                    d.resolve(item);
                });
                return d.promise();
            },

            onItemInserted: function(args) {
                $("#jsGrid").jsGrid("loadData");
            },

            updateItem: function(item) {
                var d = $.Deferred();
                item.contact_id = php_vars.cid;
                // updating data request
                $.ajax({
                    url: php_vars.signup,
                    type: "POST",
                    data: item
                }).done(function(output){
                    //d.resolve(item);
                });
                //return d.promise();
            },

            loadData: function(filter) {
                var d = $.Deferred();
                filter.cid = php_vars.cid;
                // server-side filtering
                $.ajax({
                    type: "POST",
                    url: php_vars.searchSignup,
                    data: filter,
                    dataType: "json"
                }).done(function(result) {
                    d.resolve(result);
                });

                return d.promise();
            }

        }
    });

    $('#btnBatchSave1').prop('disabled', true);
    $('#btnBatchCancel1').prop('disabled', true);
    $('#copyVals').prop('disabled', true);

    $("#batch-controls").on('click', '#btnBatchEdit1', function() {
        $.each([2,3,4,5,6,7], function(index, field) {
            $grid.jsGrid("fieldOption", field, "readOnly", true);
        });
        $grid.jsGrid("fieldOption", 9, "visible", false);
        $('#btnBatchEdit1').prop('disabled', true);
        var rows = $grid.jsGrid("option", "data");
        $grid.jsGrid("editItems_forBatch", rows);
        $('#btnBatchSave1').prop('disabled', false);
        $('#btnBatchCancel1').prop('disabled', false);
        $('#copyVals').prop('disabled', false);
        $('.jsgrid-filter-row').hide();
    });

    $("#batch-controls").on('click', '#btnBatchSave1', function() {
        if($grid.jsGrid("updateItems_forBatch")){
            $.each([2,3,4,5,6,7], function(index, field) {
                $grid.jsGrid("fieldOption", field, "readOnly", false);
            });
            $grid.jsGrid("fieldOption", 9, "visible", true);
            $('#btnBatchSave1').prop('disabled', true);
            $('#btnBatchCancel1').prop('disabled', true);
            $('#btnBatchEdit1').prop('disabled', false);
            $('#copyVals').prop('disabled', true);
            $('.jsgrid-filter-row').show();
        }
    });
    $("#batch-controls").on('click', '#btnBatchCancel1', function() {
        var rows = $grid.jsGrid("option", "data");
        $grid.jsGrid("cancelEdit_forBatch", rows);
        $.each([2,3,4,5,6,7], function(index, field) {
            $grid.jsGrid("fieldOption", field, "readOnly", false);
        });
        $grid.jsGrid("fieldOption", 9, "visible", true);
        $('#btnBatchSave1').prop('disabled', true);
        $('#btnBatchCancel1').prop('disabled', true);
        $('#btnBatchEdit1').prop('disabled', false);
        $('#copyVals').prop('disabled', true);
    });

    $("#batch-controls").on('click', '#copyVals', function() {
        var gridBody = $("#jsGrid").find('.jsgrid-grid-body');
        //fire the click event of first row to select first item.
        var status = gridBody.find('.jsgrid-table tr:first-child select option').filter(":selected").val();
        if (confirm('Are you sure you would like to mark all volunteer shifts as ' + status + '?')) {
            $('select').each(function(i, sel) {
                $(sel).val(status);
            });
            $('#btnBatchSave1').trigger('click');
        }
        $('.jsgrid-filter-row').show();
    });
});
