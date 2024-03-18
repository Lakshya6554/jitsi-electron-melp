<?php
try{
	// Get the IP address of the client
	$ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
	// Make a request to an IP geolocation service (example: ip-api.com)
	$response = file_get_contents("http://ip-api.com/json/".$ip);

	// Decode the JSON response
	$data = json_decode($response);
	// Check if $data is not empty
	if (!empty($data)) {
		// Convert the data to a JSON string
		$dataString = json_encode($data);
		// Prepare the response object
        $responseObject = new stdClass();
        $responseObject->status = 'success';
        $responseObject->data = $dataString;
        
        // Return the response as JSON
        header('Content-Type: application/json');
        echo json_encode($responseObject);
        exit; // Terminate the script execution
	}
} catch (Exception $e) {
    // Handle any exceptions or errors that occur

    // Prepare the error response object
    $errorObject = new stdClass();
    $errorObject->status = 'error';
    $errorObject->message = $e->getMessage();
    
    // Return the error response as JSON
    header('Content-Type: application/json');
    echo json_encode($errorObject);
    exit; // Terminate the script execution
}
?>