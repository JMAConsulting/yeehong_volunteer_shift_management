<?php

$options = [];
$call = wpcmrf_api('Yhvsignup', 'getchainedselect', $_REQUEST, $options, CMRF_ID);
$filterVals = $call->getReply();

if (!empty($filterVals['values'])) {
  echo json_encode($filterVals['values']);
}
else {
  echo json_encode($options);
}

