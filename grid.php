<?php
get_header();
?>

<?php the_title('<h1>', '</h1>'); ?>
<div id="batch-controls">
    <button type="button" id="btnBatchEdit1">
        Batch Update Volunteer Shift Status
    </button>
    <button type="button" id="btnBatchSave1">
        Save Batch
    </button>
    <button type="button" id="btnBatchCancel1">
        Cancel Batch
    </button>
</div>
<div id="jsGrid"></div>

