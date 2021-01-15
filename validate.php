<?php

$options = [];
$call = wpcmrf_api('Yhvsignup', 'validateemail', $_REQUEST, $options, CMRF_ID);
$filterVals = $call->getReply();

if (!empty($filterVals['values'])) {
  echo 1;
}
else {
  echo 0;
}

