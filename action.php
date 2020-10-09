<?php

$options = [];
$call = wpcmrf_api('Yhvsignup', 'doaction', $_REQUEST, $options, CMRF_ID);
$output = $call->getReply();

if (!empty($output['values'])) {
  echo json_encode($output['values']);
}
else {
  echo json_encode($options);
}